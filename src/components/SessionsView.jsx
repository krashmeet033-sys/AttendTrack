import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  BookOpen,
  UserCheck,
  CheckCircle2,
  Edit2,
  Trash2,
  Archive,
  ArrowRight,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

/**
 * SessionsView Component
 *
 * Dedicated Attendance Session Management module (Page 06).
 * Replaces complex timetable scheduling with a focused, streamlined session
 * management workspace supporting:
 *  - Creating classroom/lecture sessions
 *  - Editing session details
 *  - Setting and switching active session context
 *  - Viewing session-specific attendance turnout and statistics
 *  - Deleting sessions with safe records verification
 *
 * @param {Object} props
 * @param {Array} props.sessions            - List of session objects from App state
 * @param {Object} props.activeSession      - The currently active session object
 * @param {Function} props.onSwitchSession  - Sets active session ID across the app
 * @param {Function} props.onAddSession     - Creates a new session in App state
 * @param {Function} props.onUpdateSession  - Updates existing session in App state
 * @param {Function} props.onDeleteSession  - Deletes a session with confirmation
 * @param {Array} props.records             - Attendance records from App state
 * @param {Array} props.students            - Enrolled students roster from App state
 * @param {Function} props.onNavigateTab    - Switches active tab (e.g. to 'add' or 'records')
 * @param {Function} [props.onSetRecordsFilter] - Sets status/session filter in records
 */
