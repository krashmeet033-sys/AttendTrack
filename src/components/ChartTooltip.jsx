import React from 'react';

/**
 * ChartTooltip Component
 *
 * A tiny shared popover used by every Recharts chart in the app so hovering any
 * chart looks identical. It receives the props Recharts passes to a custom
 * `content` renderer: `active`, `payload` and `label`.
 *
 * @param {Object} props
 * @param {boolean} props.active   - Whether the tooltip is currently visible.
 * @param {Array} props.payload    - The hovered data points.
 * @param {string} [props.label]   - The hovered category label.
 * @param {string} [props.labelKey] - Reads a richer heading off the data point
 *                                    (used to show a full date instead of a weekday).
 */
function ChartTooltip({ active, payload, label, labelKey }) {
  if (!active || !payload || payload.length === 0) return null;

  // Points with a zero value add noise to the popover, so they are dropped.
  const rows = payload.filter((entry) => Number(entry.value) > 0);
  if (rows.length === 0) return null;

  const heading =
    (labelKey && payload[0] && payload[0].payload && payload[0].payload[labelKey]) || label;

  return (
    <div className="chart-tooltip">
      {heading != null && <div className="chart-tooltip__label">{heading}</div>}

      {rows.map((entry) => (
        <div key={entry.dataKey || entry.name} className="chart-tooltip__row">
          <span
            className="chart-tooltip__swatch"
            style={{ background: entry.color || entry.payload?.fill }}
            aria-hidden="true"
          />
          <span className="chart-tooltip__name">{entry.name}</span>
          <strong className="chart-tooltip__value">{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default ChartTooltip;
