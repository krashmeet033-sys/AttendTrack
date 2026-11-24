import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Edit3,
} from 'lucide-react';

/**
 * AttendanceCorrectionCentre Component
 *
 * Implements Priority 5: Dedicated Local Audit & Attendance Correction Centre.
 * Gives teachers and evaluators full transparency into attendance changes,
 * status transitions, reasons for amendment, and modification history.
 *
 * @param {Object} props
 * @param {Array} props.auditLogs          - Raw audit logs from useAttendance hook
 * @param {Array} props.records            - Live attendance records
 * @param {Array} props.sessions           - Classroom sessions
 * @param {Array} props.students           - Enrolled students
 * @param {Function} [props.onOpenStudent] - Open student profile
 */
function AttendanceCorrectionCentre({
  auditLogs = [],
  records = [],
  sessions = [],
  students = [],
  onOpenStudent = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'STATUS_CHANGE' | 'EDIT' | 'DELETE' | 'CREATE'
  const [sessionFilter, setSessionFilter] = useState('ALL');

  // Synthesize rich audit items from auditLogs and existing record change history
  const combinedEntries = useMemo(() => {
    const list = [...auditLogs];

    // Also parse any record.auditLog from existing records if not already captured
    records.forEach((rec) => {
      if (rec.auditLog && Array.isArray(rec.auditLog)) {
        rec.auditLog.forEach((logItem, idx) => {
          const id = `rec_audit_${rec.id}_${idx}`;
          if (!list.some((item) => item.id === id || (item.recordId === rec.id && item.timestamp === logItem.changedAt))) {
            list.push({
              id,
              recordId: rec.id,
              type: 'EDIT',
              studentName: rec.name,
              rollNumber: rec.rollNumber,
              sessionName: rec.sessionName || 'Classroom Session',
              previousStatus: logItem.previousStatus || 'Present',
              newStatus: logItem.newStatus || rec.status,
              reason: rec.note || 'Record amended in Records management',
              timestamp: logItem.changedAt || rec.recordedAt,
            });
          }
        });
      }
    });

    return list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }, [auditLogs, records]);

  // Filtering
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return combinedEntries.filter((item) => {
      const matchesQuery =
        !q ||
        (item.studentName && item.studentName.toLowerCase().includes(q)) ||
        (item.rollNumber && item.rollNumber.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q));

      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
      const matchesSession = sessionFilter === 'ALL' || item.sessionName === sessionFilter;

      return matchesQuery && matchesType && matchesSession;
    });
  }, [combinedEntries, searchQuery, typeFilter, sessionFilter]);

  const exportCorrectionsCSV = () => {
    if (filteredEntries.length === 0) return;

    const headers = ['Timestamp', 'Type', 'Student Name', 'Roll Number', 'Session', 'Previous Status', 'Updated Status', 'Reason'];
    const rows = filteredEntries.map((e) => [
      `"${e.timestamp || ''}"`,
      `"${e.type || ''}"`,
      `"${e.studentName || 'Class'}"`,
      `"${e.rollNumber || '—'}"`,
      `"${e.sessionName || 'Classroom Session'}"`,
      `"${e.previousStatus || '—'}"`,
      `"${e.newStatus || '—'}"`,
      `"${(e.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendtrack-corrections-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const countsByType = {
    ALL: combinedEntries.length,
    STATUS_CHANGE: combinedEntries.filter((e) => e.type === 'STATUS_CHANGE').length,
    EDIT: combinedEntries.filter((e) => e.type === 'EDIT').length,
    DELETE: combinedEntries.filter((e) => e.type === 'DELETE').length,
    CREATE: combinedEntries.filter((e) => e.type === 'CREATE').length,
  };

  return (
    <section className="panel" aria-label="Attendance Correction Centre">
      <div className="panel__header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <History size={20} className="text-brand" />
            <h2 className="panel__title" style={{ margin: 0 }}>
              Attendance Correction Centre
            </h2>
          </div>
          <p className="panel__subtitle">
            Local audit trail of status amendments, corrections, reason notes, and teacher modifications.
          </p>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={exportCorrectionsCSV}
            disabled={filteredEntries.length === 0}
            title="Download corrections log as CSV"
          >
            <FileSpreadsheet size={15} /> Export Audit Log
          </button>
        </div>
      </div>

      <div className="panel__body">
        {/* Academic Transparency Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.84rem',
            color: 'var(--color-text-main)',
          }}
        >
          <ShieldCheck size={18} className="text-brand" style={{ flexShrink: 0 }} />
          <div>
            <strong>Local Audit Mode:</strong> This log captures all modifications made on this workstation.
            Evaluators can review before-and-after status transitions and teacher justification reasons for every record.
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          {/* Modification Type Tabs */}
          <div className="filter-tabs" role="tablist">
            <button
              type="button"
              className={`filter-tab ${typeFilter === 'ALL' ? 'filter-tab--active' : ''}`}
              onClick={() => setTypeFilter('ALL')}
            >
              All Activity <span className="filter-tab__count">{countsByType.ALL}</span>
            </button>
            <button
              type="button"
              className={`filter-tab ${typeFilter === 'STATUS_CHANGE' ? 'filter-tab--active' : ''}`}
              onClick={() => setTypeFilter('STATUS_CHANGE')}
            >
              Status Changes <span className="filter-tab__count">{countsByType.STATUS_CHANGE}</span>
            </button>
            <button
              type="button"
              className={`filter-tab ${typeFilter === 'EDIT' ? 'filter-tab--active' : ''}`}
              onClick={() => setTypeFilter('EDIT')}
            >
              Edits <span className="filter-tab__count">{countsByType.EDIT}</span>
            </button>
            <button
              type="button"
              className={`filter-tab ${typeFilter === 'DELETE' ? 'filter-tab--active' : ''}`}
              onClick={() => setTypeFilter('DELETE')}
            >
              Deletions <span className="filter-tab__count">{countsByType.DELETE}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="search"
                className="field__input"
                style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
                placeholder="Search student, roll, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Session Dropdown Filter */}
            {sessions.length > 0 && (
              <select
                className="sort-field__select"
                style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.6rem' }}
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
              >
                <option value="ALL">All Sessions</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Audit Log Table */}
        {filteredEntries.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <History size={36} className="text-muted" style={{ margin: '0 auto 0.5rem auto' }} />
            <h3 className="empty-state__title">No attendance corrections found.</h3>
            <p className="empty-state__text">
              Status changes, record amendments, and deleted entries will automatically be logged here.
            </p>
          </div>
        ) : (
          <div className="records-table" role="table" aria-label="Attendance corrections log">
            <div className="records-table__head" role="row">
              <span className="records-table__th" style={{ width: '180px' }}>Date &amp; Time</span>
              <span className="records-table__th">Student Name &amp; Roll</span>
              <span className="records-table__th">Session</span>
              <span className="records-table__th">Transition</span>
              <span className="records-table__th">Amendment Reason</span>
              <span className="records-table__th" style={{ width: '100px' }}>Action</span>
            </div>

            <div className="records-table__body" role="rowgroup">
              {filteredEntries.map((entry) => {
                const dateObj = entry.timestamp ? new Date(entry.timestamp) : new Date();
                const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={entry.id}
                    className="records-table__row"
                    role="row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '180px 1.4fr 1.4fr 1.4fr 1.6fr 100px',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid var(--color-border)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {/* Timestamp */}
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {formattedDate}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formattedTime}
                      </div>
                    </div>

                    {/* Student */}
                    <div>
                      <div
                        style={{ fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer' }}
                        onClick={() => {
                          const matched = students.find((s) => s.rollNumber === entry.rollNumber);
                          if (matched) onOpenStudent(matched);
                        }}
                      >
                        {entry.studentName || 'Class Cohort'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {entry.rollNumber || '—'}
                      </div>
                    </div>

                    {/* Session */}
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {entry.sessionName || 'Classroom Session'}
                    </div>

                    {/* Status Transition */}
                    <div>
                      {entry.previousStatus && entry.newStatus ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className={`status-badge status-badge--${entry.previousStatus.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                            {entry.previousStatus}
                          </span>
                          <ArrowRight size={12} className="text-muted" />
                          <span className={`status-badge status-badge--${entry.newStatus.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                            {entry.newStatus}
                          </span>
                        </div>
                      ) : (
                        <span className="status-badge" style={{ fontSize: '0.72rem' }}>
                          {entry.type}
                        </span>
                      )}
                    </div>

                    {/* Reason */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', fontStyle: entry.reason ? 'normal' : 'italic' }}>
                      {entry.reason || 'Manual status change'}
                    </div>

                    {/* Actor / Type */}
                    <div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: entry.type === 'DELETE' ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface-alt)',
                          color: entry.type === 'DELETE' ? 'var(--color-danger)' : 'var(--color-text-muted)',
                        }}
                      >
                        {entry.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AttendanceCorrectionCentre;
