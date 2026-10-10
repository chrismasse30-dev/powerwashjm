import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Ruler, UserCheck, FileText, Home, FolderOpen, Image, Users, MessageSquare, Mail, BarChart3, Star, DollarSign, Facebook, BellRing, Chrome, TreePine, Map } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function EmployeeDashboardPage() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('Dashboard state:', { email: user?.email, isAdmin, loading });
    if (!loading && !user) {
      navigate('/employee-login');
    }
  }, [user, loading, isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/employee-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-24"></div>
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Employee Dashboard</h1>
              <p className="text-blue-200 mt-1">J & M Power Washing</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-center"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access - Employee Only</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/quickmeasure/"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Ruler className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">QuickMeasure</h4>
                </div>
                <p className="text-sm text-gray-600">Measure properties from photos with precision</p>
              </Link>

<Link
                to="/quotes-dashboard/"
                className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">Quote Submissions</h4>
                </div>
                <p className="text-sm text-gray-600">View all customer quote form submissions</p>
              </Link>

              <Link
                to="/email-templates/"
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900">Email Templates</h4>
                </div>
                <p className="text-sm text-gray-600">View QuickMeasure customer estimate templates</p>
              </Link>

              <Link
                to="/email-report/"
                className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Email Report</h4>
                </div>
                <p className="text-sm text-gray-600">View all customer emails with tracking</p>
              </Link>

              <Link
                to="/popup-management/"
                className="p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BellRing className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-gray-900">Popup Management</h4>
                </div>
                <p className="text-sm text-gray-600">Configure website popups with scheduling and tracking</p>
              </Link>

              {isAdmin && (
                <Link
                  to="/user-management/"
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">User Management</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Manage user accounts, access requests, and permissions
                  </p>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/gallery-management/"
                  className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Image className="w-5 h-5 text-teal-600" />
                    <h4 className="font-semibold text-gray-900">Gallery Management</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Upload, manage, and organize holiday lights gallery photos
                  </p>
                </Link>
              )}

              <Link
                to="/chat-dashboard/"
                className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Live Chat</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Respond to customer chat messages in real-time
                </p>
              </Link>

              <Link
                to="/newsletter-signups/"
                className="p-4 border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-pink-600" />
                  <h4 className="font-semibold text-gray-900">Newsletter Signups</h4>
                </div>
                <p className="text-sm text-gray-600">
                  View all newsletter subscribers and export to CSV
                </p>
              </Link>

              {isAdmin && (
                <Link
                  to="/website-analytics/"
                  className="p-4 border border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold text-gray-900">Website Analytics</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    View comprehensive website analytics and platform insights
                  </p>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/google-review-upload/"
                  className="p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-900">Google Review Upload</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Import 5-star Google reviews to the website carousel
                  </p>
                </Link>
              )}

              <Link
                to="/blog-management"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Blog Management</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Create, schedule, and manage blog posts
                </p>
              </Link>

              {isAdmin && (
                <>
                  <Link
                    to="/facebook-settings/"
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Facebook Integration</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Auto-post blog posts to Facebook Business Page
                    </p>
                  </Link>

                  <Link
                    to="/google-business-settings/"
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Chrome className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-gray-900">Google Business Profile</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Manage Google Business posts and reviews
                    </p>
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/pricing-administration/"
                  className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold text-gray-900">Manage Estimator Pricing</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Configure pricing for the instant online estimate tool
                  </p>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/holiday-lights-admin/"
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TreePine className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Holiday Lights Town Pages</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    View all SEO landing pages for holiday light installation by town
                  </p>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/sitemap-management/"
                  className="p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Map className="w-5 h-5 text-sky-600" />
                    <h4 className="font-semibold text-gray-900">Sitemap & SEO Submission</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Manage sitemap last-modified dates and submit URLs to search engines
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Employee Portal</h3>
          <p className="text-blue-800 text-sm">
            This is your secure employee dashboard. Additional features and functionality will be added here.
          </p>
        </div>
      </main>
    </div>
  );
}
