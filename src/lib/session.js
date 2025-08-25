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

// Set session with multiple storage fallbacks (for Capacitor compatibility)
export const setSession = (value, expiresInDays = 7) => {
  const sessionString = JSON.stringify(value);
  const encryptedSession = encryptData(sessionString);

  try {
    // Primary: Use cookies (works in browsers)
    Cookies.set(AUTH_SESSION_COOKIE, encryptedSession, {
      expires: expiresInDays,
      sameSite: 'Lax',
      secure: location.protocol === 'https:' || location.protocol === 'capacitor:',
    });
  } catch (e) {
    console.warn('Cookie storage failed:', e);
  }

  try {
    // Fallback: Use localStorage (works in Capacitor apps)
    localStorage.setItem(AUTH_SESSION_STORAGE, encryptedSession);
    // Store expiry time for localStorage cleanup
    const expiryTime = new Date().getTime() + (expiresInDays * 24 * 60 * 60 * 1000);
    localStorage.setItem(AUTH_SESSION_STORAGE + '_expiry', expiryTime.toString());
  } catch (e) {
    console.warn('localStorage storage failed:', e);
  }

  console.log('✅ Session stored successfully');
};

// Get session with multiple storage fallbacks
export const getSession = () => {
  try {
    // Try cookies first
    let encryptedSession = Cookies.get(AUTH_SESSION_COOKIE);
    let source = 'cookie';

    // If no cookie, try localStorage
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
      console.log('❌ No session found in any storage');
      return null;
    }

    const decryptedSession = decryptData(encryptedSession);
    const session = JSON.parse(decryptedSession);

    console.log(`✅ Session retrieved from ${source}`);

    // Re-sync storage (ensure both have the data)
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
  } catch (e) {
    console.warn('Cookie removal failed:', e);
  }

  try {
    localStorage.removeItem(AUTH_SESSION_STORAGE);
    localStorage.removeItem(AUTH_SESSION_STORAGE + '_expiry');
  } catch (e) {
    console.warn('localStorage removal failed:', e);
  }

  console.log('🗑️ Session removed from all storage');
};
