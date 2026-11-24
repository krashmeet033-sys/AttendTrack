import { useState, useEffect, useMemo } from 'react';
import {
  loadVersioned,
  saveVersioned,
  SESSIONS_STORAGE_KEY,
  ACTIVE_SESSION_STORAGE_KEY,
} from '../utils/storage.js';
import { validateSession } from '../utils/validation.js';

export const DEFAULT_SESSIONS = [
  {
    id: 'sess_1',
    name: 'Lecture Session 24 — React Hooks & Forms',
    subject: 'React JS & Web Technologies',
    type: 'Lecture',
    faculty: 'Prof. A. Sharma',
    room: 'Lab 402',
    date: '2026-11-21',
    className: 'B.Tech CSE',
    description: 'Controlled input components, useState hooks, form validations, and submission handlers.',
    startTime: '10:00',
    endTime: '11:00',
    status: 'active',
    isArchived: false,
    createdAt: '2026-11-21T09:00:00.000Z',
  },
  {
    id: 'sess_2',
    name: 'Lecture Session 23 — Component State & Props',
    subject: 'Data Structures & Algorithms (DSA)',
    type: 'Practical / Lab',
    faculty: 'Dr. R. Ramanujan',
    room: 'LH-101',
    date: '2026-11-20',
    className: 'B.Tech CSE',
    description: 'Component architecture, unidirectional data flow, props passing, and state lifting.',
    startTime: '11:15',
    endTime: '12:15',
    status: 'completed',
    isArchived: false,
    createdAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: 'sess_3',
    name: 'Lecture Session 22 — JSX & Component Architecture',
    subject: 'Database Management Systems (DBMS)',
    type: 'Lecture',
    faculty: 'Prof. S. Mukhopadhyay',
    room: 'LH-204',
    date: '2026-11-19',
    className: 'B.Tech CSE',
    description: 'JSX syntax rules, React fragments, conditional rendering, and dynamic list mapping.',
    startTime: '09:00',
    endTime: '10:00',
    status: 'completed',
    isArchived: false,
    createdAt: '2026-11-19T09:00:00.000Z',
  },
  {
    id: 'sess_5',
    name: 'Lecture Session 21 — Virtual DOM & Reconciliation',
    subject: 'React JS & Web Technologies',
    type: 'Lecture',
    faculty: 'Prof. A. Sharma',
    room: 'LH-102',
    date: '2026-11-18',
    className: 'B.Tech CSE',
    description: 'Virtual DOM diffing algorithm, key prop optimization, and fiber tree updates.',
    startTime: '10:00',
    endTime: '11:00',
    status: 'completed',
    isArchived: false,
    createdAt: '2026-11-18T09:00:00.000Z',
  },
  {
    id: 'sess_6',
    name: 'Lecture Session 19 — Advanced JavaScript ES6+',
    subject: 'Web Development Fundamentals',
    type: 'Lecture',
    faculty: 'Prof. A. Sharma',
    room: 'LH-102',
    date: '2026-11-14',
    className: 'B.Tech CSE',
    description: 'Destructuring, async/await, closures, and modular JS code patterns.',
    startTime: '14:00',
    endTime: '15:00',
    status: 'completed',
    isArchived: false,
    createdAt: '2026-11-14T09:00:00.000Z',
  },
  {
    id: 'sess_7',
    name: 'Lecture Session 18 — Asynchronous Programming & Promises',
    subject: 'Data Structures & Algorithms (DSA)',
    type: 'Practical / Lab',
    faculty: 'Dr. R. Ramanujan',
    room: 'Lab 402',
    date: '2026-11-12',
    className: 'B.Tech CSE',
    description: 'Event loop, microtasks vs macrotasks, and Promise chaining.',
    startTime: '11:15',
    endTime: '12:15',
    status: 'completed',
    isArchived: false,
    createdAt: '2026-11-12T09:00:00.000Z',
  },
  {
    id: 'sess_8',
    name: 'Lecture Session 17 — DOM Manipulation & Events',
    subject: 'Web Development Fundamentals',
    type: 'Lecture',
    faculty: 'Prof. A. Sharma',
    room: 'LH-101',
    date: '2026-11-11',
    className: 'B.Tech CSE',
    description: 'Event bubbling, capturing, delegation, and synthetic events in React.',
    startTime: '09:00',
    endTime: '10:00',
    status: 'completed',
    isArchived: false,
    createdAt: '2026-11-11T09:00:00.000Z',
  },
  {
    id: 'sess_9',
    name: 'Lecture Session 16 — Web Architecture & Protocols',
    subject: 'Computer Networks',
    type: 'Lecture',
    faculty: 'Dr. V. Malhotra',
    room: 'LH-201',
    date: '2026-11-07',
    className: 'B.Tech CSE',
    description: 'Client-server model, REST APIs, HTTP methods, headers and status codes.',
    startTime: '10:00',
    endTime: '11:00',
    status: 'completed',
    isArchived: false,
    createdAt: '2026-11-07T09:00:00.000Z',
  },
  {
    id: 'sess_10',
    name: 'Lecture Session 15 — HTML5, CSS3 & Responsive Design',
    subject: 'Web Development Fundamentals',
    type: 'Lecture',
    faculty: 'Prof. A. Sharma',
    room: 'Lab 401',
    date: '2026-11-04',
    className: 'B.Tech CSE',
    description: 'CSS Grid, Flexbox layouts, responsive media queries, and design tokens.',
    startTime: '11:00',
    endTime: '12:00',
    status: 'completed',
    isArchived: false,
    createdAt: '2026-11-04T09:00:00.000Z',
  },
  {
    id: 'sess_4',
    name: 'Tutorial Session 18 — Engineering Mathematics II',
    subject: 'Engineering Mathematics II',
    type: 'Tutorial',
    faculty: 'Dr. P. Sen',
    room: 'Seminar Hall 2',
    date: '2026-11-23',
    className: 'B.Tech CSE',
    description: 'Fourier series convergence, differential equations, and calculus problem solving.',
    startTime: '14:00',
    endTime: '15:00',
    status: 'upcoming',
    isArchived: false,
    createdAt: '2026-11-23T09:00:00.000Z',
  },
];

