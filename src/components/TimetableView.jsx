import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  CheckCircle2,
  Plus,
  Play,
  CheckCheck,
  CalendarDays,
  Filter,
  Copy,
  ChevronRight,
  ExternalLink,
  Users,
} from 'lucide-react';

const SUBJECT_COLORS = {
  'React JS & Web Technologies': { bg: 'rgba(124, 58, 237, 0.12)', border: 'rgba(124, 58, 237, 0.3)', text: 'var(--color-primary-dark, #6D28D9)' },
  'Data Structures & Algorithms (DSA)': { bg: 'rgba(37, 99, 235, 0.12)', border: 'rgba(37, 99, 235, 0.3)', text: '#2563EB' },
  'Database Management Systems (DBMS)': { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#059669' },
  'Engineering Mathematics II': { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: '#D97706' },
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/**
 * TimetableView Component
 *
 * Visual Academic Timetable & Lecture Schedule for B.Tech CSE Semester II.
 * Connects scheduled lectures to session management, provides 1-click active
 * session switching, attendance progress indicators, and day-wise scheduling.
 */
function TimetableView({
  sessions = [],
  activeSession,
  onSwitchSession = () => {},
  onNavigateTab = () => {},
  records = [],
  students = [],
  onAddSession = () => {},
  onDuplicateSession = () => {},
}) {
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'agenda'

  // Map sessions to enriched timetable items
  const timetableItems = useMemo(() => {
    return sessions.map((sess) => {
      // Determine day of week from date or fallback
      let dayName = 'Monday';
      if (sess.date) {
        try {
          const d = new Date(sess.date);
          const name = d.toLocaleDateString('en-US', { weekday: 'long' });
          if (DAYS_OF_WEEK.includes(name)) dayName = name;
        } catch (e) {}
      }

      const subject = sess.subject || 'React JS & Web Technologies';
      const type = sess.type || 'Lecture';
      const faculty = sess.faculty || 'Prof. A. Sharma';
      const room = sess.room || 'Lab 402';
      const status = sess.status || (sess.id === activeSession?.id ? 'active' : 'upcoming');

      // Attendance records for this session
      const sessionRecords = records.filter(
        (r) => r.sessionId === sess.id || r.sessionName === sess.name
      );
      const recordedCount = sessionRecords.length;
      const totalStudents = students.length || 8;
      const completionPct = totalStudents > 0 ? Math.round((recordedCount / totalStudents) * 100) : 0;
      const isComplete = recordedCount >= totalStudents && totalStudents > 0;

      return {
        ...sess,
        dayName,
        subject,
        type,
        faculty,
        room,
        status,
        recordedCount,
        totalStudents,
        completionPct,
        isComplete,
      };
    });
  }, [sessions, activeSession, records, students]);

  // Filtered timetable items
  const filteredItems = useMemo(() => {
    return timetableItems.filter((item) => {
      if (item.isArchived) return false;
      if (selectedDay !== 'ALL' && item.dayName !== selectedDay) return false;
      if (selectedType !== 'ALL' && item.type !== selectedType) return false;
      return true;
    });
  }, [timetableItems, selectedDay, selectedType]);

  const handleStartAttendance = (sessId) => {
    onSwitchSession(sessId);
    onNavigateTab('add');
  };

  const handleViewRecords = (sessId) => {
    onSwitchSession(sessId);
    onNavigateTab('records');
  };

  return (
    <div className="timetable-view">
      {/* Timetable Header */}
      <section className="welcome" style={{ marginBottom: '1.25rem' }}>
        <div className="welcome__main">
          <span className="welcome__greeting">Academic Schedule & Timetable System</span>
          <h2 className="welcome__title">Weekly Lecture & Lab Timetable</h2>
          <p className="welcome__sub">
            B.Tech CSE Semester II · Room assignments, faculty slots, and live session attendance tracking.
          </p>

          <div className="welcome__meta">
            <span className="welcome__chip">
              <CalendarDays size={14} />
              {sessions.filter((s) => !s.isArchived).length} Academic Sessions
            </span>
            {activeSession && (
              <span className="welcome__chip welcome__chip--active">
                <Play size={13} fill="currentColor" />
                Active: {activeSession.name}
              </span>
            )}
            <span className="welcome__chip">
              <Users size={14} />
              {students.length} Enrolled Students
            </span>
          </div>
        </div>

        <div className="welcome__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigateTab('settings')}
          >
            <Plus size={16} />
            Manage Sessions
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onNavigateTab('add')}
          >
            <CheckCheck size={16} />
            Mark Active Session
          </button>
        </div>
      </section>

      {/* Filter and View Mode Controls */}
      <div className="table-controls" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', background: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
        <div className="filter-tabs" role="tablist" aria-label="Filter by Day">
          <button
            type="button"
            className={`filter-tab ${selectedDay === 'ALL' ? 'filter-tab--active' : ''}`}
            onClick={() => setSelectedDay('ALL')}
          >
            All Week
          </button>
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d}
              type="button"
              className={`filter-tab ${selectedDay === d ? 'filter-tab--active' : ''}`}
              onClick={() => setSelectedDay(d)}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="sort-group">
            <label htmlFor="filter-session-type" className="sort-group__label">
              Type:
            </label>
            <select
              id="filter-session-type"
              className="sort-group__select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Session Types</option>
              <option value="Lecture">Lectures</option>
              <option value="Practical / Lab">Labs & Practicals</option>
              <option value="Tutorial">Tutorials</option>
            </select>
          </div>

          <div className="filter-tabs" role="tablist" aria-label="View Mode">
            <button
              type="button"
              className={`filter-tab ${viewMode === 'grid' ? 'filter-tab--active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button
              type="button"
              className={`filter-tab ${viewMode === 'agenda' ? 'filter-tab--active' : ''}`}
              onClick={() => setViewMode('agenda')}
            >
              Agenda View
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Grid View */}
      {viewMode === 'grid' ? (
        <div className="timetable-grid">
          {DAYS_OF_WEEK.map((day) => {
            const dayItems = filteredItems.filter((item) => item.dayName === day);
            if (selectedDay !== 'ALL' && selectedDay !== day) return null;

            return (
              <div key={day} className="timetable-day-col">
                <div className="timetable-day-header">
                  <span className="timetable-day-name">{day}</span>
                  <span className="timetable-day-count">{dayItems.length} lectures</span>
                </div>

                <div className="timetable-cards-stack">
                  {dayItems.length === 0 ? (
                    <div className="timetable-empty-slot">
                      <span>No scheduled lectures</span>
                    </div>
                  ) : (
                    dayItems.map((item) => {
                      const isActive = item.id === activeSession?.id;
                      const subStyle = SUBJECT_COLORS[item.subject] || SUBJECT_COLORS['React JS & Web Technologies'];

                      return (
                        <div
                          key={item.id}
                          className={`timetable-card ${isActive ? 'timetable-card--active' : ''}`}
                        >
                          <div className="timetable-card__top">
                            <span
                              className="timetable-badge-subject"
                              style={{
                                background: subStyle.bg,
                                borderColor: subStyle.border,
                                color: subStyle.text,
                              }}
                            >
                              {item.subject.split('(')[0].trim()}
                            </span>
                            <span className={`status-badge status-badge--${isActive ? 'present' : item.isComplete ? 'navy' : 'neutral'}`}>
                              <span className="status-badge__dot" aria-hidden="true" />
                              {isActive ? 'Active' : item.isComplete ? 'Marked' : item.type}
                            </span>
                          </div>

                          <h4 className="timetable-card__title">{item.name}</h4>

                          <div className="timetable-card__meta">
                            <span className="timetable-meta-item">
                              <Clock size={13} />
                              {item.startTime ? `${item.startTime} – ${item.endTime || '11:00'}` : '10:00 – 11:00 AM'}
                            </span>
                            <span className="timetable-meta-item">
                              <MapPin size={13} />
                              {item.room}
                            </span>
                            <span className="timetable-meta-item">
                              <User size={13} />
                              {item.faculty}
                            </span>
                          </div>

                          {/* Attendance Completion Meter */}
                          <div className="timetable-completion">
                            <div className="timetable-completion__header">
                              <span className="timetable-completion__label">Attendance</span>
                              <span className="timetable-completion__pct">
                                {item.recordedCount} / {item.totalStudents} ({item.completionPct}%)
                              </span>
                            </div>
                            <div className="pct-bar-bg" style={{ height: '6px' }}>
                              <div
                                className={`pct-bar-fill ${item.completionPct >= 100 ? 'pct-bar-fill--green' : item.completionPct > 0 ? 'pct-bar-fill--amber' : ''}`}
                                style={{ width: `${Math.min(100, item.completionPct)}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="timetable-card__actions">
                            {!isActive && (
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                style={{ flex: 1, fontSize: '0.76rem', padding: '0.35rem 0.5rem' }}
                                onClick={() => onSwitchSession(item.id)}
                              >
                                Activate
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn--primary btn--sm"
                              style={{ flex: 1, fontSize: '0.76rem', padding: '0.35rem 0.5rem' }}
                              onClick={() => handleStartAttendance(item.id)}
                            >
                              <CheckCheck size={13} /> Mark
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              style={{ padding: '0.35rem 0.5rem' }}
                              onClick={() => handleViewRecords(item.id)}
                              title="View Session Records"
                            >
                              <ExternalLink size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Agenda Table View */
        <div className="panel" style={{ padding: 0 }}>
          <div className="records-table-container">
            <table className="directory-table" role="table">
              <thead>
                <tr>
                  <th>Session & Subject</th>
                  <th>Day & Schedule</th>
                  <th>Classroom</th>
                  <th>Faculty</th>
                  <th>Type</th>
                  <th>Attendance Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isActive = item.id === activeSession?.id;
                  const subStyle = SUBJECT_COLORS[item.subject] || SUBJECT_COLORS['React JS & Web Technologies'];

                  return (
                    <tr key={item.id} className={isActive ? 'table-row--highlight' : ''}>
                      <td>
                        <div style={{ fontWeight: 650 }}>{item.name}</div>
                        <span
                          className="timetable-badge-subject"
                          style={{
                            display: 'inline-block',
                            marginTop: '0.2rem',
                            background: subStyle.bg,
                            borderColor: subStyle.border,
                            color: subStyle.text,
                            fontSize: '0.72rem',
                          }}
                        >
                          {item.subject}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.dayName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {item.startTime ? `${item.startTime} – ${item.endTime}` : '10:00 – 11:00 AM'}
                        </div>
                      </td>
                      <td>
                        <span className="code-chip">{item.room}</span>
                      </td>
                      <td>{item.faculty}</td>
                      <td>
                        <span className="code-chip" style={{ fontSize: '0.74rem' }}>{item.type}</span>
                      </td>
                      <td>
                        <div>
                          <span className={`status-badge status-badge--${item.isComplete ? 'present' : isActive ? 'primary' : 'neutral'}`}>
                            {isActive ? 'Active' : item.isComplete ? 'Complete' : 'Pending'}
                          </span>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                            {item.recordedCount}/{item.totalStudents} marked
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-action-btns">
                          {!isActive && (
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => onSwitchSession(item.id)}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              Activate
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => handleStartAttendance(item.id)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            Mark
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetableView;

