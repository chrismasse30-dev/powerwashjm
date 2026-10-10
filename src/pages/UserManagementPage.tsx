import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, ShieldAlert, CheckCircle, XCircle, Clock, Phone, Plus, X, CheckSquare, Square, Trash2, Key, RefreshCw, Edit2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import NotificationPreferences, { NotificationPrefs } from '../components/NotificationPreferences';

interface UserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  notification_preferences?: NotificationPrefs;
}

interface AccessRequest {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  password_hash?: string;
  status: 'pending' | 'approved' | 'denied' | 'rejected';
  role?: 'admin' | 'user';
  is_active?: boolean;
  created_at: string;
  requested_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  processed_at?: string;
  processed_by?: string;
  user_created?: boolean;
  deactivated_at?: string;
  deactivated_by?: string;
}

export default function UserManagementPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'approved' | 'denied' | 'deleted'>('users');
  const [selectedRoles, setSelectedRoles] = useState<Record<string, 'admin' | 'user'>>({});
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user' as 'admin' | 'user'
  });
  const [createError, setCreateError] = useState('');
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserData | null>(null);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  }>({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    if (!user) {
      navigate('/employee-login');
      return;
    }
    if (!isAdmin) {
      navigate('/employee-dashboard');
      return;
    }
    if (activeTab === 'users' || activeTab === 'deleted') {
      loadUsers();
    }
    if (activeTab === 'pending' || activeTab === 'approved' || activeTab === 'denied') {
      loadAccessRequests();
    }
  }, [user, isAdmin, navigate, activeTab]);

  const loadUsers = async () => {
    try {
      let query = supabase
        .from('users')
        .select('*');

      if (activeTab === 'users') {
        query = query.is('deleted_at', null);
      } else if (activeTab === 'deleted') {
        query = query.not('deleted_at', 'is', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessRequests = async () => {
    try {
      let query = supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'users') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAccessRequests(data || []);
    } catch (error) {
      console.error('Error loading access requests:', error);
      setAccessRequests([]);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    if (!confirm(`Change ${userToUpdate.email}'s role to ${newRole}?`)) {
      return;
    }

    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      alert(`Role updated successfully to ${newRole}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    const action = isActive ? 'activate' : 'deactivate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${userToUpdate.email}?`)) {
      return;
    }

    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      alert(`User ${action}d successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleApproveRequest = async (request: AccessRequest) => {
    const role = selectedRoles[request.id] || 'user';
    const name = request.first_name && request.last_name ? `${request.first_name} ${request.last_name}` : request.email;
    if (!confirm(`Approve access for ${name} as ${role.toUpperCase()}?`)) {
      return;
    }

    setUpdating(request.id);
    try {
      const { error: requestError } = await supabase
        .from('access_requests')
        .update({
          status: 'approved',
          role: role,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.email
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      const { error: userError } = await supabase
        .from('users')
        .insert({
          email: request.email,
          first_name: request.first_name,
          last_name: request.last_name,
          role: role,
          is_active: true
        });

      if (userError && !userError.message.includes('duplicate')) {
        throw userError;
      }

      alert(`Access approved! User ${name} has been granted ${role} access.`);
      loadAccessRequests();
      loadUsers();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    } finally {
      setUpdating(null);
    }
  };

  const handleDenyRequest = async (request: AccessRequest) => {
    const reason = prompt(`Deny access for ${request.first_name} ${request.last_name}?\n\nOptional reason:`);
    if (reason === null) return;

    setUpdating(request.id);
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.email
        })
        .eq('id', request.id);

      if (error) throw error;

      alert('Access request denied');
      loadAccessRequests();
    } catch (error: any) {
      console.error('Error denying request:', error);
      alert('Failed to deny request');
    } finally {
      setUpdating(null);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = new Set(users.map(u => u.id));
    setSelectedUsers(allIds);
  };

  const handleUnselectAll = () => {
    setSelectedUsers(new Set());
  };

  const deleteSelected = async () => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one user to delete');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}? This will move them to the Deleted tab.`
    );

    if (!confirmDelete) return;

    try {
      const idsToDelete = Array.from(selectedUsers);

      const { error } = await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', idsToDelete);

      if (error) {
        console.error('Error deleting users:', error);
        alert('Failed to delete users: ' + error.message);
        return;
      }

      alert(`Successfully deleted ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}`);
      setSelectedUsers(new Set());
      loadUsers();
    } catch (err) {
      console.error('Error deleting users:', err);
      alert('An error occurred while deleting users');
    }
  };

  const restoreSelected = async () => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one user to restore');
      return;
    }

    const confirmRestore = window.confirm(
      `Are you sure you want to restore ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}?`
    );

    if (!confirmRestore) return;

    try {
      const idsToRestore = Array.from(selectedUsers);

      const { error} = await supabase
        .from('users')
        .update({ deleted_at: null })
        .in('id', idsToRestore);

      if (error) {
        console.error('Error restoring users:', error);
        alert('Failed to restore users: ' + error.message);
        return;
      }

      alert(`Successfully restored ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}`);
      setSelectedUsers(new Set());
      loadUsers();
    } catch (err) {
      console.error('Error restoring users:', err);
      alert('An error occurred while restoring users');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newUserData.email) {
      setCreateError('Email is required');
      return;
    }

    setUpdating('creating');
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', newUserData.email)
        .maybeSingle();

      if (existingUser) {
        setCreateError('A user with this email already exists');
        setUpdating(null);
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: newUserData.email,
          first_name: newUserData.firstName || null,
          last_name: newUserData.lastName || null,
          role: newUserData.role,
          is_active: true
        });

      if (insertError) throw insertError;

      alert(`User created successfully! Email: ${newUserData.email}\n\nNote: Authentication credentials must be configured separately.`);
      setShowCreateModal(false);
      setNewUserData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user'
      });
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setCreateError(error.message || 'Failed to create user');
    } finally {
      setUpdating(null);
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUserForReset) return;

    setUpdating('password-reset');
    setResetError('');
    setResetSuccess('');

    try {
      const { data: authData, error: resetError } = await supabase.auth.resetPasswordForEmail(
        selectedUserForReset.email,
        {
          redirectTo: `${window.location.origin}/employee-login`
        }
      );

      if (resetError) throw resetError;

      const { error: logError } = await supabase
        .from('users')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUserForReset.id);

      if (logError) console.error('Error updating user timestamp:', logError);

      await supabase
        .from('password_reset_audit')
        .insert({
          user_id: selectedUserForReset.id,
          user_email: selectedUserForReset.email,
          admin_email: user?.email || 'unknown',
          reset_method: 'admin_reset',
          status: 'initiated',
          reset_token_sent: true,
          notes: `Password reset initiated by admin for user ${selectedUserForReset.email}`
        });

      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset-email`;

      try {
        await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            email: selectedUserForReset.email,
            firstName: selectedUserForReset.first_name,
            lastName: selectedUserForReset.last_name,
            adminEmail: user?.email,
            timestamp: new Date().toISOString()
          })
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }

      setResetSuccess(
        `Password reset email sent to ${selectedUserForReset.email}. The user will receive instructions to set a new password.`
      );

      setTimeout(() => {
        setShowPasswordResetModal(false);
        setSelectedUserForReset(null);
        setResetSuccess('');
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);

      await supabase
        .from('password_reset_audit')
        .insert({
          user_id: selectedUserForReset.id,
          user_email: selectedUserForReset.email,
          admin_email: user?.email || 'unknown',
          reset_method: 'admin_reset',
          status: 'failed',
          reset_token_sent: false,
          notes: `Password reset failed: ${error.message}`
        });

      setResetError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const openPasswordResetModal = (userData: UserData) => {
    setSelectedUserForReset(userData);
    setShowPasswordResetModal(true);
    setResetError('');
    setResetSuccess('');
  };

  const handleNotificationPreferencesUpdate = async (userId: string, preferences: NotificationPrefs) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      alert('Notification preferences updated successfully');
      loadUsers();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      alert('Failed to update notification preferences');
      throw error;
    }
  };

  const startEditingUser = (userData: UserData) => {
    setEditingUser(userData.id);
    setEditFormData({
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      email: userData.email
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditFormData({ firstName: '', lastName: '', email: '' });
  };

  const handleSaveUserInfo = async (userId: string) => {
    if (!editFormData.email.trim()) {
      alert('Email is required');
      return;
    }

    if (!editFormData.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setUpdating(userId);
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', editFormData.email)
        .neq('id', userId)
        .maybeSingle();

      if (existingUser) {
        alert('A user with this email already exists');
        setUpdating(null);
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({
          first_name: editFormData.firstName.trim() || null,
          last_name: editFormData.lastName.trim() || null,
          email: editFormData.email.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      alert('User information updated successfully');
      setEditingUser(null);
      setEditFormData({ firstName: '', lastName: '', email: '' });
      loadUsers();
    } catch (error) {
      console.error('Error updating user information:', error);
      alert('Failed to update user information');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"><Clock className="w-4 h-4" /> Pending</span>;
      case 'approved':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"><CheckCircle className="w-4 h-4" /> Approved</span>;
      case 'denied':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"><XCircle className="w-4 h-4" /> Denied</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReturnToDashboardButton />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts, permissions, and access requests</p>
        </div>

        <div className="mb-6 flex gap-2">
          {(['users', 'pending', 'approved', 'denied', 'deleted'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedUsers(new Set());
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab === 'users' ? 'All Users' :
               tab === 'deleted' ? 'Deleted Users' :
               tab.charAt(0).toUpperCase() + tab.slice(1) + ' Requests'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'users' && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
                  <p className="text-sm text-gray-600 mt-1">{users.length} total users</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">
                        {users.filter(u => u.role === 'admin').length} Admins
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">
                        {users.filter(u => u.role === 'user').length} Users
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUsers.size > 0 && (
                      <button
                        onClick={deleteSelected}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete ({selectedUsers.size})
                      </button>
                    )}
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deleted' && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Deleted Users</h2>
                  <p className="text-sm text-gray-600 mt-1">{users.length} deleted users</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedUsers.size > 0 && (
                    <button
                      onClick={restoreSelected}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Restore ({selectedUsers.size})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'users' && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Access Requests</h2>
                  <p className="text-sm text-gray-600 mt-1">{accessRequests.length} {activeTab} requests</p>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {(activeTab === 'users' || activeTab === 'deleted') && users.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No users found
              </div>
            )}

            {(activeTab === 'users' || activeTab === 'deleted') && users.map((userData) => (
                <div key={userData.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      <button
                        onClick={() => toggleSelection(userData.id)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {selectedUsers.has(userData.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full ${userData.role === 'admin' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {userData.role === 'admin' ? (
                            <ShieldAlert className="w-5 h-5 text-blue-600" />
                          ) : (
                            <User className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          {editingUser === userData.id ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editFormData.firstName}
                                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                  placeholder="First Name"
                                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <input
                                  type="text"
                                  value={editFormData.lastName}
                                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                  placeholder="Last Name"
                                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input
                                  type="email"
                                  value={editFormData.email}
                                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                  placeholder="Email"
                                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveUserInfo(userData.id)}
                                  disabled={updating === userData.id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                                >
                                  <Save className="w-3 h-3" />
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={updating === userData.id}
                                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {userData.first_name && userData.last_name
                                    ? `${userData.first_name} ${userData.last_name}`
                                    : 'Name not set'}
                                </h3>
                                {activeTab !== 'deleted' && (
                                  <button
                                    onClick={() => startEditingUser(userData)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit user information"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{userData.email}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="ml-14 flex items-center gap-4 text-sm text-gray-500">
                        <span>Joined {new Date(userData.created_at).toLocaleDateString()}</span>
                        {userData.is_active ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {activeTab !== 'deleted' && (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-medium text-gray-700">Role</label>
                          <select
                            value={userData.role}
                            onChange={(e) => handleRoleChange(userData.id, e.target.value as 'admin' | 'user')}
                            disabled={updating === userData.id || userData.email === user?.email}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-medium text-gray-700">Status</label>
                          <select
                            value={userData.is_active ? 'active' : 'inactive'}
                            onChange={(e) => handleStatusChange(userData.id, e.target.value === 'active')}
                            disabled={updating === userData.id || userData.email === user?.email}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-medium text-gray-700">Notifications</label>
                          <NotificationPreferences
                            preferences={userData.notification_preferences || {
                              new_quote_requests: true,
                              customer_information: true,
                              service_requests: true,
                              measurement_designs: true
                            }}
                            onSave={(prefs) => handleNotificationPreferencesUpdate(userData.id, prefs)}
                            disabled={updating === userData.id}
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-medium text-gray-700">Actions</label>
                          <button
                            onClick={() => openPasswordResetModal(userData)}
                            disabled={updating === userData.id}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            title="Reset user password"
                          >
                            <Key className="w-4 h-4" />
                            Reset Password
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {userData.email === user?.email && (
                    <div className="mt-3 ml-14 text-xs text-blue-600">
                      You cannot modify your own account
                    </div>
                  )}
                </div>
              ))}

            {activeTab !== 'users' && accessRequests.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No {activeTab} access requests found
              </div>
            )}

            {activeTab !== 'users' && accessRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.first_name} {request.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Requested {new Date(request.created_at).toLocaleDateString()} at{' '}
                          {new Date(request.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 ml-14">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{request.email}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{request.phone}</span>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="ml-14 mt-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Assign Role:
                          <select
                            value={selectedRoles[request.id] || request.role || 'user'}
                            onChange={(e) => setSelectedRoles({ ...selectedRoles, [request.id]: e.target.value as 'admin' | 'user' })}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>
                      </div>
                    )}

                    {request.role && request.status === 'approved' && (
                      <div className="ml-14 mt-2">
                        <span className="text-sm text-gray-600">
                          Role: <span className="font-semibold capitalize">{request.role}</span>
                        </span>
                      </div>
                    )}

                    {request.processed_at && (
                      <p className="text-sm text-gray-500 mt-2 ml-14">
                        Processed by {request.processed_by} on{' '}
                        {new Date(request.processed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(request.status)}

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveRequest(request)}
                          disabled={updating === request.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDenyRequest(request)}
                          disabled={updating === request.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError('');
                  setNewUserData({ email: '', firstName: '', lastName: '', role: 'user' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                <strong>Note:</strong> This creates a user record for access management. Authentication credentials are handled separately through the employee login system.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newUserData.role === 'admin'
                    ? 'Admins have full access to all features and can manage other users'
                    : 'Users have limited access to features based on their permissions'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError('');
                    setNewUserData({ email: '', firstName: '', lastName: '', role: 'user' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating === 'creating'}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating === 'creating' ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordResetModal && selectedUserForReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Key className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Reset Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setSelectedUserForReset(null);
                  setResetError('');
                  setResetSuccess('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>{resetError}</div>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>{resetSuccess}</div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">Security Notice</p>
                    <p>This action will send a password reset email to the user. The reset link will expire after 1 hour for security.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">
                        {selectedUserForReset.first_name && selectedUserForReset.last_name
                          ? `${selectedUserForReset.first_name} ${selectedUserForReset.last_name}`
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{selectedUserForReset.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium text-gray-900 capitalize">{selectedUserForReset.role}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="mt-2 text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>User receives password reset email</li>
                    <li>Email includes secure reset link</li>
                    <li>Link expires after 1 hour</li>
                    <li>User must create new password</li>
                    <li>Action is logged for audit purposes</li>
                  </ul>
                </div>

                <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">Audit Information</span>
                  </div>
                  <p>Administrator: {user?.email}</p>
                  <p>Timestamp: {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordResetModal(false);
                    setSelectedUserForReset(null);
                    setResetError('');
                    setResetSuccess('');
                  }}
                  disabled={updating === 'password-reset'}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={updating === 'password-reset'}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {updating === 'password-reset' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending Reset Email...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
