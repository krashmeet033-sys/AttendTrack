import React from 'react';
import { Trash2, RefreshCw, Edit3 } from 'lucide-react';

/**
 * AttendanceCard Component
 *
 * A reusable presentational component that displays one student's attendance
 * record. All data arrives through props and the styling is applied
 * conditionally from the record's status:
 *
 *   Present -> green   |   Absent -> red   |   Late -> amber
 *
 * It lays itself out as a row inside the Attendance Records table on desktop,
 * and collapses into a stacked card on smaller screens. Each value cell carries
 * a `data-label`, which the stylesheet prints as a heading when the table folds
 * into cards.
 *
 * @param {Object} props
 * @param {Object} props.record            - { id, name, rollNumber, status, recordedAt }
 * @param {Function} props.onDelete        - Called with the record id (asks for confirmation in App).
 * @param {Function} [props.onChangeStatus]- Called with the record id to cycle the status.
 * @param {Function} [props.onEdit]        - Called with the record object to trigger edit modal.
 */
function AttendanceCard({ record, onDelete, onChangeStatus, onEdit, allowEditing = true }) {
  const { id, name, rollNumber, status, recordedAt } = record;

  // Maps the status to a css modifier so present/absent/late each get their own colour.
  const statusModifier = String(status).toLowerCase(); // present | absent | late

  /** Builds up-to-two-letter initials for the avatar, e.g. "Aarav Sharma" -> "AS". */
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  /** Formats the stored ISO timestamp as a readable date, e.g. "13 Nov 2026". */
  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  /** Formats the stored ISO timestamp for display, e.g. "09:42 AM". */
  const formatTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <article
      role="row"
      className={`attendance-card attendance-card--${statusModifier}`}
    >
      <div className="attendance-card__cell attendance-card__cell--name">
        <span className="attendance-card__avatar" aria-hidden="true">
          {initials}
        </span>
        <span>
          <span className="attendance-card__name">{name}</span>
          {record.sessionName ? (
            <span className="attendance-card__session">{record.sessionName}</span>
          ) : null}
        </span>
      </div>

      <div
        role="cell"
        className="attendance-card__cell attendance-card__cell--roll attendance-card__roll"
        data-label="Roll Number"
      >
        {rollNumber}
      </div>

      <div
        role="cell"
        className="attendance-card__cell attendance-card__cell--status"
        data-label="Attendance Status"
      >
        <span className={`status-badge status-badge--${statusModifier}`}>
          <span className="status-badge__dot" aria-hidden="true" />
          {status}
        </span>
      </div>

      <div
        role="cell"
        className="attendance-card__cell attendance-card__cell--date attendance-card__date"
        data-label="Date"
      >
        {formatDate(recordedAt)}
      </div>

      <div
        role="cell"
        className="attendance-card__cell attendance-card__cell--time attendance-card__time"
        data-label="Time"
      >
        {formatTime(recordedAt)}
      </div>

      <div
        role="cell"
        className="attendance-card__cell attendance-card__cell--actions"
      >
        {onEdit && (
          <button
            type="button"
            className="card-icon-btn"
            onClick={() => allowEditing && onEdit(record)}
            disabled={!allowEditing}
            title={allowEditing ? "Edit attendance record" : "Editing disabled in settings"}
            aria-label={`Edit record for ${name}`}
            style={!allowEditing ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            <Edit3 size={15} />
          </button>
        )}

        {onChangeStatus && (
          <button
            type="button"
            className="card-icon-btn"
            onClick={() => allowEditing && onChangeStatus(id)}
            disabled={!allowEditing}
            title={allowEditing ? "Change attendance status" : "Status cycling disabled in settings"}
            aria-label={`Change status for ${name}`}
            style={!allowEditing ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            <RefreshCw size={15} />
          </button>
        )}

        <button
          type="button"
          className="card-icon-btn card-icon-btn--danger"
          onClick={() => allowEditing && onDelete(id)}
          disabled={!allowEditing}
          title={allowEditing ? "Delete attendance record" : "Record deletion disabled in settings"}
          aria-label={`Delete record for ${name}`}
          style={!allowEditing ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}

export default AttendanceCard;
