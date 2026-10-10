import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';

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

export default function AccessRequestsDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, 'admin' | 'user'>>({});

  useEffect(() => {
    if (!user) {
      navigate('/employee-login');
      return;
    }
    if (!isAdmin) {
      navigate('/employee-dashboard');
      return;
    }
    loadRequests();
  }, [user, isAdmin, navigate, filter]);

  const loadRequests = async () => {
    try {
      let query = supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests from database:', error);
      console.log('Falling back to localStorage');

      try {
        const localRequests = JSON.parse(localStorage.getItem('access_requests') || '[]');
        let filteredRequests = localRequests;

        if (filter !== 'all') {
          filteredRequests = localRequests.filter((req: AccessRequest) => req.status === filter);
        }

        filteredRequests.sort((a: AccessRequest, b: AccessRequest) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setRequests(filteredRequests);
        console.log(`Loaded ${filteredRequests.length} requests from localStorage`);
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    const role = selectedRoles[request.id] || 'user';
    const name = request.first_name && request.last_name ? `${request.first_name} ${request.last_name}` : request.email;
    if (!confirm(`Approve access for ${name} as ${role.toUpperCase()}?`)) {
      return;
    }

    setProcessing(request.id);
    try {
      // Update access request status
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

      // Add user to users table
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
      loadRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      console.log('Falling back to localStorage approval');

      try {
        const localRequests = JSON.parse(localStorage.getItem('access_requests') || '[]');
        const updatedRequests = localRequests.map((req: AccessRequest) =>
          req.id === request.id
            ? { ...req, status: 'approved', role: role, is_active: true, processed_at: new Date().toISOString(), processed_by: user?.email }
            : req
        );
        localStorage.setItem('access_requests', JSON.stringify(updatedRequests));

        // Use the password they set during registration
        localStorage.setItem(`demo_user_${request.email}`, JSON.stringify({
          email: request.email,
          password: request.password_hash || Math.random().toString(36).slice(-8),
          firstName: request.first_name,
          lastName: request.last_name
        }));

        alert(`Access approved!\n\nUser can now sign in with the password they created during registration.\n\n(Demo mode - email not sent)`);
        loadRequests();
      } catch (localError) {
        console.error('Failed to approve in localStorage:', localError);
        alert('Failed to approve request');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (request: AccessRequest) => {
    const reason = prompt(`Deny access for ${request.first_name} ${request.last_name}?\n\nOptional reason:`);
    if (reason === null) return;

    setProcessing(request.id);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-process-request`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          action: 'deny',
          adminEmail: user?.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deny request');
      }

      alert('Access request denied');
      loadRequests();
    } catch (error: any) {
      console.error('Error denying request via API:', error);
      console.log('Falling back to localStorage denial');

      try {
        const localRequests = JSON.parse(localStorage.getItem('access_requests') || '[]');
        const updatedRequests = localRequests.map((req: AccessRequest) =>
          req.id === request.id
            ? { ...req, status: 'denied', processed_at: new Date().toISOString(), processed_by: user?.email }
            : req
        );
        localStorage.setItem('access_requests', JSON.stringify(updatedRequests));

        alert('Access request denied (Demo mode - email not sent)');
        loadRequests();
      } catch (localError) {
        console.error('Failed to deny in localStorage:', localError);
        alert('Failed to deny request');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleStatusChange = async (request: AccessRequest, newStatus: 'active' | 'inactive' | 'suspended') => {
    const isActive = newStatus === 'active';
    const statusMessage = isActive ? 'activate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${statusMessage} ${request.first_name} ${request.last_name}?`)) {
      return;
    }

    setProcessing(request.id);
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          is_active: isActive,
          deactivated_at: isActive ? null : new Date().toISOString(),
          deactivated_by: isActive ? null : user?.email
        })
        .eq('id', request.id);

      if (error) throw error;

      alert(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadRequests();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      console.log('Falling back to localStorage');

      try {
        const localRequests = JSON.parse(localStorage.getItem('access_requests') || '[]');
        const updatedRequests = localRequests.map((req: AccessRequest) =>
          req.id === request.id
            ? {
                ...req,
                is_active: isActive,
                deactivated_at: isActive ? null : new Date().toISOString(),
                deactivated_by: isActive ? null : user?.email
              }
            : req
        );
        localStorage.setItem('access_requests', JSON.stringify(updatedRequests));

        alert(`User ${isActive ? 'activated' : 'deactivated'} successfully (Demo mode)`);
        loadRequests();
      } catch (localError) {
        console.error('Failed to update status in localStorage:', localError);
        alert('Failed to update user status');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateUser = async (request: AccessRequest) => {
    if (!confirm(`Create user account for ${request.first_name} ${request.last_name} (${request.email})?`)) {
      return;
    }

    setProcessing(request.id);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-employee`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email,
          firstName: request.first_name,
          lastName: request.last_name,
          phone: request.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      alert(`User account created successfully!\n\nTemporary password: ${data.tempPassword}\n\nAn email has been sent to ${request.email}`);

      await supabase
        .from('access_requests')
        .update({ user_created: true })
        .eq('id', request.id);

      loadRequests();
    } catch (error: any) {
      console.error('Error creating user via API:', error);
      console.log('Falling back to localStorage user creation');

      try {
        const tempPassword = Math.random().toString(36).slice(-8);
        localStorage.setItem(`demo_user_${request.email}`, JSON.stringify({
          email: request.email,
          password: tempPassword,
          firstName: request.first_name,
          lastName: request.last_name
        }));

        const localRequests = JSON.parse(localStorage.getItem('access_requests') || '[]');
        const updatedRequests = localRequests.map((req: AccessRequest) =>
          req.id === request.id
            ? { ...req, user_created: true }
            : req
        );
        localStorage.setItem('access_requests', JSON.stringify(updatedRequests));

        alert(`User account created!\n\nTemporary password: ${tempPassword}\n\nUser can now sign in with their email and this password.\n\n(Demo mode - email not sent)`);
        loadRequests();
      } catch (localError) {
        console.error('Failed to create user in localStorage:', localError);
        alert('Failed to create user account');
      }
    } finally {
      setProcessing(null);
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
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReturnToDashboardButton />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Requests</h1>
          <p className="text-gray-600">Review and manage employee access requests</p>
        </div>

        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'approved', 'denied'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="divide-y divide-gray-200">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {filter !== 'all' ? filter : ''} access requests found
              </div>
            ) : (
              requests.map((request) => (
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
                            onClick={() => handleApprove(request)}
                            disabled={processing === request.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleDeny(request)}
                            disabled={processing === request.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Deny
                          </button>
                        </div>
                      )}

                      {request.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          <select
                            value={request.is_active === false ? 'inactive' : 'active'}
                            onChange={(e) => handleStatusChange(request, e.target.value as 'active' | 'inactive')}
                            disabled={processing === request.id}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          {request.is_active === false && (
                            <span className="text-xs text-gray-500">
                              Cannot login
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
