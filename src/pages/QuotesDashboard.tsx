import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Download, CheckSquare, Square, Trash2, ArrowLeft, ChevronLeft, ChevronRight, Mail, ArrowUp, ArrowDown, ArrowUpDown, Plus, CreditCard as Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import { AddProspectModal } from '../components/AddProspectModal';
import EditQuoteModal from '../components/EditQuoteModal';

interface QuoteSubmission {
  id: string;
  name: string | null;
  business_name?: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  ip_city?: string | null;
  ip_state?: string | null;
  services: string[];
  property_type?: string;
  package?: string;
  page_source?: string;
  submit_email: string;
  is_submitted: boolean;
  deleted?: boolean;
  session_id?: string;
  lead_event?: string;
  abandoned_email_sent?: boolean;
  abandoned_email_sent_at?: string | null;
  estimate_followup_sent?: boolean;
  estimate_followup_sent_at?: string | null;
  customer_estimate_sent?: boolean;
  customer_estimate_sent_at?: string | null;
  estimate_approved?: boolean;
  estimate_approved_at?: string | null;
  status?: string;
  design_file_url?: string | null;
  design_image_url?: string | null;
  second_design_image_url?: string | null;
  design_saved_at?: string | null;
  design_saved_by?: string | null;
  created_at: string;
  updated_at?: string;
}

interface ColumnWidths {
  [key: string]: number;
}

