import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  HelpCircle,
  CalendarCheck,
  CalendarDays,
  History,
  ChevronLeft,
  X,
} from 'lucide-react';

/**
 * Sidebar Component
 *
 * The application's primary navigation. It renders the AttendTrack brand block
 * and the eight pages required by the brief:
 *  1. Dashboard
 *  2. Mark Attendance
 *  3. Student Directory
 *  4. Attendance Records
 *  5. Reports & Analytics
 *  6. Sessions
 *  7. Settings
 *  8. Help & Project Overview
 *
 * On desktop the rail can be collapsed to an icon-only strip with the toggle in
 * the brand block; the collapsed preference is local UI state.
 *
 * @param {Object} props
 * @param {string} props.activeTab        - Currently active page key.
 * @param {Function} props.onSelectTab    - Sets the active page (from useState in App).
 * @param {number} props.recordCount      - Live count of attendance records, shown as a badge.
 * @param {number} props.studentCount     - Live count of students enrolled, shown as a badge.
 * @param {boolean} props.isOpen          - Whether the mobile drawer is open.
 * @param {Function} props.onClose        - Closes the mobile drawer.
 */
function Sidebar({
  activeTab = 'dashboard',
  onSelectTab = () => {},
  recordCount = 0,
  studentCount = 0,
  isOpen = false,
  onClose = () => {},
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Each navigation item maps to one of the pages in the brief.
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Mark Attendance', icon: ClipboardCheck },
    { id: 'roster', label: 'Student Directory', icon: Users, badge: studentCount > 0 ? studentCount : undefined },
    { id: 'records', label: 'Attendance Records', icon: ClipboardList, badge: recordCount },
    { id: 'corrections', label: 'Correction Centre', icon: History },
    { id: 'calendar', label: 'Attendance Calendar', icon: CalendarCheck },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'sessions', label: 'Sessions', icon: CalendarDays },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'Help & Project Overview', icon: HelpCircle },
  ];

  const handleNavClick = (id) => {
    onSelectTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop – tapping outside closes the drawer */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${
          isCollapsed ? 'sidebar--collapsed' : ''
        }`}
        aria-label="Main navigation"
      >
        {/* Brand / logo */}
        <div className="sidebar__brand">
          <div className="sidebar__logo" aria-hidden="true">
            <CalendarCheck size={21} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__app-name">AttendTrack</span>
            <span className="sidebar__app-sub">Smart Student Attendance</span>
          </div>
          <button
            type="button"
            className="sidebar__collapse"
            onClick={() => setIsCollapsed((previous) => !previous)}
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-pressed={isCollapsed}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar__nav">
          <span className="sidebar__section-title">Main Navigation</span>
          <ul className="sidebar__menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id} className="sidebar__item">
                  <button
                    type="button"
                    className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="sidebar__link-icon">
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span className="sidebar__link-label">{item.label}</span>
                    {typeof item.badge === 'number' && (
                      <span className="sidebar__link-badge">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Academic context footer */}
        <div className="sidebar__footer">
          <div className="sidebar__course">
            <span className="sidebar__course-tag">B.Tech CSE (2025–29)</span>
            <span className="sidebar__course-title">Semester II</span>
            <span className="sidebar__course-sub">React JS Case Study Project</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
