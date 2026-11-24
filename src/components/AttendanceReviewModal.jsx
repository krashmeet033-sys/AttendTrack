import React from 'react';
import {
  CheckCheck,
  AlertTriangle,
  X,
  UserCheck,
  UserX,
  Clock,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

/**
 * AttendanceReviewModal Component
 *
 * Implements Phase 6: Pre-submission verification modal.
 * Summarizes the attendance roster before final commit to React state.
 */
function AttendanceReviewModal({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  pendingRecords = [],
  sessionName = 'Classroom Session',
  onUpdateStatus = () => {},
}) {
  if (!isOpen) return null;

  const total = pendingRecords.length;
  const presentCount = pendingRecords.filter((r) => r.status === 'Present').length;
  const absentCount = pendingRecords.filter((r) => r.status === 'Absent').length;
  const lateCount = pendingRecords.filter((r) => r.status === 'Late').length;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <div className="modal-card modal-card--review" style={{ maxWidth: '600px' }}>
        <div className="modal-card__header">
          <div className="modal-card__icon" aria-hidden="true" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-present)' }}>
            <CheckCheck size={22} />
          </div>
          <div>
            <h3 className="modal-card__title" id="review-modal-title">
              Review Attendance Submission
            </h3>
            <p className="modal-card__subtitle">
              Verify recorded student attendance for: <strong>{sessionName}</strong>
            </p>
          </div>
          <button type="button" className="modal-card__close" onClick={onClose} aria-label="Close review modal">
            <X size={18} />
          </button>
        </div>

        {/* Summary Metric Pills */}
        <div className="review-stats-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', margin: '0.75rem 0 1rem' }}>
          <div className="review-stat-pill" style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.65rem', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Present</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-present)' }}>{presentCount}</strong>
          </div>
          <div className="review-stat-pill" style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '0.65rem', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Absent</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-absent)' }}>{absentCount}</strong>
          </div>
          <div className="review-stat-pill" style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.65rem', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Late</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-late)' }}>{lateCount}</strong>
          </div>
        </div>

        {/* Warning if any student is absent */}
        {absentCount > 0 && (
          <div className="status-shortage-banner" style={{ margin: '0 0 1rem', padding: '0.6rem 0.85rem', fontSize: '0.8rem' }}>
            <AlertTriangle size={16} />
            <span>
              <strong>Note:</strong> {absentCount} {absentCount === 1 ? 'student is' : 'students are'} marked Absent and will receive an attendance shortage strike.
            </span>
          </div>
        )}

        {/* Scrollable Student Roster */}
        <div className="review-roster-list" style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.25rem' }}>
          {pendingRecords.map((rec) => {
            return (
              <div
                key={rec.rollNumber}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid var(--color-divider)',
                  fontSize: '0.84rem',
                }}
              >
                <div>
                  <strong style={{ display: 'block' }}>{rec.name}</strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{rec.rollNumber}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {['Present', 'Absent', 'Late'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`btn btn--sm ${rec.status === st ? (st === 'Present' ? 'btn--primary' : st === 'Absent' ? 'btn--danger' : 'btn--warning') : 'btn--ghost'}`}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.74rem',
                        height: 'auto',
                        opacity: rec.status === st ? 1 : 0.6,
                      }}
                      onClick={() => onUpdateStatus(rec.rollNumber, st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="modal-card__actions" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            <ArrowLeft size={15} /> Back to Edit
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            <CheckCircle2 size={16} /> Confirm & Save All ({total})
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceReviewModal;

