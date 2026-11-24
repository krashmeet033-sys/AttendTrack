import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Search,
  Save,
  CheckCheck,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  X,
  BookOpen,
} from 'lucide-react';

/**
 * LiveSessionWorkspace Component
 *
 * Implements Priority 2: Dedicated Live Classroom Roll Check Workspace.
 * Transforms routine attendance logging into an interactive, real-time classroom workflow.
 *
 * Features:
 *  - Real-time lecture stopwatch timer (Play/Pause/Reset)
 *  - Active lecture metadata (Subject, Room, Faculty, Time, Description)
 *  - Live roster with tactile one-click Present, Absent, and Late controls
 *  - Real-time completion progress meter
 *  - In-session instant search
 *  - "Mark Remaining Present" batch shortcut
 *  - "Save & Complete Session" with unrecorded warning confirmation
 *
 * @param {Object} props
 * @param {Object} props.activeSession            - Active classroom session
 * @param {Array} props.students                  - Enrolled class roster
 * @param {Array} props.existingRecords           - Records already saved in App state
 * @param {Function} props.onSaveSessionRecords   - Callback saving batch records
 * @param {Function} props.onClose                - Switch back or navigate
 * @param {Function} props.onOpenStudentProfile   - Clickable student profile preview
 */
function LiveSessionWorkspace({
  activeSession,
  students = [],
  existingRecords = [],
  onSaveSessionRecords = () => {},
  onClose = () => {},
  onOpenStudentProfile = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Map student rollNumber -> status ('Present' | 'Absent' | 'Late' | null)
  const [sessionRosterMap, setSessionRosterMap] = useState(() => {
    const map = {};
    const sessId = activeSession?.id;

    students.forEach((s) => {
      // Check if student already has a record in this active session
      const existing = existingRecords.find(
        (r) =>
          String(r.rollNumber).trim().toLowerCase() === String(s.rollNumber).trim().toLowerCase() &&
          r.sessionId === sessId
      );
      map[s.rollNumber] = existing ? existing.status : null;
    });
    return map;
  });

  // Stopwatch timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Turnout calculations
  const totalStudents = students.length || 1;
  const recordedCount = Object.values(sessionRosterMap).filter((status) => status !== null).length;
  const presentCount = Object.values(sessionRosterMap).filter((s) => s === 'Present').length;
  const absentCount = Object.values(sessionRosterMap).filter((s) => s === 'Absent').length;
  const lateCount = Object.values(sessionRosterMap).filter((s) => s === 'Late').length;
  const unrecordedCount = totalStudents - recordedCount;
  const progressPct = Math.min(100, Math.round((recordedCount / totalStudents) * 100));

  const handleSetStatus = (rollNumber, newStatus) => {
    setSessionRosterMap((prev) => ({
      ...prev,
      [rollNumber]: prev[rollNumber] === newStatus ? null : newStatus,
    }));
  };

  const handleMarkAllPresent = () => {
    setSessionRosterMap((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s.rollNumber] = 'Present';
      });
      return next;
    });
  };

  const handleMarkRemainingPresent = () => {
    setSessionRosterMap((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (!next[s.rollNumber]) {
          next[s.rollNumber] = 'Present';
        }
      });
      return next;
    });
  };

  const handleInitiateFinish = () => {
    if (unrecordedCount > 0) {
      setShowWarningModal(true);
    } else {
      executeSaveSession(false);
    }
  };

  const executeSaveSession = (markRemainingAbsent = false) => {
    const now = new Date().toISOString();
    const recordsToSave = [];

    students.forEach((student) => {
      let finalStatus = sessionRosterMap[student.rollNumber];
      if (!finalStatus && markRemainingAbsent) {
        finalStatus = 'Absent';
      }

      if (finalStatus) {
        recordsToSave.push({
          id: `rec_${Date.now()}_${student.rollNumber}`,
          studentId: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          status: finalStatus,
          sessionId: activeSession ? activeSession.id : 'sess_1',
          sessionName: activeSession ? activeSession.name : 'Live Classroom Session',
          sessionDate: activeSession ? activeSession.date : now.slice(0, 10),
          recordedAt: now,
        });
      }
    });

    onSaveSessionRecords(recordsToSave);
    setShowWarningModal(false);
    onClose();
  };

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <section className="live-session-workspace" aria-label="Live Classroom Attendance Session">
      {/* 1. Live Session Header Bar */}
      <div
        className="live-session-header"
        style={{
          background: 'linear-gradient(135deg, #18152E 0%, #241D44 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          border: '1px solid rgba(124, 58, 237, 0.35)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          marginBottom: '1.25rem',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10B981',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Live Lecture in Progress
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                {activeSession ? `${activeSession.room || 'Lab 402'} · ${activeSession.startTime || '10:00'} - ${activeSession.endTime || '11:00'}` : 'Lab 402'}
              </span>
            </div>

            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              {activeSession ? activeSession.name : 'Lecture Session 24 — React Hooks & Forms'}
            </h2>
            <div style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '0.25rem' }}>
              <BookOpen size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              {activeSession?.subject || 'React JS & Web Technologies'} · {activeSession?.faculty || 'Prof. A. Sharma'}
            </div>
          </div>

          {/* Live Timer Stopwatch Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(11, 10, 26, 0.6)',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(124, 58, 237, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={16} style={{ color: '#A78BFA' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                {formatTimer(timerSeconds)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsTimerRunning((prev) => !prev)}
                title={isTimerRunning ? 'Pause lecture timer' : 'Resume lecture timer'}
                style={{ width: '30px', height: '30px', color: '#ffffff' }}
              >
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setTimerSeconds(0);
                  setIsTimerRunning(false);
                }}
                title="Reset lecture timer"
                style={{ width: '30px', height: '30px', color: '#ffffff' }}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Completion Progress Bar Strip */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.84rem' }}>
            <span style={{ fontWeight: 650 }}>
              Roll Check Progress: <strong>{recordedCount} of {totalStudents} Students Evaluated</strong> ({progressPct}%)
            </span>
            <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.78rem' }}>
              <span style={{ color: '#10B981' }}><strong>{presentCount}</strong> Present</span>
              <span style={{ color: '#EF4444' }}><strong>{absentCount}</strong> Absent</span>
              <span style={{ color: '#F59E0B' }}><strong>{lateCount}</strong> Late</span>
              {unrecordedCount > 0 && (
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}><strong>{unrecordedCount}</strong> Pending</span>
              )}
            </div>
          </div>

          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPct}%`,
                background: progressPct === 100 ? '#10B981' : 'linear-gradient(90deg, #7C3AED, #A78BFA)',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Live Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="search"
            className="field__input"
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
            placeholder="Search student during roll check..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleMarkRemainingPresent}
            title="Mark remaining unevaluated students as Present"
          >
            <Sparkles size={14} className="text-brand" />
            Mark Remaining Present
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleMarkAllPresent}
            title="Mark all enrolled students as Present"
          >
            <CheckCheck size={14} />
            Mark All Present
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleInitiateFinish}
            style={{ fontWeight: 650 }}
          >
            <Save size={14} />
            Save &amp; Complete Session
          </button>
        </div>
      </div>

      {/* 4. Live Student Roster Grid */}
      <div
        className="live-roster-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {filteredStudents.map((student) => {
          const currentStatus = sessionRosterMap[student.rollNumber];
          const initials = student.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();

          return (
            <div
              key={student.id}
              className={`live-student-card ${currentStatus ? `live-student-card--${currentStatus.toLowerCase()}` : ''}`}
              style={{
                background: 'var(--color-surface)',
                border: currentStatus ? `1.5px solid var(--color-${currentStatus.toLowerCase()})` : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                boxShadow: currentStatus ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
              }}
            >
              {/* Student Identity */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1 }}
                onClick={() => onOpenStudentProfile(student)}
                title="Click to view complete student profile"
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: currentStatus === 'Present' ? 'var(--color-present)' : currentStatus === 'Absent' ? 'var(--color-absent)' : currentStatus === 'Late' ? 'var(--color-late)' : 'var(--color-surface-alt)',
                    color: currentStatus ? '#ffffff' : 'var(--color-text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    {student.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {student.rollNumber}
                  </div>
                </div>
              </div>

              {/* Three Tactile One-Tap Buttons */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleSetStatus(student.rollNumber, 'Present')}
                  className={`btn btn--sm ${currentStatus === 'Present' ? 'btn--present-active' : 'btn--ghost'}`}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    background: currentStatus === 'Present' ? 'var(--color-present)' : undefined,
                    color: currentStatus === 'Present' ? '#ffffff' : undefined,
                    borderColor: currentStatus === 'Present' ? 'var(--color-present)' : undefined,
                  }}
                  title="Mark Present"
                >
                  P
                </button>

                <button
                  type="button"
                  onClick={() => handleSetStatus(student.rollNumber, 'Absent')}
                  className={`btn btn--sm ${currentStatus === 'Absent' ? 'btn--absent-active' : 'btn--ghost'}`}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    background: currentStatus === 'Absent' ? 'var(--color-absent)' : undefined,
                    color: currentStatus === 'Absent' ? '#ffffff' : undefined,
                    borderColor: currentStatus === 'Absent' ? 'var(--color-absent)' : undefined,
                  }}
                  title="Mark Absent"
                >
                  A
                </button>

                <button
                  type="button"
                  onClick={() => handleSetStatus(student.rollNumber, 'Late')}
                  className={`btn btn--sm ${currentStatus === 'Late' ? 'btn--late-active' : 'btn--ghost'}`}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    background: currentStatus === 'Late' ? 'var(--color-late)' : undefined,
                    color: currentStatus === 'Late' ? '#ffffff' : undefined,
                    borderColor: currentStatus === 'Late' ? 'var(--color-late)' : undefined,
                  }}
                  title="Mark Late"
                >
                  L
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Warning Modal for Unrecorded Students */}
      {showWarningModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <AlertTriangle size={20} className="text-late" />
              <h3 className="modal-card__title" style={{ margin: 0 }}>
                Unrecorded Students Remaining
              </h3>
            </div>
            <p className="modal-card__message" style={{ margin: '0 0 1.25rem 0' }}>
              There are <strong>{unrecordedCount} student(s)</strong> whose attendance has not been logged.
              Would you like to automatically mark them as <strong>Absent</strong> or return to review?
            </p>
            <div className="modal-card__actions" style={{ justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowWarningModal(false)}
              >
                Review Roster
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => executeSaveSession(true)}
              >
                Mark Remaining Absent &amp; Close
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => executeSaveSession(false)}
              >
                Save Recorded Only
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default LiveSessionWorkspace;
