import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, UserPlus } from 'lucide-react';
import ChartTooltip from './ChartTooltip.jsx';

const PRESENT_COLOR = '#10B981';
const ABSENT_COLOR = '#F43F5E';
const LATE_COLOR = '#F59E0B';

/**
 * DistributionChart Component
 *
 * The "Attendance Distribution" donut. It is purely presentational — the
 * counts are calculated in App from the attendance records and passed in as
 * props, so there is exactly one source of truth for every statistic.
 *
 * @param {Object} props
 * @param {number} props.total               - Total attendance records.
 * @param {number} props.presentCount        - Records marked Present.
 * @param {number} props.absentCount         - Records marked Absent.
 * @param {number} props.lateCount           - Records marked Late.
 * @param {Function} props.onAddFirst        - Opens "Mark Attendance" from the empty state.
 */
function DistributionChart({ total, presentCount, absentCount, lateCount, onAddFirst }) {
  const slices = [
    { key: 'present', name: 'Present', value: presentCount, fill: PRESENT_COLOR },
    { key: 'absent', name: 'Absent', value: absentCount, fill: ABSENT_COLOR },
    { key: 'late', name: 'Late', value: lateCount, fill: LATE_COLOR },
  ].filter((slice) => slice.value > 0); // Empty slices would render stray arcs.

  const share = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <section className="panel chart-panel" aria-label="Attendance distribution">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">Attendance Distribution</h2>
          <p className="panel__subtitle">Status distribution of all recorded students.</p>
        </div>
      </div>

      <div className="chart-panel__body">
        {total === 0 ? (
          <div className="chart-empty">
            <span className="chart-empty__icon" aria-hidden="true">
              <PieChartIcon size={26} />
            </span>
            <h3 className="chart-empty__title">No distribution to show.</h3>
            <p className="chart-empty__text">
              The donut fills up as soon as you mark a student Present, Absent or Late.
            </p>
            <button type="button" className="btn btn--primary btn--sm" onClick={onAddFirst}>
              <UserPlus size={15} />
              Mark Attendance
            </button>
          </div>
        ) : (
          <>
            <div className="donut-figure">
              <ResponsiveContainer width="100%" height={212}>
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="64%"
                    outerRadius="94%"
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.key} fill={slice.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="donut-figure__center" aria-hidden="true">
                <span className="donut-figure__value">{total}</span>
                <span className="donut-figure__label">Records</span>
              </div>
            </div>

            <div className="donut-legend">
              {slices.map((slice) => (
                <div key={slice.key} className={`donut-legend__row donut-legend__row--${slice.key}`}>
                  <span className="donut-legend__dot" aria-hidden="true" />
                  <span className="donut-legend__name">{slice.name}</span>
                  <span className="donut-legend__value">
                    {slice.value} · {share(slice.value)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default DistributionChart;
