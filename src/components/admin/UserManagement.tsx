import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldCheck, ShieldAlert, User, UserPlus, Trash2, Lock, Eye, EyeOff, Users, Crown, Pencil, Save, Settings, Globe, Check, Newspaper, Calendar, Target, Download, Book, History, MonitorSmartphone } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

type AppRole = 'admin' | 'editor';
type LanguageCode = 'en' | 'de' | 'ja' | 'ko' | 'zh';

const AVAILABLE_LANGUAGES = [
  { code: 'en' as LanguageCode, name: 'English', flag: '🇬🇧' },
  { code: 'de' as LanguageCode, name: 'German', flag: '🇩🇪' },
  { code: 'ja' as LanguageCode, name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko' as LanguageCode, name: 'Korean', flag: '🇰🇷' },
  { code: 'zh' as LanguageCode, name: 'Chinese', flag: '🇨🇳' },
];

interface ContentEditor {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface EditorLanguageAccess {
  editorId: string;
  languages: LanguageCode[];
}

// Define available content editors with their styling - matching AdminDashboard Welcome page
const CONTENT_EDITORS: ContentEditor[] = [
  {
    id: 'news',
    name: 'Manage News',
    description: 'Create & edit news articles',
    icon: <Newspaper className="h-6 w-6" />,
    color: 'hsl(var(--primary))',
    bgColor: 'bg-[hsl(var(--primary))]',
    borderColor: 'border-[hsl(var(--primary))]'
  },
  {
    id: 'events',
    name: 'Manage Events',
    description: 'Manage events & conferences',
    icon: <Calendar className="h-6 w-6" />,
    color: 'hsl(var(--events-button))',
    bgColor: 'bg-[hsl(var(--events-button))]',
    borderColor: 'border-[hsl(var(--events-button))]'
  },
  {
    id: 'products',
    name: 'Manage Products',
    description: 'Manage product catalog',
    icon: <Target className="h-6 w-6" />,
    color: 'hsl(var(--accent-blue))',
    bgColor: 'bg-[hsl(var(--accent-blue))]',
    borderColor: 'border-[hsl(var(--accent-blue))]'
  },
  {
    id: 'downloads',
    name: 'Manage Downloads',
    description: 'Manage downloads & resources',
    icon: <Download className="h-6 w-6" />,
    color: 'hsl(180 60% 45%)',
    bgColor: 'bg-[hsl(180_60%_45%)]',
    borderColor: 'border-[hsl(180_60%_45%)]'
  },
  {
    id: 'seo',
    name: 'SEO Settings',
    description: 'Edit SEO settings',
    icon: <Eye className="h-6 w-6" />,
    color: 'hsl(var(--seo-button))',
    bgColor: 'bg-[hsl(var(--seo-button))]',
    borderColor: 'border-[hsl(var(--seo-button))]'
  },
  {
    id: 'glossary',
    name: 'Translation Glossary',
    description: 'Manage translation glossary',
    icon: <Book className="h-6 w-6" />,
    color: 'hsl(var(--accent-violet))',
    bgColor: 'bg-[hsl(var(--accent-violet))]',
    borderColor: 'border-[hsl(var(--accent-violet))]'
  },
  {
    id: 'version-history',
    name: 'Version Management',
    description: 'View & restore content versions',
    icon: <History className="h-6 w-6" />,
    color: 'hsl(280 60% 50%)',
    bgColor: 'bg-[hsl(280_60%_50%)]',
    borderColor: 'border-[hsl(280_60%_50%)]'
  }
];

interface UserWithRole {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  editorLanguageAccess?: EditorLanguageAccess[];
  globalSegmentLanguages?: LanguageCode[]; // Global language permissions for CMS segments
  roles: AppRole[];
  created_at: string;
  editorAccess?: 'all' | 'custom' | 'none';
  contentEditors?: string[];
  canDraft?: boolean;  // Permission to save drafts
  canPublish?: boolean; // Permission to publish content
  frontendEditingEnabled?: boolean; // Permission to use frontend editing
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("editor");
  const [inviteEditorAccess, setInviteEditorAccess] = useState<'all' | 'custom' | 'none'>('all');
  const [inviteSelectedEditors, setInviteSelectedEditors] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [showEditorAccessDialog, setShowEditorAccessDialog] = useState(false);
  const [editorAccessType, setEditorAccessType] = useState<'all' | 'custom' | 'none'>('none');
  const [selectedEditors, setSelectedEditors] = useState<string[]>([]);
  const [savingAccess, setSavingAccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [editUserRole, setEditUserRole] = useState<AppRole>('editor');
  const [editSelectedEditors, setEditSelectedEditors] = useState<string[]>([]);
  const [editEditorLanguages, setEditEditorLanguages] = useState<Record<string, LanguageCode[]>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [existingUserMatch, setExistingUserMatch] = useState<UserWithRole | null>(null);
  const [inviteEditorLanguages, setInviteEditorLanguages] = useState<Record<string, LanguageCode[]>>({});
  const [inviteGlobalSegmentLanguages, setInviteGlobalSegmentLanguages] = useState<LanguageCode[]>([]);
  const [editGlobalSegmentLanguages, setEditGlobalSegmentLanguages] = useState<LanguageCode[]>([]);
  // Draft/Publish permissions
  const [inviteCanDraft, setInviteCanDraft] = useState(true);
  const [inviteCanPublish, setInviteCanPublish] = useState(false);
  const [editCanDraft, setEditCanDraft] = useState(true);
  const [editCanPublish, setEditCanPublish] = useState(false);
  // Frontend Editing permissions
  const [inviteFrontendEditingEnabled, setInviteFrontendEditingEnabled] = useState(false);
  const [editFrontendEditingEnabled, setEditFrontendEditingEnabled] = useState(false);

  // Check for existing user when username or email changes
  useEffect(() => {
    const searchTerm = inviteUsername.trim() || inviteEmail.trim();
    if (searchTerm) {
      const match = users.find(u => 
        u.username?.toLowerCase() === searchTerm.toLowerCase() || 
        u.email.toLowerCase() === searchTerm.toLowerCase()
      );
      setExistingUserMatch(match || null);
    } else {
      setExistingUserMatch(null);
    }
  }, [inviteUsername, inviteEmail, users]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with their roles including username
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, username, full_name, created_at')
        .order('email');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch editor page access (now used for content editors) including language_code and permissions
      const { data: editorAccess, error: accessError } = await supabase
        .from('editor_page_access')
        .select('user_id, page_slug, language_code, can_draft, can_publish, frontend_editing_enabled');

      if (accessError) throw accessError;

      // Combine profiles with their roles and editor access
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRoles = (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole);
        
        const userEditorAccess = (editorAccess || [])
          .filter(a => a.user_id === profile.id);
        
        const userEditors = userEditorAccess.map(a => a.page_slug);

        // Determine access type
        let accessType: 'all' | 'custom' | 'none' = 'none';
        if (userEditors.includes('__all__')) {
          accessType = 'all';
        } else if (userEditors.length > 0) {
          accessType = 'custom';
        }
        
        // Build language access per editor
        const editorLanguageAccess: EditorLanguageAccess[] = [];
        const globalSegmentLanguages: LanguageCode[] = [];
        
        // Extract draft/publish/frontend-editing permissions (from global entry or first entry found)
        let canDraft = true;  // Default: can draft
        let canPublish = false; // Default: cannot publish
        let frontendEditingEnabled = false; // Default: no frontend editing
        
        userEditorAccess.forEach(access => {
          // Collect global segment languages
          if (access.page_slug === '__global__' && access.language_code) {
            globalSegmentLanguages.push(access.language_code as LanguageCode);
            // Get draft/publish/frontend-editing permissions from global entry
            if (access.can_draft !== null && access.can_draft !== undefined) {
              canDraft = access.can_draft;
            }
            if (access.can_publish !== null && access.can_publish !== undefined) {
              canPublish = access.can_publish;
            }
            if (access.frontend_editing_enabled !== null && access.frontend_editing_enabled !== undefined) {
              frontendEditingEnabled = access.frontend_editing_enabled;
            }
          }
          // Also check __all__ entry for frontend editing
          else if (access.page_slug === '__all__') {
            if (access.frontend_editing_enabled !== null && access.frontend_editing_enabled !== undefined) {
              frontendEditingEnabled = access.frontend_editing_enabled;
            }
          }
          // Collect editor-specific language access (legacy)
          else if (access.page_slug !== '__all__' && access.page_slug !== '__global__' && access.language_code) {
            const existing = editorLanguageAccess.find(e => e.editorId === access.page_slug);
            if (existing) {
              existing.languages.push(access.language_code as LanguageCode);
            } else {
              editorLanguageAccess.push({
                editorId: access.page_slug,
                languages: [access.language_code as LanguageCode]
              });
            }
          }
        });
        
        return {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          full_name: profile.full_name,
          roles: userRoles,
          created_at: profile.created_at || '',
          editorAccess: accessType,
          contentEditors: userEditors.filter(p => p !== '__all__' && p !== '__global__'),
          editorLanguageAccess,
          globalSegmentLanguages,
          canDraft,
          canPublish,
          frontendEditingEnabled
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === '23505') {
          toast.info('User already has this role');
          return;
        }
        throw error;
      }

      toast.success(`Role "${role}" added successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Failed to add role');
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    // Prevent removing the last admin
    const admins = users.filter(u => u.roles.includes('admin'));
    if (role === 'admin' && admins.length <= 1) {
      toast.error('Cannot remove the last admin');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast.success(`Role "${role}" removed`);
      loadUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !invitePassword.trim()) {
      toast.error('Please enter email and password');
      return;
    }

    if (invitePassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsInviting(true);
    try {
      const username = inviteUsername.trim() || null;
      const email = inviteEmail.trim();
      
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authorized - please sign in again');
        return;
      }

      // Create user via admin edge function
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          password: invitePassword,
          fullName: inviteFullName.trim() || email.split('@')[0],
          username,
          role: inviteRole
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Error creating user');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (!data?.user?.id) {
        toast.error('Could not create user');
        return;
      }

      const newUserId = data.user.id;

      // If editor, add permissions
      if (inviteRole === 'editor') {
        const entries: { user_id: string; page_slug: string; language_code?: string | null; can_draft?: boolean; can_publish?: boolean; frontend_editing_enabled?: boolean }[] = [];
        
        // Add global language permissions (applies to all: CMS segments + content editors)
        // Include draft/publish/frontend-editing permissions on the first global entry
        if (inviteGlobalSegmentLanguages.length > 0) {
          inviteGlobalSegmentLanguages.forEach((lang, index) => {
            entries.push({
              user_id: newUserId,
              page_slug: '__global__',
              language_code: lang,
              // Set draft/publish/frontend-editing permissions on first entry
              can_draft: index === 0 ? inviteCanDraft : undefined,
              can_publish: index === 0 ? inviteCanPublish : undefined,
              frontend_editing_enabled: index === 0 ? inviteFrontendEditingEnabled : undefined
            });
          });
        } else {
          // If no languages selected, still create a permission entry for draft/publish/frontend-editing
          entries.push({
            user_id: newUserId,
            page_slug: '__global__',
            language_code: null,
            can_draft: inviteCanDraft,
            can_publish: inviteCanPublish,
            frontend_editing_enabled: inviteFrontendEditingEnabled
          });
        }
        
        // Add content editor access (no per-editor language - uses global languages)
        if (inviteEditorAccess === 'all') {
          entries.push({ user_id: newUserId, page_slug: '__all__', language_code: null });
        } else if (inviteEditorAccess === 'custom' && inviteSelectedEditors.length > 0) {
          inviteSelectedEditors.forEach(editorId => {
            entries.push({
              user_id: newUserId,
              page_slug: editorId,
              language_code: null
            });
          });
        }

        if (entries.length > 0) {
          const { error: accessError } = await supabase
            .from('editor_page_access')
            .insert(entries);

          if (accessError) {
            console.error('Error adding editor access:', accessError);
          }
        }
      }

      toast.success(`${inviteRole === 'admin' ? 'Admin' : 'Editor'} "${username || email}" was created successfully`);
      setShowInviteDialog(false);
      setInviteUsername("");
      setInviteEmail("");
      setInviteFullName("");
      setInvitePassword("");
      setInviteRole("editor");
      setInviteEditorAccess("all");
      setInviteSelectedEditors([]);
      setInviteEditorLanguages({});
      setInviteGlobalSegmentLanguages([]);
      setInviteCanDraft(true);
      setInviteCanPublish(false);
      setInviteFrontendEditingEnabled(false);
      loadUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Error creating user');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    // Prevent deleting the last admin
    const admins = users.filter(u => u.roles.includes('admin'));
    if (selectedUser.roles.includes('admin') && admins.length <= 1) {
      toast.error('Cannot delete the last admin');
      setShowDeleteConfirm(false);
      return;
    }

    setIsDeleting(true);
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Not authenticated');
        setIsDeleting(false);
        return;
      }

      // Call the edge function to delete the user
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: selectedUser.id }
      });

      if (error) {
        console.error('Error calling delete user function:', error);
        toast.error('Error deleting: ' + error.message);
        return;
      }

      if (data?.error) {
        console.error('Delete user function returned error:', data.error);
        toast.error(data.error);
        return;
      }

      toast.success(`User "${selectedUser.email}" has been deleted`);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'editor':
        return <Pencil className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white border-red-700';
      case 'editor':
        return 'bg-blue-600 text-white border-blue-700';
      default:
        return 'bg-zinc-600 text-white border-zinc-700';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openEditorAccessDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setEditorAccessType(user.editorAccess || 'none');
    setSelectedEditors(user.contentEditors || []);
    setShowEditorAccessDialog(true);
  };

  const handleSaveEditUser = async () => {
    if (!selectedUser) return;

    setIsSavingEdit(true);
    try {
      // Update password and/or auth email if provided (via edge function)
      if (editUserPassword || editUserEmail !== selectedUser.email) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        
        if (!token) {
          toast.error('Not authenticated');
          setIsSavingEdit(false);
          return;
        }

        const updatePayload: { userId: string; password?: string; email?: string } = {
          userId: selectedUser.id
        };
        
        if (editUserPassword && editUserPassword.length >= 6) {
          updatePayload.password = editUserPassword;
        }
        
        if (editUserEmail !== selectedUser.email) {
          updatePayload.email = editUserEmail;
        }

        const { data: updateResult, error: updateError } = await supabase.functions.invoke('admin-update-user', {
          body: updatePayload
        });

        if (updateError) {
          console.error('Error updating auth user:', updateError);
          toast.error(`Error updating: ${updateError.message}`);
          setIsSavingEdit(false);
          return;
        }

        if (updateResult?.error) {
          console.error('Edge function error:', updateResult.error);
          toast.error(updateResult.error);
          setIsSavingEdit(false);
          return;
        }

        console.log('Auth user updated successfully');
      }

      // Update profile (name and username)
      const updateData: { full_name?: string; username?: string | null; email?: string } = {};
      
      if (editUserName !== (selectedUser.full_name || '')) {
        updateData.full_name = editUserName;
      }
      
      if (editUsername !== (selectedUser.username || '')) {
        updateData.username = editUsername || null;
      }
      
      if (editUserEmail !== selectedUser.email) {
        updateData.email = editUserEmail;
      }
      
      if (Object.keys(updateData).length > 0) {
        console.log('Updating profile:', updateData);
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', selectedUser.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          if (profileError.code === '23505') {
            toast.error('This username is already taken');
            setIsSavingEdit(false);
            return;
          }
          throw profileError;
        }
      }

      // Update role - check if already has target role
      const currentRole = selectedUser.roles[0];
      const hasTargetRole = selectedUser.roles.includes(editUserRole);
      console.log('Current roles:', selectedUser.roles, 'Target role:', editUserRole, 'Has target:', hasTargetRole);
      
      if (!hasTargetRole) {
        // Only insert if user doesn't already have this role
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUser.id, role: editUserRole });

        if (insertRoleError && insertRoleError.code !== '23505') {
          // Ignore duplicate key error, throw others
          console.error('Insert role error:', insertRoleError);
          throw insertRoleError;
        }
      }

      // Delete old role if different from new role
      if (currentRole && currentRole !== editUserRole) {
        const { error: deleteRoleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', currentRole);

        if (deleteRoleError) {
          console.error('Delete old role error:', deleteRoleError);
          // Don't throw - the important thing is new role was added
        }
      }

      // Update editor access - delete all existing first
      console.log('Deleting existing editor access');
      const { error: deleteAccessError } = await supabase
        .from('editor_page_access')
        .delete()
        .eq('user_id', selectedUser.id);

      if (deleteAccessError) {
        console.error('Delete access error:', deleteAccessError);
        throw deleteAccessError;
      }

      // Add editor access if role is editor
      if (editUserRole === 'editor') {
        const entries: { user_id: string; page_slug: string; language_code: string | null; can_draft?: boolean; can_publish?: boolean; frontend_editing_enabled?: boolean }[] = [];
        
        // Add global language permissions (applies to all: CMS segments + content editors)
        // Include draft/publish/frontend-editing permissions on the first global entry
        if (editGlobalSegmentLanguages.length > 0) {
          console.log('Inserting global languages:', editGlobalSegmentLanguages);
          editGlobalSegmentLanguages.forEach((lang, index) => {
            entries.push({
              user_id: selectedUser.id,
              page_slug: '__global__',
              language_code: lang,
              // Set draft/publish/frontend-editing permissions on first entry
              can_draft: index === 0 ? editCanDraft : undefined,
              can_publish: index === 0 ? editCanPublish : undefined,
              frontend_editing_enabled: index === 0 ? editFrontendEditingEnabled : undefined
            });
          });
        } else {
          // If no languages selected, still create a permission entry for draft/publish/frontend-editing
          entries.push({
            user_id: selectedUser.id,
            page_slug: '__global__',
            language_code: null,
            can_draft: editCanDraft,
            can_publish: editCanPublish,
            frontend_editing_enabled: editFrontendEditingEnabled
          });
        }
        
        // Add content editor access (no per-editor language - uses global languages)
        if (editSelectedEditors.length > 0) {
          console.log('Inserting editor access:', editSelectedEditors);
          
          editSelectedEditors.forEach(editorId => {
            entries.push({
              user_id: selectedUser.id,
              page_slug: editorId,
              language_code: null
            });
          });
        }

        if (entries.length > 0) {
          const { error: insertAccessError } = await supabase
            .from('editor_page_access')
            .insert(entries);

          if (insertAccessError) {
            console.error('Insert access error:', insertAccessError);
            throw insertAccessError;
          }
        }
      }

      toast.success('User updated successfully');
      // Dialog stays open - only closed via X button
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSaveEditorAccess = async () => {
    if (!selectedUser) return;

    setSavingAccess(true);
    try {
      // Delete existing access entries for this user
      const { error: deleteError } = await supabase
        .from('editor_page_access')
        .delete()
        .eq('user_id', selectedUser.id);

      if (deleteError) throw deleteError;

      // Insert new access entries based on type
      if (editorAccessType === 'all') {
        const { error: insertError } = await supabase
          .from('editor_page_access')
          .insert({ user_id: selectedUser.id, page_slug: '__all__' });

        if (insertError) throw insertError;
      } else if (editorAccessType === 'custom' && selectedEditors.length > 0) {
        const entries = selectedEditors.map(editorId => ({
          user_id: selectedUser.id,
          page_slug: editorId
        }));

        const { error: insertError } = await supabase
          .from('editor_page_access')
          .insert(entries);

        if (insertError) throw insertError;
      }

      toast.success('Editor permissions saved');
      setShowEditorAccessDialog(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving editor access:', error);
      toast.error('Error saving permissions');
    } finally {
      setSavingAccess(false);
    }
  };

  const getEditorAccessLabel = (access: 'all' | 'custom' | 'none' | undefined) => {
    switch (access) {
      case 'all':
        return 'All Editors';
      case 'custom':
        return 'Custom';
      default:
        return 'No Permission';
    }
  };

  const allRoles: AppRole[] = ['admin', 'editor'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Admins</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.roles.includes('admin')).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Pencil className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Editors</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.roles.includes('editor')).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Total</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Users & Roles
              </CardTitle>
              <CardDescription>
                Manage admins and editors
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowInviteDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2 text-white" />
              New User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-100 border-b border-zinc-200">
                  <TableHead className="font-semibold text-zinc-700">User</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Email</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Role</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Workflow</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Languages</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Content Editors</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Created</TableHead>
                  <TableHead className="font-semibold text-zinc-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="bg-white hover:bg-gray-100 transition-colors group border-b border-gray-100">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </p>
                          {user.username && user.username !== user.email && (
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge 
                              key={role} 
                              variant="outline"
                              className={`${getRoleBadgeVariant(role)} flex items-center gap-1`}
                            >
                            {getRoleIcon(role)}
                              {role === 'admin' ? 'Admin' : 'Editor'}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-600 text-sm">No role</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles.includes('admin') ? (
                        <Badge className="bg-emerald-600 text-white border-emerald-700 text-xs">
                          Full Access
                        </Badge>
                      ) : user.roles.includes('editor') ? (
                        <div className="flex flex-wrap gap-1">
                          {user.canDraft && (
                            <Badge className="bg-amber-600 text-white border-amber-700 text-xs">
                              Draft
                            </Badge>
                          )}
                          {user.canPublish && (
                            <Badge className="bg-emerald-600 text-white border-emerald-700 text-xs">
                              Publish
                            </Badge>
                          )}
                          {user.frontendEditingEnabled && (
                            <Badge className="bg-cyan-600 text-white border-cyan-700 text-xs flex items-center gap-1">
                              <MonitorSmartphone className="h-3 w-3" />
                              FE
                            </Badge>
                          )}
                          {!user.canDraft && !user.canPublish && !user.frontendEditingEnabled && (
                            <span className="text-zinc-500 text-sm">—</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.roles.includes('admin') ? (
                        <Badge className="bg-emerald-600 text-white border-emerald-700 text-xs">
                          All
                        </Badge>
                      ) : user.globalSegmentLanguages && user.globalSegmentLanguages.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.globalSegmentLanguages.map(lang => {
                            const langInfo = AVAILABLE_LANGUAGES.find(l => l.code === lang);
                            return (
                              <Badge key={lang} className="bg-violet-600 text-white border-violet-700 text-xs">
                                {langInfo?.flag} {lang.toUpperCase()}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.roles.includes('admin') ? (
                        <Badge className="bg-emerald-600 text-white border-emerald-700 text-xs">
                          All
                        </Badge>
                      ) : user.roles.includes('editor') ? (
                        user.editorAccess === 'all' ? (
                          <Badge className="bg-emerald-600 text-white border-emerald-700 text-xs">
                            All
                          </Badge>
                        ) : user.contentEditors && user.contentEditors.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.contentEditors.map(editorId => {
                              const editor = CONTENT_EDITORS.find(e => e.id === editorId);
                              const displayName = editor?.name?.replace('Manage ', '') || editorId.charAt(0).toUpperCase() + editorId.slice(1);
                              return (
                                <Badge key={editorId} className="bg-zinc-700 text-white border-zinc-800 text-xs">
                                  {displayName}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-sm">—</span>
                        )
                      ) : (
                        <span className="text-zinc-500 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-900 text-sm">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            // Filter to only include valid CONTENT_EDITORS ids
                            const validEditorIds = CONTENT_EDITORS.map(e => e.id);
                            const filteredEditors = (user.contentEditors || []).filter(id => validEditorIds.includes(id));
                            
                            // Build language access map from user data
                            const languageMap: Record<string, LanguageCode[]> = {};
                            (user.editorLanguageAccess || []).forEach(access => {
                              languageMap[access.editorId] = access.languages;
                            });
                            
                            setSelectedUser(user);
                            setEditUserName(user.full_name || '');
                            setEditUsername(user.username || '');
                            setEditUserEmail(user.email);
                            setEditUserPassword('');
                            setEditUserRole(user.roles.includes('admin') ? 'admin' : 'editor');
                            setEditSelectedEditors(filteredEditors);
                            setEditEditorLanguages(languageMap);
                            setEditGlobalSegmentLanguages(user.globalSegmentLanguages || []);
                            setEditCanDraft(user.canDraft ?? true);
                            setEditCanPublish(user.canPublish ?? false);
                            setEditFrontendEditingEnabled(user.frontendEditingEnabled ?? false);
                            setShowEditUserDialog(true);
                          }}
                          className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors border border-gray-200 hover:border-yellow-300"
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-gray-200 hover:border-red-300"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card className="bg-zinc-50 border-zinc-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
            <ShieldCheck className="h-5 w-5" />
            Roles Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-red-500" />
                <h4 className="font-semibold text-white">Admin</h4>
              </div>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• Full system access</li>
                <li>• Manage users & roles</li>
                <li>• Edit all pages & content</li>
                <li>• Access to all settings</li>
                <li>• Permanently delete content</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Pencil className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold text-white">Editor</h4>
              </div>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• Edit assigned pages</li>
                <li>• Create & update content</li>
                <li>• Upload media files</li>
                <li>• Manage translations</li>
                <li>• Access to glossary</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="w-[95vw] max-w-[1400px] max-h-[85vh] overflow-y-auto mt-16 bg-white [&>button]:hidden">
          <DialogHeader className="relative">
            <button
              onClick={() => setShowInviteDialog(false)}
              className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-900 transition-colors text-3xl font-light leading-none focus:outline-none"
              title="Close"
            >
              ×
            </button>
            <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
              <UserPlus className="h-6 w-6" />
              Create New User
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700">
              Create a new admin or editor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name" className="text-base font-semibold text-gray-900">Name</Label>
              <Input
                id="invite-name"
                placeholder="John Doe"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
                className="text-base h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-base font-semibold text-gray-900">Email Address *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={`text-base h-12 ${existingUserMatch ? 'border-yellow-500 ring-2 ring-yellow-200' : ''}`}
              />
              <p className="text-sm text-gray-600">For communication and as a fallback for login.</p>
              {existingUserMatch && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mt-2">
                  <p className="text-base font-bold text-yellow-800 mb-2">
                    ⚠️ This user already exists:
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-yellow-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-gray-900">{existingUserMatch.full_name || 'No name'}</p>
                        <p className="text-sm text-gray-600">
                          {existingUserMatch.username && <span className="font-medium">Login: {existingUserMatch.username} | </span>}
                          {existingUserMatch.email}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {existingUserMatch.roles.map(role => (
                            <span key={role} className={`text-xs px-2 py-1 rounded ${role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-700 hover:bg-yellow-100"
                        onClick={() => {
                          // Filter to only include valid CONTENT_EDITORS ids
                          const validEditorIds = CONTENT_EDITORS.map(e => e.id);
                          const filteredEditors = (existingUserMatch.contentEditors || []).filter(id => validEditorIds.includes(id));
                          
                          setShowInviteDialog(false);
                          setSelectedUser(existingUserMatch);
                          setEditUserName(existingUserMatch.full_name || '');
                          setEditUsername(existingUserMatch.username || '');
                          setEditUserEmail(existingUserMatch.email);
                          setEditUserPassword('');
                          setEditUserRole(existingUserMatch.roles.includes('admin') ? 'admin' : 'editor');
                          setEditSelectedEditors(filteredEditors);
                          setShowEditUserDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-username" className="text-base font-semibold text-gray-900">Login (Username)</Label>
              <Input
                id="invite-username"
                type="text"
                placeholder="e.g. admin123 or john.doe"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                className="text-base h-12"
              />
              <p className="text-sm text-gray-600">The username for login. Can be freely chosen.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-password" className="text-base font-semibold text-gray-900">Password *</Label>
              <div className="relative">
                <Input
                  id="invite-password"
                  type={showInvitePassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="pr-12 text-base h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowInvitePassword(!showInvitePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showInvitePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-bold text-gray-900">Role *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    inviteRole === 'editor' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                  onClick={() => setInviteRole('editor')}
                >
                  <div className="flex items-center gap-3">
                    <Pencil className={`h-6 w-6 ${inviteRole === 'editor' ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className={`text-lg font-bold ${inviteRole === 'editor' ? 'text-blue-900' : 'text-gray-900'}`}>Editor</span>
                  </div>
                  <p className={`text-base mt-2 ${inviteRole === 'editor' ? 'text-blue-600' : 'text-gray-600'}`}>Can edit assigned content</p>
                </div>
                <div 
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    inviteRole === 'admin' 
                      ? 'border-red-500 bg-red-50' 
                      : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                  onClick={() => setInviteRole('admin')}
                >
                  <div className="flex items-center gap-3">
                    <Crown className={`h-6 w-6 ${inviteRole === 'admin' ? 'text-red-600' : 'text-gray-600'}`} />
                    <span className={`text-lg font-bold ${inviteRole === 'admin' ? 'text-red-900' : 'text-gray-900'}`}>Admin</span>
                  </div>
                  <p className={`text-base mt-2 ${inviteRole === 'admin' ? 'text-red-600' : 'text-gray-600'}`}>Full system access</p>
                </div>
              </div>
            </div>

            {/* Global Language Permissions - only shown when Editor is selected */}
            {inviteRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    Language Permissions
                  </Label>
                  <p className="text-base text-gray-700 mt-2">
                    Select the languages the editor may edit.
                    This permission applies to <strong>all areas</strong>: CMS segments, News, Events, Products, Downloads.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = inviteGlobalSegmentLanguages.includes(lang.code);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setInviteGlobalSegmentLanguages(inviteGlobalSegmentLanguages.filter(l => l !== lang.code));
                          } else {
                            setInviteGlobalSegmentLanguages([...inviteGlobalSegmentLanguages, lang.code]);
                          }
                        }}
                        className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                          isSelected
                            ? 'bg-purple-100 border-purple-500 text-purple-800 shadow-md'
                            : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-semibold">{lang.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                      </button>
                    );
                  })}
                </div>
                
                {inviteGlobalSegmentLanguages.length > 0 ? (
                  <div className="bg-purple-100 border-2 border-purple-400 rounded-lg px-5 py-4">
                    <p className="text-lg font-bold text-purple-800">
                      ✓ {inviteGlobalSegmentLanguages.length} language(s) selected
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      The editor can edit content in these languages across all areas (CMS segments, News, Events, Products, Downloads).
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg px-5 py-4">
                    <p className="text-base text-amber-800">
                      ⚠️ No languages selected - the editor cannot edit any content.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Draft/Publish Permissions - only shown when Editor is selected */}
            {inviteRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Save className="h-5 w-5 text-orange-600" />
                    Content Workflow Permissions
                  </Label>
                  <p className="text-base text-gray-700 mt-2">
                    Control whether the editor can save drafts and/or publish content directly.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      inviteCanDraft 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                    onClick={() => setInviteCanDraft(!inviteCanDraft)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={inviteCanDraft} 
                        onCheckedChange={(checked) => setInviteCanDraft(checked === true)}
                        className="h-5 w-5"
                      />
                      <span className={`text-lg font-bold ${inviteCanDraft ? 'text-orange-900' : 'text-gray-900'}`}>
                        Save Drafts
                      </span>
                    </div>
                    <p className={`text-base mt-2 ${inviteCanDraft ? 'text-orange-600' : 'text-gray-600'}`}>
                      Can save content as draft for review
                    </p>
                  </div>
                  <div 
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      inviteCanPublish 
                        ? 'border-green-500 bg-green-50' 
                        : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                    onClick={() => setInviteCanPublish(!inviteCanPublish)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={inviteCanPublish} 
                        onCheckedChange={(checked) => setInviteCanPublish(checked === true)}
                        className="h-5 w-5"
                      />
                      <span className={`text-lg font-bold ${inviteCanPublish ? 'text-green-900' : 'text-gray-900'}`}>
                        Publish Content
                      </span>
                    </div>
                    <p className={`text-base mt-2 ${inviteCanPublish ? 'text-green-600' : 'text-gray-600'}`}>
                      Can publish content directly (live)
                    </p>
                  </div>
                </div>
                
                <div className={`rounded-lg px-5 py-4 ${
                  inviteCanPublish 
                    ? 'bg-green-100 border-2 border-green-400' 
                    : inviteCanDraft 
                      ? 'bg-orange-100 border-2 border-orange-400'
                      : 'bg-amber-50 border-2 border-amber-300'
                }`}>
                  <p className={`text-base font-semibold ${
                    inviteCanPublish 
                      ? 'text-green-800' 
                      : inviteCanDraft 
                        ? 'text-orange-800'
                        : 'text-amber-800'
                  }`}>
                    {inviteCanPublish && inviteCanDraft && '✓ Editor can save drafts and publish content directly.'}
                    {inviteCanPublish && !inviteCanDraft && '✓ Editor can only publish content (no drafts).'}
                    {!inviteCanPublish && inviteCanDraft && '✓ Editor can save drafts (requires admin approval to publish).'}
                    {!inviteCanPublish && !inviteCanDraft && '⚠️ Editor cannot save or publish any content.'}
                  </p>
                </div>
              </div>
            )}

            {/* Frontend Editing Settings - only shown when Editor is selected */}
            {inviteRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MonitorSmartphone className="h-5 w-5 text-cyan-600" />
                    Frontend Editing
                  </Label>
                  <p className="text-base text-gray-700 mt-2">
                    Allow the editor to make changes directly on the live website preview.
                  </p>
                </div>
                
                <div 
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    inviteFrontendEditingEnabled 
                      ? 'border-cyan-500 bg-cyan-50' 
                      : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                  onClick={() => setInviteFrontendEditingEnabled(!inviteFrontendEditingEnabled)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={inviteFrontendEditingEnabled} 
                      onCheckedChange={(checked) => setInviteFrontendEditingEnabled(checked === true)}
                      className="h-5 w-5"
                    />
                    <span className={`text-lg font-bold ${inviteFrontendEditingEnabled ? 'text-cyan-900' : 'text-gray-900'}`}>
                      Enable Frontend Editing
                    </span>
                  </div>
                  <p className={`text-base mt-2 ${inviteFrontendEditingEnabled ? 'text-cyan-600' : 'text-gray-600'}`}>
                    Editor can use the visual in-page editor to modify content directly on the website
                  </p>
                </div>
                
                <div className={`rounded-lg px-5 py-4 ${
                  inviteFrontendEditingEnabled 
                    ? 'bg-cyan-100 border-2 border-cyan-400' 
                    : 'bg-gray-100 border-2 border-gray-300'
                }`}>
                  <p className={`text-base font-semibold ${inviteFrontendEditingEnabled ? 'text-cyan-800' : 'text-gray-600'}`}>
                    {inviteFrontendEditingEnabled 
                      ? '✓ Editor can access Frontend Editing mode via ?edit=true URL parameter'
                      : 'Frontend Editing is disabled - editor must use the Admin Dashboard'}
                  </p>
                </div>
              </div>
            )}
            {inviteRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900">Select Content Editors</Label>
                  <p className="text-base text-gray-700 mt-2">
                    Click on the editors (News, Events, etc.) that the user should have access to.
                    Language permissions are controlled by the selection above.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CONTENT_EDITORS.map((editor) => {
                    const isSelected = inviteSelectedEditors.includes(editor.id);
                    return (
                      <div
                        key={editor.id}
                        onClick={() => {
                          if (isSelected) {
                            setInviteSelectedEditors(inviteSelectedEditors.filter(id => id !== editor.id));
                          } else {
                            setInviteSelectedEditors([...inviteSelectedEditors, editor.id]);
                          }
                          setInviteEditorAccess('custom');
                        }}
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? `${editor.borderColor} bg-white shadow-xl` 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1 ${editor.bgColor}`}></div>
                        <div className="p-5 space-y-3 text-center">
                          <div className={`h-12 w-12 mx-auto rounded-xl ${editor.bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <div className="text-white">{editor.icon}</div>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">{editor.name}</h4>
                          <p className="text-xs text-gray-500">{editor.description}</p>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-md">
                              <Check className="h-4 w-4 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {inviteSelectedEditors.length > 0 && (
                  <div className="bg-green-100 border-2 border-green-400 rounded-lg px-5 py-4">
                    <p className="text-lg font-bold text-green-800">
                      ✓ {inviteSelectedEditors.length} editor(s) selected
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInviteUser} 
              disabled={isInviting || !inviteEmail.trim() || !invitePassword.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isInviting ? (
                <>Creating...</>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you really want to delete user <strong>{selectedUser?.full_name || selectedUser?.email}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Editor Access Dialog */}
      <Dialog open={showEditorAccessDialog} onOpenChange={setShowEditorAccessDialog}>
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[85vh] overflow-y-auto mt-16 bg-white [&>button]:hidden">
          <DialogHeader className="relative">
            <button
              onClick={() => setShowEditorAccessDialog(false)}
              className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-900 transition-colors text-3xl font-light leading-none focus:outline-none"
              title="Close"
            >
              ×
            </button>
            <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
              <Settings className="h-6 w-6 text-blue-600" />
              Manage Editor Permissions
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700">
              Select the areas that {selectedUser?.full_name || selectedUser?.email} may edit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Access Type Selection */}
            <div>
              <Label className="text-xl font-bold text-gray-900">Select Content Editors</Label>
              <p className="text-base text-gray-700 mt-2">Click on the editors the user should have access to.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CONTENT_EDITORS.map((editor) => {
                const isSelected = selectedEditors.includes(editor.id);
                return (
                  <div
                    key={editor.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedEditors(selectedEditors.filter(id => id !== editor.id));
                      } else {
                        setSelectedEditors([...selectedEditors, editor.id]);
                      }
                      setEditorAccessType('custom');
                    }}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? `${editor.borderColor} bg-white shadow-xl` 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${editor.bgColor}`}></div>
                    <div className="p-5 space-y-3 text-center">
                      <div className={`h-12 w-12 mx-auto rounded-xl ${editor.bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <div className="text-white">{editor.icon}</div>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{editor.name}</h4>
                      <p className="text-xs text-gray-500">{editor.description}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-md">
                          <Check className="h-4 w-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedEditors.length > 0 && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg px-5 py-4">
                <p className="text-lg font-bold text-green-800">
                  ✓ {selectedEditors.length} editor(s) selected
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditorAccessDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={handleSaveEditorAccess} 
              disabled={savingAccess}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {savingAccess ? (
                <>Saving...</>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[85vh] overflow-y-auto mt-16 bg-white [&>button]:hidden">
          <DialogHeader className="relative">
            <button
              onClick={() => setShowEditUserDialog(false)}
              className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-900 transition-colors text-3xl font-light leading-none focus:outline-none"
              title="Close"
            >
              ×
            </button>
            <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
              <Pencil className="h-6 w-6 text-yellow-600" />
              Edit User
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700">
              Edit settings for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Editable User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-base font-semibold text-gray-900">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter name"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="text-base h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-base font-semibold text-gray-900">Login (Username)</Label>
                <Input
                  id="edit-username"
                  type="text"
                  placeholder="e.g. admin123"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="text-base h-12"
                />
                <p className="text-sm text-gray-600">The username for login</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-base font-semibold text-gray-900">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@example.com"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="text-base h-12"
                />
                <p className="text-sm text-gray-600">For communication (profile email)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-base font-semibold text-gray-900">New Password</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showEditPassword ? "text" : "password"}
                    placeholder="Leave empty = unchanged"
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    className="pr-12 text-base h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showEditPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-sm text-gray-600">Only fill in if password should be changed</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Label className="text-lg font-bold text-gray-900">Role</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    editUserRole === 'editor' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                  onClick={() => setEditUserRole('editor')}
                >
                  <div className="flex items-center gap-3">
                    <Pencil className={`h-6 w-6 ${editUserRole === 'editor' ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className={`text-lg font-bold ${editUserRole === 'editor' ? 'text-blue-900' : 'text-gray-900'}`}>Editor</span>
                  </div>
                  <p className={`text-base mt-2 ${editUserRole === 'editor' ? 'text-blue-600' : 'text-gray-600'}`}>Can edit assigned content</p>
                </div>
                <div 
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    editUserRole === 'admin' 
                      ? 'border-red-500 bg-red-50' 
                      : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                  onClick={() => setEditUserRole('admin')}
                >
                  <div className="flex items-center gap-3">
                    <Crown className={`h-6 w-6 ${editUserRole === 'admin' ? 'text-red-600' : 'text-gray-600'}`} />
                    <span className={`text-lg font-bold ${editUserRole === 'admin' ? 'text-red-900' : 'text-gray-900'}`}>Admin</span>
                  </div>
                  <p className={`text-base mt-2 ${editUserRole === 'admin' ? 'text-red-600' : 'text-gray-600'}`}>Full system access</p>
                </div>
              </div>
            </div>

            {/* Global Language Permissions - only for Editor role */}
            {editUserRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    Language Permissions
                  </Label>
                  <p className="text-base text-gray-700 mt-2">
                    Select the languages the editor may edit. 
                    This permission applies to <strong>all areas</strong>: CMS segments, News, Events, Products, Downloads.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = editGlobalSegmentLanguages.includes(lang.code);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setEditGlobalSegmentLanguages(editGlobalSegmentLanguages.filter(l => l !== lang.code));
                          } else {
                            setEditGlobalSegmentLanguages([...editGlobalSegmentLanguages, lang.code]);
                          }
                        }}
                        className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                          isSelected
                            ? 'bg-purple-100 border-purple-500 text-purple-800 shadow-md'
                            : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-semibold">{lang.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                      </button>
                    );
                  })}
                </div>
                
                {editGlobalSegmentLanguages.length > 0 ? (
                  <div className="bg-purple-100 border-2 border-purple-400 rounded-lg px-5 py-4">
                    <p className="text-lg font-bold text-purple-800">
                      ✓ {editGlobalSegmentLanguages.length} language(s) selected
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      The editor can edit content in these languages across all areas (CMS segments, News, Events, Products, Downloads).
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg px-5 py-4">
                    <p className="text-base text-amber-800">
                      ⚠️ No languages selected - the editor cannot edit any content.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Content Editor Selection - only for Editor role */}
            {editUserRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900">Select Content Editors</Label>
                  <p className="text-base text-gray-700 mt-2">
                    Click on the editors (News, Events, etc.) that the user should have access to.
                    Language permissions are controlled by the selection above.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CONTENT_EDITORS.map((editor) => {
                    const isSelected = editSelectedEditors.includes(editor.id);
                    return (
                      <div
                        key={editor.id}
                        onClick={() => {
                          if (isSelected) {
                            setEditSelectedEditors(editSelectedEditors.filter(id => id !== editor.id));
                          } else {
                            setEditSelectedEditors([...editSelectedEditors, editor.id]);
                          }
                        }}
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? `${editor.borderColor} bg-white shadow-xl` 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1 ${editor.bgColor}`}></div>
                        <div className="p-5 space-y-3 text-center">
                          <div className={`h-12 w-12 mx-auto rounded-xl ${editor.bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <div className="text-white">{editor.icon}</div>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">{editor.name}</h4>
                          <p className="text-xs text-gray-500">{editor.description}</p>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-md">
                              <Check className="h-4 w-4 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {editSelectedEditors.length > 0 && (
                  <div className="bg-green-100 border-2 border-green-400 rounded-lg px-5 py-4">
                    <p className="text-lg font-bold text-green-800">
                      ✓ {editSelectedEditors.length} editor(s) selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Draft/Publish Permissions - only for Editor role */}
            {editUserRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Save className="h-5 w-5 text-orange-600" />
                    Content Workflow Permissions
                  </Label>
                  <p className="text-base text-gray-700 mt-2">
                    Control whether the editor can save drafts and/or publish content directly.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      editCanDraft 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                    onClick={() => setEditCanDraft(!editCanDraft)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={editCanDraft} 
                        onCheckedChange={(checked) => setEditCanDraft(checked === true)}
                        className="h-5 w-5"
                      />
                      <span className={`text-lg font-bold ${editCanDraft ? 'text-orange-900' : 'text-gray-900'}`}>
                        Save Drafts
                      </span>
                    </div>
                    <p className={`text-base mt-2 ${editCanDraft ? 'text-orange-600' : 'text-gray-600'}`}>
                      Can save content as draft for review
                    </p>
                  </div>
                  <div 
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      editCanPublish 
                        ? 'border-green-500 bg-green-50' 
                        : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                    onClick={() => setEditCanPublish(!editCanPublish)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={editCanPublish} 
                        onCheckedChange={(checked) => setEditCanPublish(checked === true)}
                        className="h-5 w-5"
                      />
                      <span className={`text-lg font-bold ${editCanPublish ? 'text-green-900' : 'text-gray-900'}`}>
                        Publish Content
                      </span>
                    </div>
                    <p className={`text-base mt-2 ${editCanPublish ? 'text-green-600' : 'text-gray-600'}`}>
                      Can publish content directly (live)
                    </p>
                  </div>
                </div>
                
                <div className={`rounded-lg px-5 py-4 ${
                  editCanPublish 
                    ? 'bg-green-100 border-2 border-green-400' 
                    : editCanDraft 
                      ? 'bg-orange-100 border-2 border-orange-400'
                      : 'bg-amber-50 border-2 border-amber-300'
                }`}>
                  <p className={`text-base font-semibold ${
                    editCanPublish 
                      ? 'text-green-800' 
                      : editCanDraft 
                        ? 'text-orange-800'
                        : 'text-amber-800'
                  }`}>
                    {editCanPublish && editCanDraft && '✓ Editor can save drafts and publish content directly.'}
                    {editCanPublish && !editCanDraft && '✓ Editor can only publish content (no drafts).'}
                    {!editCanPublish && editCanDraft && '✓ Editor can save drafts (requires admin approval to publish).'}
                    {!editCanPublish && !editCanDraft && '⚠️ Editor cannot save or publish any content.'}
                  </p>
                </div>
              </div>
            )}

            {/* Frontend Editing Settings - only for Editor role */}
            {editUserRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MonitorSmartphone className="h-5 w-5 text-cyan-600" />
                    Frontend Editing
                  </Label>
                  <p className="text-base text-gray-700 mt-2">
                    Allow the editor to make changes directly on the live website preview.
                  </p>
                </div>
                
                <div 
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    editFrontendEditingEnabled 
                      ? 'border-cyan-500 bg-cyan-50' 
                      : 'bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                  onClick={() => setEditFrontendEditingEnabled(!editFrontendEditingEnabled)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={editFrontendEditingEnabled} 
                      onCheckedChange={(checked) => setEditFrontendEditingEnabled(checked === true)}
                      className="h-5 w-5"
                    />
                    <span className={`text-lg font-bold ${editFrontendEditingEnabled ? 'text-cyan-900' : 'text-gray-900'}`}>
                      Enable Frontend Editing
                    </span>
                  </div>
                  <p className={`text-base mt-2 ${editFrontendEditingEnabled ? 'text-cyan-600' : 'text-gray-600'}`}>
                    Editor can use the visual in-page editor to modify content directly on the website
                  </p>
                </div>
                
                <div className={`rounded-lg px-5 py-4 ${
                  editFrontendEditingEnabled 
                    ? 'bg-cyan-100 border-2 border-cyan-400' 
                    : 'bg-gray-100 border-2 border-gray-300'
                }`}>
                  <p className={`text-base font-semibold ${editFrontendEditingEnabled ? 'text-cyan-800' : 'text-gray-600'}`}>
                    {editFrontendEditingEnabled 
                      ? '✓ Editor can access Frontend Editing mode via ?edit=true URL parameter'
                      : 'Frontend Editing is disabled - editor must use the Admin Dashboard'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={handleSaveEditUser} 
              disabled={isSavingEdit}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSavingEdit ? (
                <>Saving...</>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
