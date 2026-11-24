import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  CalendarDays,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  X,
  ChevronDown,
  Users,
  ClipboardList,
} from 'lucide-react';

/**
 * Page metadata for the header: breadcrumb, title, and contextual subtitle.
 */
const PAGE_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Attendance Command Centre' },
  add: { title: 'Mark Attendance', subtitle: 'Student Attendance Entry Workspace' },
  roster: { title: 'Student Directory', subtitle: 'Enrolled Roster & Exam Eligibility' },
  records: { title: 'Attendance Records', subtitle: 'Search, filter and manage records' },
  corrections: { title: 'Attendance Correction Centre', subtitle: 'Local Audit Log & Record Amendments' },
  calendar: { title: 'Attendance Calendar', subtitle: 'Date-wise Attendance Activity & Inspection' },
  analytics: { title: 'Reports & Analytics', subtitle: 'Attendance Reports & Performance Analytics' },
  sessions: { title: 'Sessions', subtitle: 'Classroom Lecture Management & Context' },
  settings: { title: 'Settings', subtitle: 'Preferences, Rules & Data Controls' },
  about: { title: 'Help & Project Overview', subtitle: 'Product Overview & Project Documentation' },
};

/**
 * Header Component
 *
 * Sticky top navigation bar containing:
 *  - Page title and breadcrumbs
 *  - Live date
 *  - Global student search field with live autocomplete
 *  - Interactive notifications panel with badge
 *  - Light / dark theme toggle
 *  - Interactive teacher profile menu
 */
