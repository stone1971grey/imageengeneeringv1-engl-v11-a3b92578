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
import { Shield, ShieldCheck, ShieldAlert, User, UserPlus, Trash2, Lock, Eye, EyeOff, Users, Crown, Pencil, Save, Settings, Globe, Check, Newspaper, Calendar, Target, Download, Search, Languages } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

type AppRole = 'admin' | 'editor';

interface ContentEditor {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Define available content editors with their styling
const CONTENT_EDITORS: ContentEditor[] = [
  {
    id: 'news',
    name: 'Manage News',
    description: 'News-Artikel erstellen & bearbeiten',
    icon: <Newspaper className="h-5 w-5" />,
    color: 'hsl(var(--primary))',
    bgColor: 'bg-[hsl(var(--primary))]',
    borderColor: 'border-[hsl(var(--primary))]'
  },
  {
    id: 'events',
    name: 'Manage Events',
    description: 'Events & Veranstaltungen verwalten',
    icon: <Calendar className="h-5 w-5" />,
    color: 'hsl(var(--events-button))',
    bgColor: 'bg-[hsl(var(--events-button))]',
    borderColor: 'border-[hsl(var(--events-button))]'
  },
  {
    id: 'products',
    name: 'Manage Products',
    description: 'Produkt-Katalog verwalten',
    icon: <Target className="h-5 w-5" />,
    color: 'hsl(var(--accent-blue))',
    bgColor: 'bg-[hsl(var(--accent-blue))]',
    borderColor: 'border-[hsl(var(--accent-blue))]'
  },
  {
    id: 'downloads',
    name: 'Manage Downloads',
    description: 'Downloads & Ressourcen verwalten',
    icon: <Download className="h-5 w-5" />,
    color: 'hsl(180 60% 45%)',
    bgColor: 'bg-[hsl(180_60%_45%)]',
    borderColor: 'border-[hsl(180_60%_45%)]'
  },
  {
    id: 'seo',
    name: 'SEO Settings',
    description: 'SEO-Einstellungen bearbeiten',
    icon: <Search className="h-5 w-5" />,
    color: 'hsl(280 60% 50%)',
    bgColor: 'bg-[hsl(280_60%_50%)]',
    borderColor: 'border-[hsl(280_60%_50%)]'
  },
  {
    id: 'glossary',
    name: 'Translation Glossary',
    description: 'Übersetzungs-Glossar verwalten',
    icon: <Languages className="h-5 w-5" />,
    color: 'hsl(160 60% 40%)',
    bgColor: 'bg-[hsl(160_60%_40%)]',
    borderColor: 'border-[hsl(160_60%_40%)]'
  }
];

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
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
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('email');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch editor page access (now used for content editors)
      const { data: editorAccess, error: accessError } = await supabase
        .from('editor_page_access')
        .select('user_id, page_slug');

      if (accessError) throw accessError;

      // Combine profiles with their roles and editor access
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRoles = (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole);
        
        const userEditors = (editorAccess || [])
          .filter(a => a.user_id === profile.id)
          .map(a => a.page_slug);

        // Determine access type
        let accessType: 'all' | 'custom' | 'none' = 'none';
        if (userEditors.includes('__all__')) {
          accessType = 'all';
        } else if (userEditors.length > 0) {
          accessType = 'custom';
        }
        
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          roles: userRoles,
          created_at: profile.created_at || '',
          editorAccess: accessType,
          contentEditors: userEditors.filter(p => p !== '__all__')
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
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail.trim(),
        password: invitePassword,
        options: {
          data: {
            full_name: inviteFullName.trim() || inviteEmail.trim().split('@')[0]
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Diese E-Mail-Adresse ist bereits registriert');
        } else {
          throw authError;
        }
        return;
      }

      if (!authData.user) {
        toast.error('Benutzer konnte nicht erstellt werden');
        return;
      }

      // Add role for the new user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: authData.user.id, role: inviteRole });

      if (roleError) {
        console.error('Error adding role:', roleError);
      }

      // If editor, add content editor access permissions
      if (inviteRole === 'editor') {
        if (inviteEditorAccess === 'all') {
          const { error: accessError } = await supabase
            .from('editor_page_access')
            .insert({ user_id: authData.user.id, page_slug: '__all__' });

          if (accessError) {
            console.error('Error adding editor access:', accessError);
          }
        } else if (inviteEditorAccess === 'custom' && inviteSelectedEditors.length > 0) {
          const entries = inviteSelectedEditors.map(editorId => ({
            user_id: authData.user.id,
            page_slug: editorId
          }));

          const { error: accessError } = await supabase
            .from('editor_page_access')
            .insert(entries);

          if (accessError) {
            console.error('Error adding editor access:', accessError);
          }
        }
      }

