// Demo authentication utilities for when Supabase is not available

export const initDemoCredentials = () => {
  // Always set up/update demo credentials to ensure correct password
  const demoUser = {
    email: 'sales@powerwashjm.com',
    password: 'REMOVED_SEE_ADMIN',
    firstName: 'Sales',
    lastName: 'Admin'
  };

  localStorage.setItem('demo_user', JSON.stringify(demoUser));
  console.log('Demo credentials initialized. Use sales@powerwashjm.com with password: REMOVED_SEE_ADMIN');
};

const getDemoCredentials = () => {
  const stored = localStorage.getItem('demo_user');
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};
