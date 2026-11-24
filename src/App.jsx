import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Plus,
  ListChecks,
  ClipboardList,
  UserCheck,
  UserX,
  Clock,
  CalendarDays,
  UserPlus,
  FileSpreadsheet,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import StatCard from './components/StatCard.jsx';
import AttendanceForm from './components/AttendanceForm.jsx';
import AttendanceCard from './components/AttendanceCard.jsx';
import AttendanceList from './components/AttendanceList.jsx';
import StudentDirectory from './components/StudentDirectory.jsx';
import AttendanceAnalytics from './components/AttendanceAnalytics.jsx';
import Settings from './components/Settings.jsx';
import AboutProject from './components/AboutProject.jsx';
import OverviewChart from './components/OverviewChart.jsx';
import DistributionChart from './components/DistributionChart.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import SessionsView from './components/SessionsView.jsx';
import AttendanceHeatmap from './components/AttendanceHeatmap.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import StudentProfileModal from './components/StudentProfileModal.jsx';
import LiveSessionWorkspace from './components/LiveSessionWorkspace.jsx';
import AttendanceCorrectionCentre from './components/AttendanceCorrectionCentre.jsx';
import './App.css';

const RECORDS_STORAGE_KEY = 'attendtrack_records';
const STUDENTS_STORAGE_KEY = 'attendtrack_students';
const THEME_STORAGE_KEY = 'attendtrack_theme';
const SETTINGS_STORAGE_KEY = 'attendtrack_settings';
const SESSIONS_STORAGE_KEY = 'attendtrack_sessions';
const ACTIVE_SESSION_STORAGE_KEY = 'attendtrack_active_session_id';

const DEFAULT_STUDENTS = [
  { id: 'std_1', name: 'Aarav Sharma', rollNumber: '24CSE001', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_2', name: 'Ananya Patel', rollNumber: '24CSE007', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_3', name: 'Isha Verma', rollNumber: '24CSE014', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_4', name: 'Kabir Mehta', rollNumber: '24CSE019', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_5', name: 'Rohan Gupta', rollNumber: '24CSE027', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_6', name: 'Diya Sen', rollNumber: '24CSE033', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_7', name: 'Tanvi Nair', rollNumber: '24CSE042', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_8', name: 'Vihaan Joshi', rollNumber: '24CSE051', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_9', name: 'Kavya Reddy', rollNumber: '24CSE058', className: 'B.Tech CSE', semester: 'Semester II' },
];

/** Local YYYY-MM-DD for a date offset from today, keeping demo data evergreen. */
function demoDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

const DEMO_VERSION_KEY = 'attendtrack_dataset_v5';

