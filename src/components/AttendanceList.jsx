import React, { useState } from 'react';
import { Download, Trash2, ClipboardList, SearchX, UserPlus, Printer, CheckSquare, Square, Filter, Edit3, X, CheckCircle2, History, BookOpen } from 'lucide-react';
import AttendanceCard from './AttendanceCard.jsx';
import AuditTrailModal from './AuditTrailModal.jsx';

/**
 * AttendanceList Component
 *
 * Renders every attendance record dynamically with `.map()` inside a clean,
 * professional data table, and provides search-aware filtering, session filtering,
 * sorting, CSV export, print, record editing, and clear-all actions.
 *
 * Filtering/sorting is computed with `.filter()` + `.sort()` on a copy of the
 * records, so the original state array is never mutated. On narrower screens
 * the table header is hidden and each row becomes a self-labelled card.
 *
 * @param {Object} props
 * @param {Array}  props.records           - All attendance records (App state).
 * @param {string} props.searchQuery       - Search text shared with the header.
 * @param {Function} props.onSearchChange  - Updates the shared search text (used to clear it).
 * @param {Function} props.onDeleteRecord  - Requests deletion (confirmation happens in App).
 * @param {Function} props.onChangeStatus  - Cycles a record's status.
 * @param {Function} props.onClearAll      - Requests clearing every record (confirmation in App).
 * @param {Function} props.onDownloadCSV   - Downloads the current records as a CSV file.
 * @param {Function} props.onAddFirst      - Opens the "Mark Attendance" page.
 * @param {Function} [props.onPrint]       - Triggers printable report view.
 * @param {Function} [props.onBulkDelete]  - Requests deletion of selected IDs.
 * @param {Array}    [props.sessions]      - Available sessions for filtering & editing.
 * @param {Object}   [props.activeSession] - Currently active session.
 * @param {Function} [props.onEditRecord]  - Edits a record and adds audit log.
 */
