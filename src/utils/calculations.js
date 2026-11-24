/**
 * Centralized Attendance Calculations Utility
 *
 * Implements mathematically rigorous, consistently rounded calculations
 * for student turnout, attendance rates, exam eligibility, and status distributions.
 */

/**
 * Calculates Roster Turnout: Proportion of enrolled students with recorded entries.
 * Turnout % = (Recorded Entries ÷ Enrolled Students) × 100
 *
 * @param {number} recordedCount  - Number of students with recorded entries in this session
 * @param {number} enrolledCount  - Total number of students enrolled in the class roster
 * @returns {number} Rounded percentage (0–100)
 */
export function calculateTurnoutPercentage(recordedCount, enrolledCount) {
  if (!enrolledCount || enrolledCount <= 0 || !recordedCount || recordedCount <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((recordedCount / enrolledCount) * 100));
}

/**
 * Calculates Attendance Rate according to the configured Institutional Policy for Late arrivals:
 *  - 'separate': Late arrivals are tracked separately (0% attendance credit)
 *  - 'half': Late arrivals receive half attendance credit (50% value)
 *  - 'present': Late arrivals are counted as present (100% attendance credit)
 *
 * Attendance % = (Effective Present ÷ Total Evaluated Sessions) × 100
 *
 * @param {number} presentCount   - Number of Present marks
 * @param {number} lateCount      - Number of Late marks
 * @param {number} totalSessions  - Total evaluated sessions with recorded entries
 * @param {string} [lateRule]     - 'separate' | 'half' | 'present'
 * @returns {number} Rounded percentage (0–100)
 */
export function calculateAttendancePercentage(
  presentCount = 0,
  lateCount = 0,
  totalSessions = 0,
  lateRule = 'separate'
) {
  if (!totalSessions || totalSessions <= 0) {
    return 0;
  }

  let effectivePresent = presentCount;
  if (lateRule === 'present') {
    effectivePresent += lateCount;
  } else if (lateRule === 'half') {
    effectivePresent += lateCount * 0.5;
  }

  return Math.min(100, Math.max(0, Math.round((effectivePresent / totalSessions) * 100)));
}

/**
 * Determines whether a student meets the institutional minimum threshold for exam clearance.
 *
 * @param {number} percentage     - Student's cumulative attendance percentage
 * @param {number} [threshold=75] - Minimum attendance required (default 75%)
 * @param {number} [totalSessions=0] - Total sessions evaluated
 * @returns {boolean} True if eligible or pending evaluation, false if in shortage
 */
export function isExamEligible(percentage, threshold = 75, totalSessions = 0) {
  if (totalSessions === 0) return true; // Newly enrolled students with 0 sessions are not penalized
  return percentage >= threshold;
}

/**
 * Computes comprehensive metrics for an enrolled student against classroom records.
 *
 * @param {Object} student - Student record { id, name, rollNumber }
 * @param {Array} records  - Array of attendance records
 * @param {number} [threshold=75]
 * @param {string} [lateRule='separate']
 */
export function computeStudentMetrics(student, records = [], threshold = 75, lateRule = 'separate') {
  const rollNormalized = String(student.rollNumber).trim().toLowerCase();
  const studentRecords = records.filter(
    (r) => String(r.rollNumber).trim().toLowerCase() === rollNormalized
  );

  const total = studentRecords.length;
  const present = studentRecords.filter((r) => r.status === 'Present').length;
  const absent = studentRecords.filter((r) => r.status === 'Absent').length;
  const late = studentRecords.filter((r) => r.status === 'Late').length;

  const pct = total > 0 ? calculateAttendancePercentage(present, late, total, lateRule) : 0;
  const isEligible = total === 0 ? null : pct >= threshold; // null means no records yet

  return {
    ...student,
    total,
    present,
    absent,
    late,
    pct,
    isEligible,
    hasRecords: total > 0,
    records: studentRecords,
  };
}
