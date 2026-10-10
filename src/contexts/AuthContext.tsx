import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if remember me is enabled and if 24 hours have passed
        const rememberMeEnabled = localStorage.getItem('remember_me_enabled') === 'true';
        const loginTimestamp = localStorage.getItem('remember_me_timestamp');

        if (rememberMeEnabled && loginTimestamp) {
          const hoursSinceLogin = (Date.now() - parseInt(loginTimestamp)) / (1000 * 60 * 60);

          // If more than 24 hours have passed, sign out
          if (hoursSinceLogin >= 24) {
            console.log('24-hour session expired, signing out');
            await supabase.auth.signOut();
            localStorage.removeItem('remember_me_timestamp');
            localStorage.removeItem('remember_me_enabled');
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        const adminEmails = ['sales@powerwashjm.com', 'chrismasse30@gmail.com'];
        const adminStatus = currentUser?.email ? adminEmails.includes(currentUser.email.toLowerCase()) : false;
        console.log('Auth check:', { email: currentUser?.email, isAdmin: adminStatus });
        setUser(currentUser);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.warn('Supabase auth not available, checking demo mode');
        const demoSession = localStorage.getItem('demo_session');
        if (demoSession) {
          const session = JSON.parse(demoSession);
          const currentUser = session as User;
          const adminEmails = ['sales@powerwashjm.com', 'chrismasse30@gmail.com'];
          const adminStatus = currentUser?.email ? adminEmails.includes(currentUser.email.toLowerCase()) : false;
          console.log('Demo auth check:', { email: currentUser?.email, isAdmin: adminStatus });
          setUser(currentUser);
          setIsAdmin(adminStatus);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        (async () => {
          const currentUser = session?.user ?? null;
          const adminEmails = ['sales@powerwashjm.com', 'chrismasse30@gmail.com'];
          const adminStatus = currentUser?.email ? adminEmails.includes(currentUser.email.toLowerCase()) : false;
          console.log('Auth state changed:', { email: currentUser?.email, isAdmin: adminStatus });
          setUser(currentUser);
          setIsAdmin(adminStatus);
        })();
      });

      // Cleanup subscription when component unmounts
      return () => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing from auth changes:', error);
        }
      };
    } catch (error) {
      console.warn('Could not subscribe to auth changes:', error);
      // Return empty cleanup function if subscription failed
      return () => {};
    }
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    const adminEmails = ['sales@powerwashjm.com', 'chrismasse30@gmail.com'];
    const isAdminEmail = adminEmails.includes(email.toLowerCase());

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (!error) {
        // Store remember me preference and timestamp
        if (rememberMe) {
          const loginTimestamp = Date.now();
          localStorage.setItem('remember_me_timestamp', loginTimestamp.toString());
          localStorage.setItem('remember_me_enabled', 'true');
        } else {
          localStorage.removeItem('remember_me_timestamp');
          localStorage.removeItem('remember_me_enabled');
        }

        // Skip access request checks for admin
        if (!isAdminEmail) {
          // Check if user is active in access_requests table
          const { data: accessRequest } = await supabase
            .from('access_requests')
            .select('is_active, status')
            .eq('email', email)
            .maybeSingle();

          if (accessRequest && accessRequest.status === 'approved' && accessRequest.is_active === false) {
            await supabase.auth.signOut();
            return { error: new Error('Your account is not active. Please contact an administrator.') };
          }
        }

        return { error: null };
      }
      throw error;
    } catch (supabaseError) {
      console.warn('Supabase sign in failed, trying demo mode:', supabaseError);

      const checkUser = async (stored: any) => {
        if (stored && stored.email === email && stored.password === password) {
          // Skip access request checks for admin
          if (!isAdminEmail) {
            // Check if user is active in access requests
            try {
              const accessRequests = JSON.parse(localStorage.getItem('access_requests') || '[]');
              const userRequest = accessRequests.find((req: any) => req.email === email);

              if (userRequest) {
                if (userRequest.status !== 'approved') {
                  return { error: new Error('Your access request is pending approval.') };
                }
                if (userRequest.is_active === false) {
                  return { error: new Error('Your account is not active. Please contact an administrator.') };
                }
              }
            } catch (e) {
              console.warn('Error checking access request status:', e);
            }
          }

          const mockUser = {
            id: `demo-user-${Date.now()}`,
            email: email,
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
          } as User;
          localStorage.setItem('demo_session', JSON.stringify(mockUser));
          setUser(mockUser);
          const adminEmails = ['sales@powerwashjm.com', 'chrismasse30@gmail.com'];
          const adminStatus = adminEmails.includes(email);
          setIsAdmin(adminStatus);
          console.log('Demo sign in successful:', { email, isAdmin: adminStatus });
          return { success: true };
        }
        return { error: null };
      };

      try {
        const emailSpecificUser = localStorage.getItem(`demo_user_${email}`);
        if (emailSpecificUser) {
          const stored = JSON.parse(emailSpecificUser);
          const result = await checkUser(stored);
          if (result.success) {
            return { error: null };
          }
          if (result.error) {
            return { error: result.error };
          }
        }
      } catch (e) {
        console.warn('Error checking email-specific user:', e);
      }

      try {
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
          const stored = JSON.parse(demoUser);
          const result = await checkUser(stored);
          if (result.success) {
            return { error: null };
          }
          if (result.error) {
            return { error: result.error };
          }
        }
      } catch (e) {
        console.warn('Error checking demo user:', e);
      }

      console.error('No valid credentials found in localStorage for:', email);
      console.log('Available localStorage keys:', Object.keys(localStorage));
      return { error: new Error('Invalid email or password') };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase sign out failed, clearing demo session');
    }
    localStorage.removeItem('demo_session');
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