function Header({
  activeTab = 'dashboard',
  searchQuery = '',
  onSearchChange = () => {},
  theme = 'light',
  onToggleTheme = () => {},
  onOpenSidebar = () => {},
  teacherName = 'Class Teacher',
  className = 'B.Tech CSE · Sem II',
  onNavigateTab = () => {},
  threshold = 75,
  students = [],
  records = [],
  sessions = [],
  activeSession,
  onSwitchSession,
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const meta = PAGE_META[activeTab] || PAGE_META.dashboard;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Live date
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [readNotifIds, setReadNotifIds] = useState([]);

  // Compute live notifications from real application state.
  // The threshold comes from Settings so the alert agrees with the Dashboard.
  const lowAttendanceStudents = students.filter((s) => {
    const sRecords = records.filter((r) => r.rollNumber.toLowerCase() === s.rollNumber.toLowerCase());
    const tot = sRecords.length;
    const p = sRecords.filter((r) => r.status === 'Present').length;
    return tot > 0 && Math.round((p / tot) * 100) < threshold;
  });

  const dynamicNotifications = [
    ...(lowAttendanceStudents.length > 0
      ? [
          {
            id: 'notif_shortage',
            type: 'warning',
            title: 'Attendance Shortage Alert',
            message: `${lowAttendanceStudents.length} student${lowAttendanceStudents.length === 1 ? '' : 's'} (${lowAttendanceStudents.map((s) => s.name).slice(0, 2).join(', ')}${lowAttendanceStudents.length > 2 ? '...' : ''}) below the ${threshold}% monitoring threshold.`,
            time: 'Live Alert',
            tab: 'roster',
          },
        ]
      : []),
    {
      id: 'notif_session',
      type: 'info',
      title: 'Active Lecture Session',
      message: `${activeSession?.name || 'Classroom Session'} is ready for attendance marking in ${activeSession?.room || 'Lab 402'}.`,
      time: 'Current',
      tab: 'add',
    },
    {
      id: 'notif_records',
      type: 'success',
      title: 'Records Saved Locally',
      message: `${records.length} records across ${sessions.length} sessions are saved in this browser's storage.`,
      time: 'Saved',
      tab: 'records',
    },
  ];

  const unreadNotifs = dynamicNotifications.filter((n) => !readNotifIds.includes(n.id));
  const effectiveUnreadCount = unreadNotifs.length;

  // Initials for avatar
  const initials = teacherName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'CT';

  // Search matches
  const q = searchQuery.trim().toLowerCase();
  const matchedStudents = q
    ? students.filter(
        (s) => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q)
      )
    : [];
  const matchedRecords = q
    ? records.filter(
        (r) => r.name.toLowerCase().includes(q) || r.rollNumber.toLowerCase().includes(q)
      )
    : [];

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__menu"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar__titles">
          <div className="breadcrumbs">
            <span className="topbar__wordmark">AttendTrack</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{meta.title}</span>
          </div>
          <p className="topbar__subtitle">
            <span className="topbar__wordmark" style={{ display: 'none' }}>AttendTrack</span>
            <span className="topbar__wordmark-label">{meta.subtitle}</span>
            <span aria-hidden="true">·</span>
            <CalendarDays size={13} aria-hidden="true" />
            <span>{today}</span>
          </p>
        </div>

        {activeSession && (
          <div className="header-session-pill" title={`Active Session: ${activeSession.name} (${activeSession.date})`}>
            <span className="session-pill-dot" />
            <span className="session-pill-label">Active:</span>
            {sessions.length > 1 && onSwitchSession ? (
              <select
                className="header-session-pill__select"
                value={activeSession.id}
                onChange={(e) => onSwitchSession(e.target.value)}
                aria-label="Active session switcher"
              >
                {sessions.filter((s) => !s.isArchived).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="session-pill-name">{activeSession.name}</span>
            )}
          </div>
        )}
      </div>

      {/* CampusCore Floating Navigation Pills */}
      <nav className="header-nav-pills" aria-label="CampusCore navigation pills">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'add', label: 'Mark Attendance' },
          { id: 'roster', label: 'Students' },
          { id: 'records', label: 'Records' },
          { id: 'calendar', label: 'Calendar' },
          { id: 'analytics', label: 'Reports' },
          { id: 'sessions', label: 'Sessions' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`header-nav-pill ${isActive ? 'header-nav-pill--active' : ''}`}
              onClick={() => onNavigateTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="topbar__actions">
        {/* Global Student Search with Live Autocomplete */}
        <div className="search-field" ref={searchRef}>
          <span className="search-field__icon" aria-hidden="true">
            <Search size={16} />
          </span>
          <input
            type="search"
            className="search-field__input"
            placeholder="Search student name or roll number…"
            value={searchQuery}
            onChange={(event) => {
              onSearchChange(event.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            aria-label="Search student name or roll number"
          />
          <kbd
            className="search-field__shortcut"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.7rem',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-command-palette'))}
            title="Open Command Palette (Cmd+K)"
          >
            ⌘K
          </kbd>

          {isSearchFocused && q.length > 0 && (
            <div className="search-results" role="listbox">
              {matchedStudents.length > 0 && (
                <>
                  <div className="search-results__label">Enrolled Students ({matchedStudents.length})</div>
                  {matchedStudents.slice(0, 3).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className="search-result"
                      onClick={() => {
                        onNavigateTab('roster');
                        setIsSearchFocused(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={13} className="text-brand" />
                        <strong>{st.name}</strong>
                      </div>
                      <span>Roll: {st.rollNumber} · {st.className}</span>
                    </button>
                  ))}
                </>
              )}

              {matchedRecords.length > 0 && (
                <>
                  <div className="search-results__label">Attendance Records ({matchedRecords.length})</div>
                  {matchedRecords.slice(0, 3).map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      className="search-result"
                      onClick={() => {
                        onNavigateTab('records');
                        setIsSearchFocused(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ClipboardList size={13} className="text-brand" />
                        <strong>{rec.name}</strong>
                      </div>
                      <span>
                        Roll: {rec.rollNumber} · Status: <strong>{rec.status}</strong>
                      </span>
                    </button>
                  ))}
                </>
              )}

              {matchedStudents.length === 0 && matchedRecords.length === 0 && (
                <div className="search-results__empty">
                  No student or record matching “{q}”
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="header-dropdown-wrap" ref={notifRef}>
          <button
            type="button"
            className="icon-btn header-notif-btn"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            aria-label="Notifications"
            aria-expanded={isNotifOpen}
            title="Notifications"
          >
            <Bell size={18} />
            {effectiveUnreadCount > 0 && <span className="notif-badge">{effectiveUnreadCount}</span>}
          </button>

          {isNotifOpen && (
            <div className="dropdown-panel notif-panel" role="menu" aria-label="Notifications">
              <div className="dropdown-panel__header">
                <div>
                  <h4 className="dropdown-panel__title">Notification Centre</h4>
                  <p className="dropdown-panel__subtitle">
                    Attendance alerts and session status derived from your records
                  </p>
                </div>
                <span className="status-badge status-badge--present" style={{ fontSize: '0.72rem' }}>
                  {effectiveUnreadCount} New
                </span>
              </div>

              <div className="notif-list">
                {dynamicNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${!readNotifIds.includes(n.id) ? 'notif-item--unread' : ''}`}
                    onClick={() => {
                      if (n.tab) onNavigateTab(n.tab);
                      setReadNotifIds((prev) => [...prev, n.id]);
                      setIsNotifOpen(false);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="notif-item__icon">
                      {n.type === 'warning' ? (
                        <AlertTriangle size={15} className="text-absent" />
                      ) : n.type === 'success' ? (
                        <CheckCircle2 size={15} className="text-present" />
                      ) : (
                        <Info size={15} className="text-brand" />
                      )}
                    </div>
                    <div className="notif-item__body">
                      <div className="notif-item__title">{n.title}</div>
                      <div className="notif-item__message">{n.message}</div>
                      <span className="notif-item__time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dropdown-panel__footer" style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setReadNotifIds(dynamicNotifications.map((n) => n.id));
                  }}
                >
                  Mark all as read
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setIsNotifOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Teacher Profile Menu */}
        <div className="header-dropdown-wrap" ref={profileRef}>
          <button
            type="button"
            className="profile profile--interactive"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            aria-label="Teacher profile menu"
            aria-expanded={isProfileOpen}
          >
            <div className="profile__avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="profile__meta">
              <span className="profile__name">{teacherName}</span>
              <span className="profile__role">{className}</span>
            </div>
            <ChevronDown size={14} className="profile__chevron" />
          </button>

          {isProfileOpen && (
            <div className="dropdown-panel profile-menu" role="menu" aria-label="Profile Menu">
              <div className="profile-menu__header">
                <div className="profile-menu__avatar">{initials}</div>
                <div>
                  <div className="profile-menu__name">{teacherName}</div>
                  <div className="profile-menu__role">Course Instructor / Class Teacher</div>
                  <div className="profile-menu__sub">{className}</div>
                </div>
              </div>

              <div className="profile-menu__list">
                <button
                  type="button"
                  className="profile-menu__item"
                  onClick={() => {
                    onNavigateTab('settings');
                    setIsProfileOpen(false);
                  }}
                >
                  <SettingsIcon size={15} />
                  <span>Preferences & Settings</span>
                </button>
                <button
                  type="button"
                  className="profile-menu__item"
                  onClick={() => {
                    onNavigateTab('roster');
                    setIsProfileOpen(false);
                  }}
                >
                  <Users size={15} />
                  <span>Student Directory</span>
                </button>
                <button
                  type="button"
                  className="profile-menu__item"
                  onClick={() => {
                    onNavigateTab('about');
                    setIsProfileOpen(false);
                  }}
                >
                  <HelpCircle size={15} />
                  <span>Help &amp; Project Overview</span>
                </button>
              </div>

              <div className="profile-menu__footer">
                <span className="profile-menu__badge">Academic Batch 2025–29</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
