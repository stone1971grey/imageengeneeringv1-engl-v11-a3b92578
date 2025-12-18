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
import { Shield, ShieldCheck, ShieldAlert, User, UserPlus, Trash2, Lock, Eye, EyeOff, Users, Crown, Pencil, Save, Settings, Globe, Check } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

type AppRole = 'admin' | 'editor' | 'user';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
  created_at: string;
  editorAccess?: 'all_public' | 'custom' | 'none';
  customPages?: string[];
}

// Hidden page slugs that editors should NOT have access to
const HIDDEN_PAGE_SLUGS = [
  'styleguide',
  'comprehensive-styleguide',
  'icons-styleguide',
  'segments',
  'segment-debug',
  'backlog',
  'hidden-segments',
  'admin'
];

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("editor");
  const [isInviting, setIsInviting] = useState(false);
  const [showEditorAccessDialog, setShowEditorAccessDialog] = useState(false);
  const [editorAccessType, setEditorAccessType] = useState<'all_public' | 'custom' | 'none'>('none');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [availablePages, setAvailablePages] = useState<{slug: string; title: string}[]>([]);
  const [savingAccess, setSavingAccess] = useState(false);

  useEffect(() => {
    loadUsers();
    loadAvailablePages();
  }, []);

  const loadAvailablePages = async () => {
    try {
      const { data: pages, error } = await supabase
        .from('page_registry')
        .select('page_slug, page_title')
        .order('page_title');

      if (error) throw error;

      // Filter out hidden pages
      const publicPages = (pages || [])
        .filter(page => !HIDDEN_PAGE_SLUGS.some(hidden => 
          page.page_slug.toLowerCase().startsWith(hidden.toLowerCase())
        ))
        .map(page => ({
          slug: page.page_slug,
          title: page.page_title
        }));

      setAvailablePages(publicPages);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

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

      // Fetch editor page access
      const { data: editorAccess, error: accessError } = await supabase
        .from('editor_page_access')
        .select('user_id, page_slug');

      if (accessError) throw accessError;

      // Combine profiles with their roles and editor access
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRoles = (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole);
        
        const userPages = (editorAccess || [])
          .filter(a => a.user_id === profile.id)
          .map(a => a.page_slug);

        // Determine access type
        let accessType: 'all_public' | 'custom' | 'none' = 'none';
        if (userPages.includes('__all_public__')) {
          accessType = 'all_public';
        } else if (userPages.length > 0) {
          accessType = 'custom';
        }
        
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          roles: userRoles,
          created_at: profile.created_at || '',
          editorAccess: accessType,
          customPages: userPages.filter(p => p !== '__all_public__')
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
    setSelectedPages(user.customPages || []);
    setShowEditorAccessDialog(true);
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
      if (editorAccessType === 'all_public') {
        const { error: insertError } = await supabase
          .from('editor_page_access')
          .insert({ user_id: selectedUser.id, page_slug: '__all_public__' });

        if (insertError) throw insertError;
      } else if (editorAccessType === 'custom' && selectedPages.length > 0) {
        const entries = selectedPages.map(slug => ({
          user_id: selectedUser.id,
          page_slug: slug
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

  const getEditorAccessLabel = (access: 'all_public' | 'custom' | 'none' | undefined) => {
    switch (access) {
      case 'all_public':
        return 'Alle Public-Bereiche';
      case 'custom':
        return 'Benutzerdefiniert';
      default:
        return 'Keine Berechtigung';
    }
  };

  const allRoles: AppRole[] = ['admin', 'editor', 'user'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-500 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.roles.includes('user') || u.roles.length === 0).length}
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
              <p className="text-sm text-green-600 font-medium">Total Users</p>
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
                User Roles & Permissions
              </CardTitle>
              <CardDescription>
                Manage user access levels and permissions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Roles</TableHead>
                  <TableHead className="font-semibold">Editor-Berechtigungen</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
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
                            user.editorAccess === 'all_public' 
                              ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                              : user.editorAccess === 'custom'
                              ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          {getEditorAccessLabel(user.editorAccess)}
                          {user.editorAccess === 'custom' && user.customPages && (
                            <span className="ml-1">({user.customPages.length})</span>
                          )}
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        onValueChange={(value) => handleAddRole(user.id, value as AppRole)}
                      >
                        <SelectTrigger className="w-32 h-8 text-sm">
                          <SelectValue placeholder="Add role" />
                        </SelectTrigger>
                        <SelectContent>
                          {allRoles
                            .filter(role => !user.roles.includes(role))
                            .map((role) => (
                              <SelectItem key={role} value={role}>
                                <span className="flex items-center gap-2">
                                  {getRoleIcon(role)}
                                  {role}
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
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
            Role Permissions Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Admin</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Full system access</li>
                <li>• Manage all users & roles</li>
                <li>• Edit all pages & content</li>
                <li>• Access to all settings</li>
                <li>• Delete content permanently</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Editor</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Edit assigned pages</li>
                <li>• Create & update content</li>
                <li>• Upload media files</li>
                <li>• Manage translations</li>
                <li>• Access glossary</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">User</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• View published content</li>
                <li>• Access public resources</li>
                <li>• Submit forms</li>
                <li>• Register for events</li>
                <li>• Download resources</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <div className="space-y-4">
              <Label className="text-sm font-medium">Berechtigungstyp</Label>
              
              <div className="grid gap-3">
                {/* All Public Option */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    editorAccessType === 'all_public' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setEditorAccessType('all_public')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      editorAccessType === 'all_public' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {editorAccessType === 'all_public' && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Alle Public-Bereiche</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Editor kann alle öffentlichen Seiten bearbeiten (außer Styleguide, Segments, Backlog, Admin)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom Selection Option */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    editorAccessType === 'custom' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setEditorAccessType('custom')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      editorAccessType === 'custom' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {editorAccessType === 'custom' && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Benutzerdefinierte Auswahl</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Wählen Sie einzelne Seiten aus, die der Editor bearbeiten darf
                      </p>
                    </div>
                  </div>
                </div>

                {/* No Access Option */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    editorAccessType === 'none' 
                      ? 'border-gray-500 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setEditorAccessType('none')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      editorAccessType === 'none' ? 'border-gray-500 bg-gray-500' : 'border-gray-300'
                    }`}>
                      {editorAccessType === 'none' && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Keine Berechtigung</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Editor hat keine Berechtigungen zum Bearbeiten von Seiten
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Page Selection */}
            {editorAccessType === 'custom' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Seiten auswählen</Label>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {availablePages.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Keine Seiten verfügbar</div>
                  ) : (
                    <div className="divide-y">
                      {availablePages.map((page) => (
                        <div 
                          key={page.slug} 
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            if (selectedPages.includes(page.slug)) {
                              setSelectedPages(selectedPages.filter(s => s !== page.slug));
                            } else {
                              setSelectedPages([...selectedPages, page.slug]);
                            }
                          }}
                        >
                          <Checkbox 
                            checked={selectedPages.includes(page.slug)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPages([...selectedPages, page.slug]);
                              } else {
                                setSelectedPages(selectedPages.filter(s => s !== page.slug));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{page.title}</p>
                            <p className="text-xs text-gray-500">/{page.slug}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedPages.length > 0 && (
                  <p className="text-sm text-blue-600">
                    {selectedPages.length} Seite(n) ausgewählt
                  </p>
                )}
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
    </div>
  );
};

export default UserManagement;