function SessionsView({
  sessions = [],
  activeSession,
  onSwitchSession = () => {},
  onAddSession = () => {},
  onUpdateSession = () => {},
  onDeleteSession = () => {},
  records = [],
  students = [],
  onNavigateTab = () => {},
  onSetRecordsFilter = () => {},
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'active' | 'completed' | 'upcoming'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: '',
    subject: 'React JS & Web Technologies',
    type: 'Lecture',
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    makeActive: true,
  });
  const [formErrors, setFormErrors] = useState({});

  const SUBJECT_OPTIONS = [
    'React JS & Web Technologies',
    'Data Structures & Algorithms (DSA)',
    'Database Management Systems (DBMS)',
    'Engineering Mathematics II',
    'Computer Organization & Architecture',
    'General Classroom Activity',
  ];

  // Derive session-specific metrics
  const sessionStats = sessions.map((sess) => {
    const sessRecords = records.filter((r) => r.sessionId === sess.id);
    const markedCount = sessRecords.length;
    const presentCount = sessRecords.filter((r) => r.status === 'Present').length;
    const absentCount = sessRecords.filter((r) => r.status === 'Absent').length;
    const lateCount = sessRecords.filter((r) => r.status === 'Late').length;
    const turnoutPct =
      students.length > 0 ? Math.round((markedCount / students.length) * 100) : 0;
    const attendancePct =
      markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0;
    const isActive = activeSession && activeSession.id === sess.id;

    return {
      ...sess,
      markedCount,
      presentCount,
      absentCount,
      lateCount,
      turnoutPct,
      attendancePct,
      isActive,
    };
  });

  const query = search.trim().toLowerCase();
  const filteredSessions = sessionStats.filter((sess) => {
    const matchesQuery =
      !query ||
      sess.name.toLowerCase().includes(query) ||
      (sess.subject && sess.subject.toLowerCase().includes(query)) ||
      (sess.description && sess.description.toLowerCase().includes(query));

    if (filterType === 'active') return matchesQuery && sess.isActive;
    if (filterType === 'completed') return matchesQuery && sess.status === 'completed';
    if (filterType === 'upcoming') return matchesQuery && sess.status === 'upcoming';
    return matchesQuery;
  });

  // Active session object with calculated stats
  const activeSessionData =
    sessionStats.find((s) => s.isActive) ||
    sessionStats[0] || {
      id: 'sess_1',
      name: 'General Classroom Session',
      subject: 'React JS & Web Technologies',
      date: new Date().toISOString().slice(0, 10),
      markedCount: 0,
      turnoutPct: 0,
      attendancePct: 0,
    };

  // Open Create Form
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      subject: 'React JS & Web Technologies',
      type: 'Lecture',
      date: new Date().toISOString().slice(0, 10),
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      makeActive: true,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (sess) => {
    setEditingSession(sess);
    setFormData({
      name: sess.name || '',
      subject: sess.subject || 'React JS & Web Technologies',
      type: sess.type || 'Lecture',
      date: sess.date || new Date().toISOString().slice(0, 10),
      startTime: sess.startTime || '10:00',
      endTime: sess.endTime || '11:00',
      description: sess.description || '',
      makeActive: false,
    });
    setFormErrors({});
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Session title or lecture topic is required.';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Session title must be at least 3 characters.';
    }
    if (!formData.date) {
      errs.date = 'Session date is required.';
    }
    return errs;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    if (editingSession) {
      onUpdateSession({
        ...editingSession,
        name: formData.name.trim(),
        subject: formData.subject,
        type: formData.type,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description.trim(),
      });
      setEditingSession(null);
    } else {
      const newSession = {
        id: `sess_${Date.now()}`,
        name: formData.name.trim(),
        subject: formData.subject,
        type: formData.type,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description.trim(),
        status: 'active',
        isArchived: false,
        createdAt: new Date().toISOString(),
      };
      onAddSession(newSession);
      if (formData.makeActive) {
        onSwitchSession(newSession.id);
      }
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="sessions-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <section className="welcome">
        <div className="welcome__main">
          <span className="welcome__greeting">Academic Context & Session Management</span>
          <h2 className="welcome__title">Attendance Sessions</h2>
          <p className="welcome__sub">
            Organize lectures, tutorials and labs. Set the active session context for attendance marking and analytics.
          </p>
          <div className="welcome__meta">
            <span className="welcome__chip">
              <CalendarDays size={14} aria-hidden="true" />
              {sessions.length} Session{sessions.length === 1 ? '' : 's'} Created
            </span>
            <span className="welcome__chip">
              <UserCheck size={14} aria-hidden="true" />
              Active Context: {activeSessionData.name}
            </span>
          </div>
        </div>

        <div className="welcome__actions">
          <button type="button" className="btn btn--primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            Create Session
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onNavigateTab('add')}
          >
            Mark Active Session
          </button>
        </div>
      </section>

      {/* Active Session Spotlight Banner */}
      <section className="active-session-spotlight panel" style={{ borderLeft: '4px solid var(--color-primary-main)' }}>
        <div className="panel__header" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="live-indicator-dot" aria-hidden="true" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-main)' }}>
                CURRENT ACTIVE SESSION
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 750, color: 'var(--color-text-main)', margin: '0 0 0.35rem' }}>
              {activeSessionData.name}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <span className="active-session-chip">
                <BookOpen size={13} />
                {activeSessionData.subject || 'React JS & Web Technologies'}
              </span>
              <span className="active-session-chip">
                <CalendarDays size={13} />
                {activeSessionData.date}
              </span>
              {activeSessionData.startTime && (
                <span className="active-session-chip">
                  <Clock size={13} />
                  {activeSessionData.startTime} – {activeSessionData.endTime || ''}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => onNavigateTab('add')}
            >
              <Plus size={14} /> Mark Attendance
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                onSetRecordsFilter('ALL');
                onNavigateTab('records');
              }}
            >
              View Records
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => handleOpenEdit(activeSessionData)}
            >
              <Edit2 size={14} /> Edit
            </button>
          </div>
        </div>

        <div className="panel__body" style={{ paddingTop: '0.5rem' }}>
          {activeSessionData.description && (
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-soft)', margin: '0 0 0.85rem' }}>
              <strong>Syllabus Scope:</strong> {activeSessionData.description}
            </p>
          )}

          {/* Quick Metrics Bar for Active Session */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', padding: '0.75rem', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Recorded Turnout</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {activeSessionData.markedCount} / {students.length}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Present</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-present)' }}>
                {activeSessionData.presentCount || 0}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Absent</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-absent)' }}>
                {activeSessionData.absentCount || 0}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Late</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-late)' }}>
                {activeSessionData.lateCount || 0}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Attendance Rate</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-main)' }}>
                {activeSessionData.attendancePct}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Management Table / List */}
      <section className="panel">
        <div className="panel__header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="panel__title">All Classroom Sessions</h3>
            <p className="panel__subtitle">
              Manage lecture history and switch active context across the application
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div className="search-bar" style={{ minWidth: '220px' }}>
              <Search size={15} className="search-bar__icon" aria-hidden="true" />
              <input
                type="search"
                className="search-bar__input"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs" role="tablist">
              {[
                { key: 'ALL', label: 'All Sessions' },
                { key: 'active', label: 'Active' },
                { key: 'completed', label: 'Completed' },
                { key: 'upcoming', label: 'Upcoming' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`filter-tab ${filterType === tab.key ? 'filter-tab--active' : ''}`}
                  onClick={() => setFilterType(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="panel__body" style={{ padding: '0.5rem 1.25rem 1.25rem' }}>
          {filteredSessions.length === 0 ? (
            <div className="chart-empty" style={{ padding: '2rem 1rem' }}>
              <span className="chart-empty__icon">
                <CalendarDays size={28} />
              </span>
              <h4 className="chart-empty__title">No matching sessions found</h4>
              <p className="chart-empty__text">
                {search ? `No sessions match "${search}".` : 'Create your first classroom lecture session above.'}
              </p>
            </div>
          ) : (
            <div className="sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredSessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`session-card ${sess.isActive ? 'session-card--active' : ''}`}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '1rem 1.15rem',
                    background: sess.isActive ? 'rgba(124, 58, 237, 0.04)' : 'var(--color-surface)',
                    border: sess.isActive ? '1px solid var(--color-primary-main)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: sess.isActive ? '0 4px 14px -2px rgba(124, 58, 237, 0.12)' : 'var(--shadow-sm)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {/* Left Column: Title & Subject Details */}
                  <div style={{ flex: '1 1 320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--color-primary-main)', fontWeight: 700, fontSize: '0.7rem' }}>
                        {sess.subject || 'Curriculum'}
                      </span>
                      {sess.isActive && (
                        <span className="status-badge status-badge--present" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                          <CheckCircle2 size={11} /> Active Now
                        </span>
                      )}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {sess.type || 'Lecture'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-main)', margin: '0 0 0.25rem' }}>
                      {sess.name}
                    </h4>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <span>📅 {sess.date}</span>
                      {sess.startTime && <span>⏰ {sess.startTime} – {sess.endTime}</span>}
                      {sess.description && (
                        <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📝 {sess.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Attendance Turnout Meter */}
                  <div style={{ flex: '0 1 210px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      <span>Roster Turnout ({sess.markedCount}/{students.length})</span>
                      <strong>{sess.turnoutPct}%</strong>
                    </div>
                    <div className="active-session-progress-bar" style={{ height: '6px' }}>
                      <div
                        className="active-session-progress-fill"
                        style={{
                          width: `${sess.turnoutPct}%`,
                          backgroundColor: sess.turnoutPct >= 80 ? 'var(--color-present)' : 'var(--color-primary-main)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                      <strong style={{ color: 'var(--color-primary-main)' }}>Attendance: {sess.attendancePct}%</strong>
                      <span>P:{sess.presentCount} · A:{sess.absentCount} · L:{sess.lateCount}</span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {!sess.isActive ? (
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => onSwitchSession(sess.id)}
                        title="Set this session as the active context for attendance marking"
                      >
                        Set Active
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => onNavigateTab('add')}
                      >
                        Mark Roster
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => {
                        onSetRecordsFilter('ALL');
                        onNavigateTab('records');
                      }}
                      title="Inspect attendance records for this session"
                    >
                      Records
                    </button>

                    <button
                      type="button"
                      className="card-icon-btn"
                      onClick={() => handleOpenEdit(sess)}
                      title="Edit session details"
                      aria-label={`Edit ${sess.name}`}
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      className="card-icon-btn card-icon-btn--danger"
                      onClick={() => onDeleteSession(sess.id)}
                      title="Delete this session"
                      aria-label={`Delete ${sess.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create / Edit Session Modal */}
      {(isCreateModalOpen || editingSession) && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="session-modal-title">
          <div className="modal-card modal-card--form">
            <div className="modal-card__header">
              <div>
                <h3 className="modal-card__title" id="session-modal-title">
                  {editingSession ? 'Edit Session Details' : 'Create Classroom Attendance Session'}
                </h3>
                <p className="modal-card__subtitle">
                  {editingSession
                    ? 'Update session information. Existing student records remain safely bound.'
                    : 'Schedule a new lecture, tutorial, or lab session for attendance tracking.'}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingSession(null);
                }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="settings-form" noValidate>
              <div className="form-group">
                <label htmlFor="session-name-input" className="form-label">
                  Session Title / Lecture Topic <span style={{ color: 'var(--color-absent)' }}>*</span>
                </label>
                <input
                  id="session-name-input"
                  type="text"
                  className={`form-input ${formErrors.name ? 'form-input--error' : ''}`}
                  placeholder="e.g. Lecture 25 — Advanced Context & State"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  autoFocus
                />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="session-subject-select" className="form-label">Course Subject</label>
                  <select
                    id="session-subject-select"
                    className="form-select"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    {SUBJECT_OPTIONS.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="session-type-select" className="form-label">Session Type</label>
                  <select
                    id="session-type-select"
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Practical / Lab">Practical / Lab</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label htmlFor="session-date-input" className="form-label">Date</label>
                  <input
                    id="session-date-input"
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="session-start-time" className="form-label">Start Time</label>
                  <input
                    id="session-start-time"
                    type="time"
                    className="form-input"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="session-end-time" className="form-label">End Time</label>
                  <input
                    id="session-end-time"
                    type="time"
                    className="form-input"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="session-desc-input" className="form-label">Syllabus Scope / Notes</label>
                <textarea
                  id="session-desc-input"
                  className="form-textarea"
                  rows={2}
                  placeholder="Key concepts or syllabus topics covered in this session..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {!editingSession && (
                <div className="form-checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.4rem 0' }}>
                  <input
                    id="make-active-checkbox"
                    type="checkbox"
                    checked={formData.makeActive}
                    onChange={(e) => setFormData({ ...formData, makeActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="make-active-checkbox" style={{ fontSize: '0.84rem', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                    Set as active session immediately upon creation
                  </label>
                </div>
              )}

              <div className="modal-card__actions" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingSession(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  {editingSession ? 'Save Changes' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionsView;

