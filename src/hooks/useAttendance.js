import { useState, useEffect, useMemo, useRef } from 'react';
import {
  loadVersioned,
  saveVersioned,
  RECORDS_STORAGE_KEY,
  AUDIT_STORAGE_KEY,
  createAutoBackup,
} from '../utils/storage.js';
import { calculateAttendancePercentage } from '../utils/calculations.js';
import { validateAttendanceRecord } from '../utils/validation.js';
import { DEFAULT_RECORDS } from '../data/defaultData.js';

/**
 * Custom Hook: useAttendance
 *
 * Implements centralized state architecture for classroom attendance.
 * Owns attendance records, mathematical metrics derivation, status transitions,
 * audit history tracking, and one-click Undo capability.
 */
export function useAttendance({
  activeSession,
  settings = {},
  onToast = () => {},
} = {}) {
  const allowEditing = settings.allowEditing !== false;
  const lateRule = settings.lateRule || 'separate';

  // Core attendance records state
  const [records, setRecords] = useState(() => {
    return loadVersioned(RECORDS_STORAGE_KEY, DEFAULT_RECORDS);
  });

  // Local audit trail history
  const [auditLogs, setAuditLogs] = useState(() => {
    return loadVersioned(AUDIT_STORAGE_KEY, []);
  });

  // Undo action stack
  const [lastAction, setLastAction] = useState(null);

  // Sync to versioned localStorage
  useEffect(() => {
    saveVersioned(RECORDS_STORAGE_KEY, records);
  }, [records]);

  useEffect(() => {
    saveVersioned(AUDIT_STORAGE_KEY, auditLogs);
  }, [auditLogs]);

  // Centralized Derived Metrics
  const totalRecords = records.length;
  const presentCount = useMemo(
    () => records.filter((r) => r.status === 'Present').length,
    [records]
  );
  const absentCount = useMemo(
    () => records.filter((r) => r.status === 'Absent').length,
    [records]
  );
  const lateCount = useMemo(
    () => records.filter((r) => r.status === 'Late').length,
    [records]
  );

  const attendancePercentage = useMemo(() => {
    return calculateAttendancePercentage(presentCount, lateCount, totalRecords, lateRule);
  }, [presentCount, lateCount, totalRecords, lateRule]);

  // Record an entry in the local audit history
  const recordAudit = (type, details) => {
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type, // 'CREATE' | 'STATUS_CHANGE' | 'EDIT' | 'DELETE' | 'BULK_DELETE' | 'CLEAR_ALL'
      timestamp: new Date().toISOString(),
      ...details,
    };
    setAuditLogs((prev) => [entry, ...prev.slice(0, 99)]); // retain latest 100 entries
    return entry;
  };

  /**
   * Reverts the most recent modifying operation.
   */
  const handleUndo = () => {
    if (!lastAction) {
      onToast('No action available to undo.', 'info');
      return;
    }

    const { previousRecords, previousAudit, description } = lastAction;
    setRecords(previousRecords);
    if (previousAudit) {
      setAuditLogs(previousAudit);
    }
    setLastAction(null);
    onToast(`Action undone: ${description}`, 'success');
  };

  /**
   * Adds a single attendance record.
   */
  const handleAddRecord = (recordData, auditNote = '') => {
    const sessId = recordData.sessionId || activeSession?.id || 'sess_1';
    const sessName = recordData.sessionName || activeSession?.name || 'Classroom Session';
    const sessDate = recordData.sessionDate || activeSession?.date || new Date().toISOString().slice(0, 10);

    const stampedRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: recordData.name.trim(),
      rollNumber: recordData.rollNumber.trim().toUpperCase(),
      status: recordData.status || 'Present',
      sessionId: sessId,
      sessionName: sessName,
      sessionDate: sessDate,
      recordedAt: recordData.recordedAt || new Date().toISOString(),
      note: auditNote || recordData.note || '',
    };

    // Prevent duplicate in same session
    const sessionRecords = records.filter((r) => r.sessionId === sessId);
    const validation = validateAttendanceRecord(stampedRecord, sessionRecords);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      onToast(firstError, 'error');
      return { success: false, errors: validation.errors };
    }

    // Save previous snapshot for undo
    setLastAction({
      type: 'mark',
      previousRecords: [...records],
      previousAudit: [...auditLogs],
      description: `Removed mark for ${stampedRecord.name}`,
    });

    setRecords((prev) => [stampedRecord, ...prev]);

    recordAudit('CREATE', {
      recordId: stampedRecord.id,
      studentName: stampedRecord.name,
      rollNumber: stampedRecord.rollNumber,
      sessionName: stampedRecord.sessionName,
      newStatus: stampedRecord.status,
      reason: auditNote || 'Marked in classroom session',
    });

    if (settings.notifications?.submission !== false) {
      onToast(
        `${stampedRecord.name} marked ${stampedRecord.status}.`,
        'success',
        { label: 'Undo', onClick: handleUndo }
      );
    }

    return { success: true, record: stampedRecord };
  };

  /**
   * Adds multiple attendance records in batch (e.g. Mark All Present).
   */
  const handleAddMultipleRecords = (newRecords = []) => {
    if (!Array.isArray(newRecords) || newRecords.length === 0) return;

    setLastAction({
      type: 'bulk_mark',
      previousRecords: [...records],
      previousAudit: [...auditLogs],
      description: `Reverted batch marking (${newRecords.length} records)`,
    });

    const stamped = newRecords.map((r, i) => ({
      ...r,
      id: r.id || `rec_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      sessionId: r.sessionId || activeSession?.id || 'sess_1',
      sessionName: r.sessionName || activeSession?.name || 'Classroom Session',
      sessionDate: r.sessionDate || activeSession?.date || new Date().toISOString().slice(0, 10),
      recordedAt: r.recordedAt || new Date().toISOString(),
    }));

    setRecords((prev) => [...stamped, ...prev]);

    recordAudit('CREATE', {
      sessionName: activeSession?.name || 'Batch',
      newStatus: 'Multiple',
      reason: `Batch marked ${newRecords.length} students`,
    });

    onToast(
      `Marked attendance for ${newRecords.length} students.`,
      'success',
      { label: 'Undo', onClick: handleUndo }
    );
  };

  /**
   * Cycles a record's status (Present -> Absent -> Late -> Present).
   */
  const handleChangeStatus = (recordId) => {
    if (!allowEditing) {
      onToast('Editing is locked in Settings.', 'warning');
      return;
    }

    const current = records.find((r) => r.id === recordId);
    if (!current) return;

    const nextStatusMap = { Present: 'Absent', Absent: 'Late', Late: 'Present' };
    const nextStatus = nextStatusMap[current.status] || 'Present';

    setLastAction({
      type: 'status_change',
      previousRecords: [...records],
      previousAudit: [...auditLogs],
      description: `Restored ${current.name}'s status to ${current.status}`,
    });

    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: nextStatus } : r))
    );

    recordAudit('STATUS_CHANGE', {
      recordId,
      studentName: current.name,
      rollNumber: current.rollNumber,
      sessionName: current.sessionName,
      previousStatus: current.status,
      newStatus,
      reason: 'Status toggled by teacher',
    });

    onToast(
      `Changed ${current.name}'s status: ${current.status} → ${nextStatus}`,
      'info',
      { label: 'Undo', onClick: handleUndo }
    );
  };

  /**
   * Edits a record's status, session, and audit note.
   */
  const handleEditRecord = (updatedRecord, auditNote = '') => {
    if (!allowEditing) {
      onToast('Editing is locked in Settings.', 'warning');
      return;
    }

    const current = records.find((r) => r.id === updatedRecord.id);
    if (!current) return;

    setLastAction({
      type: 'edit',
      previousRecords: [...records],
      previousAudit: [...auditLogs],
      description: `Reverted edit on ${current.name}'s record`,
    });

    setRecords((prev) =>
      prev.map((r) =>
        r.id === updatedRecord.id
          ? {
              ...r,
              ...updatedRecord,
              note: auditNote || updatedRecord.note || r.note,
            }
          : r
      )
    );

    recordAudit('EDIT', {
      recordId: updatedRecord.id,
      studentName: current.name,
      rollNumber: current.rollNumber,
      sessionName: updatedRecord.sessionName || current.sessionName,
      previousStatus: current.status,
      newStatus: updatedRecord.status,
      reason: auditNote || 'Record amended in Records management',
    });

    onToast(
      `Updated attendance record for ${current.name}.`,
      'success',
      { label: 'Undo', onClick: handleUndo }
    );
  };

  /**
   * Deletes a single attendance record.
   */
  const handleDeleteRecord = (recordId) => {
    if (!allowEditing) {
      onToast('Deleting is locked in Settings.', 'warning');
      return;
    }

    const current = records.find((r) => r.id === recordId);
    if (!current) return;

    setLastAction({
      type: 'delete',
      previousRecords: [...records],
      previousAudit: [...auditLogs],
      description: `Restored record for ${current.name}`,
    });

    setRecords((prev) => prev.filter((r) => r.id !== recordId));

    recordAudit('DELETE', {
      recordId,
      studentName: current.name,
      rollNumber: current.rollNumber,
      sessionName: current.sessionName,
      previousStatus: current.status,
      reason: 'Record deleted by teacher',
    });

    onToast(
      `Deleted record for ${current.name}.`,
      'info',
      { label: 'Undo', onClick: handleUndo }
    );
  };

  /**
   * Bulk deletes multiple records by ID.
   */
  const handleBulkDelete = (ids = []) => {
    if (!allowEditing) {
      onToast('Deleting is locked in Settings.', 'warning');
      return;
    }

    if (ids.length === 0) return;

    createAutoBackup({ records });

    setLastAction({
      type: 'bulk_delete',
      previousRecords: [...records],
      previousAudit: [...auditLogs],
      description: `Restored ${ids.length} deleted records`,
    });

    setRecords((prev) => prev.filter((r) => !ids.includes(r.id)));

    recordAudit('BULK_DELETE', {
      reason: `Bulk deleted ${ids.length} records`,
    });

    onToast(
      `Deleted ${ids.length} attendance records.`,
      'info',
      { label: 'Undo', onClick: handleUndo }
    );
  };

  /**
   * Clears all attendance records with auto-backup snapshot.
   */
  const handleClearAll = () => {
    createAutoBackup({ records, auditLogs });

    setLastAction({
      type: 'clear_all',
      previousRecords: [...records],
      previousAudit: [...auditLogs],
      description: 'Restored all cleared records',
    });

    setRecords([]);

    recordAudit('CLEAR_ALL', {
      reason: 'All attendance records cleared',
    });

    onToast('All attendance records have been cleared.', 'info', {
      label: 'Undo',
      onClick: handleUndo,
    });
  };

  const resetRecords = () => {
    setRecords(DEFAULT_RECORDS);
    setAuditLogs([]);
    setLastAction(null);
    saveVersioned(RECORDS_STORAGE_KEY, DEFAULT_RECORDS);
    saveVersioned(AUDIT_STORAGE_KEY, []);
  };

  return {
    records,
    auditLogs,
    totalRecords,
    presentCount,
    absentCount,
    lateCount,
    attendancePercentage,
    lastAction,
    canUndo: Boolean(lastAction),
    handleAddRecord,
    handleAddMultipleRecords,
    handleChangeStatus,
    handleEditRecord,
    handleDeleteRecord,
    handleBulkDelete,
    handleClearAll,
    handleUndo,
    resetRecords,
    setRecords,
  };
}
