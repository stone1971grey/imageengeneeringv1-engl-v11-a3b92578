import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface FrontendEditContextType {
  // Edit mode state
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;
  
  // User permissions
  canEdit: boolean;
  canApprove: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  frontendEditingEnabled: boolean;
  
  // Current user
  userId: string | null;
  
  // Pending changes tracking
  pendingChanges: Map<string, PendingChange>;
  addPendingChange: (segmentKey: string, change: PendingChange) => void;
  removePendingChange: (segmentKey: string) => void;
  clearPendingChanges: () => void;
  
  // Approval actions
  approveSegment: (segmentKey: string) => Promise<boolean>;
  rejectSegment: (segmentKey: string) => Promise<boolean>;
  
  // Loading state
  isLoading: boolean;
}

interface PendingChange {
  originalValue: string;
  draftValue: string;
  contentStatus: 'draft' | 'pending' | 'approved';
  importStage: number;
}

const FrontendEditContext = createContext<FrontendEditContextType | undefined>(undefined);

export const FrontendEditProvider: React.FC<{ 
  children: React.ReactNode;
  pageSlug: string;
  language: string;
}> = ({ children, pageSlug, language }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check URL parameter for initial edit mode
  const editFromUrl = searchParams.get('edit') === 'true';
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [frontendEditingEnabled, setFrontendEditingEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  
  // Auto-enable edit mode from URL parameter after permissions are loaded
  useEffect(() => {
    if (!isLoading && editFromUrl && canEdit && !isEditMode) {
      setIsEditMode(true);
      // Remove the edit parameter from URL after activating
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('edit');
      setSearchParams(newParams, { replace: true });
    }
  }, [isLoading, editFromUrl, canEdit, isEditMode, searchParams, setSearchParams]);

  // Check user permissions
  useEffect(() => {
    const checkPermissions = async () => {
      setIsLoading(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setCanEdit(false);
          setCanApprove(false);
          setIsAdmin(false);
          setIsEditor(false);
          setUserId(null);
          setIsLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Check if user is admin
        const { data: adminRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        const userIsAdmin = !!adminRole;
        setIsAdmin(userIsAdmin);
        
        // Check if user is editor
        const { data: editorRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'editor')
          .maybeSingle();
        
        const userIsEditor = !!editorRole;
        setIsEditor(userIsEditor);
        
        // Check if frontend editing is enabled for this editor
        let hasFrontendEditing = false;
        if (userIsEditor) {
          const { data: pageAccess } = await supabase
            .from('editor_page_access')
            .select('frontend_editing_enabled')
            .eq('user_id', user.id)
            .or(`page_slug.eq.${pageSlug},page_slug.eq.__all__,page_slug.eq.__global__`)
            .eq('frontend_editing_enabled', true)
            .maybeSingle();
          
          hasFrontendEditing = !!pageAccess?.frontend_editing_enabled;
        }
        
        setFrontendEditingEnabled(hasFrontendEditing);
        
        // Admins can always edit and approve
        // Editors can edit if frontend editing is enabled, but only admins can approve
        setCanEdit(userIsAdmin || (userIsEditor && hasFrontendEditing));
        setCanApprove(userIsAdmin);
        
      } catch (error) {
        console.error('[FrontendEdit] Permission check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPermissions();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkPermissions();
    });
    
    return () => subscription.unsubscribe();
  }, [pageSlug]);

  const setEditMode = useCallback((enabled: boolean) => {
    if (enabled && !canEdit) {
      console.warn('[FrontendEdit] User cannot enable edit mode - no permission');
      return;
    }
    setIsEditMode(enabled);
  }, [canEdit]);

  const addPendingChange = useCallback((segmentKey: string, change: PendingChange) => {
    setPendingChanges(prev => new Map(prev).set(segmentKey, change));
  }, []);

  const removePendingChange = useCallback((segmentKey: string) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(segmentKey);
      return newMap;
    });
  }, []);

  const clearPendingChanges = useCallback(() => {
    setPendingChanges(new Map());
  }, []);

  const approveSegment = useCallback(async (segmentKey: string): Promise<boolean> => {
    if (!canApprove || !userId) {
      console.warn('[FrontendEdit] User cannot approve - no permission');
      return false;
    }
    
    try {
      // Get current content
      const { data: content, error: fetchError } = await supabase
        .from('page_content')
        .select('content_value, draft_value, content_status')
        .eq('page_slug', pageSlug)
        .eq('section_key', segmentKey)
        .eq('language', language)
        .maybeSingle();
      
      if (fetchError || !content) {
        console.error('[FrontendEdit] Failed to fetch content for approval:', fetchError);
        return false;
      }
      
      // If there's a draft, promote it to live
      const newContentValue = content.draft_value || content.content_value;
      
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          content_value: newContentValue,
          draft_value: null,
          content_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId
        })
        .eq('page_slug', pageSlug)
        .eq('section_key', segmentKey)
        .eq('language', language);
      
      if (updateError) {
        console.error('[FrontendEdit] Failed to approve segment:', updateError);
        return false;
      }
      
      removePendingChange(segmentKey);
      return true;
      
    } catch (error) {
      console.error('[FrontendEdit] Approval failed:', error);
      return false;
    }
  }, [canApprove, userId, pageSlug, language, removePendingChange]);

  const rejectSegment = useCallback(async (segmentKey: string): Promise<boolean> => {
    if (!canApprove || !userId) {
      console.warn('[FrontendEdit] User cannot reject - no permission');
      return false;
    }
    
    try {
      // Discard draft, keep original content
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          draft_value: null,
          content_status: 'approved'
        })
        .eq('page_slug', pageSlug)
        .eq('section_key', segmentKey)
        .eq('language', language);
      
      if (updateError) {
        console.error('[FrontendEdit] Failed to reject segment:', updateError);
        return false;
      }
      
      removePendingChange(segmentKey);
      return true;
      
    } catch (error) {
      console.error('[FrontendEdit] Rejection failed:', error);
      return false;
    }
  }, [canApprove, userId, pageSlug, language, removePendingChange]);

  return (
    <FrontendEditContext.Provider value={{
      isEditMode,
      setEditMode,
      canEdit,
      canApprove,
      isAdmin,
      isEditor,
      frontendEditingEnabled,
      userId,
      pendingChanges,
      addPendingChange,
      removePendingChange,
      clearPendingChanges,
      approveSegment,
      rejectSegment,
      isLoading
    }}>
      {children}
    </FrontendEditContext.Provider>
  );
};

export const useFrontendEdit = () => {
  const context = useContext(FrontendEditContext);
  if (context === undefined) {
    throw new Error('useFrontendEdit must be used within a FrontendEditProvider');
  }
  return context;
};

// Optional hook that doesn't throw if used outside provider
export const useFrontendEditOptional = () => {
  return useContext(FrontendEditContext);
};