      toast.success(`${inviteRole === 'admin' ? 'Admin' : 'Editor'} "${inviteEmail}" wurde erfolgreich angelegt`);
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteFullName("");
      setInvitePassword("");
      setInviteRole("editor");
      setInviteEditorAccess("all");
      setInviteSelectedEditors([]);
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
      // Update role - delete existing and add new
      const { error: deleteRoleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);

      if (deleteRoleError) throw deleteRoleError;

      const { error: insertRoleError } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser.id, role: editUserRole });

      if (insertRoleError) throw insertRoleError;

      // Update editor access
      const { error: deleteAccessError } = await supabase
        .from('editor_page_access')
        .delete()
        .eq('user_id', selectedUser.id);

      if (deleteAccessError) throw deleteAccessError;

      // Only add editor access if role is editor
      if (editUserRole === 'editor' && editSelectedEditors.length > 0) {
        const entries = editSelectedEditors.map(editorId => ({
          user_id: selectedUser.id,
          page_slug: editorId
        }));

        const { error: insertAccessError } = await supabase
          .from('editor_page_access')
          .insert(entries);

        if (insertAccessError) throw insertAccessError;
      }

      toast.success('Benutzer erfolgreich aktualisiert');
      setShowEditUserDialog(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Fehler beim Aktualisieren des Benutzers');
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
                  <TableHead className="font-semibold text-black">Editor-Berechtigungen</TableHead>
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
                          {user.editorAccess === 'custom' && user.contentEditors && (
                            <span className="ml-1">({user.contentEditors.length})</span>
                          )}
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
                            setSelectedUser(user);
                            setEditUserRole(user.roles.includes('admin') ? 'admin' : 'editor');
                            setEditSelectedEditors(user.contentEditors || []);
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
        <DialogContent className="w-[95vw] max-w-[1400px] max-h-[85vh] overflow-y-auto mt-16">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Neuen Benutzer anlegen
            </DialogTitle>
            <DialogDescription>
              Legen Sie einen neuen Admin oder Editor an.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">Name</Label>
              <Input
                id="invite-name"
                placeholder="Max Mustermann"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-email">E-Mail *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-password">Passwort *</Label>
              <div className="relative">
                <Input
                  id="invite-password"
                  type={showInvitePassword ? "text" : "password"}
                  placeholder="Mindestens 6 Zeichen"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowInvitePassword(!showInvitePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showInvitePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rolle *</Label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    inviteRole === 'editor' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'bg-white border-gray-200 hover:bg-black hover:border-black group'
                  }`}
                  onClick={() => setInviteRole('editor')}
                >
                  <div className="flex items-center gap-2">
                    <Pencil className={`h-4 w-4 ${inviteRole === 'editor' ? 'text-blue-600' : 'text-gray-600 group-hover:text-white'}`} />
                    <span className={`font-medium ${inviteRole === 'editor' ? 'text-blue-900' : 'text-gray-900 group-hover:text-white'}`}>Editor</span>
                  </div>
                  <p className={`text-xs mt-1 ${inviteRole === 'editor' ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-300'}`}>Kann zugewiesene Inhalte bearbeiten</p>
                </div>
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    inviteRole === 'admin' 
                      ? 'border-red-500 bg-red-50' 
                      : 'bg-white border-gray-200 hover:bg-black hover:border-black group'
                  }`}
                  onClick={() => setInviteRole('admin')}
                >
                  <div className="flex items-center gap-2">
                    <Crown className={`h-4 w-4 ${inviteRole === 'admin' ? 'text-red-600' : 'text-gray-600 group-hover:text-white'}`} />
                    <span className={`font-medium ${inviteRole === 'admin' ? 'text-red-900' : 'text-gray-900 group-hover:text-white'}`}>Admin</span>
                  </div>
                  <p className={`text-xs mt-1 ${inviteRole === 'admin' ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-300'}`}>Voller Systemzugriff</p>
                </div>
              </div>
            </div>

            {/* Editor Access Selection - only shown when Editor is selected */}
            {inviteRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-base font-bold text-gray-900">Content-Editoren auswählen</Label>
                  <p className="text-sm text-gray-600 mt-1">Klicken Sie auf die Editoren, auf die der Benutzer Zugriff haben soll.</p>
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
                        className={`relative overflow-hidden rounded-xl border-3 transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? `border-green-500 bg-green-50 shadow-xl ring-2 ring-green-300` 
                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-2 ${editor.bgColor}`}></div>
                        <div className="p-4 pt-5 flex flex-col items-center text-center">
                          <div className={`h-12 w-12 rounded-xl ${editor.bgColor} flex items-center justify-center mb-3 shadow-md`}>
                            <div className="text-white">{editor.icon}</div>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">{editor.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{editor.description}</p>
                          {isSelected && (
                            <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 shadow-md">
                              <Check className="h-5 w-5 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {inviteSelectedEditors.length > 0 && (
                  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg px-4 py-3">
                    <p className="text-base font-bold text-yellow-800">
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
            <Label className="text-sm font-medium">Content-Editoren auswählen</Label>
            <p className="text-xs text-gray-500 mb-4">Klicken Sie auf die Editoren, auf die der Benutzer Zugriff haben soll.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                    className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? `${editor.borderColor} bg-white shadow-lg` 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${editor.bgColor}`}></div>
                    <div className="p-3 pt-4 flex flex-col items-center text-center">
                      <div className={`h-10 w-10 rounded-lg ${editor.bgColor} flex items-center justify-center mb-2`}>
                        <div className="text-white">{editor.icon}</div>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900">{editor.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{editor.description}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedEditors.length > 0 && (
              <p className="text-sm text-blue-600 mt-3">
                {selectedEditors.length} Editor(en) ausgewählt
              </p>
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
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[85vh] overflow-y-auto mt-16">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-yellow-600" />
              Benutzer bearbeiten
            </DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Einstellungen für {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* User Info (read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
              <div>
                <Label className="text-xs text-gray-500">Name</Label>
                <p className="text-sm font-medium text-gray-900">{selectedUser?.full_name || 'Kein Name'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">E-Mail</Label>
                <p className="text-sm font-medium text-gray-900">{selectedUser?.email}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Passwort</Label>
                <p className="text-sm font-mono text-gray-500">••••••••</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-gray-900">Rolle</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    editUserRole === 'editor' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'bg-white border-gray-200 hover:bg-black hover:border-black group'
                  }`}
                  onClick={() => setEditUserRole('editor')}
                >
                  <div className="flex items-center gap-2">
                    <Pencil className={`h-5 w-5 ${editUserRole === 'editor' ? 'text-blue-600' : 'text-gray-600 group-hover:text-white'}`} />
                    <span className={`text-base font-bold ${editUserRole === 'editor' ? 'text-blue-900' : 'text-gray-900 group-hover:text-white'}`}>Editor</span>
                  </div>
                  <p className={`text-sm mt-1 ${editUserRole === 'editor' ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-300'}`}>Kann zugewiesene Inhalte bearbeiten</p>
                </div>
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    editUserRole === 'admin' 
                      ? 'border-red-500 bg-red-50' 
                      : 'bg-white border-gray-200 hover:bg-black hover:border-black group'
                  }`}
                  onClick={() => setEditUserRole('admin')}
                >
                  <div className="flex items-center gap-2">
                    <Crown className={`h-5 w-5 ${editUserRole === 'admin' ? 'text-red-600' : 'text-gray-600 group-hover:text-white'}`} />
                    <span className={`text-base font-bold ${editUserRole === 'admin' ? 'text-red-900' : 'text-gray-900 group-hover:text-white'}`}>Admin</span>
                  </div>
                  <p className={`text-sm mt-1 ${editUserRole === 'admin' ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-300'}`}>Voller Systemzugriff</p>
                </div>
              </div>
            </div>

            {/* Content Editor Selection - only for Editor role */}
            {editUserRole === 'editor' && (
              <div className="space-y-5 pt-6 border-t-2 border-gray-200 mt-4">
                <div>
                  <Label className="text-base font-bold text-gray-900">Content-Editoren auswählen</Label>
                  <p className="text-sm text-gray-600 mt-1">Klicken Sie auf die Editoren, auf die der Benutzer Zugriff haben soll.</p>
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
                        className={`relative overflow-hidden rounded-xl border-3 transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? `border-green-500 bg-green-50 shadow-xl ring-2 ring-green-300` 
                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-2 ${editor.bgColor}`}></div>
                        <div className="p-4 pt-5 flex flex-col items-center text-center">
                          <div className={`h-12 w-12 rounded-xl ${editor.bgColor} flex items-center justify-center mb-3 shadow-md`}>
                            <div className="text-white">{editor.icon}</div>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">{editor.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{editor.description}</p>
                          {isSelected && (
                            <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 shadow-md">
                              <Check className="h-5 w-5 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {editSelectedEditors.length > 0 && (
                  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg px-4 py-3">
                    <p className="text-base font-bold text-yellow-800">
                      ✓ {editSelectedEditors.length} Editor(en) ausgewählt
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSaveEditUser} 
              disabled={isSavingEdit}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSavingEdit ? (
                <>Wird gespeichert...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Änderungen speichern
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
