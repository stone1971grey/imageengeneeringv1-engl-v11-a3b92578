import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createContentBackup, validatePageSegmentsSave } from '@/utils/createContentBackup';

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
  console.log('[FrontendEditProvider] Mounting for pageSlug:', pageSlug, 'language:', language);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [frontendEditingEnabled, setFrontendEditingEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [initError, setInitError] = useState<Error | null>(null);
  
  // Auto-enable edit mode from URL parameter after permissions are loaded
  // Use a ref to track if we've already processed the URL param to prevent loops
  const hasProcessedEditParam = useRef(false);
  
  // Safe URL parameter reading - done once on mount, not reactively
  const editFromUrl = useRef<boolean>(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      editFromUrl.current = params.get('edit') === 'true';
      console.log('[FrontendEdit] Initial URL edit param:', editFromUrl.current);
    } catch (e) {
      console.error('[FrontendEdit] Error reading URL params:', e);
    }
  }, []);
  
  // URL param processing effect - only runs when loading completes
  useEffect(() => {
    console.log('[FrontendEdit] URL param effect - isLoading:', isLoading, 'editFromUrl:', editFromUrl.current, 'canEdit:', canEdit, 'isEditMode:', isEditMode, 'hasProcessed:', hasProcessedEditParam.current);
    
    // Only process once per page load
    if (hasProcessedEditParam.current) {
      console.log('[FrontendEdit] Already processed, skipping');
      return;
    }
    
    if (!isLoading && editFromUrl.current && canEdit && !isEditMode) {
      console.log('[FrontendEdit] Activating edit mode from URL');
      hasProcessedEditParam.current = true;
      setIsEditMode(true);
      
      // Remove the edit parameter from URL after activating
      setTimeout(() => {
        try {
          const newParams = new URLSearchParams(window.location.search);
          newParams.delete('edit');
          const newUrl = window.location.pathname + (newParams.toString() ? '?' + newParams.toString() : '');
          window.history.replaceState({}, '', newUrl);
          console.log('[FrontendEdit] Cleaned URL:', newUrl);
        } catch (error) {
          console.error('[FrontendEdit] Error removing edit param:', error);
        }
      }, 100);
    } else if (!isLoading && editFromUrl.current && !canEdit) {
      console.warn('[FrontendEdit] User has no edit permission but edit=true in URL');
      hasProcessedEditParam.current = true; // Mark as processed to prevent repeated warnings
    }
  }, [isLoading, canEdit, isEditMode]);

  // Check user permissions with robust error handling
  useEffect(() => {
    let isMounted = true;
    
    const checkPermissions = async () => {
      console.log('[FrontendEdit] Starting permission check...');
      
      try {
        // FIRST: Check if frontend editing is enabled for this PAGE in page_registry
        const { data: pageRegistry, error: pageRegistryError } = await supabase
          .from('page_registry')
          .select('frontend_editing_enabled')
          .eq('page_slug', pageSlug)
          .maybeSingle();
        
        if (pageRegistryError) {
          console.warn('[FrontendEdit] Page registry check error (non-critical):', pageRegistryError);
        }
        
        const pageHasFrontendEditingEnabled = pageRegistry?.frontend_editing_enabled ?? false;
        console.log('[FrontendEdit] Page frontend_editing_enabled:', pageHasFrontendEditingEnabled, 'for page:', pageSlug);
        
        // If page-level toggle is OFF, no one can edit (not even admins via frontend)
        if (!pageHasFrontendEditingEnabled) {
          console.log('[FrontendEdit] Frontend editing is disabled for this page via page_registry toggle');
          if (isMounted) {
            setCanEdit(false);
            setCanApprove(false);
            setIsAdmin(false);
            setIsEditor(false);
            setFrontendEditingEnabled(false);
            setUserId(null);
            setIsLoading(false);
          }
          return;
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.warn('[FrontendEdit] Auth error (non-critical):', userError);
        }
        
        if (!isMounted) return;
        
        if (!user) {
          console.log('[FrontendEdit] No user found, setting defaults');
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
        const { data: adminRole, error: adminError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (adminError) {
          console.warn('[FrontendEdit] Admin role check error (non-critical):', adminError);
        }
        
        if (!isMounted) return;
        
        const userIsAdmin = !!adminRole;
        setIsAdmin(userIsAdmin);
        
        // Check if user is editor
        const { data: editorRole, error: editorError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'editor')
          .maybeSingle();
        
        if (editorError) {
          console.warn('[FrontendEdit] Editor role check error (non-critical):', editorError);
        }
        
        if (!isMounted) return;
        
        const userIsEditor = !!editorRole;
        setIsEditor(userIsEditor);
        
        // Check if frontend editing is enabled for this editor (user-level permission)
        let userHasFrontendEditing = false;
        if (userIsEditor) {
          const { data: pageAccess, error: accessError } = await supabase
            .from('editor_page_access')
            .select('frontend_editing_enabled')
            .eq('user_id', user.id)
            .or(`page_slug.eq.${pageSlug},page_slug.eq.__all__,page_slug.eq.__global__`)
            .eq('frontend_editing_enabled', true)
            .maybeSingle();
          
          if (accessError) {
            console.warn('[FrontendEdit] Page access check error (non-critical):', accessError);
          }
          
          userHasFrontendEditing = !!pageAccess?.frontend_editing_enabled;
        }
        
        if (!isMounted) return;
        
        setFrontendEditingEnabled(userHasFrontendEditing);
        
        // Admins can edit if page-level toggle is ON (already checked above)
        // Editors can edit if page-level toggle is ON AND they have user-level permission
        setCanEdit(userIsAdmin || (userIsEditor && userHasFrontendEditing));
        setCanApprove(userIsAdmin);
        
        console.log('[FrontendEdit] Permission check complete:', { 
          userIsAdmin, 
          userIsEditor, 
          userHasFrontendEditing,
          pageHasFrontendEditingEnabled 
        });
        
      } catch (error) {
        console.error('[FrontendEdit] Permission check failed with exception:', error);
        if (isMounted) {
          setInitError(error instanceof Error ? error : new Error(String(error)));
          // Still allow children to render with no permissions
          setCanEdit(false);
          setCanApprove(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkPermissions();
    
    // Listen for auth changes with error handling
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(() => {
        if (isMounted) {
          checkPermissions();
        }
      });
      subscription = data.subscription;
    } catch (e) {
      console.error('[FrontendEdit] Failed to setup auth listener:', e);
    }
    
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
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

  console.log('[FrontendEditProvider] Rendering children, isLoading:', isLoading, 'canEdit:', canEdit, 'isEditMode:', isEditMode, 'hasError:', !!initError);

  // CRITICAL: Always render children - never block on loading
  // The context values will update when permissions are loaded
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
