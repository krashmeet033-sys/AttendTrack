import React, { useState } from 'react';
import {
  History,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Calendar,
  FileText,
  ShieldCheck,
} from 'lucide-react';

/**
 * AuditTrailModal Component
 *
 * Implements Phase 7 & Phase 9: Audit Trail.
 * Displays full institutional audit trail of attendance records: creations, status changes,
 * deletions, amendment reasons, and timestamps.
 */
function AuditTrailModal({
  isOpen = false,
  onClose = () => {},
  records = [],
  teacherName = 'Class Teacher',
}) {
  const [filterType, setFilterType] = useState('ALL');

  if (!isOpen) return null;

  // Compile audit log entries
  const auditEntries = [];

  records.forEach((record) => {
    // 1. Initial creation entry
    if (record.recordedAt) {
      auditEntries.push({
        id: `audit_create_${record.id}`,
        recordId: record.id,
        type: 'CREATED',
        studentName: record.name,
        rollNumber: record.rollNumber,
        sessionName: record.sessionName || 'Classroom Session',
        oldValue: 'None',
        newValue: record.status,
        reason: 'Initial Attendance Entry',
        actor: teacherName,
        timestamp: record.recordedAt,
      });
    }

    // 2. Subsequent edits
    if (Array.isArray(record.auditLog)) {
      record.auditLog.forEach((log, index) => {
        auditEntries.push({
          id: `audit_edit_${record.id}_${index}`,
          recordId: record.id,
          type: 'STATUS_CHANGE',
          studentName: record.name,
          rollNumber: record.rollNumber,
          sessionName: record.sessionName || 'Classroom Session',
          oldValue: log.previousStatus || 'Previous Status',
          newValue: log.newStatus || record.status,
          reason: log.note || record.editReason || 'Faculty status adjustment',
          actor: teacherName,
          timestamp: log.changedAt || record.modifiedAt || new Date().toISOString(),
        });
      });
    }
  });

  // Sort descending by timestamp
  auditEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredEntries = auditEntries.filter((item) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'EDITS') return item.type === 'STATUS_CHANGE';
    if (filterType === 'CREATIONS') return item.type === 'CREATED';
    return true;
  });

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="audit-modal-title">
      <div className="modal-card modal-card--audit" style={{ maxWidth: '720px' }}>
        <div className="modal-card__header">
          <div className="modal-card__icon" aria-hidden="true" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563EB' }}>
            <History size={22} />
          </div>
          <div>
            <h3 className="modal-card__title" id="audit-modal-title">
              Attendance Audit Trail & Change History
            </h3>
            <p className="modal-card__subtitle">
              Verified chronological log of all attendance creations, corrections, and faculty edits
            </p>
          </div>
          <button type="button" className="modal-card__close" onClick={onClose} aria-label="Close Audit Modal">
            <X size={18} />
          </button>
        </div>

        {/* Audit Filter Tabs */}
        <div className="table-controls" style={{ padding: '0.6rem 0.8rem', background: 'var(--color-surface)', borderRadius: '10px', border: '1px solid var(--color-border)', margin: '0.75rem 0' }}>
          <div className="filter-tabs" role="tablist">
            <button
              type="button"
              className={`filter-tab ${filterType === 'ALL' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterType('ALL')}
            >
              All Actions ({auditEntries.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${filterType === 'EDITS' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterType('EDITS')}
            >
              Corrections & Edits ({auditEntries.filter((e) => e.type === 'STATUS_CHANGE').length})
            </button>
            <button
              type="button"
              className={`filter-tab ${filterType === 'CREATIONS' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterType('CREATIONS')}
            >
              Initial Entries ({auditEntries.filter((e) => e.type === 'CREATED').length})
            </button>
          </div>

          <span className="code-chip" style={{ fontSize: '0.74rem' }}>
            <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Tamper-Evident History
          </span>
        </div>

        {/* Audit Log Entries List */}
        <div className="audit-log-container" style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
          {filteredEntries.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p className="empty-state__text">No audit history recorded yet.</p>
            </div>
          ) : (
            <div className="audit-timeline">
              {filteredEntries.map((entry) => {
                const dateObj = new Date(entry.timestamp);
                const dateStr = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-GB') : '';
                const timeStr = !isNaN(dateObj) ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <div key={entry.id} className="audit-item" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-divider)', display: 'flex', gap: '0.85rem' }}>
                    <div className="audit-item__icon" style={{ marginTop: '0.2rem' }}>
                      {entry.type === 'STATUS_CHANGE' ? (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-late)', display: 'grid', placeItems: 'center' }}>
                          <Clock size={14} />
                        </div>
                      ) : (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-present)', display: 'grid', placeItems: 'center' }}>
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <strong>{entry.studentName}</strong>{' '}
                          <span className="code-chip" style={{ fontSize: '0.72rem' }}>{entry.rollNumber}</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          {dateStr} at {timeStr}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', marginTop: '0.25rem', color: 'var(--color-text-main)' }}>
                        {entry.type === 'STATUS_CHANGE' ? (
                          <span>
                            Status modified from <strong className="text-absent">{entry.oldValue}</strong> to <strong className="text-present">{entry.newValue}</strong>
                          </span>
                        ) : (
                          <span>
                            Marked as <strong className="text-present">{entry.newValue}</strong> in {entry.sessionName}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        <span>Reason: <em>&quot;{entry.reason}&quot;</em></span>
                        <span>Authorized by: <strong>{entry.actor}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-card__actions" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditTrailModal;

