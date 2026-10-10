import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Upload, AlertCircle, CheckCircle, Copy, Eye, Trash2, EyeOff, RefreshCw, CheckSquare, Square, ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import { supabase } from '../lib/supabase';

interface ParsedReview {
  customerName: string;
  reviewText: string;
  starRating: number;
  reviewDate: string;
}

interface CustomerReview {
  id: string;
  customer_name: string;
  review_text: string;
  rating: number;
  review_date: string;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
  source: string | null;
}

interface BatchReviewRow {
  customerName: string;
  reviewText: string;
  starRating: number;
  reviewDate: string;
  source: string;
}

export default function GoogleReviewUploadPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pastedText, setPastedText] = useState('');
  const [parsedReview, setParsedReview] = useState<ParsedReview | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'active' | 'hidden' | 'deleted'>('active');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [batchRows, setBatchRows] = useState<BatchReviewRow[]>([]);
  const [batchSource, setBatchSource] = useState('Housecall Pro');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate('/employee-login');
    return null;
  }

  if (!isAdmin) {
    navigate('/employee-dashboard');
    return null;
  }

  useEffect(() => {
    loadReviews();
  }, [filter, sortOrder]);

  const parseReviewDate = (dateStr: string): number => {
    const match = dateStr.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers: { [key: string]: number } = {
      'second': 1,
      'minute': 60,
      'hour': 3600,
      'day': 86400,
      'week': 604800,
      'month': 2592000,
      'year': 31536000
    };

    return value * (multipliers[unit] || 0);
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      let query = supabase
        .from('customer_reviews')
        .select('*');

      if (filter === 'active') {
        query = query.eq('is_active', true).eq('deleted', false);
      } else if (filter === 'hidden') {
        query = query.eq('is_active', false).eq('deleted', false);
      } else if (filter === 'deleted') {
        query = query.eq('deleted', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sortedData = (data || []).sort((a, b) => {
        const aTime = parseReviewDate(a.review_date);
        const bTime = parseReviewDate(b.review_date);
        return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
      });

      setReviews(sortedData);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const toggleReviewSelection = (id: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReviews(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map(r => r.id)));
    }
  };

  const toggleVisibility = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      setSuccess(!currentState ? 'Review is now visible on website' : 'Review hidden from website');
      await loadReviews();
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setError('Failed to update review visibility');
    }
  };

  const deleteReview = async (id: string, permanent: boolean = false) => {
    const confirmMsg = permanent
      ? 'Permanently delete this review? This cannot be undone.'
      : 'Move this review to deleted? You can restore it later.';

    if (!confirm(confirmMsg)) return;

    try {
      if (permanent) {
        const { error } = await supabase
          .from('customer_reviews')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setSuccess('Review permanently deleted');
      } else {
        const { error } = await supabase
          .from('customer_reviews')
          .update({ deleted: true })
          .eq('id', id);

        if (error) throw error;
        setSuccess('Review moved to deleted');
      }

      await loadReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
    }
  };

  const deleteSelectedReviews = async (permanent: boolean = false) => {
    if (selectedReviews.size === 0) {
      alert('Please select at least one review');
      return;
    }

    const confirmMsg = permanent
      ? `Permanently delete ${selectedReviews.size} reviews? This cannot be undone.`
      : `Move ${selectedReviews.size} reviews to deleted? You can restore them later.`;

    if (!confirm(confirmMsg)) return;

    try {
      if (permanent) {
        const { error } = await supabase
          .from('customer_reviews')
          .delete()
          .in('id', Array.from(selectedReviews));

        if (error) throw error;
        setSuccess(`${selectedReviews.size} reviews permanently deleted`);
      } else {
        const { error } = await supabase
          .from('customer_reviews')
          .update({ deleted: true })
          .in('id', Array.from(selectedReviews));

        if (error) throw error;
        setSuccess(`${selectedReviews.size} reviews moved to deleted`);
      }

      setSelectedReviews(new Set());
      await loadReviews();
    } catch (err) {
      console.error('Error deleting reviews:', err);
      setError('Failed to delete reviews');
    }
  };

  const restoreReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ deleted: false, is_active: true })
        .eq('id', id);

      if (error) throw error;
      setSuccess('Review restored successfully');
      await loadReviews();
    } catch (err) {
      console.error('Error restoring review:', err);
      setError('Failed to restore review');
    }
  };

  const restoreSelectedReviews = async () => {
    if (selectedReviews.size === 0) {
      alert('Please select at least one review to restore');
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ deleted: false, is_active: true })
        .in('id', Array.from(selectedReviews));

      if (error) throw error;
      setSuccess(`${selectedReviews.size} reviews restored successfully`);
      setSelectedReviews(new Set());
      await loadReviews();
    } catch (err) {
      console.error('Error restoring reviews:', err);
      setError('Failed to restore reviews');
    }
  };

  const checkForDuplicate = async (customerName: string, reviewText: string): Promise<boolean> => {
    try {
      const { data: nameCheck, error: nameError } = await supabase
        .from('customer_reviews')
        .select('id')
        .eq('customer_name', customerName)
        .maybeSingle();

      if (nameError && nameError.code !== 'PGRST116') {
        throw nameError;
      }

      if (nameCheck) {
        return true;
      }

      const { data: textCheck, error: textError } = await supabase
        .from('customer_reviews')
        .select('id')
        .eq('review_text', reviewText)
        .maybeSingle();

      if (textError && textError.code !== 'PGRST116') {
        throw textError;
      }

      if (textCheck) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  const convertRelativeDateToISO = (relativeDate: string): string => {
    const now = new Date();
    const match = relativeDate.match(/(\d+)\s+(day|week|month|year)s?\s+ago/i);

    if (!match) {
      return now.toISOString().split('T')[0];
    }

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'day':
        now.setDate(now.getDate() - value);
        break;
      case 'week':
        now.setDate(now.getDate() - (value * 7));
        break;
      case 'month':
        now.setMonth(now.getMonth() - value);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - value);
        break;
    }

    return now.toISOString().split('T')[0];
  };

  const parseGoogleReview = (text: string): ParsedReview | null => {
    setError('');

    if (!text.trim()) {
      setError('Please paste review content');
      return null;
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      setError('Invalid review format. Please copy the entire review from Google.');
      return null;
    }

    let customerName = '';
    let reviewText = '';
    let reviewDate = 'Recently';

    const namePattern = /^([A-Z][a-z]+(?: [A-Z][a-z]+)*)/;
    const datePattern = /(\d+\s+(?:day|week|month|year)s?\s+ago|recently)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!customerName && namePattern.test(line)) {
        const match = line.match(namePattern);
        if (match) {
          customerName = match[1];
          continue;
        }
      }

      if (line.includes('★') || line.includes('⭐') || /\d+\s*star/i.test(line)) {
        continue;
      }

      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        reviewDate = dateMatch[1];
        continue;
      }

      if (line.length > 20 && !line.toLowerCase().includes('review') && !line.toLowerCase().includes('local guide')) {
        if (!reviewText) {
          reviewText = line;
        } else {
          reviewText += ' ' + line;
        }
      }
    }

    if (!customerName) {
      const firstLine = lines[0];
      if (firstLine.length < 50) {
        customerName = firstLine.split(/\d+/)[0].trim();
      }
    }

    if (!customerName) {
      setError('Could not detect customer name. Please ensure you copied the complete review including the reviewer name.');
      return null;
    }

    if (!reviewText) {
      setError('Could not detect review text. Please ensure you copied the complete review.');
      return null;
    }

    return {
      customerName,
      reviewText,
      starRating: 5,
      reviewDate
    };
  };

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);
    setSuccess('');
    setError('');
    setParsedReview(null);

    if (text.trim()) {
      const parsed = parseGoogleReview(text);
      if (parsed) {
        setParsedReview(parsed);
      }
    }
  };

  const handleSubmit = async () => {
    if (!parsedReview) {
      setError('Please paste and validate a review first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const isDuplicate = await checkForDuplicate(parsedReview.customerName, parsedReview.reviewText);

      if (isDuplicate) {
        setError('This review already exists in the carousel. Duplicate reviews from the same customer or with identical text cannot be added.');
        setLoading(false);
        return;
      }

      console.log('Attempting to insert review:', {
        customer_name: parsedReview.customerName,
        review_text: parsedReview.reviewText,
        rating: parsedReview.starRating,
        review_date: parsedReview.reviewDate,
        user_email: user.email,
        user_id: user.id,
        isAdmin
      });

      const isValidUUID = (id: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
      };

      const reviewData: any = {
        customer_name: parsedReview.customerName,
        review_text: parsedReview.reviewText,
        rating: parsedReview.starRating,
        review_date: convertRelativeDateToISO(parsedReview.reviewDate),
        google_review_data: {
          original_text: pastedText,
          parsed_at: new Date().toISOString(),
          added_by_email: user.email,
          original_date_text: parsedReview.reviewDate
        },
        is_active: true
      };

      if (user.id && isValidUUID(user.id)) {
        reviewData.created_by = user.id;
      }

      console.log('Review data to insert:', reviewData);

      const { data: insertData, error: insertError } = await supabase
        .from('customer_reviews')
        .insert(reviewData)
        .select();

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw new Error(`Database error: ${insertError.message} (Code: ${insertError.code})`);
      }

      console.log('Review inserted successfully:', insertData);

      setSuccess('Review successfully added to the carousel!');
      setPastedText('');
      setParsedReview(null);
      setShowPreview(false);
      await loadReviews();
    } catch (err: any) {
      console.error('Error adding review:', err);
      setError(err.message || 'Failed to add review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPastedText('');
    setParsedReview(null);
    setError('');
    setSuccess('');
    setShowPreview(false);
  };

  const parseCSV = (text: string): BatchReviewRow[] => {
    const lines: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
          current += char;
        }
      } else if (char === '\n' && !inQuotes) {
        lines.push(current);
        current = '';
      } else if (char === '\r' && !inQuotes) {
        continue;
      } else {
        current += char;
      }
    }
    if (current) lines.push(current);

    if (lines.length < 2) return [];

    const parseLine = (line: string): string[] => {
      const fields: string[] = [];
      let field = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQ && line[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQ = !inQ;
          }
        } else if (char === ',' && !inQ) {
          fields.push(field);
          field = '';
        } else {
          field += char;
        }
      }
      fields.push(field);
      return fields;
    };

    const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());

    const nameIdx = headers.findIndex(h => h.includes('customer name'));
    const dateIdx = headers.findIndex(h => h.includes('review created date') || h.includes('created date'));
    const sourceIdx = headers.findIndex(h => h === 'source');
    const ratingIdx = headers.findIndex(h => h.includes('star rating') || h.includes('rating'));
    const commentIdx = headers.findIndex(h => h.includes('review comment') || h.includes('comment') || h.includes('review text'));

    if (nameIdx === -1 || commentIdx === -1) {
      throw new Error('CSV must have "Customer Name" and "Review Comment" columns');
    }

    const rows: BatchReviewRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const fields = parseLine(lines[i]);
      const customerName = (fields[nameIdx] || '').trim().replace(/^"|"$/g, '');
      if (!customerName) continue;

      const rawDate = (dateIdx >= 0 ? fields[dateIdx] : '').trim();
      let reviewDate = '';
      if (rawDate) {
        const dateMatch = rawDate.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          reviewDate = dateMatch[1];
        } else {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) {
            reviewDate = parsed.toISOString().split('T')[0];
          }
        }
      }
      if (!reviewDate) reviewDate = new Date().toISOString().split('T')[0];

      const rating = ratingIdx >= 0 ? parseFloat(fields[ratingIdx] || '5') : 5;
      const reviewText = (fields[commentIdx] || '').trim().replace(/^"|"$/g, '');
      const source = batchSource;

      rows.push({
        customerName,
        reviewText: reviewText || '',
        starRating: Math.round(rating) || 5,
        reviewDate,
        source
      });
    }

    return rows;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBatchResult(null);
    setError('');

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      setBatchRows(rows);
      setSuccess(`Loaded ${rows.length} reviews from CSV. Review them below and click "Import Reviews" to add them all.`);
    } catch (err: any) {
      setError(`Failed to parse CSV: ${err.message}`);
      setBatchRows([]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBatchImport = async () => {
    if (batchRows.length === 0) {
      setError('No reviews to import. Please upload a CSV file first.');
      return;
    }

    setBatchLoading(true);
    setError('');
    setSuccess('');
    setBatchResult(null);

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    const existingNames = new Set<string>();
    const existingTexts = new Set<string>();
    try {
      const { data: existing } = await supabase
        .from('customer_reviews')
        .select('customer_name, review_text');
      (existing || []).forEach(r => {
        existingNames.add(r.customer_name.toLowerCase().trim());
        existingTexts.add(r.review_text.toLowerCase().trim());
      });
    } catch (err) {
      console.error('Error fetching existing reviews for dedup:', err);
    }

    const BATCH_SIZE = 50;
    for (let i = 0; i < batchRows.length; i += BATCH_SIZE) {
      const chunk = batchRows.slice(i, i + BATCH_SIZE);
      const toInsert: any[] = [];

      for (const row of chunk) {
        const nameKey = row.customerName.toLowerCase().trim();
        const textKey = row.reviewText.toLowerCase().trim();

        if (existingNames.has(nameKey) || (textKey && existingTexts.has(textKey))) {
          skipped++;
          continue;
        }

        toInsert.push({
          customer_name: row.customerName,
          review_text: row.reviewText || 'Great service!',
          rating: row.starRating,
          review_date: row.reviewDate,
          source: row.source,
          is_active: true
        });

        existingNames.add(nameKey);
        if (textKey) existingTexts.add(textKey);
      }

      if (toInsert.length === 0) continue;

      try {
        const { error: insertError } = await supabase
          .from('customer_reviews')
          .insert(toInsert);

        if (insertError) {
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`);
        } else {
          added += toInsert.length;
        }
      } catch (err: any) {
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${err.message}`);
      }
    }

    setBatchResult({ added, skipped, errors });
    setBatchRows([]);
    await loadReviews();

    if (added > 0) {
      setSuccess(`Successfully imported ${added} reviews${skipped > 0 ? ` (${skipped} duplicates skipped)` : ''}.`);
    } else if (skipped > 0) {
      setError(`All ${skipped} reviews were duplicates and skipped.`);
    }
    setBatchLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <ReturnToDashboardButton />

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Upload className="w-8 h-8" />
                  Google Review Upload
                </h1>
                <p className="text-blue-100 mt-2">Import 5-star Google reviews to the website carousel</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Copy className="w-5 h-5" />
                How to Copy Reviews from Google
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                <li>Go to your Google Business Profile reviews</li>
                <li>Find a 5-star review you want to add</li>
                <li>Select and copy the entire review (name, stars, date, and text)</li>
                <li>Paste it into the text area below</li>
                <li>Preview and submit to add it to the carousel</li>
              </ol>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">{success}</h4>
                  <p className="text-sm text-green-700 mt-1">The review will appear in the "What Our Customers Say" section on the homepage.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Validation Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paste Google Review Content
              </label>
              <textarea
                value={pastedText}
                onChange={handlePaste}
                placeholder="Paste the complete Google review here including the customer name, date, and review text..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Example format: "Paul Lupoli 2 months ago They arrived on time and did an excellent job..."
              </p>
            </div>

            {parsedReview && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Review Validated Successfully
                  </h3>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Customer Name:</span>
                      <p className="text-gray-900 mt-1">{parsedReview.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Star Rating:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(parsedReview.starRating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-2 text-gray-900 font-semibold">{parsedReview.starRating} Stars</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Date:</span>
                      <p className="text-gray-900 mt-1">{parsedReview.reviewDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Review Length:</span>
                      <p className="text-gray-900 mt-1">{parsedReview.reviewText.length} characters</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-gray-600 font-medium">Review Text:</span>
                    <p className="text-gray-900 mt-1 leading-relaxed">{parsedReview.reviewText}</p>
                  </div>
                </div>

                {showPreview && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview on Website</h4>
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {parsedReview.customerName.charAt(0)}
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="font-bold text-gray-900">{parsedReview.customerName}</h4>
                          <p className="text-sm text-gray-500">{parsedReview.reviewDate}</p>
                        </div>
                        <div className="flex space-x-1">
                          {[...Array(parsedReview.starRating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{parsedReview.reviewText}</p>
                      <div className="mt-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-sm text-gray-600">Google Review</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={!parsedReview || loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Adding Review...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Add Review to Carousel
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>All reviews are automatically set to 5 stars - only upload 5-star reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Copy the entire review including the customer name and date</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Duplicate reviews are automatically detected and prevented</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Review the preview before submitting to ensure accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>The review will be immediately visible on the homepage carousel</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileSpreadsheet className="w-7 h-7" />
              Batch CSV Upload
            </h2>
            <p className="text-emerald-100 mt-1">Import reviews in bulk from a CSV file (Housecall Pro, Google, etc.)</p>
          </div>

          <div className="p-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-emerald-900 mb-2">How it works</h3>
              <ol className="text-sm text-emerald-800 space-y-1 ml-6 list-decimal">
                <li>Export your reviews as a CSV file from Housecall Pro or another platform</li>
                <li>Select the review source below (used to tag each review)</li>
                <li>Upload the CSV file - reviews will be parsed and displayed for review</li>
                <li>Click "Import Reviews" to add all non-duplicate reviews to the website</li>
              </ol>
              <p className="text-xs text-emerald-700 mt-2">
                Required columns: Customer Name, Review Comment. Optional: Review Created Date, Star Rating, Source.
                Duplicate reviews (same customer name or review text) are automatically skipped.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Review Source
              </label>
              <select
                value={batchSource}
                onChange={(e) => setBatchSource(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="Housecall Pro">Housecall Pro</option>
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="Angi">Angi</option>
                <option value="Yelp">Yelp</option>
                <option value="Other">Other</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Each imported review will be tagged with this source so visitors know where it came from.
              </p>
            </div>

            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors w-full"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Choose CSV File
              </button>
            </div>

            {batchRows.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {batchRows.length} Reviews Ready to Import
                  </h3>
                  <button
                    onClick={() => setBatchRows([])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Name</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Date</th>
                        <th className="text-center px-3 py-2 font-semibold text-gray-700">Rating</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Source</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {batchRows.slice(0, 100).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{row.customerName}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.reviewDate}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {row.starRating}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.source}</td>
                          <td className="px-3 py-2 text-gray-700 max-w-xs truncate">{row.reviewText || '(no text)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {batchRows.length > 100 && (
                    <p className="text-center text-xs text-gray-500 py-2 bg-gray-50">
                      Showing first 100 of {batchRows.length} reviews
                    </p>
                  )}
                </div>

                <button
                  onClick={handleBatchImport}
                  disabled={batchLoading}
                  className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
                >
                  {batchLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Importing {batchRows.length} Reviews...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Import {batchRows.length} Reviews
                    </>
                  )}
                </button>
              </div>
            )}

            {batchResult && (
              <div className={`rounded-lg p-4 mb-6 ${batchResult.added > 0 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                <h4 className={`font-semibold ${batchResult.added > 0 ? 'text-green-900' : 'text-orange-900'}`}>
                  Import Complete
                </h4>
                <div className="mt-2 text-sm space-y-1">
                  <p className={batchResult.added > 0 ? 'text-green-700' : 'text-orange-700'}>
                    {batchResult.added} reviews added successfully
                  </p>
                  {batchResult.skipped > 0 && (
                    <p className="text-orange-700">{batchResult.skipped} duplicate reviews skipped</p>
                  )}
                  {batchResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-700 font-medium">Errors:</p>
                      <ul className="list-disc ml-6 text-red-600 text-xs">
                        {batchResult.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Star className="w-7 h-7" />
                  Manage Reviews
                </h2>
                <p className="text-green-100 mt-1">Toggle visibility and manage existing reviews</p>
              </div>
              <button
                onClick={loadReviews}
                disabled={loadingReviews}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loadingReviews ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setFilter('active');
                    setSelectedReviews(new Set());
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Visible on Site
                  </div>
                </button>
                <button
                  onClick={() => {
                    setFilter('hidden');
                    setSelectedReviews(new Set());
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'hidden'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    Hidden
                  </div>
                </button>
                <button
                  onClick={() => {
                    setFilter('deleted');
                    setSelectedReviews(new Set());
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'deleted'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Deleted
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort:
                </span>
                <button
                  onClick={() => setSortOrder('newest')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    sortOrder === 'newest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  Newest First
                </button>
                <button
                  onClick={() => setSortOrder('oldest')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    sortOrder === 'oldest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  Oldest First
                </button>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {selectedReviews.size === reviews.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  {selectedReviews.size === reviews.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedReviews.size > 0 && (
                  <>
                    {filter === 'deleted' ? (
                      <>
                        <button
                          onClick={restoreSelectedReviews}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Restore ({selectedReviews.size})
                        </button>
                        <button
                          onClick={() => deleteSelectedReviews(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                          Delete Permanently ({selectedReviews.size})
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => deleteSelectedReviews(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete ({selectedReviews.size})
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {loadingReviews ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No reviews in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review) => {
                  const isSelected = selectedReviews.has(review.id);
                  return (
                    <div
                      key={review.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-4 ring-blue-500 ring-offset-2'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleReviewSelection(review.id)}
                    >
                      <div className="absolute top-3 left-3" onClick={(e) => {
                        e.stopPropagation();
                        toggleReviewSelection(review.id);
                      }}>
                        {isSelected ? (
                          <div className="bg-blue-600 text-white rounded-lg p-1.5 shadow-lg">
                            <CheckSquare className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="bg-white text-gray-700 rounded-lg p-1.5 border-2 border-gray-300 shadow-sm">
                            <Square className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex gap-1">
                        {filter !== 'deleted' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility(review.id, review.is_active);
                            }}
                            className={`p-1.5 rounded-lg shadow-lg transition-colors ${
                              review.is_active
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-400 hover:bg-gray-500 text-white'
                            }`}
                            title={review.is_active ? 'Hide from website' : 'Show on website'}
                          >
                            {review.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        )}
                        {filter === 'deleted' ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                restoreReview(review.id);
                              }}
                              className="p-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-lg"
                              title="Restore review"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteReview(review.id, true);
                              }}
                              className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteReview(review.id, false);
                            }}
                            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center mb-3 mt-6">
                        <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                          {review.customer_name.charAt(0)}
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="font-bold text-gray-900">{review.customer_name}</h4>
                          <p className="text-xs text-gray-500">{review.review_date}</p>
                        </div>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-4">{review.review_text}</p>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        {review.is_active && filter !== 'deleted' && (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            Visible
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