export default function QuotesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'deleted'>('all');
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    select: 80,
    status: 120,
    design_file: 140,
    name: 180,
    business_name: 180,
    phone: 150,
    email: 220,
    address: 250,
    city: 120,
    state: 100,
    zip: 100,
    services: 200,
    property_type: 150,
    package: 180,
    source: 150,
    lead_event: 150,
    abandoned_email: 160,
    customer_estimate: 180,
    estimate_followup: 180,
    approved: 120,
    date: 180,
    abandoned_email_sent_date: 180
  });
  const [resizing, setResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  // Sorting state
  type SortDirection = 'asc' | 'desc' | null;
  type SortableColumn = 'name' | 'business_name' | 'city' | 'state' | 'services' | 'created_at';
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Service filter state
  const [selectedService, setSelectedService] = useState<string>('all');

  // Global search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'all',
    leadEvent: 'all',
    source: 'all',
    hasDesign: 'all',
    emailSent: 'all',
    estimateSent: 'all',
    approved: 'all'
  });

  // Column visibility state
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    const saved = sessionStorage.getItem('hiddenColumns');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; column: string } | null>(null);
  const [showUnhideModal, setShowUnhideModal] = useState(false);
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteSubmission | null>(null);
  const [bulkStatus, setBulkStatus] = useState<string>('Submitted');

  const columnLabels: { [key: string]: string } = {
    select: '☑ Select',
    status: 'Status',
    design_file: 'Design File',
    name: 'Name',
    business_name: 'Business Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    city: 'City',
    state: 'State',
    zip: 'Zip Code',
    services: 'Services',
    property_type: 'Property Type',
    package: 'Package',
    source: 'Source',
    lead_event: 'Lead Events',
    abandoned_email: 'Reminder Email',
    customer_estimate: 'Estimate Email Status',
    estimate_followup: 'Estimate Follow Up',
    date: 'Submitted Date',
    abandoned_email_sent_date: 'Auto Email Sent Date',
    ip_city: 'IP City',
    ip_state: 'IP State'
  };

  useEffect(() => {
    if (!user) {
      navigate('/employee-login');
      return;
    }
    fetchQuotes();

    // Set up realtime subscription for quote updates with debouncing
    let refreshTimeout: NodeJS.Timeout | null = null;

    const channel = supabase
      .channel('quote_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_submissions'
        },
        (payload) => {
          console.log('Realtime update received:', payload);

          // Debounce refetch to avoid multiple rapid updates
          if (refreshTimeout) {
            clearTimeout(refreshTimeout);
          }

          refreshTimeout = setTimeout(() => {
            fetchQuotes();
          }, 1000); // Wait 1 second before refetching
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      supabase.removeChannel(channel);
    };
  }, [user, navigate, filterStatus]);

  // Save hidden columns to session storage
  useEffect(() => {
    sessionStorage.setItem('hiddenColumns', JSON.stringify([...hiddenColumns]));
  }, [hiddenColumns]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleColumnRightClick = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    if (column === 'select') return; // Don't allow hiding select column
    setContextMenu({ x: e.clientX, y: e.clientY, column });
  };

  const hideColumn = (column: string) => {
    setHiddenColumns(prev => new Set([...prev, column]));
    setContextMenu(null);
  };

  const unhideColumn = (column: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      newSet.delete(column);
      return newSet;
    });
  };

  const unhideAllColumns = () => {
    setHiddenColumns(new Set());
    setShowUnhideModal(false);
  };

  const isColumnVisible = (column: string) => !hiddenColumns.has(column);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching quotes with user:', user?.email);
      console.log('Filter status:', filterStatus);

      let query = supabase
        .from('quote_submissions')
        .select('id, name, business_name, phone, email, address, city, state, zip, ip_city, ip_state, services, property_type, package, page_source, submit_email, is_submitted, deleted, session_id, lead_event, abandoned_email_sent, abandoned_email_sent_at, estimate_followup_sent, estimate_followup_sent_at, customer_estimate_sent, customer_estimate_sent_at, estimate_approved, estimate_approved_at, status, design_file_url, design_image_url, second_design_image_url, design_saved_at, design_saved_by, created_at, updated_at');

      if (filterStatus === 'draft') {
        query = query.eq('is_submitted', false).eq('deleted', false).is('duplicate_of_id', null);
      } else if (filterStatus === 'submitted') {
        query = query.eq('is_submitted', true).eq('deleted', false).is('duplicate_of_id', null);
      } else if (filterStatus === 'deleted') {
        query = query.eq('deleted', true);
      } else {
        // 'all' - exclude deleted quotes AND duplicates
        query = query.eq('deleted', false).is('duplicate_of_id', null);
      }

      // Optimize: Load most recent 500 records first (covers 99% of use cases)
      // Users can adjust filters to narrow down if needed
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Fetched quotes:', data);
      console.log('Number of quotes:', data?.length || 0);
      setQuotes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quotes';
      console.error('Error fetching quotes:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredAndSortedQuotes.map(q => q.id));
    setSelectedQuotes(allIds);
  };

  const handleUnselectAll = () => {
    setSelectedQuotes(new Set());
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedQuotes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuotes(newSelected);
  };

  const deleteSelected = async () => {
    if (selectedQuotes.size === 0) {
      alert('Please select at least one quote to delete');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedQuotes.size} quote${selectedQuotes.size > 1 ? 's' : ''}? This will move them to the Deleted tab.`
    );

    if (!confirmDelete) return;

    try {
      const idsToDelete = Array.from(selectedQuotes);

      // Soft delete: mark as deleted instead of permanently removing
      const { error } = await supabase
        .from('quote_submissions')
        .update({ deleted: true })
        .in('id', idsToDelete);

      if (error) {
        console.error('Error deleting quotes:', error);
        alert('Failed to delete quotes: ' + error.message);
        return;
      }

      alert(`Successfully deleted ${selectedQuotes.size} quote${selectedQuotes.size > 1 ? 's' : ''}`);
      setSelectedQuotes(new Set());
      fetchQuotes();
    } catch (err) {
      console.error('Error deleting quotes:', err);
      alert('An error occurred while deleting quotes');
    }
  };

  const restoreSelected = async () => {
    if (selectedQuotes.size === 0) {
      alert('Please select at least one quote to restore');
      return;
    }

    const confirmRestore = window.confirm(
      `Are you sure you want to restore ${selectedQuotes.size} quote${selectedQuotes.size > 1 ? 's' : ''}?`
    );

    if (!confirmRestore) return;

    try {
      const idsToRestore = Array.from(selectedQuotes);

      const { error } = await supabase
        .from('quote_submissions')
        .update({ deleted: false })
        .in('id', idsToRestore);

      if (error) {
        console.error('Error restoring quotes:', error);
        alert('Failed to restore quotes: ' + error.message);
        return;
      }

      alert(`Successfully restored ${selectedQuotes.size} quote${selectedQuotes.size > 1 ? 's' : ''}`);
      setSelectedQuotes(new Set());
      fetchQuotes();
    } catch (err) {
      console.error('Error restoring quotes:', err);
      alert('An error occurred while restoring quotes');
    }
  };

  const exportToCSV = () => {
    const selectedData = quotes.filter(q => selectedQuotes.has(q.id));

    if (selectedData.length === 0) {
      alert('Please select at least one quote to export');
      return;
    }

    const headers = [
      'Full Name',
      'Business Name',
      'Phone Number',
      'Email Address',
      'Street Address',
      'City',
      'State',
      'ZIP Code',
      'Services Interested In',
      'Property Type',
      'Package',
      'Page Source',
      'Lead Event',
      'Submitted Date',
      'Auto Email Sent Date'
    ];

    const csvRows = [headers.join(',')];

    selectedData.forEach(quote => {
      const row = [
        `"${quote.name}"`,
        quote.business_name ? `"${quote.business_name}"` : '',
        `"${quote.phone}"`,
        `"${quote.email}"`,
        `"${quote.address}"`,
        quote.city ? `"${quote.city}"` : '',
        quote.state ? `"${quote.state}"` : '',
        quote.zip ? `"${quote.zip}"` : '',
        `"${quote.services.join('; ')}"`,
        quote.property_type ? `"${quote.property_type}"` : '',
        quote.package ? `"${quote.package}"` : '',
        quote.page_source ? `"${quote.page_source}"` : '',
        quote.lead_event ? `"${quote.lead_event}"` : '',
        `"${new Date(quote.created_at).toLocaleString()}"`,
        quote.abandoned_email_sent_at ? `"${new Date(quote.abandoned_email_sent_at).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}"` : 'N/A'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `quote_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return (
      <div className="text-sm">
        <div className="font-medium text-gray-900">{dateStr}</div>
        <div className="text-gray-600">{timeStr}</div>
      </div>
    );
  };

  const isHolidayLightsSubmission = (quote: QuoteSubmission) => {
    return quote.page_source?.toLowerCase().includes('holiday') ||
           quote.services.some(s => s.toLowerCase().includes('holiday'));
  };

  // Extract unique services from all quotes
  const uniqueServices = useMemo(() => {
    const servicesSet = new Set<string>();
    quotes.forEach(quote => {
      quote.services?.forEach(service => servicesSet.add(service));
    });
    return Array.from(servicesSet).sort();
  }, [quotes]);

  // Handle sorting
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Get sort icon for a column
  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="w-4 h-4 text-blue-600" />;
    }
    return null;
  };

  // Sort and filter quotes
  const filteredAndSortedQuotes = useMemo(() => {
    let result = [...quotes];

    // Apply global search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(quote => {
        const searchFields = [
          quote.name,
          quote.business_name,
          quote.email,
          quote.phone,
          quote.address,
          quote.city,
          quote.state,
          quote.zip,
          quote.services?.join(' ')
        ];

        return searchFields.some(field =>
          field?.toLowerCase().includes(term)
        );
      });
    }

    // Apply service filter
    if (selectedService !== 'all') {
      result = result.filter(quote =>
        quote.services?.includes(selectedService)
      );
    }

    // Apply advanced filters
    if (advancedFilters.status !== 'all') {
      result = result.filter(quote => quote.status === advancedFilters.status);
    }

    if (advancedFilters.leadEvent !== 'all') {
      result = result.filter(quote => quote.lead_event === advancedFilters.leadEvent);
    }

    if (advancedFilters.source !== 'all') {
      result = result.filter(quote => quote.page_source === advancedFilters.source);
    }

    if (advancedFilters.hasDesign !== 'all') {
      const hasDesign = advancedFilters.hasDesign === 'yes';
      result = result.filter(quote => hasDesign ? !!quote.design_file_url : !quote.design_file_url);
    }

    if (advancedFilters.emailSent !== 'all') {
      const emailSent = advancedFilters.emailSent === 'yes';
      result = result.filter(quote => quote.abandoned_email_sent === emailSent);
    }

    if (advancedFilters.estimateSent !== 'all') {
      const estimateSent = advancedFilters.estimateSent === 'yes';
      result = result.filter(quote => quote.customer_estimate_sent === estimateSent);
    }

    if (advancedFilters.approved !== 'all') {
      const approved = advancedFilters.approved === 'yes';
      result = result.filter(quote => quote.estimate_approved === approved);
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | string[] = '';
        let bValue: string | string[] = '';

        switch (sortColumn) {
          case 'name':
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
            break;
          case 'business_name':
            aValue = (a.business_name || '').toLowerCase();
            bValue = (b.business_name || '').toLowerCase();
            break;
          case 'city':
            aValue = (a.city || '').toLowerCase();
            bValue = (b.city || '').toLowerCase();
            break;
          case 'state':
            aValue = (a.state || '').toLowerCase();
            bValue = (b.state || '').toLowerCase();
            break;
          case 'services':
            aValue = (a.services || []).join(', ').toLowerCase();
            bValue = (b.services || []).join(', ').toLowerCase();
            break;
          case 'created_at':
            // Sort by date - convert to timestamps for comparison
            const aTime = new Date(a.created_at).getTime();
            const bTime = new Date(b.created_at).getTime();
            return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [quotes, selectedService, sortColumn, sortDirection, searchTerm, advancedFilters]);

  // Pagination logic
  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedQuotes.slice(startIndex, endIndex);
  }, [filteredAndSortedQuotes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedQuotes.length / itemsPerPage);

  // Get unique values for filter dropdowns
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(quotes.map(q => q.status).filter(Boolean));
    return Array.from(statuses).sort();
  }, [quotes]);

  const uniqueLeadEvents = useMemo(() => {
    const events = new Set(quotes.map(q => q.lead_event).filter(Boolean));
    return Array.from(events).sort();
  }, [quotes]);

  const uniqueSources = useMemo(() => {
    const sources = new Set(quotes.map(q => q.page_source).filter(Boolean));
    return Array.from(sources).sort();
  }, [quotes]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedService, advancedFilters, filterStatus]);

  const handleEditStart = (quoteId: string, field: string, currentValue: string) => {
    setEditingCell({ id: quoteId, field });
    setEditValue(currentValue || '');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditSave = async (quoteId: string, field: string) => {
    try {
      const updateData: any = { [field]: editValue };

      const { error } = await supabase
        .from('quote_submissions')
        .update(updateData)
        .eq('id', quoteId);

      if (error) {
        console.error('Error updating quote:', error);
        alert('Failed to update: ' + error.message);
        return;
      }

      // Update local state
      setQuotes(quotes.map(q =>
        q.id === quoteId ? { ...q, [field]: editValue } : q
      ));

      setEditingCell(null);
      setEditValue('');
    } catch (err) {
      console.error('Error updating quote:', err);
      alert('An error occurred while updating');
    }
  };

  const handleLeadEventChange = async (quoteId: string, newEvent: string) => {
    try {
      const { error } = await supabase
        .from('quote_submissions')
        .update({ lead_event: newEvent })
        .eq('id', quoteId);

      if (error) {
        console.error('Error updating lead event:', error);
        alert('Failed to update lead event: ' + error.message);
        return;
      }

      setQuotes(prevQuotes =>
        prevQuotes.map(q =>
          q.id === quoteId ? { ...q, lead_event: newEvent } : q
        )
      );
    } catch (err) {
      console.error('Error updating lead event:', err);
      alert('An error occurred while updating the lead event');
    }
  };

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quote_submissions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status: ' + error.message);
        return;
      }

      setQuotes(prevQuotes =>
        prevQuotes.map(q =>
          q.id === quoteId ? { ...q, status: newStatus, updated_at: new Date().toISOString() } : q
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('An error occurred while updating the status');
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedQuotes.size === 0) {
      alert('Please select at least one quote to update');
      return;
    }

    const confirmUpdate = window.confirm(
      `Are you sure you want to update ${selectedQuotes.size} quote${selectedQuotes.size > 1 ? 's' : ''} to status "${bulkStatus}"?`
    );

    if (!confirmUpdate) return;

    try {
      const idsToUpdate = Array.from(selectedQuotes);

      const { error } = await supabase
        .from('quote_submissions')
        .update({
          status: bulkStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', idsToUpdate);

      if (error) {
        console.error('Error updating statuses:', error);
        alert('Failed to update statuses: ' + error.message);
        return;
      }

      setQuotes(prevQuotes =>
        prevQuotes.map(q =>
          selectedQuotes.has(q.id) ? { ...q, status: bulkStatus, updated_at: new Date().toISOString() } : q
        )
      );

      alert(`Successfully updated ${selectedQuotes.size} quote${selectedQuotes.size > 1 ? 's' : ''} to "${bulkStatus}"`);
      setSelectedQuotes(new Set());
    } catch (err) {
      console.error('Error updating statuses:', err);
      alert('An error occurred while updating the statuses');
    }
  };

  const handleApprovedChange = async (quoteId: string, isApproved: boolean) => {
    try {
      const updateData: any = {
        estimate_approved: isApproved,
        updated_at: new Date().toISOString()
      };

      // Set timestamp when manually approving
      if (isApproved) {
        updateData.estimate_approved_at = new Date().toISOString();
      } else {
        // Clear timestamp when un-approving
        updateData.estimate_approved_at = null;
        updateData.estimate_approved_by_ip = null;
      }

      const { error } = await supabase
        .from('quote_submissions')
        .update(updateData)
        .eq('id', quoteId);

      if (error) {
        console.error('Error updating approval status:', error);
        alert('Failed to update approval status: ' + error.message);
        return;
      }

      // Update local state
      setQuotes(prevQuotes =>
        prevQuotes.map(q =>
          q.id === quoteId
            ? {
                ...q,
                estimate_approved: isApproved,
                estimate_approved_at: isApproved ? new Date().toISOString() : null
              }
            : q
        )
      );
    } catch (err) {
      console.error('Error updating approval status:', err);
      alert('An error occurred while updating the approval status');
    }
  };

  const handleSaveQuoteEdit = async (updatedQuote: Partial<QuoteSubmission>) => {
    if (!editingQuote) return;

    try {
      const { error } = await supabase
        .from('quote_submissions')
        .update({
          ...updatedQuote,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingQuote.id);

      if (error) {
        console.error('Error updating quote:', error);
        throw new Error(error.message);
      }

      // Update local state
      setQuotes(prevQuotes =>
        prevQuotes.map(q =>
          q.id === editingQuote.id
            ? { ...q, ...updatedQuote, updated_at: new Date().toISOString() }
            : q
        )
      );

      setEditingQuote(null);
      alert('Quote updated successfully!');
    } catch (err) {
      console.error('Error saving quote:', err);
      throw err;
    }
  };

  const handleManualReminderEmail = async (quoteId: string, email: string) => {
    // Check if this email address already received a reminder
    const { data: existingEmails } = await supabase
      .from('quote_submissions')
      .select('id, abandoned_email_sent_at, name')
      .eq('email', email)
      .eq('abandoned_email_sent', true)
      .eq('deleted', false)
      .is('duplicate_of_id', null);

    let confirmMessage = `Send reminder email to ${email}?`;

    if (existingEmails && existingEmails.length > 0) {
      const lastSentDate = new Date(existingEmails[0].abandoned_email_sent_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      confirmMessage = `⚠️ REMINDER EMAIL ALREADY SENT\n\n` +
        `Email: ${email}\n` +
        `Last sent: ${lastSentDate}\n` +
        `Previous recipient: ${existingEmails[0].name || 'Unknown'}\n\n` +
        `⚠️ WARNING: This contact has already received a reminder email.\n\n` +
        `Sending another email may:\n` +
        `• Appear spammy to the customer\n` +
        `• Lower email engagement rates\n` +
        `• Potentially annoy the recipient\n\n` +
        `ADMIN OVERRIDE: You can still send this email if there's a legitimate reason (e.g., different person, new request, customer requested follow-up).\n\n` +
        `Do you want to proceed anyway?`;
    }

    const confirmSend = window.confirm(confirmMessage);

    if (!confirmSend) return;

    setSendingEmail(quoteId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-abandoned-form-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quoteId }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`✅ Reminder email sent successfully to ${email}!`);
        fetchQuotes();
      } else {
        const errorMsg = result.error || 'Failed to send email';
        alert(`❌ Unable to send email:\n\n${errorMsg}`);
      }
    } catch (err) {
      console.error('Error sending manual reminder:', err);
      alert('❌ An error occurred while sending the reminder email');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleSendEstimateFollowUp = async (quoteId: string, email: string, name: string) => {
    // Check if follow-up already sent
    const quote = quotes.find(q => q.id === quoteId);

    if (quote?.estimate_followup_sent) {
      const lastSentDate = quote.estimate_followup_sent_at
        ? new Date(quote.estimate_followup_sent_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Unknown';

      const confirmMessage = `⚠️ ESTIMATE FOLLOW-UP ALREADY SENT\n\n` +
        `Email: ${email}\n` +
        `Last sent: ${lastSentDate}\n\n` +
        `Do you want to send another follow-up email?`;

      if (!window.confirm(confirmMessage)) return;
    } else {
      const confirmMessage = `Send estimate follow-up email to ${name} (${email})?`;
      if (!window.confirm(confirmMessage)) return;
    }

    if (!email) {
      alert('❌ No email address found for this quote');
      return;
    }

    setSendingEmail(quoteId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-estimate-followup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quoteId }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`✅ Estimate follow-up email sent successfully to ${email}!`);
        fetchQuotes();
      } else {
        const errorMsg = result.error || 'Failed to send email';
        alert(`❌ Unable to send email:\n\n${errorMsg}`);
      }
    } catch (err) {
      console.error('Error sending estimate follow-up:', err);
      alert('❌ An error occurred while sending the estimate follow-up email');
    } finally {
      setSendingEmail(null);
    }
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
          <p className="mt-4 text-gray-600">Loading quotes...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quote Submissions</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 font-semibold">Error: {error}</p>
              <button
                onClick={fetchQuotes}
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
      <ReturnToDashboardButton />

      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Quote Submissions</h1>
            <button
              onClick={() => setShowAddProspectModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add New Prospect
            </button>
          </div>

          {/* Global Search */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="🔍 Search by name, email, phone, address, city, or any field..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl px-2"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-700">Filters:</span>
              {(filterStatus !== 'all' || selectedService !== 'all' || advancedFilters.status !== 'all' || advancedFilters.leadEvent !== 'all' || advancedFilters.source !== 'all') && (
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setSelectedService('all');
                    setAdvancedFilters({
                      status: 'all',
                      leadEvent: 'all',
                      source: 'all',
                      hasDesign: 'all',
                      emailSent: 'all',
                      estimateSent: 'all',
                      approved: 'all'
                    });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Submission Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Submission Type</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Quotes ({quotes.length})</option>
                  <option value="draft">Drafts ({quotes.filter(q => !q.is_submitted && !q.deleted).length})</option>
                  <option value="submitted">Submitted ({quotes.filter(q => q.is_submitted && !q.deleted).length})</option>
                  <option value="deleted">Deleted ({quotes.filter(q => q.deleted).length})</option>
                </select>
              </div>

              {/* Service Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Service Type</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Services</option>
                  {uniqueServices.map(service => {
                    const count = quotes.filter(q => q.services?.includes(service)).length;
                    return (
                      <option key={service} value={service}>
                        {service} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lead Status</label>
                <select
                  value={advancedFilters.status}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Page Source</label>
                <select
                  value={advancedFilters.source}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, source: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {/* Lead Event Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lead Event</label>
                <select
                  value={advancedFilters.leadEvent}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, leadEvent: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Events</option>
                  {uniqueLeadEvents.map(event => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>

              {/* Has Design Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Has Design</label>
                <select
                  value={advancedFilters.hasDesign}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, hasDesign: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All</option>
                  <option value="yes">Has Design</option>
                  <option value="no">No Design</option>
                </select>
              </div>

              {/* Email Sent Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reminder Email</label>
                <select
                  value={advancedFilters.emailSent}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, emailSent: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All</option>
                  <option value="yes">Sent</option>
                  <option value="no">Not Sent</option>
                </select>
              </div>

              {/* Estimate Sent Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estimate Sent</label>
                <select
                  value={advancedFilters.estimateSent}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, estimateSent: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All</option>
                  <option value="yes">Sent</option>
                  <option value="no">Not Sent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                Showing <strong>{paginatedQuotes.length}</strong> of <strong>{filteredAndSortedQuotes.length}</strong> quotes
                {filteredAndSortedQuotes.length !== quotes.length && (
                  <span className="text-gray-500"> (filtered from {quotes.length} total)</span>
                )}
                {selectedQuotes.size > 0 && <span> | Selected: <strong>{selectedQuotes.size}</strong></span>}
              </p>

              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="500">500</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-gray-500 italic">
              💡 Tip: Use the search box above to quickly find records, or combine multiple filters for precise results
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

              {/* Bulk Status Update */}
              {selectedQuotes.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <label className="text-sm font-medium text-blue-900">Update to:</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="px-3 py-1.5 text-sm font-medium border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Needs Measure">Needs Measure</option>
                    <option value="Measured">Measured</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Sold">Sold</option>
                    <option value="Completed">Completed</option>
                    <option value="Lost">Lost</option>
                  </select>
                  <button
                    onClick={handleBulkStatusUpdate}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update {selectedQuotes.size} Selected
                  </button>
                </div>
              )}

              <button
                onClick={exportToCSV}
                disabled={selectedQuotes.size === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export Selected to CSV
              </button>
              {filterStatus === 'deleted' ? (
                <button
                  onClick={restoreSelected}
                  disabled={selectedQuotes.size === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <CheckSquare className="w-4 h-4" />
                  Restore Selected
                </button>
              ) : (
                <button
                  onClick={deleteSelected}
                  disabled={selectedQuotes.size === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              )}
              <button
                onClick={fetchQuotes}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowUnhideModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Manage column visibility"
              >
                {hiddenColumns.size > 0 ? `Columns (${hiddenColumns.size} hidden)` : 'Manage Columns'}
              </button>
            </div>
          </div>
        </div>

        {filteredAndSortedQuotes.length === 0 && quotes.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-2">No quotes match the selected filter.</p>
            <button
              onClick={() => setSelectedService('all')}
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Clear filter to see all quotes
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No quote submissions yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    if (tableContainerRef.current) {
                      tableContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Scroll Left
                </button>
                <div className="text-center">
                  <span className="text-sm text-gray-600 font-medium block">Use arrows to navigate table horizontally</span>
                  <span className="text-xs text-gray-500 italic">Double-click any cell to edit</span>
                </div>
                <button
                  onClick={() => {
                    if (tableContainerRef.current) {
                      tableContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Scroll Right"
                >
                  Scroll Right
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto" ref={tableContainerRef}>
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
                    {isColumnVisible('status') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.status}px`, minWidth: `${columnWidths.status}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'status')}
                      >
                        Status
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'status')}
                        />
                      </th>
                    )}
                    {isColumnVisible('design_file') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.design_file}px`, minWidth: `${columnWidths.design_file}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'design_file')}
                      >
                        Design File
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'design_file')}
                        />
                      </th>
                    )}
                    {isColumnVisible('abandoned_email') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.abandoned_email}px`, minWidth: `${columnWidths.abandoned_email}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'abandoned_email')}
                      >
                        Reminder Email
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'abandoned_email')}
                        />
                      </th>
                    )}
                    {isColumnVisible('customer_estimate') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.customer_estimate}px`, minWidth: `${columnWidths.customer_estimate}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'customer_estimate')}
                      >
                        Estimate Email Status
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'customer_estimate')}
                        />
                      </th>
                    )}
                    {isColumnVisible('estimate_followup') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.estimate_followup}px`, minWidth: `${columnWidths.estimate_followup}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'estimate_followup')}
                      >
                        Estimate Follow Up
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'estimate_followup')}
                        />
                      </th>
                    )}
                    {isColumnVisible('approved') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.approved}px`, minWidth: `${columnWidths.approved}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'approved')}
                      >
                        Approved
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'approved')}
                        />
                      </th>
                    )}
                    {isColumnVisible('name') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu group"
                        style={{ width: `${columnWidths.name}px`, minWidth: `${columnWidths.name}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'name')}
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer select-none"
                          onClick={() => handleSort('name')}
                        >
                          <span>Full Name</span>
                          {getSortIcon('name')}
                        </div>
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'name')}
                        />
                      </th>
                    )}
                    {isColumnVisible('business_name') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu group"
                        style={{ width: `${columnWidths.business_name}px`, minWidth: `${columnWidths.business_name}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'business_name')}
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer select-none"
                          onClick={() => handleSort('business_name')}
                        >
                          <span>Business Name</span>
                          {getSortIcon('business_name')}
                        </div>
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'business_name')}
                        />
                      </th>
                    )}
                    {isColumnVisible('phone') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.phone}px`, minWidth: `${columnWidths.phone}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'phone')}
                      >
                        Phone Number
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'phone')}
                        />
                      </th>
                    )}
                    {isColumnVisible('email') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.email}px`, minWidth: `${columnWidths.email}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'email')}
                      >
                        Email Address
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'email')}
                        />
                      </th>
                    )}
                    {isColumnVisible('address') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.address}px`, minWidth: `${columnWidths.address}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'address')}
                      >
                        Street Address
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'address')}
                        />
                      </th>
                    )}
                    {isColumnVisible('city') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu group"
                        style={{ width: `${columnWidths.city}px`, minWidth: `${columnWidths.city}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'city')}
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer select-none"
                          onClick={() => handleSort('city')}
                        >
                          <span>City</span>
                          {getSortIcon('city')}
                        </div>
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'city')}
                        />
                      </th>
                    )}
                    {isColumnVisible('state') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu group"
                        style={{ width: `${columnWidths.state}px`, minWidth: `${columnWidths.state}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'state')}
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer select-none"
                          onClick={() => handleSort('state')}
                        >
                          <span>State</span>
                          {getSortIcon('state')}
                        </div>
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'state')}
                        />
                      </th>
                    )}
                    {isColumnVisible('zip') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.zip}px`, minWidth: `${columnWidths.zip}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'zip')}
                      >
                        ZIP Code
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'zip')}
                        />
                      </th>
                    )}
                    {isColumnVisible('services') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu group"
                        style={{ width: `${columnWidths.services}px`, minWidth: `${columnWidths.services}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'services')}
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer select-none"
                          onClick={() => handleSort('services')}
                        >
                          <span>Services Interested In</span>
                          {getSortIcon('services')}
                        </div>
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'services')}
                        />
                      </th>
                    )}
                    {isColumnVisible('property_type') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.property_type}px`, minWidth: `${columnWidths.property_type}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'property_type')}
                      >
                        Property Type *
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'property_type')}
                        />
                      </th>
                    )}
                    {isColumnVisible('package') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.package}px`, minWidth: `${columnWidths.package}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'package')}
                      >
                        Package *
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'package')}
                        />
                      </th>
                    )}
                    {isColumnVisible('source') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.source}px`, minWidth: `${columnWidths.source}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'source')}
                      >
                        Source
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'source')}
                        />
                      </th>
                    )}
                    {isColumnVisible('lead_event') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.lead_event}px`, minWidth: `${columnWidths.lead_event}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'lead_event')}
                      >
                        Lead Events
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'lead_event')}
                        />
                      </th>
                    )}
                    {isColumnVisible('date') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-pointer group hover:bg-gray-50"
                        style={{ width: `${columnWidths.date}px`, minWidth: `${columnWidths.date}px` }}
                        onClick={() => handleSort('created_at')}
                        onContextMenu={(e) => handleColumnRightClick(e, 'date')}
                      >
                        <div className="flex items-center gap-2">
                          <span>Submitted Date & Time</span>
                          {getSortIcon('created_at')}
                        </div>
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'date')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>
                    )}
                    {isColumnVisible('abandoned_email_sent_date') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.abandoned_email_sent_date}px`, minWidth: `${columnWidths.abandoned_email_sent_date}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'abandoned_email_sent_date')}
                      >
                        Auto Email Sent Date
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'abandoned_email_sent_date')}
                        />
                      </th>
                    )}
                    {isColumnVisible('ip_city') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.city}px`, minWidth: `${columnWidths.city}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'ip_city')}
                      >
                        IP City
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'city')}
                        />
                      </th>
                    )}
                    {isColumnVisible('ip_state') && (
                      <th
                        className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative cursor-context-menu"
                        style={{ width: `${columnWidths.state}px`, minWidth: `${columnWidths.state}px` }}
                        onContextMenu={(e) => handleColumnRightClick(e, 'ip_state')}
                      >
                        IP State
                        <div
                          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                          onMouseDown={(e) => handleMouseDown(e, 'state')}
                        />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedQuotes.map((quote) => {
                    const isHolidayLights = isHolidayLightsSubmission(quote);
                    return (
                      <tr
                        key={quote.id}
                        className={`group hover:bg-gray-50 ${selectedQuotes.has(quote.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className={`border border-gray-300 px-2 py-3 sticky left-0 z-10 ${selectedQuotes.has(quote.id) ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-white group-hover:bg-gray-50'}`} style={{ width: `${columnWidths.select}px` }}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedQuotes.has(quote.id)}
                              onChange={() => toggleSelection(quote.id)}
                              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <button
                              onClick={() => setEditingQuote(quote)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit this quote"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        {isColumnVisible('status') && (
                          <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.status}px` }}>
                            <select
                              value={quote.status || 'Submitted'}
                              onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                              className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                quote.status === 'Draft' ? 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100' :
                                quote.status === 'Submitted' ? 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100' :
                                quote.status === 'Needs Measure' ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100' :
                                quote.status === 'Measured' ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100' :
                                quote.status === 'Quoted' ? 'bg-yellow-50 text-yellow-800 border-yellow-300 hover:bg-yellow-100' :
                                quote.status === 'Sold' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' :
                                quote.status === 'Completed' ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100' :
                                quote.status === 'Lost' ? 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100' :
                                'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100'
                              }`}
                              title="Select quote status"
                            >
                              <option value="Draft">Draft</option>
                              <option value="Submitted">Submitted</option>
                              <option value="Needs Measure">Needs Measure</option>
                              <option value="Measured">Measured</option>
                              <option value="Quoted">Quoted</option>
                              <option value="Sold">Sold</option>
                              <option value="Completed">Completed</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </td>
                        )}
                        {isColumnVisible('design_file') && (
                          <td className="border border-gray-300 px-4 py-3 text-center" style={{ width: `${columnWidths.design_file}px` }}>
                            {quote.design_file_url ? (
                              <div className="flex flex-col gap-1.5">
                                <button
                                  onClick={() => navigate(`/quickmeasure?quoteId=${quote.id}`)}
                                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                  title={`Edit design in QuickMeasure tool - Last saved by ${quote.design_saved_by || 'Unknown'} on ${quote.design_saved_at ? new Date(quote.design_saved_at).toLocaleDateString() : 'Unknown date'}`}
                                >
                                  ✏️ Edit Design
                                </button>
                                <div className="flex gap-1">
                                  <a
                                    href={quote.design_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1 px-2 py-1 text-gray-600 text-xs hover:text-blue-600 transition-colors"
                                    title="View Photo 1 (Front View)"
                                  >
                                    📐 Photo 1
                                  </a>
                                  {quote.second_design_image_url && (
                                    <a
                                      href={quote.second_design_image_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center gap-1 px-2 py-1 text-gray-600 text-xs hover:text-blue-600 transition-colors"
                                      title="View Photo 2 (Side View)"
                                    >
                                      📐 Photo 2
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No design</span>
                            )}
                          </td>
                        )}
                        {isColumnVisible('abandoned_email') && (
                          <td className="border border-gray-300 px-4 py-3 text-center" style={{ width: `${columnWidths.abandoned_email}px` }}>
                            {quote.abandoned_email_sent ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Sent
                                </span>
                                {quote.abandoned_email_sent_at && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(quote.abandoned_email_sent_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                            ) : !quote.is_submitted && quote.email ? (
                              <button
                                onClick={() => handleManualReminderEmail(quote.id, quote.email!)}
                                disabled={sendingEmail === quote.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                title="Send reminder email now (overrides cron schedule)"
                              >
                                {sendingEmail === quote.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3 h-3" />
                                    Send Now
                                  </>
                                )}
                              </button>
                            ) : quote.is_submitted ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Submitted
                              </span>
                            ) : !quote.email ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                No Email
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Not Sent
                              </span>
                            )}
                          </td>
                        )}
                        {isColumnVisible('customer_estimate') && (
                          <td className="border border-gray-300 px-4 py-3 text-center" style={{ width: `${columnWidths.customer_estimate}px` }}>
                            {quote.customer_estimate_sent ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Email Sent
                                </span>
                                {quote.customer_estimate_sent_at && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(quote.customer_estimate_sent_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                            ) : quote.status === 'Quoted' || quote.status === 'Measured' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⚠ Not Sent
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                N/A
                              </span>
                            )}
                          </td>
                        )}
                        {isColumnVisible('estimate_followup') && (
                          <td className="border border-gray-300 px-4 py-3 text-center" style={{ width: `${columnWidths.estimate_followup}px` }}>
                            {quote.estimate_followup_sent ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Sent
                                </span>
                                {quote.estimate_followup_sent_at && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(quote.estimate_followup_sent_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                            ) : quote.status === 'Quoted' && quote.email ? (
                              <button
                                onClick={() => handleSendEstimateFollowUp(quote.id, quote.email!, quote.name || 'Customer')}
                                disabled={sendingEmail === quote.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                title="Send estimate follow-up email"
                              >
                                {sendingEmail === quote.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3 h-3" />
                                    Send Follow Up
                                  </>
                                )}
                              </button>
                            ) : quote.status !== 'Quoted' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                N/A
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                No Email
                              </span>
                            )}
                          </td>
                        )}
                        {isColumnVisible('approved') && (
                          <td className="border border-gray-300 px-4 py-3 text-center" style={{ width: `${columnWidths.approved}px` }}>
                            <div className="flex flex-col items-center gap-1">
                              <select
                                value={quote.estimate_approved ? 'approved' : 'not_approved'}
                                onChange={(e) => handleApprovedChange(quote.id, e.target.value === 'approved')}
                                className={`w-full px-2 py-1 text-xs font-medium rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  quote.estimate_approved
                                    ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'
                                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                <option value="approved">✓ Approved</option>
                                <option value="not_approved">Not Approved</option>
                              </select>
                              {quote.estimate_approved && quote.estimate_approved_at && (
                                <span className="text-xs text-gray-500">
                                  {new Date(quote.estimate_approved_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                              {quote.status === 'Sold' && quote.estimate_approved && (
                                <span className="text-xs text-blue-600 font-medium">
                                  Auto-approved
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        {isColumnVisible('name') && (
                          <td
                            className="border border-gray-300 px-4 py-3 cursor-pointer hover:bg-blue-50"
                            style={{ width: `${columnWidths.name}px` }}
                            onDoubleClick={() => handleEditStart(quote.id, 'name', quote.name || '')}
                          >
                            {editingCell?.id === quote.id && editingCell?.field === 'name' ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(quote.id, 'name');
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditSave(quote.id, 'name')}
                                    className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    className="flex-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{quote.name || <span className="text-gray-400">-</span>}</div>
                            )}
                          </td>
                        )}
                        {isColumnVisible('business_name') && (
                          <td
                            className="border border-gray-300 px-4 py-3 cursor-pointer hover:bg-blue-50"
                            style={{ width: `${columnWidths.business_name}px` }}
                            onDoubleClick={() => handleEditStart(quote.id, 'business_name', quote.business_name || '')}
                          >
                            {editingCell?.id === quote.id && editingCell?.field === 'business_name' ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(quote.id, 'business_name');
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditSave(quote.id, 'business_name')}
                                    className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    className="flex-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-700">{quote.business_name || <span className="text-gray-400">-</span>}</div>
                            )}
                          </td>
                        )}
                        {isColumnVisible('phone') && (
                          <td
                            className="border border-gray-300 px-4 py-3 cursor-pointer hover:bg-blue-50"
                            style={{ width: `${columnWidths.phone}px` }}
                            onDoubleClick={() => handleEditStart(quote.id, 'phone', quote.phone || '')}
                          >
                            {editingCell?.id === quote.id && editingCell?.field === 'phone' ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(quote.id, 'phone');
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                                <button
                                  onClick={() => handleEditSave(quote.id, 'phone')}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              quote.phone ? (
                                <a href={`tel:${quote.phone}`} className="text-sm text-blue-600 hover:underline">
                                  {quote.phone}
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )
                            )}
                          </td>
                        )}
                        {isColumnVisible('email') && (
                          <td
                            className="border border-gray-300 px-4 py-3 cursor-pointer hover:bg-blue-50"
                            style={{ width: `${columnWidths.email}px` }}
                            onDoubleClick={() => handleEditStart(quote.id, 'email', quote.email || '')}
                          >
                            {editingCell?.id === quote.id && editingCell?.field === 'email' ? (
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(quote.id, 'email');
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                                <button
                                  onClick={() => handleEditSave(quote.id, 'email')}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              quote.email ? (
                                <a href={`mailto:${quote.email}`} className="text-sm text-blue-600 hover:underline break-all">
                                  {quote.email}
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )
                            )}
                          </td>
                        )}
                        {isColumnVisible('address') && (
                          <td
                            className="border border-gray-300 px-4 py-3 cursor-pointer hover:bg-blue-50"
                            style={{ width: `${columnWidths.address}px` }}
                            onDoubleClick={() => handleEditStart(quote.id, 'address', quote.address || '')}
                          >
                            {editingCell?.id === quote.id && editingCell?.field === 'address' ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(quote.id, 'address');
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                                <button
                                  onClick={() => handleEditSave(quote.id, 'address')}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900">{quote.address || <span className="text-gray-400">-</span>}</div>
                            )}
                          </td>
                        )}
                        {isColumnVisible('city') && (
                          <td
                            className="border border-gray-300 px-4 py-3 cursor-pointer hover:bg-blue-50"
                            style={{ width: `${columnWidths.city}px` }}
                            onDoubleClick={() => handleEditStart(quote.id, 'city', quote.city || '')}
                          >
                            {editingCell?.id === quote.id && editingCell?.field === 'city' ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(quote.id, 'city');
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                                <button
                                  onClick={() => handleEditSave(quote.id, 'city')}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">{quote.city || <span className="text-gray-400">-</span>}</div>
                            )}
                          </td>
                        )}
                        {isColumnVisible('state') && (
                          <td
                            className="border border-gray-300 px-4 py-3 cursor-pointer hover:bg-blue-50"
                            style={{ width: `${columnWidths.state}px` }}
                            onDoubleClick={() => handleEditStart(quote.id, 'state', quote.state || '')}
                          >
                            {editingCell?.id === quote.id && editingCell?.field === 'state' ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(quote.id, 'state');
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                                <button
                                  onClick={() => handleEditSave(quote.id, 'state')}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">{quote.state || <span className="text-gray-400">-</span>}</div>
                            )}
                          </td>
                        )}
                        {isColumnVisible('zip') && (
                          <td
                            className="border border-gray-300 px-4 py-3 cursor-pointer hover:bg-blue-50"
                            style={{ width: `${columnWidths.zip}px` }}
                            onDoubleClick={() => handleEditStart(quote.id, 'zip', quote.zip || '')}
                          >
                            {editingCell?.id === quote.id && editingCell?.field === 'zip' ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-sm border border-blue-500 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(quote.id, 'zip');
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                                <button
                                  onClick={() => handleEditSave(quote.id, 'zip')}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">{quote.zip || <span className="text-gray-400">-</span>}</div>
                            )}
                          </td>
                        )}
                        {isColumnVisible('services') && (
                          <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.services}px` }}>
                            <div className="flex flex-wrap gap-1">
                              {quote.services && quote.services.length > 0 ? (
                                quote.services.map((service, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {service}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                        )}
                        {isColumnVisible('property_type') && (
                          <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.property_type}px` }}>
                            {isHolidayLights && quote.property_type ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {quote.property_type}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">N/A</span>
                            )}
                          </td>
                        )}
                        {isColumnVisible('package') && (
                          <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.package}px` }}>
                            {isHolidayLights && quote.package ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                {quote.package}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">N/A</span>
                            )}
                          </td>
                        )}
                        {isColumnVisible('source') && (
                          <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.source}px` }}>
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {quote.page_source || 'Unknown'}
                            </span>
                          </td>
                        )}
                        {isColumnVisible('lead_event') && (
                          <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.lead_event}px` }}>
                            <select
                              value={quote.lead_event || 'lead.created'}
                              onChange={(e) => handleLeadEventChange(quote.id, e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="lead.created">Lead Created</option>
                              <option value="lead.deleted">Lead Deleted</option>
                              <option value="lead.converted">Lead Converted</option>
                              <option value="lead.lost">Lead Lost</option>
                              <option value="lead.updated">Lead Updated</option>
                            </select>
                          </td>
                        )}
                        {isColumnVisible('date') && (
                          <td className="border border-gray-300 px-4 py-3 whitespace-nowrap" style={{ width: `${columnWidths.date}px` }}>
                            {formatDateTime(quote.created_at)}
                          </td>
                        )}
                        {isColumnVisible('abandoned_email_sent_date') && (
                          <td className="border border-gray-300 px-4 py-3 whitespace-nowrap" style={{ width: `${columnWidths.abandoned_email_sent_date}px` }}>
                            {quote.abandoned_email_sent_at ? (
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {new Date(quote.abandoned_email_sent_at).toLocaleDateString('en-US', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-gray-600">
                                  {new Date(quote.abandoned_email_sent_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">N/A</span>
                            )}
                          </td>
                        )}
                        {isColumnVisible('ip_city') && (
                          <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.city}px` }}>
                            <div className="text-sm text-gray-600">{quote.ip_city || <span className="text-gray-400">-</span>}</div>
                          </td>
                        )}
                        {isColumnVisible('ip_state') && (
                          <td className="border border-gray-300 px-4 py-3" style={{ width: `${columnWidths.state}px` }}>
                            <div className="text-sm text-gray-600">{quote.ip_state || <span className="text-gray-400">-</span>}</div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right-click Context Menu */}
        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 9999
            }}
            className="bg-white border border-gray-300 rounded-lg shadow-xl py-1 min-w-48"
          >
            <button
              onClick={() => hideColumn(contextMenu.column)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span>Hide column</span>
              <span className="text-xs text-gray-500">({columnLabels[contextMenu.column]})</span>
            </button>
            <button
              onClick={() => {
                setShowUnhideModal(true);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Manage column visibility...
            </button>
          </div>
        )}

        {/* Unhide Columns Modal */}
        {showUnhideModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Column Visibility</h3>
                <button
                  onClick={() => setShowUnhideModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {hiddenColumns.size === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">All columns are currently visible</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-3">Select columns to show:</p>
                  {[...hiddenColumns].map((column) => (
                    <label
                      key={column}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        onChange={() => unhideColumn(column)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{columnLabels[column]}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  onClick={unhideAllColumns}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={hiddenColumns.size === 0}
                >
                  Show All Columns
                </button>
                <button
                  onClick={() => setShowUnhideModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Prospect Modal */}
        <AddProspectModal
          isOpen={showAddProspectModal}
          onClose={() => setShowAddProspectModal(false)}
          onSuccess={() => {
            fetchQuotes();
            alert('Prospect added successfully!');
          }}
        />

        {/* Edit Quote Modal */}
        {editingQuote && (
          <EditQuoteModal
            quote={editingQuote}
            isOpen={!!editingQuote}
            onClose={() => setEditingQuote(null)}
            onSave={handleSaveQuoteEdit}
          />
        )}
      </div>
    </div>
  );
}
