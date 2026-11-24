import { useState, useEffect } from 'react';
import {
  loadVersioned,
  saveVersioned,
  SETTINGS_STORAGE_KEY,
} from '../utils/storage.js';

export const DEFAULT_SETTINGS = {
  institutionName: 'Apex Institute of Technology',
  departmentName: 'Computer Science & Engineering',
  className: 'B.Tech CSE',
  semester: 'Semester II',
  section: 'A',
  academicYear: '2025–26',
  teacherName: 'Prof. Ananya Sen',
  teacherEmail: 'ananya.sen@apex.edu',
  threshold: 75,
  lateRule: 'separate', // 'separate' | 'half' | 'present'
  allowEditing: true,
  requireReason: false,
  autoBackup: true,
  notifications: {
    submission: true,
    thresholdAlert: true,
    duplicateWarning: true,
  },
  columns: {
    rollNumber: true,
    className: true,
    session: true,
    recordedAt: true,
  },
};

/**
 * Custom Hook: useSettings
 *
 * Centralizes application settings, threshold configurations,
 * late-arrival policy, and editing access locks.
 */
export function useSettings(onToast = () => {}) {
  const [settings, setSettings] = useState(() => {
    return loadVersioned(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  });

  useEffect(() => {
    saveVersioned(SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
    onToast('Settings updated successfully.', 'success');
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveVersioned(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
    onToast('Settings reset to default values.', 'info');
  };

  return {
    settings,
    threshold: Number(settings.threshold) || 75,
    lateRule: settings.lateRule || 'separate',
    allowEditing: settings.allowEditing !== false,
    updateSettings,
    resetSettings,
    setSettings,
  };
}