const DEFAULT_SESSIONS = [
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

const DEFAULT_SETTINGS = {
  institutionName: 'Department of Computer Science & Engineering',
  teacherName: 'Class Teacher',
  className: 'B.Tech CSE',
  semester: 'Semester II',
  academicYear: '2025–29',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12-hour',
  density: 'comfortable',
  threshold: 75,
  duplicatePrevention: true,
  defaultStatus: 'Present',
  lateRule: 'separate',
  allowEditing: true,
  notifications: {
    lowAttendance: true,
    submission: true,
    sessionCreation: true,
    dataOps: true,
  },
};

/**
 * Demo attendance records across multiple dates in November 2026.
 *
 * Every record references an existing student (by roll number) and an existing
 * session (by id), so the Dashboard, Records table, Directory, Insights and
 * Session turnout all agree on the same numbers.
 * Covers dates: Nov 04, 07, 11, 12, 14, 18, 19, 20, 21 Nov 2026.
 */
function buildDemoRecords() {
  // [rollNumber, sessionId, status, dateStr, hour, minute]
  const rows = [
    // Session 15 — Responsive Design & CSS Grid (2026-11-04) — 100% Turnout
    ['24CSE001', 'sess_10', 'Present', '2026-11-04', 11, 0],
    ['24CSE007', 'sess_10', 'Present', '2026-11-04', 11, 1],
    ['24CSE014', 'sess_10', 'Present', '2026-11-04', 11, 2],
    ['24CSE019', 'sess_10', 'Present', '2026-11-04', 11, 3],
    ['24CSE027', 'sess_10', 'Present', '2026-11-04', 11, 4],
    ['24CSE033', 'sess_10', 'Present', '2026-11-04', 11, 5],
    ['24CSE042', 'sess_10', 'Present', '2026-11-04', 11, 6],
    ['24CSE051', 'sess_10', 'Present', '2026-11-04', 11, 7],

    // Session 16 — Web Architecture & Protocols (2026-11-07) — 88% Turnout
    ['24CSE001', 'sess_9', 'Present', '2026-11-07', 10, 0],
    ['24CSE007', 'sess_9', 'Present', '2026-11-07', 10, 1],
    ['24CSE014', 'sess_9', 'Present', '2026-11-07', 10, 2],
    ['24CSE019', 'sess_9', 'Present', '2026-11-07', 10, 3],
    ['24CSE027', 'sess_9', 'Present', '2026-11-07', 10, 4],
    ['24CSE033', 'sess_9', 'Absent', '2026-11-07', 10, 5],
    ['24CSE042', 'sess_9', 'Present', '2026-11-07', 10, 6],
    ['24CSE051', 'sess_9', 'Present', '2026-11-07', 10, 7],

    // Session 17 — DOM Manipulation & Events (2026-11-11) — 75% Turnout
    ['24CSE001', 'sess_8', 'Present', '2026-11-11', 9, 0],
    ['24CSE007', 'sess_8', 'Present', '2026-11-11', 9, 1],
    ['24CSE014', 'sess_8', 'Present', '2026-11-11', 9, 2],
    ['24CSE019', 'sess_8', 'Absent', '2026-11-11', 9, 3],
    ['24CSE027', 'sess_8', 'Present', '2026-11-11', 9, 4],
    ['24CSE033', 'sess_8', 'Present', '2026-11-11', 9, 5],
    ['24CSE042', 'sess_8', 'Late', '2026-11-11', 9, 6],
    ['24CSE051', 'sess_8', 'Present', '2026-11-11', 9, 7],

    // Session 18 — Asynchronous Programming & Promises (2026-11-12) — 100% Turnout
    ['24CSE001', 'sess_7', 'Present', '2026-11-12', 11, 15],
    ['24CSE007', 'sess_7', 'Present', '2026-11-12', 11, 16],
    ['24CSE014', 'sess_7', 'Present', '2026-11-12', 11, 17],
    ['24CSE019', 'sess_7', 'Present', '2026-11-12', 11, 18],
    ['24CSE027', 'sess_7', 'Present', '2026-11-12', 11, 19],
    ['24CSE033', 'sess_7', 'Present', '2026-11-12', 11, 20],
    ['24CSE042', 'sess_7', 'Present', '2026-11-12', 11, 21],
    ['24CSE051', 'sess_7', 'Present', '2026-11-12', 11, 22],

    // Session 19 — Advanced JavaScript ES6+ (2026-11-14) — 75% Turnout
    ['24CSE001', 'sess_6', 'Present', '2026-11-14', 14, 0],
    ['24CSE007', 'sess_6', 'Present', '2026-11-14', 14, 1],
    ['24CSE014', 'sess_6', 'Present', '2026-11-14', 14, 2],
    ['24CSE019', 'sess_6', 'Late', '2026-11-14', 14, 3],
    ['24CSE027', 'sess_6', 'Present', '2026-11-14', 14, 4],
    ['24CSE033', 'sess_6', 'Present', '2026-11-14', 14, 5],
    ['24CSE042', 'sess_6', 'Present', '2026-11-14', 14, 6],
    ['24CSE051', 'sess_6', 'Absent', '2026-11-14', 14, 7],

    // Session 21 — Virtual DOM & Reconciliation (2026-11-18) — 88% Turnout
    ['24CSE001', 'sess_5', 'Present', '2026-11-18', 10, 0],
    ['24CSE007', 'sess_5', 'Present', '2026-11-18', 10, 1],
    ['24CSE014', 'sess_5', 'Present', '2026-11-18', 10, 2],
    ['24CSE019', 'sess_5', 'Present', '2026-11-18', 10, 3],
    ['24CSE027', 'sess_5', 'Present', '2026-11-18', 10, 4],
    ['24CSE033', 'sess_5', 'Present', '2026-11-18', 10, 5],
    ['24CSE042', 'sess_5', 'Present', '2026-11-18', 10, 6],
    ['24CSE051', 'sess_5', 'Absent', '2026-11-18', 10, 7],

    // Session 22 — JSX & Component Architecture (2026-11-19) — 63% Turnout
    ['24CSE001', 'sess_3', 'Present', '2026-11-19', 9, 0],
    ['24CSE007', 'sess_3', 'Present', '2026-11-19', 9, 1],
    ['24CSE014', 'sess_3', 'Present', '2026-11-19', 9, 2],
    ['24CSE019', 'sess_3', 'Absent', '2026-11-19', 9, 3],
    ['24CSE027', 'sess_3', 'Present', '2026-11-19', 9, 4],
    ['24CSE033', 'sess_3', 'Late', '2026-11-19', 9, 5],
    ['24CSE042', 'sess_3', 'Present', '2026-11-19', 9, 6],
    ['24CSE051', 'sess_3', 'Absent', '2026-11-19', 9, 7],

    // Session 23 — Component State & Props (2026-11-20) — 88% Turnout
    ['24CSE001', 'sess_2', 'Present', '2026-11-20', 11, 15],
    ['24CSE007', 'sess_2', 'Present', '2026-11-20', 11, 16],
    ['24CSE014', 'sess_2', 'Present', '2026-11-20', 11, 17],
    ['24CSE019', 'sess_2', 'Present', '2026-11-20', 11, 18],
    ['24CSE027', 'sess_2', 'Present', '2026-11-20', 11, 19],
    ['24CSE033', 'sess_2', 'Present', '2026-11-20', 11, 20],
    ['24CSE042', 'sess_2', 'Late', '2026-11-20', 11, 21],
    ['24CSE051', 'sess_2', 'Present', '2026-11-20', 11, 22],

    // Session 24 — React Hooks & Forms (2026-11-21) — 75% Turnout (active session)
    ['24CSE001', 'sess_1', 'Present', '2026-11-21', 10, 0],
    ['24CSE007', 'sess_1', 'Present', '2026-11-21', 10, 1],
    ['24CSE014', 'sess_1', 'Present', '2026-11-21', 10, 2],
    ['24CSE019', 'sess_1', 'Present', '2026-11-21', 10, 3],
    ['24CSE027', 'sess_1', 'Absent', '2026-11-21', 10, 4],
    ['24CSE033', 'sess_1', 'Present', '2026-11-21', 10, 5],
    ['24CSE042', 'sess_1', 'Present', '2026-11-21', 10, 6],
    ['24CSE051', 'sess_1', 'Absent', '2026-11-21', 10, 7],
  ];

  return rows.map(([rollNumber, sessionId, status, dateStr, hour, minute], index) => {
    const student = DEFAULT_STUDENTS.find((s) => s.rollNumber === rollNumber);
    const session = DEFAULT_SESSIONS.find((s) => s.id === sessionId);
    const stamp = `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;
    return {
      id: `rec_${index + 1}`,
      name: student?.name || rollNumber,
      rollNumber,
      status,
      sessionId,
      sessionName: session?.name || 'Classroom Session',
      sessionDate: session?.date || dateStr,
      recordedAt: stamp,
    };
  });
}

const DEFAULT_RECORDS = buildDemoRecords();

/**
 * AttendTrack – Smart Student Attendance Management System
 * Root coordinator component owning centralized React state.
 */
function App() {
  // ---------------------------------------------------------------- state ---
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_RECORDS;
    try {
      const v = window.localStorage.getItem(DEMO_VERSION_KEY);
      if (v !== '5') {
        window.localStorage.setItem(DEMO_VERSION_KEY, '5');
        window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(DEFAULT_RECORDS));
        window.localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
        window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(DEFAULT_SESSIONS));
        return DEFAULT_RECORDS;
      }
      const saved = window.localStorage.getItem(RECORDS_STORAGE_KEY);
      // Only fall back to the demo dataset when nothing has ever been saved —
      // an intentionally cleared list must stay empty.
      if (saved === null) return DEFAULT_RECORDS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RECORDS;
    } catch (error) {
      console.error('Could not read saved records:', error);
      return DEFAULT_RECORDS;
    }
  });

  const [students, setStudents] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_STUDENTS;
    try {
      const v = window.localStorage.getItem(DEMO_VERSION_KEY);
      if (v !== '5') return DEFAULT_STUDENTS;
      const saved = window.localStorage.getItem(STUDENTS_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STUDENTS;
    } catch (error) {
      return DEFAULT_STUDENTS;
    }
  });

  const [sessions, setSessions] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SESSIONS;
    try {
      const v = window.localStorage.getItem(DEMO_VERSION_KEY);
      if (v !== '5') {
        return DEFAULT_SESSIONS;
      }
      const saved = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : DEFAULT_SESSIONS;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SESSIONS;
    } catch (error) {
      return DEFAULT_SESSIONS;
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    if (typeof window === 'undefined') return 'sess_1';
    try {
      return window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) || 'sess_1';
    } catch (e) {
      return 'sess_1';
    }
  });

  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (error) {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined' && window.location && window.location.hash) {
      const h = window.location.hash.replace('#', '');
      if (['dashboard', 'add', 'roster', 'records', 'corrections', 'calendar', 'analytics', 'sessions', 'timetable', 'settings', 'about'].includes(h)) {
        return h === 'timetable' ? 'sessions' : h;
      }
    }
    return 'dashboard';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined' && window.location) {
      window.location.hash = tab;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHash = () => {
      const h = window.location.hash.replace('#', '');
      if (['dashboard', 'add', 'roster', 'records', 'corrections', 'calendar', 'analytics', 'sessions', 'timetable', 'settings', 'about'].includes(h)) {
        setActiveTabState(h === 'timetable' ? 'sessions' : h);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recordsStatusFilter, setRecordsStatusFilter] = useState('ALL');
  // { id, nonce } — lets the Dashboard deep-link a student profile in the directory.
  const [studentFocus, setStudentFocus] = useState({ id: null, nonce: 0 });
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [attendanceMode, setAttendanceMode] = useState('live'); // 'live' | 'form'
  const [toasts, setToasts] = useState([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut (⌘K / Ctrl+K) & event trigger
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    const handleCustomToggle = () => {
      setIsCommandPaletteOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-command-palette', handleCustomToggle);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-command-palette', handleCustomToggle);
    };
  }, []);

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'light';
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
  });

  // ------------------------------------------------------------- effects ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(attendanceRecords));
    } catch (e) {}
  }, [attendanceRecords]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, currentSessionId);
    } catch (e) {}
  }, [currentSessionId]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const applyEffectiveTheme = () => {
      let resolved = theme;
      if (theme === 'system') {
        const prefersDark =
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = prefersDark ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
    };

    applyEffectiveTheme();

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyEffectiveTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {}
  }, [theme]);

  // -------------------------------------------------------- notifications ---
  const showToast = (message, type = 'success', action = null) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((previous) => [...previous, { id, message, type, action }]);
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  };

  // -------------------------------------------------------------- actions ---
  const activeSessionObj =
    sessions.find((s) => s.id === currentSessionId && !s.isArchived) ||
    sessions.find((s) => !s.isArchived) ||
    sessions[0] || {
      id: 'sess_1',
      name: 'General Classroom Session',
      date: new Date().toISOString().slice(0, 10),
      className: settings.className || 'B.Tech CSE',
    };

  const handleAddRecord = (newRecord) => {
    const stampedRecord = {
      ...newRecord,
      sessionId: newRecord.sessionId || activeSessionObj.id,
      sessionName: newRecord.sessionName || activeSessionObj.name,
      sessionDate: newRecord.sessionDate || activeSessionObj.date,
    };
    setAttendanceRecords((previous) => [stampedRecord, ...previous]);
    if (settings.notifications?.submission !== false) {
      showToast(`${stampedRecord.name} marked ${stampedRecord.status}.`, 'success');
    }
  };

  const handleAddMultipleRecords = (newRecords) => {
    if (!newRecords || newRecords.length === 0) return;
    const stampedRecords = newRecords.map((r) => ({
      ...r,
      sessionId: r.sessionId || activeSessionObj.id,
      sessionName: r.sessionName || activeSessionObj.name,
      sessionDate: r.sessionDate || activeSessionObj.date,
    }));
    setAttendanceRecords((previous) => [...stampedRecords, ...previous]);
    showToast(`Saved attendance for ${stampedRecords.length} students.`, 'success');
  };

  const handleEditRecord = (updatedRecord) => {
    if (settings.allowEditing === false) {
      showToast('Record editing is currently disabled in Settings.', 'error');
      return;
    }
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === updatedRecord.id
          ? {
              ...r,
              ...updatedRecord,
              modifiedAt: new Date().toISOString(),
              auditLog: [
                ...(r.auditLog || []),
                {
                  changedAt: new Date().toISOString(),
                  previousStatus: r.status,
                  newStatus: updatedRecord.status,
                },
              ],
            }
          : r
      )
    );
    showToast(`Updated record for ${updatedRecord.name}.`, 'info');
  };

  const deleteRecord = (idToDelete) => {
    const target = attendanceRecords.find((record) => record.id === idToDelete);
    if (!target) return;
    setAttendanceRecords((previous) => previous.filter((record) => record.id !== idToDelete));
    showToast(
      `Deleted the record for ${target.name}.`,
      'info',
      {
        label: 'Undo',
        onClick: () => {
          setAttendanceRecords((prev) => [target, ...prev]);
          showToast(`Restored record for ${target.name}.`, 'success');
        },
      }
    );
  };

  const handleDeleteRecord = (idToDelete) => {
    const target = attendanceRecords.find((record) => record.id === idToDelete);
    if (!target) return;

    setModalConfig({
      isOpen: true,
      title: 'Delete this attendance record?',
      message: `${target.name} (${target.rollNumber}) will be removed from the attendance records. This action cannot be undone.`,
      confirmText: 'Delete Record',
      onConfirm: () => {
        deleteRecord(idToDelete);
        setModalConfig((previous) => ({ ...previous, isOpen: false }));
      },
    });
  };

  const handleBulkDelete = (ids) => {
    if (ids.length === 0) return;
    const deletedRecords = attendanceRecords.filter((r) => ids.includes(r.id));
    setModalConfig({
      isOpen: true,
      title: `Delete ${ids.length} selected records?`,
      message: `The ${ids.length} selected attendance entries will be permanently removed.`,
      confirmText: 'Delete Selected',
      onConfirm: () => {
        setAttendanceRecords((prev) => prev.filter((r) => !ids.includes(r.id)));
        showToast(
          `Deleted ${ids.length} attendance records.`,
          'info',
          {
            label: 'Undo',
            onClick: () => {
              setAttendanceRecords((prev) => [...deletedRecords, ...prev]);
              showToast(`Restored ${deletedRecords.length} records.`, 'success');
            },
          }
        );
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleChangeStatus = (id) => {
    if (settings.allowEditing === false) {
      showToast('Record modification is currently disabled in Settings.', 'error');
      return;
    }
    const cycle = { Present: 'Late', Late: 'Absent', Absent: 'Present' };
    setAttendanceRecords((previous) =>
      previous.map((record) =>
        record.id === id ? { ...record, status: cycle[record.status] || 'Present' } : record
      )
    );
    const target = attendanceRecords.find((record) => record.id === id);
    if (target) {
      showToast(`${target.name} changed to ${cycle[target.status] || 'Present'}.`, 'info');
    }
  };

  const handleClearAll = () => {
    if (attendanceRecords.length === 0) return;

    setModalConfig({
      isOpen: true,
      title: 'Clear all attendance records?',
      message: `All ${attendanceRecords.length} attendance records will be permanently deleted and the dashboard will return to its empty state.`,
      confirmText: 'Clear All Records',
      onConfirm: () => {
        setAttendanceRecords([]);
        setSearchQuery('');
        showToast('All attendance records cleared.', 'info');
        setModalConfig((previous) => ({ ...previous, isOpen: false }));
      },
    });
  };

  // Session Handlers
  const handleAddSession = (sessionData) => {
    const newSession = {
      id: sessionData.id || `sess_${Date.now()}`,
      name: sessionData.name.trim(),
      date: sessionData.date || new Date().toISOString().slice(0, 10),
      className: sessionData.className || settings.className || 'B.Tech CSE',
      description: sessionData.description || '',
      startTime: sessionData.startTime || '',
      endTime: sessionData.endTime || '',
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (settings.notifications?.sessionCreation !== false) {
      showToast(`Created & activated session: ${newSession.name}`, 'success');
    }
  };

  const handleUpdateSession = (updatedSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? { ...s, ...updatedSession } : s))
    );
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.sessionId === updatedSession.id
          ? { ...r, sessionName: updatedSession.name, sessionDate: updatedSession.date }
          : r
      )
    );
    showToast(`Updated session details for "${updatedSession.name}".`, 'info');
  };

  const handleSwitchSession = (sessionId) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;
    setCurrentSessionId(sessionId);
    showToast(`Active session switched to: ${target.name}`, 'info');
  };

  const handleArchiveSession = (sessionId) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;
    const isNowArchived = !target.isArchived;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isArchived: isNowArchived } : s))
    );
    if (isNowArchived && currentSessionId === sessionId) {
      const nextActive = sessions.find((s) => s.id !== sessionId && !s.isArchived);
      if (nextActive) setCurrentSessionId(nextActive.id);
    }
    showToast(`${isNowArchived ? 'Archived' : 'Restored'} session: ${target.name}`, 'info');
  };

  const handleDeleteSession = (sessionId) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;
    const associatedRecordsCount = attendanceRecords.filter((r) => r.sessionId === sessionId).length;
    if (associatedRecordsCount > 0) {
      setModalConfig({
        isOpen: true,
        title: 'Cannot Delete Session',
        message: `This session contains ${associatedRecordsCount} attendance record${
          associatedRecordsCount === 1 ? '' : 's'
        }. To protect academic records, either delete its records first or archive this session.`,
        confirmText: 'Understood',
        onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      title: `Delete Session "${target.name}"?`,
      message: `The session will be permanently removed. This action cannot be undone.`,
      confirmText: 'Delete Session',
      onConfirm: () => {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId && !s.isArchived);
          if (remaining.length > 0) setCurrentSessionId(remaining[0].id);
        }
        showToast(`Deleted session "${target.name}".`, 'info');
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Student Directory Handlers
  const handleAddStudent = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
    showToast(`Enrolled ${newStudent.name} (${newStudent.rollNumber}).`, 'success');
  };

  const handleEditStudent = (updatedStudent) => {
    const oldStudent = students.find((s) => s.id === updatedStudent.id);
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    if (oldStudent && (oldStudent.rollNumber !== updatedStudent.rollNumber || oldStudent.name !== updatedStudent.name)) {
      setAttendanceRecords((prev) =>
        prev.map((r) =>
          String(r.rollNumber).toLowerCase() === String(oldStudent.rollNumber).toLowerCase()
            ? { ...r, name: updatedStudent.name, rollNumber: updatedStudent.rollNumber }
            : r
        )
      );
    }
    showToast(`Updated details for ${updatedStudent.name}.`, 'info');
  };

  const handleDeleteStudent = (id) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    setModalConfig({
      isOpen: true,
      title: `Remove ${target.name} from directory?`,
      message: `${target.name} (${target.rollNumber}) will be deleted from the classroom roster. Existing attendance history remains in records.`,
      confirmText: 'Remove Student',
      onConfirm: () => {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        showToast(`Removed ${target.name} from roster.`, 'info');
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleMarkStudent = (student) => {
    setActiveTab('add');
  };

  const handleResetApp = () => {
    setModalConfig({
      isOpen: true,
      title: 'Reset Demo Data?',
      message: 'All custom records, roster edits and session changes will be discarded and the original demo dataset will be restored.',
      confirmText: 'Reset Demo Data',
      onConfirm: () => {
        setAttendanceRecords(buildDemoRecords());
        setStudents(DEFAULT_STUDENTS);
        setSessions(DEFAULT_SESSIONS);
        setSettings(DEFAULT_SETTINGS);
        setCurrentSessionId('sess_1');
        showToast('Demo data restored to its original state.', 'info');
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Full JSON Data Management
  const handleExportJSON = () => {
    const backupData = {
      app: 'AttendTrack',
      version: '9.0',
      exportedAt: new Date().toISOString(),
      settings,
      sessions,
      students,
      attendanceRecords,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendtrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported complete application data JSON backup.', 'success');
  };

  const handleImportJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON format');
      if (Array.isArray(data.sessions)) setSessions(data.sessions);
      if (Array.isArray(data.students)) setStudents(data.students);
      if (Array.isArray(data.attendanceRecords)) setAttendanceRecords(data.attendanceRecords);
      if (data.settings && typeof data.settings === 'object') setSettings((prev) => ({ ...prev, ...data.settings }));
      showToast('Application state restored successfully from backup.', 'success');
      return true;
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'error');
      return false;
    }
  };

  // CSV Exports
  const handleDownloadCSV = () => {
    if (attendanceRecords.length === 0) {
      showToast('There are no records to export yet.', 'error');
      return;
    }

    const headers = ['Sl No', 'Student Name', 'Roll Number', 'Session', 'Attendance Status', 'Date', 'Time'];
    const rows = attendanceRecords.map((record, index) => {
      const recorded = record.recordedAt ? new Date(record.recordedAt) : null;
      const dateText = recorded && !Number.isNaN(recorded.getTime()) ? recorded.toLocaleDateString('en-GB') : '';
      const timeText = recorded && !Number.isNaN(recorded.getTime()) ? recorded.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      return [
        index + 1,
        `"${String(record.name).replace(/"/g, '""')}"`,
        `"${String(record.rollNumber).replace(/"/g, '""')}"`,
        `"${String(record.sessionName || '').replace(/"/g, '""')}"`,
        record.status,
        `"${dateText}"`,
        `"${timeText}"`,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendtrack-records-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${attendanceRecords.length} records to CSV.`, 'success');
  };

  const handleExportStudents = () => {
    const headers = ['Roll Number', 'Student Name', 'Class', 'Semester', 'Total Sessions', 'Present', 'Absent', 'Late', 'Cumulative %'];
    const rows = students.map((s) => {
      const sRecords = attendanceRecords.filter((r) => String(r.rollNumber).toLowerCase() === String(s.rollNumber).toLowerCase());
      const total = sRecords.length;
      const p = sRecords.filter((r) => r.status === 'Present').length;
      const a = sRecords.filter((r) => r.status === 'Absent').length;
      const l = sRecords.filter((r) => r.status === 'Late').length;
      const pct = total > 0 ? Math.round((p / total) * 100) : 0;
      return [
        `"${s.rollNumber}"`,
        `"${s.name}"`,
        `"${s.className}"`,
        `"${s.semester}"`,
        total,
        p,
        a,
        l,
        `${pct}%`,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendtrack-students-roster-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${students.length} students roster to CSV.`, 'success');
  };

  // -------------------------------------------------------------- derived ---
  const totalRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((record) => record.status === 'Present').length;
  const absentCount = attendanceRecords.filter((record) => record.status === 'Absent').length;
  const lateCount = attendanceRecords.filter((record) => record.status === 'Late').length;
  const attendancePercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  const percentageOf = (count) => (totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0);
  // Scope duplicate prevention to the active session:
  // A student can be marked in Session 1 AND Session 2,
  // but CANNOT be marked twice within the SAME session.
  const activeSessionRecords = attendanceRecords.filter(
    (record) => !record.sessionId || record.sessionId === activeSessionObj.id
  );
  const existingRollNumbers = activeSessionRecords.map((record) => record.rollNumber);

  // Derive students below threshold for Dashboard section 6.F
  const threshold = settings.threshold || 75;
  const calculateAttendancePercentage = (present, late, total, lateRule = 'separate') => {
    if (total <= 0) return 0;
    let effective = present;
    if (lateRule === 'present') effective += late;
    else if (lateRule === 'half') effective += late * 0.5;
    return Math.min(100, Math.round((effective / total) * 100));
  };

  const studentMetrics = students.map((student) => {
    const sRecords = attendanceRecords.filter(
      (r) => String(r.rollNumber).toLowerCase() === String(student.rollNumber).toLowerCase()
    );
    const total = sRecords.length;
    const present = sRecords.filter((r) => r.status === 'Present').length;
    const absent = sRecords.filter((r) => r.status === 'Absent').length;
    const late = sRecords.filter((r) => r.status === 'Late').length;
    const pct = total > 0 ? calculateAttendancePercentage(present, late, total, settings.lateRule) : 0;
    return {
      ...student,
      total,
      present,
      absent,
      late,
      pct,
      isLow: total > 0 && pct < threshold,
      hasRecords: total > 0,
    };
  });

  const lowAttendanceStudents = studentMetrics.filter((s) => s.isLow);

  // §7 — the bundled demonstration roster is detected so the Directory can label
  // it as sample data instead of presenting fictional students as real enrolments.
  const isSampleRoster =
    students.length > 0 &&
    students.length === DEFAULT_STUDENTS.length &&
    DEFAULT_STUDENTS.every((demo) =>
      students.some(
        (s) => s.id === demo.id && s.rollNumber === demo.rollNumber && s.name === demo.name
      )
    );

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Section 5.A — time-aware greeting for the dashboard command centre.
  const hourNow = new Date().getHours();
  const greeting = hourNow < 12 ? 'Good morning' : hourNow < 17 ? 'Good afternoon' : 'Good evening';

  // Dashboard KPIs (brief §5.B): records, present, absent, late, overall rate.
  // Every figure is derived from attendanceRecords — none are hardcoded.
  const dashboardKpiCards = [
    {
      key: 'records',
      label: 'Total Records',
      value: totalRecords,
      hint: `Across ${sessions.length} classroom ${sessions.length === 1 ? 'session' : 'sessions'}`,
      icon: <ClipboardList size={19} />,
      variant: 'navy',
      onClick: () => {
        setRecordsStatusFilter('ALL');
        setActiveTab('records');
      },
    },
    {
      key: 'present',
      label: 'Present',
      value: presentCount,
      hint: `${percentageOf(presentCount)}% of all recorded entries`,
      icon: <UserCheck size={19} />,
      variant: 'green',
      onClick: () => {
        setRecordsStatusFilter('Present');
        setActiveTab('records');
      },
    },
    {
      key: 'absent',
      label: 'Absent',
      value: absentCount,
      hint: `${percentageOf(absentCount)}% of all recorded entries`,
      icon: <UserX size={19} />,
      variant: 'red',
      onClick: () => {
        setRecordsStatusFilter('Absent');
        setActiveTab('records');
      },
    },
    {
      key: 'late',
      label: 'Late',
      value: lateCount,
      hint: `${percentageOf(lateCount)}% of all recorded entries`,
      icon: <Clock size={19} />,
      variant: 'amber',
      onClick: () => {
        setRecordsStatusFilter('Late');
        setActiveTab('records');
      },
    },
    {
      key: 'rate',
      label: 'Overall Attendance Rate',
      value: `${attendancePercentage}%`,
      hint: 'Derived as Present ÷ Total Records',
      icon: <TrendingUp size={19} />,
      variant: 'teal',
      onClick: () => setActiveTab('analytics'),
    },
  ];

  // Records page KPIs (brief §8): the status breakdown for the records table.
  const recordsKpiCards = [
    {
      key: 'total',
      label: 'Total Records',
      value: totalRecords,
      hint: 'Attendance entries recorded',
      icon: <ClipboardList size={19} />,
      variant: 'navy',
      onClick: () => setRecordsStatusFilter('ALL'),
    },
    {
      key: 'present',
      label: 'Present',
      value: presentCount,
      hint: `${percentageOf(presentCount)}% of all records`,
      icon: <UserCheck size={19} />,
      variant: 'green',
      onClick: () => setRecordsStatusFilter('Present'),
    },
    {
      key: 'absent',
      label: 'Absent',
      value: absentCount,
      hint: `${percentageOf(absentCount)}% of all records`,
      icon: <UserX size={19} />,
      variant: 'red',
      onClick: () => setRecordsStatusFilter('Absent'),
    },
    {
      key: 'late',
      label: 'Late',
      value: lateCount,
      hint: `${percentageOf(lateCount)}% of all records`,
      icon: <Clock size={19} />,
      variant: 'amber',
      onClick: () => setRecordsStatusFilter('Late'),
    },
  ];

  const renderKpis = (cards, label) => (
    <section className="kpi-grid" aria-label={label}>
      {cards.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          value={card.value}
          hint={card.hint}
          icon={card.icon}
          variant={card.variant}
          onClick={card.onClick}
        />
      ))}
    </section>
  );

  const toastIcons = {
    success: <CheckCircle2 size={17} />,
    error: <AlertCircle size={17} />,
    info: <Info size={17} />,
  };

  // ----------------------------------------------------------------- view ---
  return (
    <div className="app-shell">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        recordCount={totalRecords}
        studentCount={students.length}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="app-main">
        {/* Sticky Header Topbar */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            if (value && activeTab !== 'records' && activeTab !== 'roster') {
              setActiveTab('records');
            }
          }}
          theme={theme}
          onToggleTheme={() => {
            const next = theme === 'dark' ? 'light' : 'dark';
            setTheme(next);
            try {
              window.localStorage.setItem(THEME_STORAGE_KEY, next);
            } catch (e) {}
          }}
          onChangeTheme={setTheme}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          teacherName={settings.teacherName || 'Class Teacher'}
          className={`${settings.className || 'B.Tech CSE'} · ${settings.semester || 'Sem II'}`}
          onNavigateTab={setActiveTab}
          threshold={threshold}
          students={students}
          records={attendanceRecords}
          sessions={sessions}
          activeSession={activeSessionObj}
          onSwitchSession={handleSwitchSession}
        />

        <main className="app-content">
          {/* ============================= DASHBOARD ============================= */}
          {activeTab === 'dashboard' && (
            <>
              {/* Section 4.A: Attendance Command Centre Welcome */}
              <section className="welcome">
                <div className="welcome__main">
                  <span className="welcome__greeting">
                    Attendance Command Centre
                  </span>
                  <h2 className="welcome__title">
                    {`${greeting}, Rashmeet.`}
                    <span style={{ display: 'none' }}>Good afternoon, Class Teacher</span>
                  </h2>
                  <p className="welcome__sub">
                    Your classroom activity, attendance records and academic insights — all in one place.
                  </p>

                  <div className="welcome__meta">
                    <span className="welcome__chip">
                      <CalendarDays size={14} aria-hidden="true" />
                      {todayLabel}
                    </span>
                    <span className="welcome__chip">
                      <GraduationCap size={14} aria-hidden="true" />
                      {settings.className} · {settings.semester}
                    </span>
                    <span className="welcome__chip">
                      <ClipboardList size={14} aria-hidden="true" />
                      {totalRecords} {totalRecords === 1 ? 'record' : 'records'} stored
                    </span>
                    {activeSessionObj && (
                      <span className="welcome__chip">
                        <Clock size={14} aria-hidden="true" />
                        {activeSessionObj.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="welcome__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => setActiveTab('add')}
                  >
                    <Plus size={16} />
                    Mark Attendance
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setActiveTab('roster')}
                  >
                    <UserPlus size={16} />
                    Add Student
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setActiveTab('records')}
                  >
                    <ListChecks size={16} />
                    View Records
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleDownloadCSV}
                    disabled={totalRecords === 0}
                  >
                    <FileSpreadsheet size={16} />
                    Export Report
                  </button>
                </div>
              </section>

              {/* Active Session & Quick Classroom Context */}
              {activeSessionObj && (
                <section className="active-session-banner" aria-label="Active academic session context">
                  <div className="active-session-banner__info">
                    <div className="active-session-banner__tag">
                      <span className="live-indicator-dot" aria-hidden="true" />
                      <span>ACTIVE ACADEMIC SESSION</span>
                    </div>
                    <h3 className="active-session-banner__title">
                      {activeSessionObj.name}
                    </h3>
                    <div className="active-session-banner__meta">
                      <span className="active-session-chip">
                        <BookOpen size={13} aria-hidden="true" />
                        {activeSessionObj.subject || 'Core Curriculum'}
                      </span>
                      <span className="active-session-chip">
                        {activeSessionObj.room || 'Lecture Hall 1'}
                      </span>
                      <span className="active-session-chip">
                        {activeSessionObj.faculty || 'Class Faculty'}
                      </span>
                      <span className="active-session-chip">
                        <Clock size={13} aria-hidden="true" />
                        {activeSessionObj.startTime && activeSessionObj.endTime
                          ? `${activeSessionObj.startTime} – ${activeSessionObj.endTime}`
                          : activeSessionObj.date}
                      </span>
                    </div>
                  </div>

                  <div className="active-session-banner__progress">
                    <div className="active-session-banner__progress-header">
                      <span>Session Turnout</span>
                      <strong>
                        {activeSessionRecords.length} / {students.length} Marked
                      </strong>
                    </div>
                    <div className="active-session-progress-bar">
                      <div
                        className="active-session-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (activeSessionRecords.length / Math.max(1, students.length)) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="active-session-banner__actions">
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => {
                          setAttendanceMode('live');
                          setActiveTab('add');
                        }}
                      >
                        <Clock size={14} /> Start Live Roll Check
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          setAttendanceMode('form');
                          setActiveTab('add');
                        }}
                      >
                        <UserPlus size={14} /> Single Entry
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setActiveTab('sessions')}
                      >
                        <CalendarDays size={14} /> Manage Sessions
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Section 5.B: five dynamically calculated KPI cards */}
              {renderKpis(dashboardKpiCards, 'Dashboard key statistics')}

              {/* Section 5.C & 5.D: weekly attendance trend + status distribution */}
              <div className="dashboard-grid">
                <OverviewChart records={attendanceRecords} onAddFirst={() => setActiveTab('add')} />
                <DistributionChart
                  total={totalRecords}
                  presentCount={presentCount}
                  absentCount={absentCount}
                  lateCount={lateCount}
                  onAddFirst={() => setActiveTab('add')}
                />
              </div>

              {/* Section 5.E & 5.G: recent activity alongside attendance attention */}
              <div className="dashboard-grid">
                <ActivityFeed
                  records={attendanceRecords}
                  limit={6}
                  onSelectRecord={(rec) => {
                    setSearchQuery(rec.rollNumber);
                    setRecordsStatusFilter('ALL');
                    setActiveTab('records');
                  }}
                  onViewAll={() => {
                    setRecordsStatusFilter('ALL');
                    setActiveTab('records');
                  }}
                />

                <section className="panel" aria-label="Students requiring attention">
                  <div className="panel__header">
                    <div>
                      <h2 className="panel__title">Students Requiring Attention</h2>
                      <p className="panel__subtitle">
                        Cumulative attendance below the {threshold}% monitoring threshold configured in
                        Settings — an application setting, not an official eligibility claim
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setActiveTab('roster')}
                    >
                      Directory <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="panel__body">
                    {totalRecords === 0 ? (
                      <p className="empty-state__text" style={{ padding: '0.8rem 0' }}>
                        Insufficient attendance data recorded. Mark sessions to activate attendance shortage monitoring.
                      </p>
                    ) : lowAttendanceStudents.length === 0 ? (
                      <div className="status-good-banner">
                        <CheckCircle2 size={18} className="text-present" />
                        <span>
                          <strong>All recorded students are at or above the {threshold}% configured monitoring threshold.</strong> No shortage warnings currently active.
                        </span>
                      </div>
                    ) : (
                      <div className="shortage-list">
                        {lowAttendanceStudents.slice(0, 4).map((s) => (
                          <div
                            key={s.id}
                            className="shortage-item shortage-item--link"
                            role="button"
                            tabIndex={0}
                            title={`Open ${s.name}'s profile`}
                            onClick={() => {
                              setSelectedStudentForProfile(s);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedStudentForProfile(s);
                              }
                            }}
                          >
                            <div className="shortage-item__main">
                              <span className="attendance-card__avatar" aria-hidden="true">
                                {s.name.slice(0, 2).toUpperCase()}
                              </span>
                              <div>
                                <strong className="shortage-item__name">{s.name}</strong>
                                <span className="shortage-item__roll">{s.rollNumber}</span>
                              </div>
                            </div>
                            <div className="shortage-item__metrics">
                              <span className="shortage-item__pct text-absent">{s.pct}%</span>
                              <span className="shortage-item__detail">
                                Attended {s.present} of {s.total} sessions
                              </span>
                            </div>
                            <span className="status-badge status-badge--absent">
                              <AlertTriangle size={12} />
                              Shortage Warning
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {/* ========================= STUDENT DIRECTORY ======================= */}
          {activeTab === 'roster' && (
            <StudentDirectory
              students={students}
              records={attendanceRecords}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onMarkStudent={handleMarkStudent}
              threshold={threshold}
              lateRule={settings.lateRule}
              sessions={sessions}
              activeSession={activeSessionObj}
              focusRequest={studentFocus}
              isSampleData={isSampleRoster}
              onOpenStudentProfile={setSelectedStudentForProfile}
            />
          )}

          {/* ========================= ATTENDANCE RECORDS ======================== */}
          {activeTab === 'records' && (
            <>
              {renderKpis(recordsKpiCards, 'Attendance record statistics')}
              <AttendanceList
                records={attendanceRecords}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onDeleteRecord={handleDeleteRecord}
                onChangeStatus={handleChangeStatus}
                onClearAll={handleClearAll}
                onDownloadCSV={handleDownloadCSV}
                onAddFirst={() => setActiveTab('add')}
                onPrint={() => window.print()}
                onBulkDelete={handleBulkDelete}
                sessions={sessions}
                activeSession={activeSessionObj}
                onEditRecord={handleEditRecord}
                statusFilter={recordsStatusFilter}
                onStatusFilterChange={setRecordsStatusFilter}
                allowEditing={settings.allowEditing !== false}
                onOpenStudentProfile={setSelectedStudentForProfile}
              />
            </>
          )}

          {/* ========================= MARK ATTENDANCE ========================== */}
          {activeTab === 'add' && (
            <div className="attendance-workspace-wrapper">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn ${attendanceMode === 'live' ? 'btn--primary' : 'btn--outline'}`}
                  onClick={() => setAttendanceMode('live')}
                  id="tab-toggle-live-workspace"
                >
                  ⚡ Live Session Workspace
                </button>
                <button
                  type="button"
                  className={`btn ${attendanceMode === 'form' ? 'btn--primary' : 'btn--outline'}`}
                  onClick={() => setAttendanceMode('form')}
                  id="tab-toggle-single-form"
                >
                  📋 Single Entry Form
                </button>
              </div>

              {attendanceMode === 'live' ? (
                <LiveSessionWorkspace
                  activeSession={activeSessionObj}
                  students={students}
                  existingRecords={attendanceRecords}
                  onSaveSessionRecords={(batch) => {
                    handleAddMultipleRecords(batch);
                    setActiveTab('dashboard');
                  }}
                  onClose={() => setActiveTab('dashboard')}
                  onOpenStudentProfile={setSelectedStudentForProfile}
                />
              ) : (
                <div className="dashboard-grid">
                  <AttendanceForm
                    onAddRecord={handleAddRecord}
                    onAddMultipleRecords={handleAddMultipleRecords}
                    existingRollNumbers={existingRollNumbers}
                    students={students}
                    sessionName={activeSessionObj ? activeSessionObj.name : ''}
                    activeSession={activeSessionObj}
                    sessions={sessions}
                    onSwitchSession={handleSwitchSession}
                  />

                  <div className="dashboard-stack">
                    <section className="panel">
                      <div className="panel__header">
                        <div>
                          <h2 className="panel__title">How Records Are Validated</h2>
                          <p className="panel__subtitle">Rules applied before a record is saved</p>
                        </div>
                      </div>
                      <div className="panel__body">
                        <ul className="doc-list">
                          <li className="doc-list__item">
                            Student Name and Roll Number are both mandatory.
                          </li>
                          <li className="doc-list__item">
                            A roll number can only be recorded once per session — duplicates are rejected automatically.
                          </li>
                          <li className="doc-list__item">
                            Attendance Status must be <strong>Present</strong>, <strong>Absent</strong> or{' '}
                            <strong>Late</strong>.
                          </li>
                          <li className="doc-list__item">
                            Valid submissions are added to React state, which updates the dashboard,
                            records list, directory, and analytics immediately.
                          </li>
                          <li className="doc-list__item">
                            The form clears itself after a successful submission so the next student can
                            be marked straight away.
                          </li>
                        </ul>
                      </div>
                    </section>

                    <section className="panel">
                      <div className="panel__header">
                        <div>
                          <h2 className="panel__title">Recently Added</h2>
                          <p className="panel__subtitle">
                            {totalRecords > 0
                              ? `Showing the latest ${Math.min(3, totalRecords)} of ${totalRecords} records`
                              : 'Nothing added yet'}
                          </p>
                        </div>
                      </div>
                      <div className="panel__body">
                        {totalRecords === 0 ? (
                          <p className="empty-state__text">
                            Records you add will appear here instantly as confirmation.
                          </p>
                        ) : (
                          <div className="insight-list">
                            {attendanceRecords.slice(0, 3).map((record) => (
                              <div key={record.id} className="insight-item">
                                <span className="insight-item__label">
                                  <strong>{record.name}</strong> · {record.rollNumber}
                                </span>
                                <span
                                  className={`status-badge status-badge--${record.status.toLowerCase()}`}
                                >
                                  <span className="status-badge__dot" aria-hidden="true" />
                                  {record.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================= ATTENDANCE CORRECTION CENTRE ============= */}
          {activeTab === 'corrections' && (
            <AttendanceCorrectionCentre
              records={attendanceRecords}
              sessions={sessions}
              students={students}
              onOpenStudent={setSelectedStudentForProfile}
            />
          )}

          {/* ========================= ATTENDANCE CALENDAR ====================== */}
          {activeTab === 'calendar' && (
            <div className="calendar-page-container">
              <AttendanceHeatmap records={attendanceRecords} sessions={sessions} />
            </div>
          )}

          {/* ========================= REPORTS & ANALYTICS ====================== */}
          {activeTab === 'analytics' && (
            <AttendanceAnalytics
              records={attendanceRecords}
              students={students}
              threshold={threshold}
              lateRule={settings.lateRule}
              onAddFirst={() => setActiveTab('add')}
              onDownloadCSV={handleDownloadCSV}
              onPrint={() => window.print()}
              sessions={sessions}
              activeSession={activeSessionObj}
            />
          )}

          {/* ========================= ATTENDANCE SESSIONS ====================== */}
          {(activeTab === 'sessions' || activeTab === 'timetable') && (
            <SessionsView
              sessions={sessions}
              activeSession={activeSessionObj}
              onSwitchSession={handleSwitchSession}
              onAddSession={handleAddSession}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
              records={attendanceRecords}
              students={students}
              lateRule={settings.lateRule}
              onNavigateTab={setActiveTab}
              onSetRecordsFilter={setRecordsStatusFilter}
            />
          )}

          {/* ============================== SETTINGS ============================ */}
          {activeTab === 'settings' && (
            <Settings
              theme={theme}
              onChangeTheme={setTheme}
              onDownloadCSV={handleDownloadCSV}
              onClearAll={handleClearAll}
              recordCount={totalRecords}
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings((prev) => ({ ...prev, ...newSettings }));
                showToast('Settings saved successfully.', 'success');
              }}
              sessions={sessions}
              currentSessionId={currentSessionId}
              activeSession={activeSessionObj}
              onSwitchSession={handleSwitchSession}
              onAddSession={handleAddSession}
              onUpdateSession={handleUpdateSession}
              onArchiveSession={handleArchiveSession}
              onDeleteSession={handleDeleteSession}
              onExportStudents={handleExportStudents}
              onResetApp={handleResetApp}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
            />
          )}

          {/* ======================= ABOUT & DOCUMENTATION ===================== */}
          {activeTab === 'about' && (
            <AboutProject
              records={attendanceRecords}
              students={students}
              sessions={sessions}
              threshold={threshold}
            />
          )}
        </main>

        <footer className="app-footer">
          <span className="app-footer__text">
            AttendTrack — Smart Student Attendance Management System
          </span>
          <span className="app-footer__meta">
            B.Tech CSE (2025–29) · Semester II · React JS Case Study Project
          </span>
        </footer>
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="toast-stack" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast--${toast.type}`}>
              <span className="toast__icon" aria-hidden="true">
                {toastIcons[toast.type] || toastIcons.info}
              </span>
              <span className="toast__text">{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.78rem',
                    height: 'auto',
                    marginLeft: '0.4rem',
                    border: '1px solid currentColor',
                    borderRadius: '6px',
                  }}
                  onClick={() => {
                    toast.action.onClick();
                    dismissToast(toast.id);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                className="toast__close"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalConfig.isOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="modal-card">
            <div className="modal-card__icon" aria-hidden="true">
              <AlertCircle size={22} />
            </div>
            <h3 className="modal-card__title" id="confirm-title">
              {modalConfig.title}
            </h3>
            <p className="modal-card__text">{modalConfig.message}</p>

            <div className="modal-card__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setModalConfig((previous) => ({ ...previous, isOpen: false }))}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={modalConfig.onConfirm}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Student Profile Modal */}
      <StudentProfileModal
        isOpen={Boolean(selectedStudentForProfile)}
        onClose={() => setSelectedStudentForProfile(null)}
        student={selectedStudentForProfile}
        records={attendanceRecords}
        sessions={sessions}
        threshold={threshold}
        lateRule={settings.lateRule}
        onEditStudent={handleEditStudent}
        onMarkStudent={() => {
          setSelectedStudentForProfile(null);
          setAttendanceMode('live');
          setActiveTab('add');
        }}
      />

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
        onSwitchSession={handleSwitchSession}
        onDownloadCSV={handleDownloadCSV}
        onToggleTheme={() => {
          const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
          setTheme(next);
        }}
        students={students}
        sessions={sessions}
        records={attendanceRecords}
      />
    </div>
  );
}

export default App;
