import React from 'react';

/**
 * StatCard Component
 *
 * A reusable KPI card. Every value passed in is calculated in App from the
 * attendance records held in React state — nothing is hardcoded.
 *
 * @param {Object} props
 * @param {string} props.label             - Metric label, e.g. "Total Students".
 * @param {string|number} props.value      - Dynamically computed value.
 * @param {string} [props.hint]            - Short supporting line under the value.
 * @param {React.ReactNode} props.icon     - Lucide icon element.
 * @param {'navy'|'blue'|'green'|'red'|'amber'|'teal'} [props.variant='blue']
 */
function StatCard({ label, value, hint, icon, variant = 'blue', onClick }) {
  return (
    <article
      className={`stat-card stat-card--${variant} ${onClick ? 'stat-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon" aria-hidden="true">
          {icon}
        </span>
      </div>

      <div>
        <div className="stat-card__value">{value}</div>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </article>
  );
}

export default StatCard;
