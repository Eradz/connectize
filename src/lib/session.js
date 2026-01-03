import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

export const AUTH_SESSION_COOKIE = "connectize_spicy_auth_cookie";
export const AUTH_SESSION_STORAGE = "connectize_auth_session";

const ENCRYPTION_KEY =
  "9803037e608561b4485fa127ed2c0788578605492c15942944bf34868adf2c4f";

// Encrypt the data using AES encryption
const encryptData = (data) =>
  CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();

// Decrypt the data using AES decryption
const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Set session with Capacitor compatibility (no expiration)
export const setSession = (value, expiresInDays = 730) => { // 2 years - essentially permanent
  const sessionString = JSON.stringify(value);
  const encryptedSession = encryptData(sessionString);

  try {
    // Use cookies for web browsers and HTTPS/Capacitor environments
    Cookies.set(AUTH_SESSION_COOKIE, encryptedSession, {
      expires: expiresInDays,
      sameSite: 'Lax',
      secure: location.protocol === 'https:' || location.protocol === 'capacitor:',
    });
    
    // Also store in localStorage as fallback for Capacitor apps (no expiration check)
    localStorage.setItem(AUTH_SESSION_STORAGE, encryptedSession);
    // Store a very far future expiry time (essentially permanent)
    const expiryTime = new Date().getTime() + (expiresInDays * 24 * 60 * 60 * 1000);
    localStorage.setItem(AUTH_SESSION_STORAGE + '_expiry', expiryTime.toString());
    
    console.log('✅ Session stored successfully (long-term)');
  } catch (e) {
    console.error('Session storage failed:', e);
  }
};

// Get session with Capacitor compatibility
export const getSession = () => {
  try {
    // Try cookies first
    let encryptedSession = Cookies.get(AUTH_SESSION_COOKIE);
    let source = 'cookie';

    // If no cookie, try localStorage (important for Capacitor apps)
    if (!encryptedSession) {
      encryptedSession = localStorage.getItem(AUTH_SESSION_STORAGE);
      source = 'localStorage';

      // Check if localStorage session is expired
      if (encryptedSession) {
        const expiryTime = localStorage.getItem(AUTH_SESSION_STORAGE + '_expiry');
        if (expiryTime && new Date().getTime() > parseInt(expiryTime)) {
          console.log('📅 localStorage session expired');
          localStorage.removeItem(AUTH_SESSION_STORAGE);
          localStorage.removeItem(AUTH_SESSION_STORAGE + '_expiry');
          return null;
        }
      }
    }

    if (!encryptedSession) {
      // Normal case for unauthenticated users - no logging needed
      return null;
    }

    const decryptedSession = decryptData(encryptedSession);
    const session = JSON.parse(decryptedSession);
    
    console.log('[getSession] Retrieved from:', source, 'hasTokens:', !!session?.tokens, 'hasAccess:', !!session?.tokens?.access);

    // Re-sync storage for cross-platform compatibility
    if (source === 'localStorage' && session) {
      setSession(session);
    }

    return session;
  } catch (error) {
    console.error("Error reading or decrypting session:", error);
    // Clean up corrupted data
    removeSession();
    return null;
  }
};

// Remove session from all storage locations
export const removeSession = () => {
  try {
    Cookies.remove(AUTH_SESSION_COOKIE);
    localStorage.removeItem(AUTH_SESSION_STORAGE);
    localStorage.removeItem(AUTH_SESSION_STORAGE + '_expiry');
    console.log('🗑️ Session removed from all storage');
  } catch (e) {
    console.error('Session removal failed:', e);
  }
};
