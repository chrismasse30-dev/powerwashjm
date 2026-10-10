import { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CreateEmployeePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const createEmployee = async () => {
    setStatus('loading');
    setMessage('');

    try {
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Attempting to create account...');

      const { data, error } = await supabase.auth.signUp({
        email: 'sales@powerwashjm.com',
        password: 'REMOVED_SEE_ADMIN',
        options: {
          emailRedirectTo: undefined,
        }
      });

      console.log('Response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setStatus('success');
          setMessage('Employee account already exists! You can log in now.');
        } else {
          setStatus('error');
          setMessage(`Error: ${error.message}\n\nPlease check browser console for details.`);
        }
      } else {
        setStatus('success');
        setMessage('Employee account created successfully! Email: sales@powerwashjm.com');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setStatus('error');
      setMessage(`Unexpected error: ${error.message || 'Failed to connect to authentication service'}\n\nCheck browser console for details.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Employee Account</h1>
            <p className="text-gray-600">One-time setup for employee access</p>
          </div>

          {status === 'idle' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This will create the sales employee account with preset credentials.
                </p>
              </div>

              <button
                onClick={createEmployee}
                className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                Create Account
              </button>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Creating account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-green-800 font-semibold mb-4">{message}</p>
              <a
                href="/employee-login/"
                className="inline-block bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                Go to Login
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <p className="text-red-800 font-semibold mb-4 whitespace-pre-line">{message}</p>
              <button
                onClick={createEmployee}
                className="bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
