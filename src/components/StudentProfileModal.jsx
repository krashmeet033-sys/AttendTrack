import React, { useState, useMemo } from 'react';
import {
  User,
  X,
  Mail,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Edit3,
  Save,
  GraduationCap,
  Award,
  Layers,
  History,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { calculateAttendancePercentage } from '../utils/calculations.js';

/**
 * StudentProfileModal Component
 *
 * Provides a comprehensive, individual student academic dossier:
 *  - Student identification, cohort, and contact details
 *  - Overall attendance rate and examination eligibility standing
 *  - Subject-wise attendance breakdown across all curriculum courses
 *  - Complete chronologically ordered lecture attendance history
 *  - Targeted log of missed lectures and late arrivals
 *  - Inline profile editing with validation
 *
 * @param {Object} props
 * @param {boolean} props.isOpen           - Modal visibility
 * @param {Function} props.onClose         - Close handler
 * @param {Object} props.student           - Current student object { id, name, rollNumber, className, semester }
 * @param {Array} props.records            - All attendance records from App state
 * @param {Array} props.sessions           - All academic sessions
 * @param {number} [props.threshold=75]    - Institutional attendance threshold
 * @param {string} [props.lateRule='separate'] - Late arrival weighting rule
 * @param {Function} [props.onEditStudent] - Handler to save updated student details
 * @param {Function} [props.onMarkStudent] - Quick link to mark attendance
 */
function StudentProfileModal({
  isOpen = false,
  onClose = () => {},
  student = null,
  records = [],
  sessions = [],
  threshold = 75,
  lateRule = 'separate',
  onEditStudent = () => {},
  onMarkStudent = () => {},
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'subjects' | 'history' | 'missed' | 'edit'
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editError, setEditError] = useState('');

  // Sync edit form when student changes
  React.useEffect(() => {
    if (student) {
      setEditName(student.name || '');
      setEditRoll(student.rollNumber || '');
      setEditClass(student.className || 'B.Tech CSE');
      setEditSemester(student.semester || 'Semester II');
      setIsEditing(false);
      setEditError('');
      setActiveTab('overview');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const rollNorm = String(student.rollNumber || '').trim().toLowerCase();

  // All attendance records for this student
  const studentRecords = useMemo(() => {
    return records
      .filter((r) => String(r.rollNumber || '').trim().toLowerCase() === rollNorm)
      .sort((a, b) => new Date(b.recordedAt || 0) - new Date(a.recordedAt || 0));
  }, [records, rollNorm]);

  const totalSessions = studentRecords.length;
  const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
  const absentCount = studentRecords.filter((r) => r.status === 'Absent').length;
  const lateCount = studentRecords.filter((r) => r.status === 'Late').length;

  const attendancePct = totalSessions > 0
    ? calculateAttendancePercentage(presentCount, lateCount, totalSessions, lateRule)
    : 0;

  const isEligible = totalSessions === 0 ? null : attendancePct >= threshold;
  const missedRecords = studentRecords.filter((r) => r.status === 'Absent');
  const lateRecords = studentRecords.filter((r) => r.status === 'Late');

  // Derive Subject-Wise Attendance Breakdown
  const subjectBreakdown = useMemo(() => {
    const map = {};

    studentRecords.forEach((rec) => {
      const sessObj = sessions.find((s) => s.id === rec.sessionId || s.name === rec.sessionName);
      const subj = rec.subject || sessObj?.subject || 'General Web Technologies';

      if (!map[subj]) {
        map[subj] = { subject: subj, total: 0, present: 0, absent: 0, late: 0 };
      }
      map[subj].total += 1;
      if (rec.status === 'Present') map[subj].present += 1;
      else if (rec.status === 'Absent') map[subj].absent += 1;
      else if (rec.status === 'Late') map[subj].late += 1;
    });

    return Object.values(map).map((item) => ({
      ...item,
      pct: calculateAttendancePercentage(item.present, item.late, item.total, lateRule),
    }));
  }, [studentRecords, sessions, lateRule]);

  const initials = student.name
    ? student.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'ST';

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Student name cannot be empty.');
      return;
    }
    if (!editRoll.trim()) {
      setEditError('Roll number cannot be empty.');
      return;
    }

    onEditStudent({
      ...student,
      name: editName.trim(),
      rollNumber: editRoll.trim().toUpperCase(),
      className: editClass.trim() || 'B.Tech CSE',
      semester: editSemester.trim() || 'Semester II',
    });
    setIsEditing(false);
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-profile-title"
      style={{ zIndex: 1000 }}
    >
      <div
        className="modal-card modal-card--profile"
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Profile Header Banner */}
        <div
          style={{
            padding: '1.5rem 1.75rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)',
            borderBottom: '1px solid var(--color-border)',
            position: 'relative',
          }}
        >
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close profile"
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Student Avatar */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), #4338CA)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h3
                  id="student-profile-title"
                  style={{ margin: 0, fontSize: '1.35rem', fontWeight: 750, color: 'var(--color-text-main)' }}
                >
                  {student.name}
                </h3>
                {isEligible === true && (
                  <span className="status-badge status-badge--present" style={{ fontSize: '0.75rem' }}>
                    <CheckCircle2 size={12} /> Exam Eligible (≥{threshold}%)
                  </span>
                )}
                {isEligible === false && (
                  <span className="status-badge status-badge--absent" style={{ fontSize: '0.75rem' }}>
                    <AlertTriangle size={12} /> Shortage Alert (&lt;{threshold}%)
                  </span>
                )}
                {isEligible === null && (
                  <span className="status-badge" style={{ fontSize: '0.75rem', background: 'var(--color-surface-alt)' }}>
                    No Records Logged
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.84rem',
                  color: 'var(--color-text-muted)',
                  marginTop: '0.35rem',
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  <strong style={{ color: 'var(--color-text-main)' }}>Roll:</strong>{' '}
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{student.rollNumber}</span>
                </span>
                <span>•</span>
                <span>
                  <GraduationCap size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '3px' }} />
                  {student.className} · {student.semester}
                </span>
                <span>•</span>
                <span>Batch 2025–29</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  onClose();
                  onMarkStudent(student);
                }}
              >
                <UserCheck size={14} /> Mark Attendance
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              marginTop: '1.25rem',
            }}
          >
            <div
              style={{
                background: 'var(--color-surface)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Attendance Rate
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isEligible === false ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                {totalSessions > 0 ? `${attendancePct}%` : '—'}
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Sessions
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {totalSessions}
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Present
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-present)' }}>
                {presentCount}
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Absent / Late
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-absent)' }}>
                {absentCount} <span style={{ fontSize: '0.85rem', color: 'var(--color-late)' }}>/ {lateCount}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.75rem',
            background: 'var(--color-surface-alt)',
            borderBottom: '1px solid var(--color-border)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            className={`filter-tab ${activeTab === 'overview' ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <BookOpen size={13} /> Subject Breakdown
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'history' ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <History size={13} /> Complete History ({studentRecords.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'missed' ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveTab('missed')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <AlertCircle size={13} /> Missed & Late ({missedRecords.length + lateRecords.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'edit' ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveTab('edit')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <Edit3 size={13} /> Edit Profile
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: SUBJECT BREAKDOWN */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  Curriculum Course Performance
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Institutional Threshold: <strong>{threshold}%</strong>
                </span>
              </div>

              {subjectBreakdown.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <p className="empty-state__text">No subject-wise records logged for this student yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {subjectBreakdown.map((item) => (
                    <div
                      key={item.subject}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{item.subject}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            {item.present} Present · {item.absent} Absent · {item.late} Late (Total {item.total} lectures)
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: item.pct >= threshold ? 'var(--color-present)' : 'var(--color-danger)',
                            }}
                          >
                            {item.pct}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div
                        style={{
                          height: '6px',
                          background: 'var(--color-surface-alt)',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${item.pct}%`,
                            background: item.pct >= threshold ? 'var(--color-present)' : 'var(--color-danger)',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPLETE HISTORY */}
          {activeTab === 'history' && (
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700 }}>
                Chronological Lecture Attendance Log
              </h4>

              {studentRecords.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <p className="empty-state__text">No attendance records recorded for this student.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {studentRecords.map((rec) => {
                    const statusMod = String(rec.status).toLowerCase();
                    return (
                      <div
                        key={rec.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 650, fontSize: '0.88rem' }}>
                            {rec.sessionName || 'Classroom Session'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                            {rec.recordedAt ? new Date(rec.recordedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            <Clock size={12} style={{ display: 'inline', margin: '0 4px 0 10px', verticalAlign: '-1px' }} />
                            {rec.recordedAt ? new Date(rec.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                        </div>

                        <span className={`status-badge status-badge--${statusMod}`}>
                          <span className="status-badge__dot" aria-hidden="true" />
                          {rec.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MISSED & LATE LECTURES */}
          {activeTab === 'missed' && (
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700 }}>
                Absences and Late Attendance Entries
              </h4>

              {missedRecords.length === 0 && lateRecords.length === 0 ? (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <CheckCircle2 size={32} className="text-present" style={{ margin: '0 auto 0.5rem auto' }} />
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Perfect Attendance Record!</strong>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    This student has zero absences and zero late arrivals recorded.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {missedRecords.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--color-danger)' }}>
                          Absent: {rec.sessionName || 'Classroom Lecture'}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {rec.recordedAt ? new Date(rec.recordedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          {rec.note ? ` · Reason: ${rec.note}` : ''}
                        </div>
                      </div>
                      <span className="status-badge status-badge--absent">Absent</span>
                    </div>
                  ))}

                  {lateRecords.map((rec) => (
                    <div
                      key={rec.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: 'rgba(245, 158, 11, 0.06)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--color-late)' }}>
                          Late Arrival: {rec.sessionName || 'Classroom Lecture'}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {rec.recordedAt ? new Date(rec.recordedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          {rec.note ? ` · Reason: ${rec.note}` : ''}
                        </div>
                      </div>
                      <span className="status-badge status-badge--late">Late</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 700 }}>
                Update Enrolled Student Details
              </h4>

              {editError && (
                <div className="form-error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={15} /> {editError}
                </div>
              )}

              <div className="field" style={{ marginBottom: '1rem' }}>
                <label className="field__label" htmlFor="edit-student-name">
                  Full Student Name
                </label>
                <input
                  id="edit-student-name"
                  type="text"
                  className="field__input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div className="field" style={{ marginBottom: '1rem' }}>
                <label className="field__label" htmlFor="edit-student-roll">
                  Roll Number (ID)
                </label>
                <input
                  id="edit-student-roll"
                  type="text"
                  className="field__input"
                  value={editRoll}
                  onChange={(e) => setEditRoll(e.target.value)}
                  placeholder="e.g. 24CSE001"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="field">
                  <label className="field__label" htmlFor="edit-student-class">
                    Department / Class
                  </label>
                  <input
                    id="edit-student-class"
                    type="text"
                    className="field__input"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="edit-student-sem">
                    Academic Semester
                  </label>
                  <input
                    id="edit-student-sem"
                    type="text"
                    className="field__input"
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setActiveTab('overview')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.85rem 1.75rem',
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            Student ID: <code>{student.id}</code>
          </span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileModal;
