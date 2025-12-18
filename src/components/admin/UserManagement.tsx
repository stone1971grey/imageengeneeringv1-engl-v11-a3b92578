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
import { Shield, ShieldCheck, ShieldAlert, User, UserPlus, Trash2, Lock, Eye, EyeOff, Users, Crown, Pencil, Save, Settings, Globe, Check, Newspaper, Calendar, Target, Download, Book } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

type AppRole = 'admin' | 'editor';
type LanguageCode = 'de' | 'ja' | 'ko' | 'zh';

const AVAILABLE_LANGUAGES = [
  { code: 'de' as LanguageCode, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja' as LanguageCode, name: 'Japanisch', flag: '🇯🇵' },
  { code: 'ko' as LanguageCode, name: 'Koreanisch', flag: '🇰🇷' },
  { code: 'zh' as LanguageCode, name: 'Chinesisch', flag: '🇨🇳' },
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
    description: 'News-Artikel erstellen & bearbeiten',
    icon: <Newspaper className="h-6 w-6" />,
    color: 'hsl(var(--primary))',
    bgColor: 'bg-[hsl(var(--primary))]',
    borderColor: 'border-[hsl(var(--primary))]'
  },
  {
    id: 'events',
    name: 'Manage Events',
    description: 'Events & Veranstaltungen verwalten',
    icon: <Calendar className="h-6 w-6" />,
    color: 'hsl(var(--events-button))',
    bgColor: 'bg-[hsl(var(--events-button))]',
    borderColor: 'border-[hsl(var(--events-button))]'
  },
  {
    id: 'products',
    name: 'Manage Products',
    description: 'Produkt-Katalog verwalten',
    icon: <Target className="h-6 w-6" />,
    color: 'hsl(var(--accent-blue))',
    bgColor: 'bg-[hsl(var(--accent-blue))]',
    borderColor: 'border-[hsl(var(--accent-blue))]'
  },
  {
    id: 'downloads',
    name: 'Manage Downloads',
    description: 'Downloads & Ressourcen verwalten',
    icon: <Download className="h-6 w-6" />,
    color: 'hsl(180 60% 45%)',
    bgColor: 'bg-[hsl(180_60%_45%)]',
    borderColor: 'border-[hsl(180_60%_45%)]'
  },
  {
    id: 'seo',
    name: 'SEO Settings',
    description: 'SEO-Einstellungen bearbeiten',
    icon: <Eye className="h-6 w-6" />,
    color: 'hsl(var(--seo-button))',
    bgColor: 'bg-[hsl(var(--seo-button))]',
    borderColor: 'border-[hsl(var(--seo-button))]'
  },
  {
    id: 'glossary',
    name: 'Translation Glossary',
    description: 'Übersetzungs-Glossar verwalten',
    icon: <Book className="h-6 w-6" />,
    color: 'hsl(var(--accent-violet))',
    bgColor: 'bg-[hsl(var(--accent-violet))]',
    borderColor: 'border-[hsl(var(--accent-violet))]'
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

      // Fetch editor page access (now used for content editors) including language_code
      const { data: editorAccess, error: accessError } = await supabase
        .from('editor_page_access')
        .select('user_id, page_slug, language_code');

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
        
        userEditorAccess.forEach(access => {
          // Collect global segment languages
          if (access.page_slug === '__global__' && access.language_code) {
            globalSegmentLanguages.push(access.language_code as LanguageCode);
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
          globalSegmentLanguages
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
      toast.error('Bitte E-Mail und Passwort eingeben');
      return;
    }

    if (invitePassword.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setIsInviting(true);
    try {
      const username = inviteUsername.trim() || null;
      const email = inviteEmail.trim();
      
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Nicht autorisiert - bitte erneut anmelden');
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
        toast.error('Fehler beim Anlegen des Benutzers');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (!data?.user?.id) {
        toast.error('Benutzer konnte nicht erstellt werden');
        return;
      }

      const newUserId = data.user.id;

      // If editor, add permissions
      if (inviteRole === 'editor') {
        const entries: { user_id: string; page_slug: string; language_code?: string | null }[] = [];
        
        // Add global segment language permissions
        if (inviteGlobalSegmentLanguages.length > 0) {
          inviteGlobalSegmentLanguages.forEach(lang => {
            entries.push({
              user_id: newUserId,
              page_slug: '__global__',
              language_code: lang
            });
          });
        }
        
        // Add content editor access
        if (inviteEditorAccess === 'all') {
          entries.push({ user_id: newUserId, page_slug: '__all__', language_code: null });
        } else if (inviteEditorAccess === 'custom' && inviteSelectedEditors.length > 0) {
          inviteSelectedEditors.forEach(editorId => {
            const languages = inviteEditorLanguages[editorId] || [];
            if (languages.length > 0) {
              languages.forEach(lang => {
                entries.push({
                  user_id: newUserId,
                  page_slug: editorId,
                  language_code: lang
                });
              });
            } else {
              entries.push({
                user_id: newUserId,
                page_slug: editorId,
                language_code: null
              });
            }
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

      toast.success(`${inviteRole === 'admin' ? 'Admin' : 'Editor'} "${username || email}" wurde erfolgreich angelegt`);
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
      loadUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Fehler beim Anlegen des Benutzers');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    // Prevent deleting the last admin
    const admins = users.filter(u => u.roles.includes('admin'));
    if (selectedUser.roles.includes('admin') && admins.length <= 1) {
      toast.error('Der letzte Admin kann nicht gelöscht werden');
      setShowDeleteConfirm(false);
      return;
    }

    setIsDeleting(true);
    try {
      // Delete user roles first
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);

      if (rolesError) {
        console.error('Error deleting roles:', rolesError);
      }

      // Delete editor page access
      const { error: accessError } = await supabase
        .from('editor_page_access')
        .delete()
        .eq('user_id', selectedUser.id);

      if (accessError) {
        console.error('Error deleting editor access:', accessError);
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      toast.success(`Benutzer "${selectedUser.email}" wurde gelöscht`);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Fehler beim Löschen des Benutzers');
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
        return 'bg-red-100 text-red-800 border-red-300';
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('de-DE', {
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
            toast.error('Dieser Benutzername ist bereits vergeben');
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
        const entries: { user_id: string; page_slug: string; language_code: string | null }[] = [];
        
        // Add global segment language permissions
        if (editGlobalSegmentLanguages.length > 0) {
          console.log('Inserting global segment languages:', editGlobalSegmentLanguages);
          editGlobalSegmentLanguages.forEach(lang => {
            entries.push({
              user_id: selectedUser.id,
              page_slug: '__global__',
              language_code: lang
            });
          });
        }
        
        // Add content editor access
        if (editSelectedEditors.length > 0) {
          console.log('Inserting editor access:', editSelectedEditors, 'with languages:', editEditorLanguages);
          
          editSelectedEditors.forEach(editorId => {
            const languages = editEditorLanguages[editorId] || [];
            if (languages.length > 0) {
              // Create one entry per language
              languages.forEach(lang => {
                entries.push({
                  user_id: selectedUser.id,
                  page_slug: editorId,
                  language_code: lang
                });
              });
            } else {
              // No language restriction - full access to this editor
              entries.push({
                user_id: selectedUser.id,
                page_slug: editorId,
                language_code: null
              });
            }
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

      toast.success('Benutzer erfolgreich aktualisiert');
      // Dialog bleibt offen - wird nur über X-Button geschlossen
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Fehler: ${error?.message || 'Unbekannter Fehler'}`);
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

      toast.success('Editor-Berechtigungen gespeichert');
      setShowEditorAccessDialog(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving editor access:', error);
      toast.error('Fehler beim Speichern der Berechtigungen');
    } finally {
      setSavingAccess(false);
    }
  };

  const getEditorAccessLabel = (access: 'all' | 'custom' | 'none' | undefined) => {
    switch (access) {
      case 'all':
        return 'Alle Editoren';
      case 'custom':
        return 'Benutzerdefiniert';
      default:
        return 'Keine Berechtigung';
    }
  };

  const allRoles: AppRole[] = ['admin', 'editor'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Admins</p>
              <p className="text-2xl font-bold text-red-900">
                {users.filter(u => u.roles.includes('admin')).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Pencil className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Editors</p>
              <p className="text-2xl font-bold text-blue-900">
                {users.filter(u => u.roles.includes('editor')).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Gesamt</p>
              <p className="text-2xl font-bold text-green-900">{users.length}</p>
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
                Benutzer & Rollen
              </CardTitle>
              <CardDescription>
                Admins und Editoren verwalten
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowInviteDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Neuen Benutzer anlegen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="font-semibold text-black">User</TableHead>
                  <TableHead className="font-semibold text-black">Email</TableHead>
                  <TableHead className="font-semibold text-black">Roles</TableHead>
                  <TableHead className="font-semibold text-black">CMS-Sprachen</TableHead>
                  <TableHead className="font-semibold text-black">Content-Editoren</TableHead>
                  <TableHead className="font-semibold text-black">Created</TableHead>
                  <TableHead className="font-semibold text-black text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-white group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-black">
                            {user.full_name || 'No name'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 group-hover:text-black">{user.email}</TableCell>
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
                              {role}
                              <button
                                onClick={() => handleRemoveRole(user.id, role)}
                                className="ml-1 hover:text-red-600 transition-colors"
                                title="Remove role"
                              >
                                ×
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No roles assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles.includes('editor') ? (
                        user.globalSegmentLanguages && user.globalSegmentLanguages.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.globalSegmentLanguages.map(lang => {
                              const langInfo = AVAILABLE_LANGUAGES.find(l => l.code === lang);
                              return (
                                <Badge key={lang} variant="outline" className="bg-purple-50 border-purple-300 text-purple-700 text-xs">
                                  {langInfo?.flag} {langInfo?.name || lang}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Keine</span>
                        )
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.roles.includes('editor') ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditorAccessDialog(user)}
                          className={`text-xs ${
                            user.editorAccess === 'all' 
                              ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                              : user.editorAccess === 'custom'
                              ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          {getEditorAccessLabel(user.editorAccess)}
                          {user.editorAccess === 'custom' && user.contentEditors && (() => {
                            const validEditorIds = CONTENT_EDITORS.map(e => e.id);
                            const validCount = user.contentEditors.filter(id => validEditorIds.includes(id)).length;
                            return validCount > 0 ? <span className="ml-1">({validCount})</span> : null;
                          })()}
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm group-hover:text-black">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
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
                            setShowEditUserDialog(true);
                          }}
                          className="h-8 w-8 flex items-center justify-center text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-md transition-colors"
                          title="Benutzer bearbeiten"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="h-8 w-8 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Benutzer löschen"
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Rollen-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Admin</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Voller Systemzugriff</li>
                <li>• Benutzer & Rollen verwalten</li>
                <li>• Alle Seiten & Inhalte bearbeiten</li>
                <li>• Zugriff auf alle Einstellungen</li>
                <li>• Inhalte dauerhaft löschen</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Editor</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Zugewiesene Seiten bearbeiten</li>
                <li>• Inhalte erstellen & aktualisieren</li>
                <li>• Mediendateien hochladen</li>
                <li>• Übersetzungen verwalten</li>
                <li>• Zugriff auf Glossar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="w-[95vw] max-w-[1400px] max-h-[85vh] overflow-y-auto mt-16 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
              <UserPlus className="h-6 w-6" />
              Neuen Benutzer anlegen
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700">
              Legen Sie einen neuen Admin oder Editor an.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name" className="text-base font-semibold text-gray-900">Name</Label>
              <Input
                id="invite-name"
                placeholder="Max Mustermann"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
                className="text-base h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-username" className="text-base font-semibold text-gray-900">Login (Benutzername)</Label>
              <Input
                id="invite-username"
                type="text"
                placeholder="z.B. admin123 oder max.mustermann"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                className="text-base h-12"
              />
              <p className="text-sm text-gray-600">Der Benutzername für den Login. Kann frei gewählt werden.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-base font-semibold text-gray-900">E-Mail-Adresse *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={`text-base h-12 ${existingUserMatch ? 'border-yellow-500 ring-2 ring-yellow-200' : ''}`}
              />
              <p className="text-sm text-gray-600">Für Kommunikation und als Fallback für den Login.</p>
              {existingUserMatch && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mt-2">
                  <p className="text-base font-bold text-yellow-800 mb-2">
                    ⚠️ Dieser Benutzer existiert bereits:
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-yellow-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-gray-900">{existingUserMatch.full_name || 'Kein Name'}</p>
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
                        Bearbeiten
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-password" className="text-base font-semibold text-gray-900">Passwort *</Label>
              <div className="relative">
                <Input
                  id="invite-password"
                  type={showInvitePassword ? "text" : "password"}
                  placeholder="Mindestens 6 Zeichen"
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
              <Label className="text-lg font-bold text-gray-900">Rolle *</Label>
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
                  <p className={`text-base mt-2 ${inviteRole === 'editor' ? 'text-blue-600' : 'text-gray-600'}`}>Kann zugewiesene Inhalte bearbeiten</p>
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
                  <p className={`text-base mt-2 ${inviteRole === 'admin' ? 'text-red-600' : 'text-gray-600'}`}>Voller Systemzugriff</p>
                </div>
              </div>
            </div>

            {/* Global Segment Languages - only shown when Editor is selected */}
            {inviteRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    Globale Sprachberechtigungen (CMS-Segmente)
                  </Label>
                  <p className="text-base text-gray-700 mt-2">
                    Wählen Sie die Sprachen aus, die der Editor auf allen CMS-Seiten bearbeiten darf.
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
                
                {inviteGlobalSegmentLanguages.length > 0 && (
                  <div className="bg-purple-100 border-2 border-purple-400 rounded-lg px-5 py-4">
                    <p className="text-lg font-bold text-purple-800">
                      ✓ {inviteGlobalSegmentLanguages.length} Sprache(n) für CMS-Segmente ausgewählt
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Editor Access Selection - only shown when Editor is selected */}
            {inviteRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900">Content-Editoren auswählen</Label>
                  <p className="text-base text-gray-700 mt-2">Klicken Sie auf die Editoren (News, Events, etc.), auf die der Benutzer Zugriff haben soll.</p>
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
                      ✓ {inviteSelectedEditors.length} Editor(en) ausgewählt
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleInviteUser} 
              disabled={isInviting || !inviteEmail.trim() || !invitePassword.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isInviting ? (
                <>Wird angelegt...</>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Benutzer anlegen
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
              Benutzer löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Benutzer <strong>{selectedUser?.full_name || selectedUser?.email}</strong> wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Editor Access Dialog */}
      <Dialog open={showEditorAccessDialog} onOpenChange={setShowEditorAccessDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editor-Berechtigungen verwalten
            </DialogTitle>
            <DialogDescription>
              Wählen Sie die Bereiche aus, die {selectedUser?.full_name || selectedUser?.email} bearbeiten darf.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Access Type Selection */}
            <div>
              <Label className="text-xl font-bold text-gray-900">Content-Editoren auswählen</Label>
              <p className="text-base text-gray-700 mt-2">Klicken Sie auf die Editoren, auf die der Benutzer Zugriff haben soll.</p>
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
                  ✓ {selectedEditors.length} Editor(en) ausgewählt
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditorAccessDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSaveEditorAccess} 
              disabled={savingAccess}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {savingAccess ? (
                <>Speichern...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={(open) => {
        // Nur schließen wenn explizit geschlossen wird (nicht bei Overlay-Click)
        if (!open) return;
      }}>
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[85vh] overflow-y-auto mt-16 bg-white" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="relative">
            <button
              onClick={() => setShowEditUserDialog(false)}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
              title="Schließen"
            >
              ×
            </button>
            <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
              <Pencil className="h-6 w-6 text-yellow-600" />
              Benutzer bearbeiten
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700">
              Bearbeiten Sie die Einstellungen für {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Editable User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-base font-semibold text-gray-900">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Name eingeben"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="text-base h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-base font-semibold text-gray-900">Login (Benutzername)</Label>
                <Input
                  id="edit-username"
                  type="text"
                  placeholder="z.B. admin123"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="text-base h-12"
                />
                <p className="text-sm text-gray-600">Der Benutzername für den Login</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-base font-semibold text-gray-900">E-Mail-Adresse</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@example.com"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="text-base h-12"
                />
                <p className="text-sm text-gray-600">Für Kommunikation (Profil-E-Mail)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-base font-semibold text-gray-900">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showEditPassword ? "text" : "password"}
                    placeholder="Leer lassen = unverändert"
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
                <p className="text-sm text-gray-600">Nur ausfüllen wenn Passwort geändert werden soll</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Label className="text-lg font-bold text-gray-900">Rolle</Label>
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
                  <p className={`text-base mt-2 ${editUserRole === 'editor' ? 'text-blue-600' : 'text-gray-600'}`}>Kann zugewiesene Inhalte bearbeiten</p>
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
                  <p className={`text-base mt-2 ${editUserRole === 'admin' ? 'text-red-600' : 'text-gray-600'}`}>Voller Systemzugriff</p>
                </div>
              </div>
            </div>

            {/* Global Segment Languages - only for Editor role */}
            {editUserRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    Globale Sprachberechtigungen (CMS-Segmente)
                  </Label>
                  <p className="text-base text-gray-700 mt-2">
                    Wählen Sie die Sprachen aus, die der Editor auf <strong>allen CMS-Seiten</strong> bearbeiten darf. 
                    Englisch (Original) ist immer schreibgeschützt.
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
                      ✓ {editGlobalSegmentLanguages.length} Sprache(n) für CMS-Segmente ausgewählt
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      Der Editor kann auf allen CMS-Seiten die Splitscreen-Übersetzungen in diesen Sprachen bearbeiten.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg px-5 py-4">
                    <p className="text-base text-amber-800">
                      ⚠️ Keine Sprachen ausgewählt - der Editor kann keine CMS-Segmente bearbeiten.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Content Editor Selection - only for Editor role */}
            {editUserRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-xl font-bold text-gray-900">Content-Editoren auswählen</Label>
                  <p className="text-base text-gray-700 mt-2">Klicken Sie auf die Editoren (News, Events, etc.), auf die der Benutzer Zugriff haben soll.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CONTENT_EDITORS.map((editor) => {
                    const isSelected = editSelectedEditors.includes(editor.id);
                    const selectedLanguages = editEditorLanguages[editor.id] || [];
                    return (
                      <div
                        key={editor.id}
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                          isSelected 
                            ? `${editor.borderColor} bg-white shadow-xl` 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1 ${editor.bgColor}`}></div>
                        <div className="p-4">
                          <div 
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => {
                              if (isSelected) {
                                setEditSelectedEditors(editSelectedEditors.filter(id => id !== editor.id));
                                // Clear languages when deselecting
                                const newLangs = { ...editEditorLanguages };
                                delete newLangs[editor.id];
                                setEditEditorLanguages(newLangs);
                              } else {
                                setEditSelectedEditors([...editSelectedEditors, editor.id]);
                              }
                            }}
                          >
                            <div className={`h-10 w-10 rounded-xl ${editor.bgColor} flex items-center justify-center shadow-lg`}>
                              <div className="text-white">{editor.icon}</div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-gray-900">{editor.name}</h4>
                              <p className="text-xs text-gray-500">{editor.description}</p>
                            </div>
                            {isSelected && (
                              <div className="bg-green-500 rounded-full p-1 shadow-md">
                                <Check className="h-4 w-4 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          
                          {/* Language Selection - only visible when editor is selected */}
                          {isSelected && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                Sprachversionen (leer = voller Zugriff):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {AVAILABLE_LANGUAGES.map((lang) => {
                                  const isLangSelected = selectedLanguages.includes(lang.code);
                                  return (
                                    <button
                                      key={lang.code}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newLangs = isLangSelected
                                          ? selectedLanguages.filter(l => l !== lang.code)
                                          : [...selectedLanguages, lang.code];
                                        setEditEditorLanguages({
                                          ...editEditorLanguages,
                                          [editor.id]: newLangs
                                        });
                                      }}
                                      className={`px-2 py-1 text-xs rounded-md border transition-colors flex items-center gap-1 ${
                                        isLangSelected
                                          ? 'bg-purple-100 border-purple-400 text-purple-800'
                                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      <span>{lang.flag}</span>
                                      <span>{lang.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              {selectedLanguages.length > 0 && (
                                <p className="text-xs text-purple-600 mt-2">
                                  → Nur Übersetzungen in {selectedLanguages.length} Sprache(n) bearbeitbar
                                </p>
                              )}
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
                      ✓ {editSelectedEditors.length} Editor(en) ausgewählt
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
              Schließen
            </Button>
            <Button 
              onClick={handleSaveEditUser} 
              disabled={isSavingEdit}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSavingEdit ? (
                <>Wird gespeichert...</>
              ) : (
                <>Änderungen speichern</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
