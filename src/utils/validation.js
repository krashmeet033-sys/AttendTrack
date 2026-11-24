/**
 * Centralized Validation Utility
 *
 * Provides reusable validation rules for student data, attendance entries,
 * classroom sessions, CSV rosters, and JSON backups.
 */

/**
 * Validates a student record.
 *
 * @param {Object} student - { name, rollNumber, className, semester }
 * @param {Array} existingStudents - Current students roster
 * @param {string} [currentStudentId] - ID of student being edited (to skip self-match)
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateStudent(student, existingStudents = [], currentStudentId = null) {
  const errors = {};
  const name = String(student.name || '').trim();
  const rollNumber = String(student.rollNumber || '').trim();

  if (!name) {
    errors.name = 'Student Name is required.';
  } else if (name.length < 2) {
    errors.name = 'Student Name must be at least 2 characters.';
  }

  if (!rollNumber) {
    errors.rollNumber = 'Roll Number is required.';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(rollNumber)) {
    errors.rollNumber = 'Roll Number can only contain alphanumeric characters, hyphens, and underscores.';
  } else {
    const isDuplicate = existingStudents.some(
      (s) =>
        s.id !== currentStudentId &&
        String(s.rollNumber).trim().toLowerCase() === rollNumber.toLowerCase()
    );
    if (isDuplicate) {
      errors.rollNumber = `Roll Number "${rollNumber}" is already enrolled.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates an attendance record before saving.
 *
 * @param {Object} record - { name, rollNumber, status, sessionId }
 * @param {Array} existingRecords - Records in the active session
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateAttendanceRecord(record, existingRecords = []) {
  const errors = {};
  const name = String(record.name || '').trim();
  const rollNumber = String(record.rollNumber || '').trim();
  const status = record.status;
  const validStatuses = ['Present', 'Absent', 'Late'];

  if (!name) {
    errors.name = 'Student Name is required.';
  }

  if (!rollNumber) {
    errors.rollNumber = 'Roll Number is required.';
  }

  if (!status || !validStatuses.includes(status)) {
    errors.status = 'Attendance Status must be Present, Absent, or Late.';
  }

  if (rollNumber && existingRecords.length > 0) {
    const isDuplicate = existingRecords.some(
      (r) =>
        String(r.rollNumber).trim().toLowerCase() === rollNumber.toLowerCase() &&
        r.id !== record.id
    );
    if (isDuplicate) {
      errors.rollNumber = `Roll Number "${rollNumber}" already has attendance marked for this session.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a classroom session object.
 *
 * @param {Object} session - { name, subject, date, startTime, endTime }
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateSession(session) {
  const errors = {};
  const name = String(session.name || '').trim();
  const date = session.date;

  if (!name) {
    errors.name = 'Session title or lecture topic is required.';
  } else if (name.length < 3) {
    errors.name = 'Session title must be at least 3 characters.';
  }

  if (!date) {
    errors.date = 'Session date is required.';
  }

  if (session.startTime && session.endTime && session.startTime >= session.endTime) {
    errors.endTime = 'End time must be after start time.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates parsed JSON backup data before restoring state.
 *
 * @param {any} data - Parsed JSON object
 * @returns {{ isValid: boolean, message?: string }}
 */
export function validateJsonBackup(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, message: 'Invalid backup file: Root must be a JSON object.' };
  }

  if (!Array.isArray(data.students) && !Array.isArray(data.attendanceRecords)) {
    return {
      isValid: false,
      message: 'Invalid backup format: Must contain students or attendanceRecords arrays.',
    };
  }

  return { isValid: true };
}
