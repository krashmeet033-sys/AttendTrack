/**
 * Centralized Storage Utility for AttendTrack
 *
 * Provides versioned localStorage persistence, safe schema validation,
 * automatic fallback on corruption, pre-destructive backups, and data migration.
 */

export const STORAGE_VERSION = 5;
export const DEMO_VERSION_KEY = 'attendtrack_dataset_v5';
export const RECORDS_STORAGE_KEY = 'attendtrack_records_v5';
export const STUDENTS_STORAGE_KEY = 'attendtrack_students_v5';
export const SESSIONS_STORAGE_KEY = 'attendtrack_sessions_v5';
export const ACTIVE_SESSION_STORAGE_KEY = 'attendtrack_active_session_v5';
export const SETTINGS_STORAGE_KEY = 'attendtrack_settings_v5';
export const AUDIT_STORAGE_KEY = 'attendtrack_audit_trail_v5';
export const THEME_STORAGE_KEY = 'attendtrack_theme_v5';
export const AUTO_BACKUP_KEY = 'attendtrack_auto_backup_v5';

/**
 * Loads a value from localStorage with version validation and error recovery.
 *
 * @template T
 * @param {string} key - localStorage key
 * @param {T} fallback - Default value if key does not exist or data is invalid
 * @returns {T}
 */
export function loadVersioned(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const version = window.localStorage.getItem(DEMO_VERSION_KEY);
    if (version !== String(STORAGE_VERSION)) {
      return fallback;
    }

    const item = window.localStorage.getItem(key);
    if (!item) return fallback;

    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return fallback;

    // Basic type matching to prevent structure mismatches
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'object' && !Array.isArray(fallback) && typeof parsed !== 'object') {
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.warn(`[AttendTrack Storage] Failed to load key "${key}", falling back to defaults.`, error);
    return fallback;
  }
}

/**
 * Safely saves data to localStorage.
 *
 * @param {string} key - localStorage key
 * @param {any} data - Data to serialize and store
 * @returns {boolean} True if successfully stored
 */
export function saveVersioned(key, data) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(DEMO_VERSION_KEY, String(STORAGE_VERSION));
    window.localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`[AttendTrack Storage] Failed to save key "${key}".`, error);
    return false;
  }
}

/**
 * Creates an automatic snapshot of critical application state before destructive operations.
 *
 * @param {Object} state - { students, records, sessions, settings, auditLogs }
 * @returns {boolean}
 */
export function createAutoBackup(state = {}) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const backupPayload = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      state: {
        students: state.students || [],
        records: state.records || [],
        sessions: state.sessions || [],
        settings: state.settings || {},
        auditLogs: state.auditLogs || [],
      },
    };
    window.localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backupPayload));
    return true;
  } catch (e) {
    console.error('[AttendTrack Storage] Failed to generate automatic backup.', e);
    return false;
  }
}

/**
 * Retrieves the most recent automatic backup snapshot.
 *
 * @returns {Object|null}
 */
export function getLatestAutoBackup() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTO_BACKUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Clears all AttendTrack localStorage keys safely.
 */
export function clearAllStoredData() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const keys = [
    DEMO_VERSION_KEY,
    RECORDS_STORAGE_KEY,
    STUDENTS_STORAGE_KEY,
    SESSIONS_STORAGE_KEY,
    ACTIVE_SESSION_STORAGE_KEY,
    SETTINGS_STORAGE_KEY,
    AUDIT_STORAGE_KEY,
    THEME_STORAGE_KEY,
  ];

  keys.forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch (e) {}
  });
}
