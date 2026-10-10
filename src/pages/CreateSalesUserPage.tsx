import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateSalesUserPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const createUser = async () => {
    setIsCreating(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'sales@powerwashjm.com',
        password: 'REMOVED_SEE_ADMIN',
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setMessage({
            type: 'success',
            text: 'User already exists! You can now log in with these credentials at /employee-login'
          });
        } else {
          throw error;
        }
      } else {
        setMessage({
          type: 'success',
          text: `User created successfully! You can now log in at /employee-login with email: sales@powerwashjm.com`
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({
        type: 'error',
        text: `Error: ${error instanceof Error ? error.message : 'Failed to create user'}`
      });
    } finally {
      setIsCreating(false);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Employee User</h1>
            <p className="text-gray-600">Set up the sales employee account</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              This will create the sales employee account with preset credentials.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <button
            onClick={createUser}
            disabled={isCreating}
            className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating User...' : 'Create User Account'}
          </button>

          <div className="mt-6 text-center">
            <a
              href="/employee-login/"
              className="text-blue-900 text-sm hover:underline"
            >
              Go to Employee Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
