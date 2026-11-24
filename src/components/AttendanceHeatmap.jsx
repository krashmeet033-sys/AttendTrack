import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle, Info, CalendarDays, Award, Users } from 'lucide-react';

/**
 * AttendanceHeatmap Component
 *
 * Interactive monthly attendance calendar & density heatmap.
 * Renders days of the selected month, identifies days with lecture records,
 * and visually color-codes attendance turnout.
 */
function AttendanceHeatmap({ records = [], sessions = [] }) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 10, 1)); // November 2026

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Helper to extract clean YYYY-MM-DD from any record
  const getRecordDate = (r) => {
    if (r.sessionDate) return r.sessionDate.slice(0, 10);
    if (r.recordedAt) {
      const d = new Date(r.recordedAt);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
      return r.recordedAt.slice(0, 10);
    }
    return '';
  };

  // Group records by day in this month
  const dayStatsMap = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayRecords = records.filter((r) => getRecordDate(r) === dayStr);
    const daySessions = sessions.filter((s) => s.date === dayStr);

    const total = dayRecords.length;
    const present = dayRecords.filter((r) => r.status === 'Present').length;
    const absent = dayRecords.filter((r) => r.status === 'Absent').length;
    const late = dayRecords.filter((r) => r.status === 'Late').length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    dayStatsMap[d] = {
      day: d,
      dateStr: dayStr,
      hasRecords: total > 0,
      hasSession: daySessions.length > 0,
      sessionName: daySessions[0]?.name || (total > 0 ? 'Classroom Session' : null),
      total,
      present,
      absent,
      late,
      pct,
    };
  }

  const [activeHoverDay, setActiveHoverDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleGoToday = () => {
    setCurrentMonthDate(new Date(2026, 10, 1)); // Default to academic semester month
    setSelectedDay(null);
  };

  // Calendar matrix days
  const calendarDays = [];
  // Leading empty blanks
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ blank: true, key: `blank-${i}` });
  }
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ blank: false, day: d, data: dayStatsMap[d], key: `day-${d}` });
  }

  // Monthly summary stats
  const daysWithRecords = Object.values(dayStatsMap).filter((d) => d.hasRecords);
  const activeDaysCount = daysWithRecords.length;
  const totalMonthRecords = Object.values(dayStatsMap).reduce((acc, d) => acc + d.total, 0);
  const totalMonthPresent = Object.values(dayStatsMap).reduce((acc, d) => acc + d.present, 0);
  const avgTurnoutPct = totalMonthRecords > 0 ? Math.round((totalMonthPresent / totalMonthRecords) * 100) : 0;
  const highestDay = daysWithRecords.length > 0 ? [...daysWithRecords].sort((a, b) => b.pct - a.pct)[0] : null;
  const lowestDay = daysWithRecords.length > 0 ? [...daysWithRecords].sort((a, b) => a.pct - b.pct)[0] : null;

  // Selected day records
  const selectedDayRecords = selectedDay
    ? records.filter((r) => getRecordDate(r) === selectedDay.dateStr)
    : [];

  return (
    <section className="panel" aria-label="Monthly attendance heatmap">
      <div className="panel__header">
        <div>
          <h3 className="panel__title">Attendance Calendar &amp; Activity Map</h3>
          <p className="panel__subtitle">Visual date-by-date attendance timeline. Select any date to inspect classroom records.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleGoToday}
            style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
          >
            Today
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <button
              type="button"
              className="icon-btn"
              style={{ width: '28px', height: '28px' }}
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 650, fontSize: '0.85rem', minWidth: '125px', textAlign: 'center' }}>
              {monthName}
            </span>
            <button
              type="button"
              className="icon-btn"
              style={{ width: '28px', height: '28px' }}
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="panel__body">
        {/* Monthly Summary Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          padding: '0.85rem 1rem',
          background: 'var(--color-surface-sunken)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Active Class Days</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>{activeDaysCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Sessions recorded</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Monthly Turnout</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>{avgTurnoutPct}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Average attendance</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Total Entries</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>{totalMonthRecords}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Student attendance logs</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Highest Turnout</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-present)' }}>{highestDay ? `${highestDay.pct}%` : '—'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{highestDay ? `Nov ${highestDay.day} (${highestDay.present} Present)` : 'No records'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Lowest Turnout</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-absent)' }}>{lowestDay ? `${lowestDay.pct}%` : '—'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{lowestDay ? `Nov ${lowestDay.day} (${lowestDay.pct}% turnout)` : 'No records'}</div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="heatmap-container">
          <div className="heatmap-weekdays">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="heatmap-grid">
            {calendarDays.map((cell) => {
              if (cell.blank) {
                return <div key={cell.key} className="heatmap-cell heatmap-cell--blank" />;
              }

              const { day, data } = cell;
              let toneClass = 'heatmap-cell--empty';

              if (data.hasRecords) {
                if (data.pct >= 80) toneClass = 'heatmap-cell--high';
                else if (data.pct >= 60) toneClass = 'heatmap-cell--medium';
                else toneClass = 'heatmap-cell--low';
              } else if (data.hasSession) {
                toneClass = 'heatmap-cell--scheduled';
              }

              const isSelected = selectedDay && selectedDay.dateStr === data.dateStr;

              return (
                <div
                  key={cell.key}
                  className={`heatmap-cell ${toneClass} ${isSelected ? 'heatmap-cell--selected' : ''}`}
                  onClick={() => setSelectedDay(isSelected ? null : data)}
                  onMouseEnter={() => setActiveHoverDay(data)}
                  onMouseLeave={() => setActiveHoverDay(null)}
                  style={{ cursor: 'pointer' }}
                  title={
                    data.hasRecords
                      ? `${data.dateStr}: ${data.pct}% attendance (${data.present} Present, ${data.absent} Absent). Click to inspect records.`
                      : data.hasSession
                      ? `${data.dateStr}: Scheduled session (${data.sessionName}). Click to view.`
                      : `${data.dateStr}: No sessions recorded. Click to inspect.`
                  }
                >
                  <span className="heatmap-cell__day">{day}</span>
                  {data.hasRecords && (
                    <span className="heatmap-cell__pct">{data.pct}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Records Drawer */}
        {selectedDay && (
          <div className="calendar-selected-panel" style={{
            marginTop: '1.25rem',
            padding: '1.15rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Records for {new Date(`${selectedDay.dateStr}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {selectedDay.hasRecords
                    ? `${selectedDay.total} student records recorded (${selectedDay.present} Present, ${selectedDay.absent} Absent, ${selectedDay.late} Late · ${selectedDay.pct}% Turnout)`
                    : 'No attendance records on this date.'}
                </span>
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setSelectedDay(null)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                Close Day View
              </button>
            </div>

            {selectedDayRecords.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.65rem' }}>
                {selectedDayRecords.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--color-surface-sunken)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 650, fontSize: '0.85rem', color: 'var(--color-text)' }}>{rec.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Roll: {rec.rollNumber}</div>
                    </div>
                    <span className={`status-badge status-badge--${rec.status.toLowerCase()}`}>
                      <span className="status-badge__dot" aria-hidden="true" />
                      {rec.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                No students recorded on {selectedDay.dateStr}. Select a highlighted date (e.g. Nov 11, 12, 14, 18, 19, 20, 21) to view recorded turnouts.
              </div>
            )}
          </div>
        )}

        {/* Hover Inspector / Legend Banner */}
        <div className="heatmap-detail-card" style={{ marginTop: '1rem' }}>
          {activeHoverDay && activeHoverDay.hasRecords ? (
            <div className="heatmap-detail-content">
              <div>
                <strong>{activeHoverDay.dateStr}</strong>
                <span style={{ marginLeft: '0.5rem', color: 'var(--color-text-muted)' }}>
                  {activeHoverDay.sessionName || 'Classroom Lecture'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span className="text-present" style={{ fontWeight: 650 }}>
                  {activeHoverDay.present} Present
                </span>
                <span className="text-absent" style={{ fontWeight: 650 }}>
                  {activeHoverDay.absent} Absent
                </span>
                <span className="text-late" style={{ fontWeight: 650 }}>
                  {activeHoverDay.late} Late
                </span>
                <span className="status-badge status-badge--present">
                  {activeHoverDay.pct}% Turnout
                </span>
              </div>
            </div>
          ) : activeHoverDay && activeHoverDay.hasSession ? (
            <div className="heatmap-detail-content">
              <strong>{activeHoverDay.dateStr}</strong>
              <span style={{ color: 'var(--color-primary-dark)' }}>
                Scheduled session pending attendance: {activeHoverDay.sessionName}
              </span>
            </div>
          ) : (
            <div className="heatmap-legend">
              <span className="heatmap-legend__item">
                <span className="heatmap-swatch heatmap-swatch--high" /> ≥80% High Attendance
              </span>
              <span className="heatmap-legend__item">
                <span className="heatmap-swatch heatmap-swatch--medium" /> 60–79% Moderate
              </span>
              <span className="heatmap-legend__item">
                <span className="heatmap-swatch heatmap-swatch--low" /> &lt;60% Shortage
              </span>
              <span className="heatmap-legend__item">
                <span className="heatmap-swatch heatmap-swatch--empty" /> No Sessions
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AttendanceHeatmap;
