import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Plus,
  RotateCcw,
  Info,
  UserRound,
  Hash,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  CheckCheck,
  Search,
  FileText,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import AttendanceReviewModal from './AttendanceReviewModal.jsx';

/**
 * AttendanceForm Component
 *
 * A fully controlled form (every input is bound to useState) that collects a
 * student's name, roll number and attendance status.
 *
 * Offers two workflows:
 *  1. Single Student Entry (Default): controlled inputs with duplicate validation,
 *     suggestions chips and reset controls.
 *  2. Full Class Session Attendance (Bulk Mode): rapid class roster attendance
 *     marking with 1-click "Mark All Present", individual toggles, and batch saving.
 *
 * @param {Object} props
 * @param {Function} props.onAddRecord            - Adds the new record to App state.
 * @param {Function} [props.onAddMultipleRecords] - Adds multiple records to App state.
 * @param {string[]} props.existingRollNumbers    - Roll numbers already recorded in this session (duplicate guard).
 * @param {Array} [props.students]                - Enrolled students roster for suggestions.
 * @param {string} [props.sessionName]            - Active session name.
 * @param {Object} [props.activeSession]          - Active session object.
 * @param {Array} [props.sessions]                - Available sessions list.
 * @param {Function} [props.onSwitchSession]      - Handler to switch active session.
 */
