import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, BarChart3, UserPlus } from 'lucide-react';
import ChartTooltip from './ChartTooltip.jsx';

/**
 * Fixed hex values rather than CSS variables: the Recharts SVG layer needs
 * concrete colour strings, and these three read well on the deep navy canvas
 * as well as the light theme.
 */
const PRESENT_COLOR = '#10B981';
const ABSENT_COLOR = '#F43F5E';
const LATE_COLOR = '#F59E0B';

/** How many calendar days the overview looks back. */
const DAYS_SHOWN = 7;

/** Local YYYY-MM-DD key so each record lands on the correct calendar day. */
function dayKey(value) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * OverviewChart Component
 *
 * The "Attendance Overview" panel. It buckets the real attendance records into
 * the last seven calendar days and stacks Present / Absent / Late per day.
 *
 * Nothing here is simulated: a day with no records simply reports zero, and the
 * chart is recalculated from state on every render.
 *
 * @param {Object} props
 * @param {Array} props.records      - The live attendance records held in App.
 * @param {Function} props.onAddFirst - Opens "Mark Attendance" from the empty state.
 */
function OverviewChart({ records, onAddFirst }) {
  const data = useMemo(() => {
    const buckets = [];
    const today = new Date();

    for (let offset = DAYS_SHOWN - 1; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);

      buckets.push({
        key: dayKey(date),
        weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        Present: 0,
        Absent: 0,
        Late: 0,
      });
    }

    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    records.forEach((record) => {
      if (!record.recordedAt) return;
      const bucket = byKey.get(dayKey(record.recordedAt));
      if (!bucket) return;
      if (Object.prototype.hasOwnProperty.call(bucket, record.status)) {
        bucket[record.status] += 1;
      }
    });

    return buckets;
  }, [records]);

  const total = records.length;
  const weekTotal = data.reduce(
    (sum, day) => sum + day.Present + day.Absent + day.Late,
    0
  );

  return (
    <section className="panel chart-panel" aria-label="Attendance overview">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">Attendance Overview</h2>
          <p className="panel__subtitle">
            Attendance marked on each of the last {DAYS_SHOWN} days.
          </p>
        </div>

        <span className="live-chip">
          <TrendingUp size={14} />
          Live from React state
        </span>
      </div>

      <div className="chart-panel__body">
        {total === 0 ? (
          <div className="chart-empty">
            <span className="chart-empty__icon" aria-hidden="true">
              <BarChart3 size={26} />
            </span>
            <h3 className="chart-empty__title">Nothing to plot yet.</h3>
            <p className="chart-empty__text">
              Mark your first student and this chart will start drawing itself from real
              attendance records.
            </p>
            <button type="button" className="btn btn--primary btn--sm" onClick={onAddFirst}>
              <UserPlus size={15} />
              Mark Attendance
            </button>
          </div>
        ) : (
          <>
            <div className="chart-canvas chart-canvas--overview">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />

                  <XAxis dataKey="weekday" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={38} />

                  <Tooltip
                    cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}
                    content={<ChartTooltip labelKey="fullDate" />}
                  />

                  <Bar dataKey="Present" stackId="day" fill={PRESENT_COLOR} maxBarSize={28} />
                  <Bar dataKey="Absent" stackId="day" fill={ABSENT_COLOR} maxBarSize={28} />
                  <Bar
                    dataKey="Late"
                    stackId="day"
                    fill={LATE_COLOR}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-legend">
              <div className="chart-legend__item">
                <span className="chart-legend__swatch" style={{ background: PRESENT_COLOR }} />
                <span className="chart-legend__label">Present</span>
              </div>
              <div className="chart-legend__item">
                <span className="chart-legend__swatch" style={{ background: ABSENT_COLOR }} />
                <span className="chart-legend__label">Absent</span>
              </div>
              <div className="chart-legend__item">
                <span className="chart-legend__swatch" style={{ background: LATE_COLOR }} />
                <span className="chart-legend__label">Late</span>
              </div>
              <span className="chart-legend__total">
                {weekTotal} records in this window
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default OverviewChart;
