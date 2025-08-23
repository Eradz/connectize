// Test authentication utility
// This is a temporary file for testing the subscription dashboard with your credentials

import { setSession } from '../lib/session';
import { loginUser } from '../api-services/authentication';

// Test credentials
const TEST_CREDENTIALS = {
  email: "info@connectize.co",
  password: "Access2024"
};

export const loginForTesting = async () => {
  try {
    console.log('🔐 Attempting authentication with info@connectize.co...');
    
    const success = await loginUser({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
      resetForm: () => {}
    });

    if (success) {
      console.log('✅ Test authentication successful');
      return true;
    } else {
      console.error('❌ Test authentication failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Test authentication error:', error);
    return false;
  }
};

export const isTestAuthActive = () => {
  try {
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    return session?.user?.email === 'info@connectize.co';
  } catch {
    return false;
  }
};