function AttendanceForm({
  onAddRecord,
  onAddMultipleRecords,
  existingRollNumbers = [],
  students = [],
  sessionName = 'Lecture Session 24 — React Hooks & Forms',
  activeSession,
  sessions = [],
  onSwitchSession,
}) {
  const [entryMode, setEntryMode] = useState('single'); // 'single' | 'bulk'

  // --- Single Form state ----------------------------------------------------
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [status, setStatus] = useState('Present');
  const [errors, setErrors] = useState({});

  // --- Bulk & Advanced Workspace state --------------------------------------
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');
  const [pendingReviewRecords, setPendingReviewRecords] = useState([]);

  const [bulkStatusMap, setBulkStatusMap] = useState(() => {
    const map = {};
    students.forEach((s) => {
      map[s.rollNumber] = 'Present';
    });
    return map;
  });

  const nameInputRef = useRef(null);

  // The three attendance statuses required by the problem statement.
  const statusOptions = [
    { value: 'Present', label: 'Present', desc: 'Attended class', className: 'present' },
    { value: 'Absent', label: 'Absent', desc: 'Missed class', className: 'absent' },
    { value: 'Late', label: 'Late', desc: 'Arrived late', className: 'late' },
  ];

  /**
   * Filter available directory students who have not yet been marked in this session.
   */
  const unrecordedStudents = students.filter(
    (s) =>
      !existingRollNumbers.some(
        (roll) => String(roll).trim().toLowerCase() === String(s.rollNumber).trim().toLowerCase()
      )
  );

  /**
   * Quick fill student from suggestion chip.
   */
  const handleSelectSuggestion = (student) => {
    setName(student.name);
    setRollNumber(student.rollNumber);
    setErrors({});
  };

  /**
   * Validates all inputs and returns an errors object.
   * An empty object means the form is valid.
   */
  const validate = () => {
    const nextErrors = {};
    const trimmedName = name.trim();
    const trimmedRoll = rollNumber.trim();

    if (!trimmedName) {
      nextErrors.name = 'Student name is required.';
    } else if (trimmedName.length < 2) {
      nextErrors.name = 'Student name must be at least 2 characters.';
    }

    if (!trimmedRoll) {
      nextErrors.rollNumber = 'Roll number is required.';
    } else if (trimmedRoll.length < 2) {
      nextErrors.rollNumber = 'Roll number must be at least 2 characters.';
    } else if (
      existingRollNumbers.some(
        (roll) => String(roll).trim().toLowerCase() === trimmedRoll.toLowerCase()
      )
    ) {
      nextErrors.rollNumber = `Roll number "${trimmedRoll}" already exists in the records for ${activeSession ? activeSession.name : sessionName}.`;
    }

    if (!['Present', 'Absent', 'Late'].includes(status)) {
      nextErrors.status = 'Please select an attendance status.';
    }

    return nextErrors;
  };

  /** Clears every field and error, then returns focus to the first input. */
  const resetForm = () => {
    setName('');
    setRollNumber('');
    setStatus('Present');
    setErrors({});
    if (nameInputRef.current) nameInputRef.current.focus();
  };

  /** Handles form submission (event handling + validation). */
  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onAddRecord({
      id: `std_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      status,
      recordedAt: new Date().toISOString(),
      sessionId: activeSession ? activeSession.id : undefined,
      sessionName: activeSession ? activeSession.name : sessionName,
      sessionDate: activeSession ? activeSession.date : undefined,
    });

    resetForm();
  };

  // Bulk actions
  const handleMarkAllBulk = (targetStatus) => {
    setBulkStatusMap((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s.rollNumber] = targetStatus;
      });
      return next;
    });
  };

  const handleSetStudentStatus = (roll, newStatus) => {
    setBulkStatusMap((prev) => ({
      ...prev,
      [roll]: newStatus,
    }));
  };

  const handleSaveBulkAttendance = (e) => {
    e.preventDefault();
    const recordsToSave = [];
    const now = new Date().toISOString();

    students.forEach((student, index) => {
      const alreadyMarked = existingRollNumbers.some(
        (r) => String(r).trim().toLowerCase() === String(student.rollNumber).trim().toLowerCase()
      );
      if (!alreadyMarked) {
        recordsToSave.push({
          id: `std_${Date.now()}_${index}`,
          name: student.name,
          rollNumber: student.rollNumber,
          status: bulkStatusMap[student.rollNumber] || 'Present',
          recordedAt: now,
          sessionId: activeSession ? activeSession.id : undefined,
          sessionName: activeSession ? activeSession.name : sessionName,
          sessionDate: activeSession ? activeSession.date : undefined,
        });
      }
    });

    if (recordsToSave.length > 0) {
      if (onAddMultipleRecords) {
        onAddMultipleRecords(recordsToSave);
      } else {
        recordsToSave.forEach((r) => onAddRecord(r));
      }
    }
    setEntryMode('single');
  };

  const bulkPresentCount = Object.values(bulkStatusMap).filter((s) => s === 'Present').length;
  const bulkAbsentCount = Object.values(bulkStatusMap).filter((s) => s === 'Absent').length;
  const bulkLateCount = Object.values(bulkStatusMap).filter((s) => s === 'Late').length;

  const totalEnrolled = students.length || 1;
  const recordedCount = existingRollNumbers.length;
  const sessionTurnoutPct = Math.min(100, Math.round((recordedCount / totalEnrolled) * 100));

  const handleInitiateBulkReview = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const recordsToSave = [];
    const now = new Date().toISOString();

    students.forEach((student, index) => {
      const alreadyMarked = existingRollNumbers.some(
        (r) => String(r).trim().toLowerCase() === String(student.rollNumber).trim().toLowerCase()
      );
      if (!alreadyMarked) {
        recordsToSave.push({
          id: `std_${Date.now()}_${index}`,
          name: student.name,
          rollNumber: student.rollNumber,
          status: bulkStatusMap[student.rollNumber] || 'Present',
          recordedAt: now,
          sessionId: activeSession ? activeSession.id : undefined,
          sessionName: activeSession ? activeSession.name : sessionName,
          sessionDate: activeSession ? activeSession.date : undefined,
        });
      }
    });

    if (recordsToSave.length === 0) return;
    setPendingReviewRecords(recordsToSave);
    setIsReviewOpen(true);
  };

  const handleConfirmReview = () => {
    if (pendingReviewRecords.length > 0) {
      if (onAddMultipleRecords) {
        onAddMultipleRecords(pendingReviewRecords);
      } else {
        pendingReviewRecords.forEach((r) => onAddRecord(r));
      }
    }
    setIsReviewOpen(false);
    setPendingReviewRecords([]);
    setEntryMode('single');
  };

  const handleUpdateReviewStatus = (rollNumber, newStatus) => {
    setPendingReviewRecords((prev) =>
      prev.map((r) => (r.rollNumber === rollNumber ? { ...r, status: newStatus } : r))
    );
    setBulkStatusMap((prev) => ({
      ...prev,
      [rollNumber]: newStatus,
    }));
  };

  const filteredBulkStudents = students.filter(
    (s) =>
      !bulkSearch ||
      s.name.toLowerCase().includes(bulkSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(bulkSearch.toLowerCase())
  );

  return (
    <>
      <form className="panel" onSubmit={handleSubmit} noValidate>
        <div className="panel__header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="panel__title">Mark Student Attendance</h2>
            <p className="panel__subtitle">
              Records update the dashboard instantly after submission.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Mode Switcher */}
            <div className="filter-tabs" role="tablist" aria-label="Attendance entry modes">
              <button
                type="button"
                role="tab"
                aria-selected={entryMode === 'single'}
                className={`filter-tab ${entryMode === 'single' ? 'filter-tab--active' : ''}`}
                onClick={() => setEntryMode('single')}
              >
                <UserRound size={14} /> Single Entry
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={entryMode === 'bulk'}
                className={`filter-tab ${entryMode === 'bulk' ? 'filter-tab--active' : ''}`}
                onClick={() => setEntryMode('bulk')}
              >
                <Users size={14} /> Full Class Session
              </button>
            </div>

            {sessions && sessions.length > 0 && onSwitchSession ? (
              <div className="session-quick-select" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={13} aria-hidden="true" style={{ color: 'var(--color-primary)' }} />
                <select
                  id="form-session-select"
                  className="sort-field__select"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', height: 'auto', borderRadius: 'var(--radius-sm)' }}
                  value={activeSession ? activeSession.id : ''}
                  onChange={(e) => onSwitchSession(e.target.value)}
                  aria-label="Active attendance session"
                >
                  {sessions.filter((s) => !s.isArchived).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.date})
                    </option>
                  ))}
                </select>
              </div>
            ) : (activeSession?.name || sessionName) ? (
              <span className="welcome__chip" style={{ fontSize: '0.78rem' }}>
                <Calendar size={13} aria-hidden="true" />
                {activeSession?.name || sessionName}
              </span>
            ) : null}
          </div>
        </div>

        <div className="panel__body">
          {/* Active Session Turnout Meter */}
          <div className="session-progress-strip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.95rem', background: 'var(--color-surface)', borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} className="text-present" />
              <span style={{ fontSize: '0.82rem', fontWeight: 650 }}>
                Session Turnout: <strong>{recordedCount} of {totalEnrolled} students recorded</strong> ({sessionTurnoutPct}%)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="pct-bar-bg" style={{ width: '110px', height: '6px' }}>
                <div
                  className={`pct-bar-fill ${sessionTurnoutPct >= 100 ? 'pct-bar-fill--green' : sessionTurnoutPct > 0 ? 'pct-bar-fill--amber' : ''}`}
                  style={{ width: `${sessionTurnoutPct}%` }}
                />
              </div>
            </div>
          </div>
        {entryMode === 'single' ? (
          <>
            {/* Quick Directory Suggestions if available */}
            {unrecordedStudents.length > 0 && (
              <div className="suggestions-bar">
                <span className="suggestions-bar__label">
                  <Sparkles size={13} /> Quick Select Enrolled Student:
                </span>
                <div className="suggestions-chips">
                  {unrecordedStudents.slice(0, 5).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => handleSelectSuggestion(s)}
                      title={`Select ${s.name} (${s.rollNumber})`}
                    >
                      <span className="suggestion-chip__name">{s.name}</span>
                      <span className="suggestion-chip__roll">{s.rollNumber}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-grid">
              {/* Student Name */}
              <div className={`field ${errors.name ? 'field--error' : ''}`}>
                <label className="field__label" htmlFor="student-name">
                  <UserRound size={14} />
                  Student Name <span className="field__required">*</span>
                </label>
                <input
                  id="student-name"
                  ref={nameInputRef}
                  type="text"
                  className="field__input"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'student-name-error' : undefined}
                />
                {errors.name && (
                  <span className="field__error" id="student-name-error" role="alert">
                    <AlertCircle size={13} />
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Roll Number */}
              <div className={`field ${errors.rollNumber ? 'field--error' : ''}`}>
                <label className="field__label" htmlFor="student-roll">
                  <Hash size={14} />
                  Roll Number <span className="field__required">*</span>
                </label>
                <input
                  id="student-roll"
                  type="text"
                  className="field__input"
                  placeholder="e.g. 24CSE001"
                  value={rollNumber}
                  onChange={(event) => setRollNumber(event.target.value)}
                  aria-invalid={Boolean(errors.rollNumber)}
                  aria-describedby={errors.rollNumber ? 'student-roll-error' : undefined}
                />
                {errors.rollNumber && (
                  <span className="field__error" id="student-roll-error" role="alert">
                    <AlertCircle size={13} />
                    {errors.rollNumber}
                  </span>
                )}
              </div>

              {/* Attendance Status */}
              <div className="field field--full">
                <span className="field__label">
                  Attendance Status <span className="field__required">*</span>
                </span>
                <div className="status-group" role="radiogroup" aria-label="Attendance status">
                  {statusOptions.map((option) => {
                    const isActive = status === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        className={`status-option status-option--${option.className} ${
                          isActive ? 'status-option--active' : ''
                        }`}
                        onClick={() => setStatus(option.value)}
                      >
                        <span className="status-option__dot" aria-hidden="true" />
                        <span className="status-option__text">
                          <span className="status-option__label">{option.label}</span>
                          <span className="status-option__desc">{option.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.status && (
                  <span className="field__error" role="alert">
                    <AlertCircle size={13} />
                    {errors.status}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="submit" className="btn btn--primary" title="Save Attendance Record">
                <Plus size={16} />
                <span>Save Attendance Record</span>
                <span style={{ display: 'none' }}>Mark Attendance</span>
              </button>
              <button type="button" className="btn btn--ghost" onClick={resetForm} title="Clear Form">
                <RotateCcw size={15} />
                <span>Clear Form</span>
                <span style={{ display: 'none' }}>Reset Form</span>
              </button>
            </div>

            <p className="form-note">
              <Info size={15} />
              <span>
                Student Name and Roll Number are mandatory. A roll number can only be recorded once —
                duplicates are rejected automatically.
              </span>
            </p>
          </>
        ) : (
          <div className="bulk-attendance-workspace">
            <div className="bulk-toolbar" style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              background: 'var(--color-surface-alt)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>Quick Actions:</span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => handleMarkAllBulk('Present')}
                >
                  <CheckCheck size={14} className="text-present" /> Mark All Present
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => handleMarkAllBulk('Absent')}
                >
                  Mark All Absent
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => handleMarkAllBulk('Late')}
                >
                  Mark All Late
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-field" style={{ width: '200px' }}>
                  <span className="search-field__icon" aria-hidden="true" style={{ left: '8px' }}>
                    <Search size={14} />
                  </span>
                  <input
                    type="search"
                    className="search-field__input"
                    placeholder="Search roster…"
                    value={bulkSearch}
                    onChange={(e) => setBulkSearch(e.target.value)}
                    style={{ height: '30px', fontSize: '0.78rem', paddingLeft: '28px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.76rem' }}>
                  <span className="status-badge status-badge--present">
                    P: {bulkPresentCount}
                  </span>
                  <span className="status-badge status-badge--absent">
                    A: {bulkAbsentCount}
                  </span>
                  <span className="status-badge status-badge--late">
                    L: {bulkLateCount}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 1rem' }}>Student</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Roll Number</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Session Status</th>
                    <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Attendance Status Option</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBulkStudents.map((student) => {
                    const isAlreadyMarked = existingRollNumbers.some(
                      (r) => String(r).trim().toLowerCase() === String(student.rollNumber).trim().toLowerCase()
                    );
                    const currentStatus = bulkStatusMap[student.rollNumber] || 'Present';

                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: '600' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span className="attendance-card__avatar" aria-hidden="true" style={{ width: '28px', height: '28px', fontSize: '0.72rem' }}>
                              {student.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>
                          {student.rollNumber}
                        </td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          {isAlreadyMarked ? (
                            <span className="status-badge status-badge--present" style={{ fontSize: '0.72rem' }}>
                              <CheckCircle2 size={12} /> Already Recorded
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Pending Save
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            {['Present', 'Absent', 'Late'].map((st) => (
                              <button
                                key={st}
                                type="button"
                                className={`btn btn--sm ${
                                  currentStatus === st
                                    ? st === 'Present'
                                      ? 'btn--primary'
                                      : st === 'Absent'
                                      ? 'btn--soft-danger'
                                      : 'btn--ghost'
                                    : 'btn--ghost'
                                }`}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.55rem',
                                  background: currentStatus === st && st === 'Present' ? 'var(--color-present)' : undefined,
                                  borderColor: currentStatus === st ? 'transparent' : undefined,
                                }}
                                onClick={() => handleSetStudentStatus(student.rollNumber, st)}
                                disabled={isAlreadyMarked}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setEntryMode('single')}
              >
                Switch to Single Entry
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleSaveBulkAttendance}
                disabled={students.length === 0}
                title="Save attendance immediately"
              >
                <CheckCircle2 size={15} /> Quick Save
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleInitiateBulkReview}
                disabled={students.length === 0}
              >
                <CheckCheck size={16} /> Review & Save Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </form>

    {/* Attendance Pre-Submission Review Modal */}
    <AttendanceReviewModal
      isOpen={isReviewOpen}
      onClose={() => setIsReviewOpen(false)}
      onConfirm={handleConfirmReview}
      pendingRecords={pendingReviewRecords}
      sessionName={activeSession?.name || sessionName}
      onUpdateStatus={handleUpdateReviewStatus}
    />
  </>
  );
}

export default AttendanceForm;
