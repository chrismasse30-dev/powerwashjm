import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, X, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { initDemoCredentials } from '../utils/demoAuth';

export default function EmployeeLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestFirstName, setRequestFirstName] = useState('');
  const [requestLastName, setRequestLastName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestPhone, setRequestPhone] = useState('');
  const [requestPassword, setRequestPassword] = useState('');
  const [requestConfirmPassword, setRequestConfirmPassword] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  useEffect(() => {
    // Initialize demo credentials on page load
    initDemoCredentials();

    // Check for remembered credentials
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    // Log current setup for debugging
    console.log('Login page loaded');
    console.log('Supabase URL configured:', !!import.meta.env.VITE_SUPABASE_URL);
    console.log('Demo credentials available:', !!localStorage.getItem('demo_user'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signIn(email, password, rememberMe);

    if (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. If you were recently approved, use the temporary password sent to your email.');
      setIsLoading(false);
    } else {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      navigate('/employee-dashboard');
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (requestPassword !== requestConfirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate password strength
    if (requestPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const { supabase } = await import('../lib/supabase');

      // Insert into access_requests table
      const { data, error: dbError } = await supabase
        .from('access_requests')
        .insert({
          first_name: requestFirstName,
          last_name: requestLastName,
          email: requestEmail,
          phone: requestPhone,
          password_hash: requestPassword,
          status: 'pending',
          is_active: false
        })
        .select();

      if (dbError) {
        console.error('Database error details:', dbError);
        console.error('Error code:', dbError.code);
        console.error('Error message:', dbError.message);
        console.error('Error details:', dbError.details);

        // Provide more specific error messages
        if (dbError.code === '23505') {
          throw new Error('This email address has already been used for an access request.');
        } else if (dbError.code === '42501') {
          throw new Error('Permission denied. Please contact support.');
        } else {
          throw new Error(`Failed to save access request: ${dbError.message}`);
        }
      }

      console.log('Access request saved successfully:', data);

      // Send email notification using Web3Forms
      try {
        const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_key: '54b19651-cf8e-48f8-96ed-e2d65daff9ac',
            subject: `New Employee Access Request - ${requestFirstName} ${requestLastName}`,
            from_name: 'J&M Power Washing System',
            to_email: 'sales@powerwashjm.com',
            message: `New employee access request received:

Name: ${requestFirstName} ${requestLastName}
Email: ${requestEmail}
Phone: ${requestPhone}
Requested: ${new Date().toLocaleString()}

Please review this request in the User Management Dashboard:
https://powerwashjm.com/user-management

This is an automated notification from the employee access request system.`
          })
        });

        if (!web3formsResponse.ok) {
          console.warn('Failed to send email notification, but access request was saved');
        } else {
          console.log('Email notification sent successfully');
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the request if email fails
      }

      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        setRequestFirstName('');
        setRequestLastName('');
        setRequestEmail('');
        setRequestPhone('');
        setRequestPassword('');
        setRequestConfirmPassword('');
      }, 3000);

    } catch (error) {
      console.error('Request access error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Show user-friendly error message
      alert(`Failed to submit access request.\n\n${errorMessage}\n\nPlease contact sales@powerwashjm.com directly for assistance.`);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Sign-In</h1>
            <p className="text-gray-600">J & M Power Washing</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Keep me signed in for 24 hours
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="text-blue-100 text-sm hover:text-white underline transition-colors"
          >
            Request Access
          </button>
          <p className="text-blue-100 text-sm">
            For assistance, contact your administrator
          </p>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Access</h2>
              <p className="text-gray-600 text-sm">Fill out the form below to request employee access</p>
            </div>

            {requestSuccess ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-gray-600">Your access request has been sent. You'll receive an email once it's reviewed.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={requestFirstName}
                    onChange={(e) => setRequestFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={requestLastName}
                    onChange={(e) => setRequestLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="requestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="requestEmail"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="requestPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="requestPhone"
                    value={requestPhone}
                    onChange={(e) => setRequestPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="requestPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    id="requestPassword"
                    value={requestPassword}
                    onChange={(e) => setRequestPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="requestConfirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="requestConfirmPassword"
                    value={requestConfirmPassword}
                    onChange={(e) => setRequestConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Re-enter your password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your account will be activated once approved by an administrator. You'll receive a notification when you can log in.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
