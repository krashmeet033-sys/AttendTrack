import React from 'react';
import { Activity, History } from 'lucide-react';

/**
 * Turns a record timestamp into a short human phrase such as "Just now",
 * "12m ago", "3h ago", "Yesterday" or a calendar date.
 */
function formatRelative(value) {
  if (!value) return 'Unknown time';

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return 'Unknown time';

  const minutes = Math.floor((Date.now() - then) / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * ActivityFeed Component
 *
 * The "Recent Attendance Activity" panel. It sorts the live records by their
 * `recordedAt` timestamp and shows the newest ones first, so the panel is a real
 * audit trail rather than a decorative list.
 *
 * @param {Object} props
 * @param {Array} props.records  - The live attendance records held in App.
 * @param {number} [props.limit=6] - How many of the newest records to show.
 */
function ActivityFeed({ records, limit = 6, onViewAll, onSelectRecord }) {
  const recent = [...records]
    .sort((a, b) => new Date(b.recordedAt || 0) - new Date(a.recordedAt || 0))
    .slice(0, limit);

  return (
    <section className="panel" aria-label="Recent attendance activity">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">Recent Attendance Activity</h2>
          <p className="panel__subtitle">The latest records added to this session.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className="live-chip">
            <Activity size={14} />
            {records.length} total
          </span>
          {onViewAll && records.length > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={onViewAll}>
              View All
            </button>
          )}
        </div>
      </div>

      <div className="panel__body">
        {recent.length === 0 ? (
          <div className="chart-empty">
            <span className="chart-empty__icon" aria-hidden="true">
              <History size={26} />
            </span>
            <h3 className="chart-empty__title">No activity yet.</h3>
            <p className="chart-empty__text">
              Every attendance record you add shows up here with a live timestamp.
            </p>
          </div>
        ) : (
          <ul className="activity-list">
            {recent.map((record) => {
              const statusKey = String(record.status).toLowerCase();

              return (
                <li
                  key={record.id}
                  className="activity-item"
                  onClick={onSelectRecord ? () => onSelectRecord(record) : undefined}
                  role={onSelectRecord ? 'button' : undefined}
                  tabIndex={onSelectRecord ? 0 : undefined}
                  onKeyDown={
                    onSelectRecord
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectRecord(record);
                          }
                        }
                      : undefined
                  }
                  style={onSelectRecord ? { cursor: 'pointer' } : undefined}
                  title={onSelectRecord ? `Open record for ${record.name} (${record.rollNumber})` : undefined}
                >
                  <span
                    className={`activity-item__dot activity-item__dot--${statusKey}`}
                    aria-hidden="true"
                  />

                  <div className="activity-item__main">
                    <span className="activity-item__name">{record.name}</span>
                    <span className="activity-item__meta">
                      {record.rollNumber} · marked {record.status}
                    </span>
                  </div>

                  <span className="activity-item__time">{formatRelative(record.recordedAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default ActivityFeed;
