import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

export const AUTH_SESSION_COOKIE = "connectize_spicy_auth_cookie";
export const AUTH_SESSION_STORAGE = "connectize_auth_session";
const SESSION_VERSION = 2;
const DEFAULT_SESSION_TTL_DAYS = 30;
const LEGACY_EXPIRY_KEY = `${AUTH_SESSION_STORAGE}_expiry`;

const LEGACY_ENCRYPTION_KEY =
  "9803037e608561b4485fa127ed2c0788578605492c15942944bf34868adf2c4f";

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const normalizeSession = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const session = { ...value };
  const normalizedUser =
    session.user ||
    (session.id || session.email
      ? {
          ...(session.id ? { id: session.id } : {}),
          ...(session.email ? { email: session.email } : {}),
        }
      : null);

  if (normalizedUser) {
    session.user = normalizedUser;
  }

  return session;
};

const clearLegacySession = (storage = getStorage()) => {
  try {
    Cookies.remove(AUTH_SESSION_COOKIE);
    storage?.removeItem(LEGACY_EXPIRY_KEY);
  } catch {
    // Ignore best-effort cleanup failures.
  }
};

const clearStoredSession = () => {
  const storage = getStorage();
  try {
    storage?.removeItem(AUTH_SESSION_STORAGE);
    clearLegacySession(storage);
  } catch {
    // Ignore best-effort cleanup failures.
  }
};

const persistSession = (session, expiresInDays) => {
  const storage = getStorage();
  if (!storage || !session) {
    return;
  }

  const expiresAt =
    Date.now() + Math.max(expiresInDays, 1) * 24 * 60 * 60 * 1000;

  storage.setItem(
    AUTH_SESSION_STORAGE,
    JSON.stringify({
      version: SESSION_VERSION,
      expiresAt,
      data: session,
    })
  );
  clearLegacySession(storage);
};

const readStoredSession = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(AUTH_SESSION_STORAGE);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed?.version === SESSION_VERSION && parsed?.data) {
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        clearStoredSession();
        return null;
      }

      return normalizeSession(parsed.data);
    }

    return normalizeSession(parsed);
  } catch {
    return null;
  }
};

const readLegacySession = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  let encryptedSession = Cookies.get(AUTH_SESSION_COOKIE);

  if (!encryptedSession) {
    encryptedSession = storage.getItem(AUTH_SESSION_STORAGE);
    const expiryTime = storage.getItem(LEGACY_EXPIRY_KEY);
    if (expiryTime && Date.now() > Number.parseInt(expiryTime, 10)) {
      clearStoredSession();
      return null;
    }
  }

  if (!encryptedSession) {
    return null;
  }

  try {
    const decryptedSession = CryptoJS.AES.decrypt(
      encryptedSession,
      LEGACY_ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);
    if (!decryptedSession) {
      return null;
    }

    return normalizeSession(JSON.parse(decryptedSession));
  } catch {
    return null;
  }
};

export const setSession = (value, expiresInDays = DEFAULT_SESSION_TTL_DAYS) => {
  const session = normalizeSession(value);
  if (!session) {
    clearStoredSession();
    return;
  }

  try {
    persistSession(session, expiresInDays);
  } catch {
    clearStoredSession();
  }
};

export const getSession = () => {
  const storedSession = readStoredSession();
  if (storedSession) {
    return storedSession;
  }

  const legacySession = readLegacySession();
  if (legacySession) {
    setSession(legacySession);
    return legacySession;
  }

  return null;
};

export const removeSession = () => {
  clearStoredSession();
};
