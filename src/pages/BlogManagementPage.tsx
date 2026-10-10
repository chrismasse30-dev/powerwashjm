import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, FileText, Clock, Search, ArrowUpDown, Zap, Settings } from 'lucide-react';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  publish_date: string | null;
  scheduled_publish_at: string | null;
  view_count: number;
  created_at: string;
  author_id: string;
}

type SortOption = 'published-desc' | 'published-asc' | 'status' | 'views-desc' | 'views-asc';

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('published-desc');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);

    let query = supabase
      .from('blog_posts')
      .select('*')
      .or('deleted.is.null,deleted.eq.false')
      .order('created_at', { ascending: false});

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching blog posts:', error);
    }
    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted: true })
      .eq('id', id);

    if (!error) fetchPosts();
  };

  const handlePublishNow = async (id: string, title: string) => {
    if (!confirm(`Publish "${title}" immediately?`)) return;

    const { error } = await supabase
      .from('blog_posts')
      .update({
        status: 'published',
        publish_date: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) fetchPosts();
  };

  const sortPosts = (postsToSort: BlogPost[]): BlogPost[] => {
    const sorted = [...postsToSort];

    switch (sortBy) {
      case 'published-desc':
        return sorted.sort((a, b) => {
          const dateA = a.scheduled_publish_at || a.publish_date || a.created_at;
          const dateB = b.scheduled_publish_at || b.publish_date || b.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

      case 'published-asc':
        return sorted.sort((a, b) => {
          const dateA = a.scheduled_publish_at || a.publish_date || a.created_at;
          const dateB = b.scheduled_publish_at || b.publish_date || b.created_at;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });

      case 'status':
        const statusOrder = { published: 0, scheduled: 1, draft: 2, archived: 3 };
        return sorted.sort((a, b) => {
          const orderA = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
          const orderB = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
          if (orderA !== orderB) return orderA - orderB;

          // Within same status, sort by date
          const dateA = a.scheduled_publish_at || a.publish_date || a.created_at;
          const dateB = b.scheduled_publish_at || b.publish_date || b.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

      case 'views-desc':
        return sorted.sort((a, b) => b.view_count - a.view_count);

      case 'views-asc':
        return sorted.sort((a, b) => a.view_count - b.view_count);

      default:
        return sorted;
    }
  };

  const filteredPosts = sortPosts(
    posts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  const now = new Date();

  const stats = {
    total: posts.length,
    published: posts.filter(p => {
      if (p.status !== 'published') return false;
      const publishDate = p.publish_date ? new Date(p.publish_date) : null;
      return !publishDate || publishDate <= now;
    }).length,
    scheduled: posts.filter(p => {
      if (p.status === 'scheduled') return true;
      if (p.status === 'published') {
        const publishDate = p.publish_date ? new Date(p.publish_date) : null;
        return publishDate && publishDate > now;
      }
      return false;
    }).length,
    draft: posts.filter(p => p.status === 'draft').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <ReturnToDashboardButton />

      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog Management</h1>
            <p className="text-gray-600">Create, schedule, and manage blog posts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Published</p>
                  <p className="text-3xl font-bold text-green-600">{stats.published}</p>
                </div>
                <Eye className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.scheduled}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Drafts</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
                </div>
                <FileText className="w-10 h-10 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 bg-white"
                >
                  <option value="all">All Posts</option>
                  <option value="draft">Drafts</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 bg-white appearance-none cursor-pointer"
                  >
                    <option value="published-desc">Published: Newest First</option>
                    <option value="published-asc">Published: Oldest First</option>
                    <option value="status">Status</option>
                    <option value="views-desc">Views: High to Low</option>
                    <option value="views-asc">Views: Low to High</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/blog-management/new"
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                    title="Quick & simple blog editor"
                  >
                    <Zap className="w-5 h-5" />
                    Quick Create
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-2">No posts found</p>
                <Link
                  to="/blog-management/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
                >
                  <Plus className="w-5 h-5" />
                  Create First Post
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Published</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Views</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPosts.map(post => {
                      const publishDate = post.publish_date ? new Date(post.publish_date) : null;
                      const scheduledDate = post.scheduled_publish_at ? new Date(post.scheduled_publish_at) : null;
                      const now = new Date();

                      let displayStatus = post.status;
                      if (post.status === 'published' && publishDate && publishDate > now) {
                        displayStatus = 'scheduled';
                      }
                      if (post.status === 'scheduled' && scheduledDate && scheduledDate <= now) {
                        displayStatus = 'published';
                      }

                      return (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{post.title}</div>
                          <div className="text-sm text-gray-500">/blog/{post.slug}</div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(displayStatus)}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {displayStatus === 'scheduled' ? (
                              <div>
                                <div className="font-medium">Scheduled for:</div>
                                <div className="text-gray-600">{formatDateTime(scheduledDate || publishDate)}</div>
                              </div>
                            ) : displayStatus === 'published' ? (
                              <div>
                                <div className="font-medium">Published:</div>
                                <div className="text-gray-600">{formatDateTime(publishDate)}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Not published</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{post.view_count}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/blog-management/preview/${post.id}`}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                              title="Preview Post"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            {post.status === 'draft' && (
                              <button
                                onClick={() => handlePublishNow(post.id, post.title)}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Publish
                              </button>
                            )}
                            <Link
                              to={`/blog-management/simple/${post.id}`}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Quick Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <Link
                              to={`/blog-management/edit/${post.id}`}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                              title="Advanced Editor"
                            >
                              <Settings className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