function AttendanceList({
  records = [],
  searchQuery = '',
  onSearchChange = () => {},
  onDeleteRecord = () => {},
  onChangeStatus = () => {},
  onClearAll = () => {},
  onDownloadCSV = () => {},
  onAddFirst = () => {},
  onPrint = () => window.print(),
  onBulkDelete = () => {},
  sessions = [],
  activeSession,
  onEditRecord,
  statusFilter: externalStatusFilter,
  onStatusFilterChange,
  allowEditing = true,
}) {
  // Local UI state
  const [internalStatusFilter, setInternalStatusFilter] = useState('ALL');
  const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
  const setStatusFilter = (val) => {
    setInternalStatusFilter(val);
    if (onStatusFilterChange) onStatusFilterChange(val);
  };
  const [sessionFilter, setSessionFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Record Edit Modal state
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('Present');
  const [editSessionId, setEditSessionId] = useState('');
  const [editNote, setEditNote] = useState('');

  // Counts per status – derived from live records
  const counts = {
    ALL: records.length,
    Present: records.filter((record) => record.status === 'Present').length,
    Absent: records.filter((record) => record.status === 'Absent').length,
    Late: records.filter((record) => record.status === 'Late').length,
  };

  const filterTabs = [
    { key: 'ALL', label: 'All' },
    { key: 'Present', label: 'Present', modifier: 'present' },
    { key: 'Absent', label: 'Absent', modifier: 'absent' },
    { key: 'Late', label: 'Late', modifier: 'late' },
  ];

  const query = searchQuery.trim().toLowerCase();

  // 1) search by name or roll number  2) filter by status  3) filter by session  4) filter by subject 5) sort
  const visibleRecords = records
    .filter((record) => {
      const matchesQuery =
        !query ||
        record.name.toLowerCase().includes(query) ||
        record.rollNumber.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
      const matchesSession =
        sessionFilter === 'ALL' ||
        record.sessionId === sessionFilter ||
        record.sessionName === sessionFilter;
      const sessObj = sessions.find(
        (s) => s.id === record.sessionId || s.name === record.sessionName
      );
      const subj = record.subject || sessObj?.subject || '';
      const matchesSubject =
        subjectFilter === 'ALL' ||
        subj === subjectFilter ||
        (record.sessionName &&
          record.sessionName.toLowerCase().includes(subjectFilter.toLowerCase()));
      return matchesQuery && matchesStatus && matchesSession && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'roll-asc') return a.rollNumber.localeCompare(b.rollNumber);
      if (sortBy === 'roll-desc') return b.rollNumber.localeCompare(a.rollNumber);
      // 'recent' keeps the newest record first
      return new Date(b.recordedAt || 0) - new Date(a.recordedAt || 0);
    });

  const hasRecords = records.length > 0;
  const isNarrowed = Boolean(query) || statusFilter !== 'ALL' || sessionFilter !== 'ALL';

  const clearFilters = () => {
    setStatusFilter('ALL');
    setSessionFilter('ALL');
    if (onSearchChange) onSearchChange('');
  };

  const handleStartEdit = (record) => {
    setEditingRecord(record);
    setEditStatus(record.status || 'Present');
    setEditSessionId(record.sessionId || (activeSession ? activeSession.id : ''));
    setEditNote('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRecord || !onEditRecord) return;
    const chosenSession = sessions.find((s) => s.id === editSessionId);
    const updated = {
      ...editingRecord,
      status: editStatus,
      sessionId: editSessionId,
      sessionName: chosenSession ? chosenSession.name : editingRecord.sessionName,
      sessionDate: chosenSession ? chosenSession.date : editingRecord.sessionDate,
    };
    onEditRecord(updated, editNote || `Status changed to ${editStatus}`);
    setEditingRecord(null);
  };

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === visibleRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleRecords.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  return (
    <section className="panel" aria-label="Attendance records">
      {/* Official Academic Print Report Header (visible only on print) */}
      <div className="print-report-header" aria-hidden="true">
        <div className="print-report-header__top">
          <h1 className="print-report-header__title">
            Apex Institute of Technology
          </h1>
          <h2 className="print-report-header__dept">
            Department of Computer Science & Engineering
          </h2>
          <p className="print-report-header__sub">
            Official Classroom Attendance Record Sheet · B.Tech CSE (Semester II)
          </p>
        </div>
        <div className="print-report-header__meta-grid">
          <div><strong>Active Session:</strong> {activeSession ? activeSession.name : 'All Classroom Sessions'}</div>
          <div><strong>Subject:</strong> {activeSession?.subject || 'React JS & Web Technologies'}</div>
          <div><strong>Academic Year:</strong> 2025–26</div>
          <div><strong>Report Generated:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div><strong>Total Records Listed:</strong> {visibleRecords.length} student entries</div>
          <div><strong>Faculty In-Charge:</strong> Prof. Ananya Sen</div>
        </div>
      </div>

      <div className="panel__header">
        <div>
          <h2 className="panel__title">Attendance Records</h2>
          <p className="panel__subtitle">
            View, search, filter and manage student attendance records.
          </p>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setIsAuditModalOpen(true)}
            title="View complete attendance change audit trail"
          >
            <History size={15} />
            Audit Trail
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onPrint}
            disabled={!hasRecords}
            title="Print classroom attendance record sheet"
          >
            <Printer size={15} />
            Print
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onDownloadCSV}
            disabled={!hasRecords}
            title="Download attendance records as a CSV file"
          >
            <Download size={15} />
            Download CSV
          </button>
          <button
            type="button"
            className="btn btn--soft-danger btn--sm"
            onClick={onClearAll}
            disabled={!hasRecords}
            title="Delete every attendance record"
          >
            <Trash2 size={15} />
            Clear All
          </button>
        </div>
      </div>

      <div className="panel__body">
        {/* Toolbar: status filters + sorting */}
        {hasRecords && (
          <>
            <div className="list-toolbar">
              <div className="filter-tabs" role="tablist" aria-label="Filter by attendance status">
                {filterTabs.map((tab) => {
                  const isActive = statusFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`filter-tab ${tab.modifier ? `filter-tab--${tab.modifier}` : ''} ${
                        isActive ? 'filter-tab--active' : ''
                      }`}
                      onClick={() => setStatusFilter(tab.key)}
                    >
                      {tab.label}
                      <span className="filter-tab__count">{counts[tab.key]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Session Filter dropdown */}
              {sessions.length > 0 && (
                <div className="sort-field">
                  <label className="sort-field__label" htmlFor="filter-session">
                    Session
                  </label>
                  <select
                    id="filter-session"
                    className="sort-field__select"
                    value={sessionFilter}
                    onChange={(event) => setSessionFilter(event.target.value)}
                  >
                    <option value="ALL">All Sessions ({records.length})</option>
                    {sessions.map((s) => {
                      const sessionRecordsCount = records.filter(
                        (r) => r.sessionId === s.id || r.sessionName === s.name
                      ).length;
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({sessionRecordsCount})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Subject Filter dropdown */}
              <div className="sort-field">
                <label className="sort-field__label" htmlFor="filter-subject">
                  Subject
                </label>
                <select
                  id="filter-subject"
                  className="sort-field__select"
                  value={subjectFilter}
                  onChange={(event) => setSubjectFilter(event.target.value)}
                >
                  <option value="ALL">All Subjects</option>
                  <option value="React JS & Web Technologies">React JS</option>
                  <option value="Data Structures & Algorithms (DSA)">DSA</option>
                  <option value="Database Management Systems (DBMS)">DBMS</option>
                  <option value="Engineering Mathematics II">Mathematics</option>
                </select>
              </div>

              <div className="sort-field">
                <label className="sort-field__label" htmlFor="sort-records">
                  Sort by
                </label>
                <select
                  id="sort-records"
                  className="sort-field__select"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="recent">Newest first</option>
                  <option value="name-asc">Student name (A–Z)</option>
                  <option value="name-desc">Student name (Z–A)</option>
                  <option value="roll-asc">Roll number (ascending)</option>
                  <option value="roll-desc">Roll number (descending)</option>
                </select>
              </div>
            </div>

            {/* Bulk Selection Bar if records are selected */}
            {selectedIds.length > 0 && (
              <div className="bulk-actions-bar">
                <span className="bulk-actions-bar__count">
                  <strong>{selectedIds.length}</strong> record{selectedIds.length === 1 ? '' : 's'} selected
                </span>
                <div className="bulk-actions-bar__actions">
                  <button
                    type="button"
                    className="btn btn--soft-danger btn--sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            <p className="records-meta" style={{ marginTop: '0.9rem' }}>
              Showing <strong>{visibleRecords.length}</strong> of <strong>{records.length}</strong>{' '}
              records
              {query && (
                <>
                  <span aria-hidden="true">·</span> matching <strong>“{searchQuery.trim()}”</strong>
                </>
              )}
            </p>
          </>
        )}

        {/* Read-only banner if editing disabled */}
        {!allowEditing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              color: 'var(--color-text-main)',
              fontSize: '0.875rem',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🔒</span>
            <div>
              <strong>Read-Only Mode Active:</strong> Attendance records and status cycling are locked in Settings.
            </div>
          </div>
        )}

        {/* Records table, or the appropriate empty state */}
        {!hasRecords ? (
          <div className="empty-state">
            <div className="empty-state__art" aria-hidden="true">
              <ClipboardList size={40} strokeWidth={1.6} />
            </div>
            <h3 className="empty-state__title">No attendance records available.</h3>
            <p className="empty-state__text">
              Start by adding your first student attendance record.
            </p>
            <div className="empty-state__actions">
              <button type="button" className="btn btn--primary" onClick={onAddFirst}>
                <UserPlus size={16} />
                Mark Attendance
              </button>
            </div>
            <p className="empty-state__hint">
              Every KPI, chart and percentage in this app is calculated from the records you add.
            </p>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__art" aria-hidden="true">
              <SearchX size={40} strokeWidth={1.6} />
            </div>
            <h3 className="empty-state__title">No matching records found.</h3>
            <p className="empty-state__text">
              No record matches the current search or status filter. Try a different keyword or
              clear the filters.
            </p>
            <div className="empty-state__actions">
              <button type="button" className="btn btn--ghost" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="records-table" role="table" aria-label="Student attendance records">
            <div className="records-table__head" role="row">
              <span className="records-table__th" role="columnheader">
                Student Name
              </span>
              <span className="records-table__th" role="columnheader">
                Roll Number
              </span>
              <span className="records-table__th" role="columnheader">
                Attendance Status
              </span>
              <span className="records-table__th" role="columnheader">
                Date
              </span>
              <span className="records-table__th" role="columnheader">
                Time
              </span>
              <span className="records-table__th records-table__th--right" role="columnheader">
                Actions
              </span>
            </div>

            <div className="records-table__body" role="rowgroup">
              {visibleRecords.map((record) => (
                <AttendanceCard
                  key={record.id}
                  record={record}
                  onDelete={onDeleteRecord}
                  onChangeStatus={onChangeStatus}
                  onEdit={handleStartEdit}
                  allowEditing={allowEditing}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Small footer note that explains what the numbers represent */}
      {hasRecords && isNarrowed && (
        <p className="records-meta" style={{ padding: '0 1.35rem 1.35rem' }}>
          Filters are active — the KPI cards above always reflect the full record set.
        </p>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-rec-title">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Edit3 size={18} className="text-brand" />
                <h3 className="modal-card__title" id="edit-rec-title" style={{ margin: 0 }}>
                  Edit Attendance Record
                </h3>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditingRecord(null)}
                aria-label="Close edit dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'var(--color-surface-alt)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
              <strong style={{ fontSize: '0.95rem' }}>{editingRecord.name}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                Roll Number: {editingRecord.rollNumber}
              </div>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="field" style={{ marginBottom: '1rem' }}>
                <label className="field__label" htmlFor="edit-status-select">
                  Attendance Status
                </label>
                <select
                  id="edit-status-select"
                  className="field__input field__input--select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>

              {sessions.length > 0 && (
                <div className="field" style={{ marginBottom: '1rem' }}>
                  <label className="field__label" htmlFor="edit-session-select">
                    Assigned Session
                  </label>
                  <select
                    id="edit-session-select"
                    className="field__input field__input--select"
                    value={editSessionId}
                    onChange={(e) => setEditSessionId(e.target.value)}
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.date})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field" style={{ marginBottom: '1.25rem' }}>
                <label className="field__label" htmlFor="edit-note-input">
                  Amendment Reason / Audit Note (Optional)
                </label>
                <input
                  id="edit-note-input"
                  type="text"
                  className="field__input"
                  placeholder="e.g. Medical certificate verified by teacher"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>

              <div className="modal-card__actions" style={{ justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                >
                  <CheckCircle2 size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Academic Print Signatures (visible only on print) */}
      <div className="print-report-footer" aria-hidden="true">
        <div className="print-signature-box">
          <div className="print-signature-line" />
          <span>Faculty / Course Instructor</span>
        </div>
        <div className="print-signature-box">
          <div className="print-signature-line" />
          <span>Head of Department (HOD)</span>
        </div>
        <div className="print-signature-box">
          <div className="print-signature-line" />
          <span>Dean of Academic Affairs</span>
        </div>
      </div>

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        records={records}
      />
    </section>
  );
}

export default AttendanceList;
