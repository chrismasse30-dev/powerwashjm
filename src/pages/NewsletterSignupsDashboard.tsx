import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Mail, MapPin, Calendar, Download, CheckSquare, Square, Trash2, ArrowLeft, User, Phone as PhoneIcon } from 'lucide-react';

interface NewsletterSignup {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  services_interested_in: string[] | null;
  property_type: string | null;
  business_name: string | null;
  source: string | null;
  opted_out: boolean;
  created_at: string;
}

interface ColumnWidths {
  [key: string]: number;
}

export default function NewsletterSignupsDashboard() {
  const [signups, setSignups] = useState<NewsletterSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSignups, setSelectedSignups] = useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    select: 80,
    name: 200,
    email: 250,
    city: 130,
    state: 100,
    services: 200,
    property_type: 120,
    business_name: 180,
    source: 130,
    date: 150
  });
  const [resizing, setResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/employee-login');
      return;
    }

    fetchSignups();
  }, [user, navigate]);

  const fetchSignups = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching newsletter signups...');

      const { data, error } = await supabase
        .from('newsletter_signups')
        .select('*')
        .eq('opted_out', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching signups:', error);
        throw error;
      }

      console.log('Fetched signups:', data);
      setSignups(data || []);
    } catch (err: any) {
      console.error('Error fetching signups:', err);
      setError(err.message || 'Failed to load signups');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allIds = new Set(signups.map(s => s.id));
    setSelectedSignups(allIds);
  };

  const handleUnselectAll = () => {
    setSelectedSignups(new Set());
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedSignups);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSignups(newSelected);
  };

  const deleteSelected = async () => {
    if (selectedSignups.size === 0) {
      alert('Please select at least one signup to delete');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedSignups.size} signup${selectedSignups.size > 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const idsToDelete = Array.from(selectedSignups);

      const { error } = await supabase
        .from('newsletter_signups')
        .delete()
        .in('id', idsToDelete);

      if (error) {
        console.error('Error deleting signups:', error);
        alert('Failed to delete signups: ' + error.message);
        return;
      }

      alert(`Successfully deleted ${selectedSignups.size} signup${selectedSignups.size > 1 ? 's' : ''}`);
      setSelectedSignups(new Set());
      fetchSignups();
    } catch (err) {
      console.error('Error deleting signups:', err);
      alert('An error occurred while deleting signups');
    }
  };

  const exportToCSV = () => {
    const selectedData = signups.filter(s => selectedSignups.has(s.id));

    if (selectedData.length === 0) {
      alert('Please select at least one signup to export');
      return;
    }

    const headers = ['Full Name', 'Email', 'City', 'State', 'Services Interested In', 'Property Type', 'Business Name', 'Source', 'Date Added'];
    const csvData = selectedData.map(signup => [
      `${signup.first_name || ''} ${signup.last_name || ''}`.trim() || 'N/A',
      signup.email,
      signup.city || '',
      signup.state || '',
      signup.services_interested_in?.join('; ') || '',
      signup.property_type || '',
      signup.business_name || '',
      signup.source || '',
      new Date(signup.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-signups-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setResizing(column);
    setStartX(e.pageX);
    setStartWidth(columnWidths[column]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        const diff = e.pageX - startX;
        const newWidth = Math.max(50, startWidth + diff);
        setColumnWidths(prev => ({
          ...prev,
          [resizing]: newWidth
        }));
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, startX, startWidth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading newsletter signups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative pt-24">
        <button
          onClick={() => navigate('/employee-dashboard')}
          className="fixed top-6 right-6 z-50 bg-blue-900 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-colors"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Newsletter Signups</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 font-semibold">Error: {error}</p>
              <button
                onClick={fetchSignups}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/employee-dashboard')}
        className="fixed top-6 right-6 z-50 bg-blue-900 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-colors"
        aria-label="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Newsletter Signups</h1>

          <div className="flex flex-wrap items-center gap-4">
            <p className="text-gray-600">
              Total signups: {signups.length} | Selected: {selectedSignups.size}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                Check All
              </button>
              <button
                onClick={handleUnselectAll}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Uncheck All
              </button>
              <button
                onClick={exportToCSV}
                disabled={selectedSignups.size === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export Selected to CSV
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedSignups.size === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
              <button
                onClick={fetchSignups}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {signups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500">No newsletter signups yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="border-collapse" style={{ width: 'max-content' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 relative"
                      style={{ width: `${columnWidths.select}px`, minWidth: `${columnWidths.select}px` }}
                    >
                      Select
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 z-30"
                        onMouseDown={(e) => handleMouseDown(e, 'select')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.name}px`, minWidth: `${columnWidths.name}px` }}
                    >
                      Full Name
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'name')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.email}px`, minWidth: `${columnWidths.email}px` }}
                    >
                      Email
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'email')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.city}px`, minWidth: `${columnWidths.city}px` }}
                    >
                      City
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'city')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.state}px`, minWidth: `${columnWidths.state}px` }}
                    >
                      State
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'state')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.services}px`, minWidth: `${columnWidths.services}px` }}
                    >
                      Services Interested In
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'services')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.property_type}px`, minWidth: `${columnWidths.property_type}px` }}
                    >
                      Property Type
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'property_type')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.business_name}px`, minWidth: `${columnWidths.business_name}px` }}
                    >
                      Business Name
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'business_name')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.source}px`, minWidth: `${columnWidths.source}px` }}
                    >
                      Source
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'source')}
                      />
                    </th>
                    <th
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      style={{ width: `${columnWidths.date}px`, minWidth: `${columnWidths.date}px` }}
                    >
                      Date Added
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => handleMouseDown(e, 'date')}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {signups.map((signup) => (
                    <tr
                      key={signup.id}
                      className={`group hover:bg-gray-50 ${selectedSignups.has(signup.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td
                        className={`border border-gray-300 px-4 py-3 sticky left-0 z-10 ${selectedSignups.has(signup.id) ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-white group-hover:bg-gray-50'}`}
                        style={{ width: `${columnWidths.select}px` }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSignups.has(signup.id)}
                          onChange={() => toggleSelection(signup.id)}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.name}px` }}>
                        <div className="flex items-center gap-2">
                          {(signup.first_name || signup.last_name) && <User className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          <div className="text-sm text-gray-900 font-medium">
                            {signup.first_name || signup.last_name ? `${signup.first_name || ''} ${signup.last_name || ''}`.trim() : <span className="text-gray-400">-</span>}
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.email}px` }}>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <a href={`mailto:${signup.email}`} className="text-sm text-blue-600 hover:underline break-all">
                            {signup.email}
                          </a>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.city}px` }}>
                        <div className="flex items-center gap-2">
                          {signup.city && <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          <div className="text-sm text-gray-600">{signup.city || <span className="text-gray-400">-</span>}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.state}px` }}>
                        <div className="text-sm text-gray-600">{signup.state || <span className="text-gray-400">-</span>}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.services}px` }}>
                        <div className="text-sm text-gray-700">
                          {signup.services_interested_in && signup.services_interested_in.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {signup.services_interested_in.map((service, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {service}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.property_type}px` }}>
                        <div className="text-sm text-gray-700">
                          {signup.property_type ? (
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              signup.property_type === 'Commercial'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {signup.property_type}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.business_name}px` }}>
                        <div className="text-sm text-gray-700">{signup.business_name || <span className="text-gray-400">-</span>}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.source}px` }}>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          signup.source?.includes('Quote')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {signup.source || 'Unknown'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 whitespace-nowrap" style={{ width: `${columnWidths.date}px` }}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="text-sm text-gray-900">{formatDate(signup.created_at)}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
