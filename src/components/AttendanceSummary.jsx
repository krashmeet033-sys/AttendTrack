import React from 'react';
import { Info } from 'lucide-react';

/**
 * AttendanceSummary Component
 *
 * The "Attendance Summary" panel. Every figure is passed down from App, where it
 * is calculated from the attendance records held in useState — the component
 * itself only draws what it is given.
 *
 * @param {Object} props
 * @param {number} props.total                 - Total attendance records.
 * @param {number} props.presentCount          - Records marked Present.
 * @param {number} props.absentCount           - Records marked Absent.
 * @param {number} props.lateCount             - Records marked Late.
 * @param {number} props.attendancePercentage  - Present ÷ total, as a percentage.
 */
function AttendanceSummary({
  total,
  presentCount,
  absentCount,
  lateCount,
  attendancePercentage,
}) {
  const rows = [
    { key: 'present', label: 'Present students', count: presentCount },
    { key: 'absent', label: 'Absent students', count: absentCount },
    { key: 'late', label: 'Late students', count: lateCount },
  ];

  const share = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <section className="panel" aria-label="Attendance summary">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">Attendance Summary</h2>
          <p className="panel__subtitle">
            {total > 0
              ? `Across all ${total} attendance records.`
              : 'Add a record to build the summary.'}
          </p>
        </div>
      </div>

      <div className="panel__body">
        <div className="summary-list">
          {rows.map((row) => {
            const rowPercentage = share(row.count);

            return (
              <div key={row.key} className={`summary-row summary-row--${row.key}`}>
                <div className="summary-row__head">
                  <span className="summary-row__label">
                    <span className="summary-row__dot" aria-hidden="true" />
                    {row.label}
                  </span>
                  <span className="summary-row__value">
                    {row.count} · {rowPercentage}%
                  </span>
                </div>

                <div className="summary-bar">
                  <div
                    className="summary-bar__fill"
                    style={{ width: `${rowPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="summary-row summary-row--total">
            <div className="summary-row__head">
              <span className="summary-row__label">
                <span className="summary-row__dot" aria-hidden="true" />
                Overall attendance
              </span>
              <span className="summary-row__value">{attendancePercentage}%</span>
            </div>

            <div className="summary-bar">
              <div
                className="summary-bar__fill"
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>
        </div>

        <p className="summary-footnote">
          <Info size={15} />
          <span>
            Overall attendance is Present divided by all records in the current set. Late is tracked
            separately and is not counted as Present.
          </span>
        </p>
      </div>
    </section>
  );
}

export default AttendanceSummary;
