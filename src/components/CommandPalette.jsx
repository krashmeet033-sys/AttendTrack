import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  CalendarDays,
  ClipboardList,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
  Sun,
  Moon,
  FileSpreadsheet,
  X,
  ArrowRight,
  Terminal,
  History,
} from 'lucide-react';

/**
 * CommandPalette Component
 *
 * Implements Phase 12: Application-Wide Command Palette & Global Search.
 * Activated via Cmd+K / Ctrl+K or search trigger.
 */
function CommandPalette({
  isOpen = false,
  onClose = () => {},
  onNavigateTab = () => {},
  students = [],
  sessions = [],
  onSwitchSession = () => {},
  onToggleTheme = () => {},
  onDownloadCSV = () => {},
  onSelectStudent = () => {},
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent or event
          window.dispatchEvent(new CustomEvent('toggle-command-palette'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Navigation commands
  const navCommands = [
    { id: 'nav-dash', label: 'Go to Dashboard', category: 'Navigation', icon: <BarChart3 size={16} />, action: () => onNavigateTab('dashboard') },
    { id: 'nav-add', label: 'Go to Mark Attendance', category: 'Navigation', icon: <Plus size={16} />, action: () => onNavigateTab('add') },
    { id: 'nav-roster', label: 'Go to Student Directory', category: 'Navigation', icon: <Users size={16} />, action: () => onNavigateTab('roster') },
    { id: 'nav-records', label: 'Go to Attendance Records', category: 'Navigation', icon: <ClipboardList size={16} />, action: () => onNavigateTab('records') },
    { id: 'nav-corrections', label: 'Go to Attendance Correction Centre', category: 'Navigation', icon: <History size={16} />, action: () => onNavigateTab('corrections') },
    { id: 'nav-analytics', label: 'Go to Reports & Analytics', category: 'Navigation', icon: <BarChart3 size={16} />, action: () => onNavigateTab('analytics') },
    { id: 'nav-sessions', label: 'Go to Sessions', category: 'Navigation', icon: <CalendarDays size={16} />, action: () => onNavigateTab('sessions') },
    { id: 'nav-settings', label: 'Go to Settings', category: 'Navigation', icon: <Settings size={16} />, action: () => onNavigateTab('settings') },
    { id: 'nav-about', label: 'Go to Help & Project Overview', category: 'Navigation', icon: <HelpCircle size={16} />, action: () => onNavigateTab('about') },
  ];

  // Quick actions
  const actionCommands = [
    { id: 'act-theme', label: 'Toggle Light / Dark Theme', category: 'Actions', icon: <Sun size={16} />, action: () => onToggleTheme() },
    { id: 'act-export', label: 'Export Attendance Records to CSV', category: 'Actions', icon: <FileSpreadsheet size={16} />, action: () => onDownloadCSV() },
  ];

  // Matching students
  const matchedStudents = students
    .filter((s) => !q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q))
    .slice(0, 5)
    .map((s) => ({
      id: `std-${s.id}`,
      label: `${s.name} (${s.rollNumber})`,
      sublabel: `${s.className} · ${s.semester}`,
      category: 'Students',
      icon: <Users size={16} />,
      action: () => {
        onNavigateTab('roster');
        onSelectStudent(s);
      },
    }));

  // Matching sessions
  const matchedSessions = sessions
    .filter((s) => !q || s.name.toLowerCase().includes(q) || (s.subject && s.subject.toLowerCase().includes(q)))
    .slice(0, 4)
    .map((sess) => ({
      id: `sess-${sess.id}`,
      label: sess.name,
      sublabel: `${sess.subject || 'Lecture'} · ${sess.date}`,
      category: 'Academic Sessions',
      icon: <CalendarDays size={16} />,
      action: () => {
        onSwitchSession(sess.id);
        onNavigateTab('dashboard');
      },
    }));

  const filteredNav = navCommands.filter((c) => !q || c.label.toLowerCase().includes(q));
  const filteredActions = actionCommands.filter((c) => !q || c.label.toLowerCase().includes(q));

  const allItems = [...matchedStudents, ...matchedSessions, ...filteredNav, ...filteredActions];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
        onClose();
      }
    }
  };

  return (
    <div className="modal-backdrop command-palette-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="command-palette-card" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-search">
          <Search size={18} className="command-palette-icon" />
          <input
            ref={inputRef}
            type="search"
            className="command-palette-input"
            placeholder="Type a student name, roll number, session, or page…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        <div className="command-palette-list">
          {allItems.length === 0 ? (
            <div className="command-palette-empty">
              No results found for &quot;{query}&quot;. Try searching student names, roll numbers, or actions.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`command-palette-item ${isSelected ? 'command-palette-item--selected' : ''}`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="command-palette-item__icon">{item.icon}</div>
                  <div className="command-palette-item__body">
                    <span className="command-palette-item__label">{item.label}</span>
                    {item.sublabel && (
                      <span className="command-palette-item__sub">{item.sublabel}</span>
                    )}
                  </div>
                  <span className="command-palette-item__cat">{item.category}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="command-palette-footer">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Select with <kbd>↵</kbd></span>
          <span>Close with <kbd>ESC</kbd></span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