/**
 * Custom Hook: useSessions
 *
 * Centralizes academic lecture sessions, active session selection,
 * date validations, and session status transitions.
 */
export function useSessions({ onToast = () => {} } = {}) {
  const [sessions, setSessions] = useState(() => {
    return loadVersioned(SESSIONS_STORAGE_KEY, DEFAULT_SESSIONS);
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const saved = loadVersioned(ACTIVE_SESSION_STORAGE_KEY, 'sess_1');
    return typeof saved === 'string' ? saved : 'sess_1';
  });

  useEffect(() => {
    saveVersioned(SESSIONS_STORAGE_KEY, sessions);
  }, [sessions]);

  useEffect(() => {
    saveVersioned(ACTIVE_SESSION_STORAGE_KEY, currentSessionId);
  }, [currentSessionId]);

  const activeSession = useMemo(() => {
    const found = sessions.find((s) => s.id === currentSessionId);
    return found || sessions[0] || null;
  }, [sessions, currentSessionId]);

  const handleCreateSession = (sessionData) => {
    const validation = validateSession(sessionData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      onToast(firstError, 'error');
      return { success: false, errors: validation.errors };
    }

    const newSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: sessionData.name.trim(),
      subject: sessionData.subject || 'React JS & Web Technologies',
      type: sessionData.type || 'Lecture',
      faculty: sessionData.faculty || 'Prof. A. Sharma',
      room: sessionData.room || 'Lab 402',
      date: sessionData.date,
      startTime: sessionData.startTime || '10:00',
      endTime: sessionData.endTime || '11:00',
      description: sessionData.description || '',
      status: 'upcoming',
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    onToast(`Session "${newSession.name}" created and set as active.`, 'success');
    return { success: true, session: newSession };
  };

  const handleUpdateSession = (updatedSession) => {
    const validation = validateSession(updatedSession);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      onToast(firstError, 'error');
      return { success: false, errors: validation.errors };
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? { ...s, ...updatedSession } : s))
    );
    onToast(`Updated session details for "${updatedSession.name}".`, 'success');
    return { success: true };
  };

  const handleSwitchSession = (sessionId) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setCurrentSessionId(sessionId);
      onToast(`Active session switched to: ${target.name}`, 'info');
    }
  };

  const handleArchiveSession = (sessionId) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isArchived: !s.isArchived } : s))
    );
  };

  const handleDeleteSession = (sessionId) => {
    const target = sessions.find((s) => s.id === sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) setCurrentSessionId(remaining[0].id);
    }
    onToast(`Deleted session "${target ? target.name : sessionId}".`, 'info');
  };

  const resetSessions = () => {
    setSessions(DEFAULT_SESSIONS);
    setCurrentSessionId('sess_1');
    saveVersioned(SESSIONS_STORAGE_KEY, DEFAULT_SESSIONS);
    saveVersioned(ACTIVE_SESSION_STORAGE_KEY, 'sess_1');
  };

  return {
    sessions,
    currentSessionId,
    activeSession,
    handleCreateSession,
    handleUpdateSession,
    handleSwitchSession,
    handleArchiveSession,
    handleDeleteSession,
    resetSessions,
    setSessions,
    setCurrentSessionId,
  };
}
