import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  UserPlus,
  Printer,
  Download,
  AlertTriangle,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  ShieldCheck,
  Calculator,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText,
} from 'lucide-react';
import OverviewChart from './OverviewChart.jsx';
import DistributionChart from './DistributionChart.jsx';
import AttendanceHeatmap from './AttendanceHeatmap.jsx';

/**
 * Chart colours matching the Lavender/Violet Design System.
 */
const PRESENT_COLOR = '#10B981';
const ABSENT_COLOR = '#F43F5E';
const LATE_COLOR = '#F59E0B';

/**
 * AttendanceAnalytics Component
 *
 * The Reports & Analytics page. Every number here is derived from the `records`
 * array that lives in App's useState — no simulated trends, no invented history.
 *
 * Features:
 *  - At-a-glance attendance overview
 *  - 7-day trend chart built from actual attendance dates
 *  - Present vs Absent vs Late donut distribution
 *  - Status breakdown percentage progress bars
 *  - Student-wise attendance comparison table
 *  - Calculated Attendance Insights (threshold analysis, top attendance, session counts)
 *  - CSV export & Printable report controls
 *
 * @param {Object} props
 * @param {Array} props.records       - The live attendance records.
 * @param {Function} props.onAddFirst - Opens the "Mark Attendance" page from the empty state.
 * @param {Array} [props.students]    - Enrolled student roster.
 * @param {number} [props.threshold]  - Attendance threshold (default 75%).
 * @param {Function} [props.onPrint]  - Print handler.
 * @param {Function} [props.onDownloadCSV] - CSV export handler.
 * @param {Array} [props.sessions]    - Available class sessions for comparative analytics.
 * @param {Object} [props.activeSession] - Active session object.
 */
function AttendanceAnalytics({
  records = [],
  onAddFirst = () => {},
  students = [],
  threshold = 75,
  lateRule = 'separate',
  onPrint = () => window.print(),
  onDownloadCSV,
  sessions = [],
  activeSession,
}) {
  const [sessionFilter, setSessionFilter] = useState('ALL');

  if (records.length === 0) {
    return (
      <section className="panel">
        <div className="empty-state">
          <div className="empty-state__art" aria-hidden="true">
            <BarChart3 size={40} strokeWidth={1.6} />
          </div>
          <h3 className="empty-state__title">No attendance data yet.</h3>
          <p className="empty-state__text">
            Reports are generated from your attendance records. Mark your first student and the
            overview, trend and breakdown will appear here.
          </p>
          <div className="empty-state__actions">
            <button type="button" className="btn btn--primary" onClick={onAddFirst}>
              <UserPlus size={16} />
              Mark Attendance
            </button>
          </div>
        </div>
      </section>
    );
  }

  const displayRecords =
    sessionFilter === 'ALL'
      ? records
      : records.filter(
          (r) => r.sessionId === sessionFilter || r.sessionName === sessionFilter
        );

  const total = displayRecords.length;
  const presentCount = displayRecords.filter((record) => record.status === 'Present').length;
  const absentCount = displayRecords.filter((record) => record.status === 'Absent').length;
  const lateCount = displayRecords.filter((record) => record.status === 'Late').length;

  // Attendance percentage for this record set = Present ÷ Total.
  const attendancePercentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  /** Converts a count into a share of the total (0 when there are no records). */
  const share = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  // Grouped rows reused by the status breakdown panel.
  const breakdownRows = [
    { key: 'present', label: 'Present', count: presentCount, color: PRESENT_COLOR },
    { key: 'absent', label: 'Absent', count: absentCount, color: ABSENT_COLOR },
    { key: 'late', label: 'Late', count: lateCount, color: LATE_COLOR },
  ];

  // Distinct students who have records in displayRecords, plus all enrolled students
  const allStudentsToDisplay =
    students && students.length > 0
      ? students
      : Array.from(new Set(displayRecords.map((r) => r.rollNumber))).map((roll) => ({
          rollNumber: roll,
          name: displayRecords.find((r) => r.rollNumber === roll)?.name || roll,
        }));

  const studentStats = allStudentsToDisplay.map((st) => {
    const studentRecords = displayRecords.filter(
      (r) => String(r.rollNumber).trim().toLowerCase() === String(st.rollNumber).trim().toLowerCase()
    );
    const sTotal = studentRecords.length;
    const pCount = studentRecords.filter((r) => r.status === 'Present').length;
    const aCount = studentRecords.filter((r) => r.status === 'Absent').length;
    const lCount = studentRecords.filter((r) => r.status === 'Late').length;

    let effectivePresent = pCount;
    if (lateRule === 'present') effectivePresent += lCount;
    else if (lateRule === 'half') effectivePresent += lCount * 0.5;

    const pct = sTotal > 0 ? Math.min(100, Math.round((effectivePresent / sTotal) * 100)) : 0;
    return {
      roll: st.rollNumber,
      name: st.name,
      total: sTotal,
      pCount,
      aCount,
      lCount,
      pct,
      hasRecords: sTotal > 0,
    };
  });

  // Calculate insights
  const lowAttendanceStudents = studentStats.filter((s) => s.hasRecords && s.pct < threshold);
  const bestStudent = [...studentStats].filter((s) => s.hasRecords).sort((a, b) => b.pct - a.pct)[0];

  const [analyticsTab, setAnalyticsTab] = useState('overview'); // 'overview' | 'builder' | 'predictor' | 'heatmap'

  // Report Builder state
  const [builderRange, setBuilderRange] = useState('all');
  const [builderSubj, setBuilderSubj] = useState('ALL');
  const [builderSess, setBuilderSess] = useState('ALL');
  const [builderCohort, setBuilderCohort] = useState('ALL');
  const [builderStatus, setBuilderStatus] = useState('ALL');

  // Filter records for Report Builder
  const builderRecords = records.filter((r) => {
    const sessObj = sessions.find((s) => s.id === r.sessionId || s.name === r.sessionName);
    const subj = r.subject || sessObj?.subject || '';
    if (builderSubj !== 'ALL' && subj !== builderSubj && (!r.sessionName || !r.sessionName.toLowerCase().includes(builderSubj.toLowerCase()))) {
      return false;
    }
    if (builderSess !== 'ALL' && r.sessionId !== builderSess && r.sessionName !== builderSess) {
      return false;
    }
    if (builderStatus !== 'ALL' && r.status !== builderStatus) {
      return false;
    }
    if (builderRange === '7days') {
      const d = new Date(r.recordedAt || r.sessionDate || 0);
      if ((Date.now() - d.getTime()) / (1000 * 3600 * 24) > 7) return false;
    } else if (builderRange === '30days') {
      const d = new Date(r.recordedAt || r.sessionDate || 0);
      if ((Date.now() - d.getTime()) / (1000 * 3600 * 24) > 30) return false;
    }
    return true;
  });

  // Calculate cohort performance in Report Builder
  const cohortStudents = (students.length > 0 ? students : studentStats.map((s) => ({ id: s.roll, name: s.name, rollNumber: s.roll }))).map((st) => {
    const stRecords = builderRecords.filter((r) => r.rollNumber.toLowerCase() === st.rollNumber.toLowerCase());
    const tot = stRecords.length;
    const p = stRecords.filter((r) => r.status === 'Present').length;
    const a = stRecords.filter((r) => r.status === 'Absent').length;
    const l = stRecords.filter((r) => r.status === 'Late').length;
    const pct = tot > 0 ? Math.round((p / tot) * 100) : 0;
    return { ...st, total: tot, present: p, absent: a, late: l, pct };
  }).filter((st) => {
    if (builderCohort === 'SHORTAGE') return st.total > 0 && st.pct < threshold;
    if (builderCohort === 'HIGH') return st.total > 0 && st.pct >= 90;
    return true;
  });

  const builderTotalRecords = builderRecords.length;
  const builderTotalPresent = builderRecords.filter((r) => r.status === 'Present').length;
  const builderTotalAbsent = builderRecords.filter((r) => r.status === 'Absent').length;
  const builderAvgPct = builderTotalRecords > 0 ? Math.round((builderTotalPresent / builderTotalRecords) * 100) : 0;

  const handleDownloadBuilderCSV = () => {
    const headers = ['Roll Number', 'Student Name', 'Evaluated Sessions', 'Present', 'Absent', 'Late', 'Turnout %', 'Academic Standing'];
    const rows = cohortStudents.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      s.total,
      s.present,
      s.absent,
      s.late,
      `${s.pct}%`,
      s.total === 0 ? 'No Records' : s.pct >= threshold ? 'Good Standing' : 'Shortage Warning',
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendtrack-report-${builderSubj.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Session-wise attendance comparison breakdown
  const sessionStats = sessions.map((sess) => {
    const sessRecords = records.filter(
      (r) => r.sessionId === sess.id || r.sessionName === sess.name
    );
    const sTotal = sessRecords.length;
    const sPresent = sessRecords.filter((r) => r.status === 'Present').length;
    const sAbsent = sessRecords.filter((r) => r.status === 'Absent').length;
    const sLate = sessRecords.filter((r) => r.status === 'Late').length;
    const sPct = sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 0;
    return {
      ...sess,
      total: sTotal,
      present: sPresent,
      absent: sAbsent,
      late: sLate,
      pct: sPct,
    };
  });

  return (
    <div className="dashboard-stack">
      {/* Header Toolbar with Print & Export */}
      <div className="panel" style={{ padding: '0.9rem 1.25rem', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Classroom Reports & Analytics</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Data-driven attendance performance, status distributions and threshold monitoring.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {sessions.length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} style={{ color: 'var(--color-primary)' }} />
                <select
                  id="analytics-session-filter"
                  className="sort-field__select"
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  aria-label="Filter analytics by session"
                >
                  <option value="ALL">All Recorded Sessions ({records.length})</option>
                  {sessions.map((s) => {
                    const count = records.filter(
                      (r) => r.sessionId === s.id || r.sessionName === s.name
                    ).length;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onPrint}
              title="Print attendance report sheet"
            >
              <Printer size={15} />
              Print Report
            </button>
            {onDownloadCSV && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={onDownloadCSV}
                title="Download CSV report"
              >
                <Download size={15} />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="filter-tabs" role="tablist" style={{ padding: '0.35rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', width: 'fit-content' }}>
        <button
          type="button"
          className={`filter-tab ${analyticsTab === 'overview' ? 'filter-tab--active' : ''}`}
          onClick={() => setAnalyticsTab('overview')}
        >
          <BarChart3 size={14} /> Executive Analytics
        </button>
        <button
          type="button"
          className={`filter-tab ${analyticsTab === 'builder' ? 'filter-tab--active' : ''}`}
          onClick={() => setAnalyticsTab('builder')}
        >
          <SlidersHorizontal size={14} /> Custom Report Builder
        </button>
        <button
          type="button"
          className={`filter-tab ${analyticsTab === 'heatmap' ? 'filter-tab--active' : ''}`}
          onClick={() => setAnalyticsTab('heatmap')}
        >
          <Calendar size={14} /> Monthly Heatmap
        </button>
      </div>

      {/* At-a-glance attendance overview */}
      <section className="analytics-overview" aria-label="Attendance overview">
        <div className="mini-stat">
          <span className="mini-stat__label">Total Records</span>
          <span className="mini-stat__value">{total}</span>
        </div>
        <div className="mini-stat mini-stat--present">
          <span className="mini-stat__label">Present</span>
          <span className="mini-stat__value">{presentCount}</span>
        </div>
        <div className="mini-stat mini-stat--absent">
          <span className="mini-stat__label">Absent</span>
          <span className="mini-stat__value">{absentCount}</span>
        </div>
        <div className="mini-stat mini-stat--late">
          <span className="mini-stat__label">Late</span>
          <span className="mini-stat__value">{lateCount}</span>
        </div>
        <div className="mini-stat mini-stat--primary">
          <span className="mini-stat__label">Attendance</span>
          <span className="mini-stat__value">{attendancePercentage}%</span>
        </div>
      </section>

      {analyticsTab === 'overview' && (
        <>
          {/* Trend built from the real dates + status distribution */}
          <div className="analytics-grid">
        <OverviewChart records={displayRecords} onAddFirst={onAddFirst} />
        <DistributionChart
          total={total}
          presentCount={presentCount}
          absentCount={absentCount}
          lateCount={lateCount}
          onAddFirst={onAddFirst}
        />
      </div>

      {/* Status breakdown with counts and percentages */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">Status Breakdown</h2>
            <p className="panel__subtitle">
              How the {total} recorded students are distributed across the three statuses.
            </p>
          </div>
          <span
            className="section-heading__sub"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <TrendingUp size={15} />
            Live from React state
          </span>
        </div>

        <div className="panel__body">
          <div className="metric-list">
            {breakdownRows.map((row) => (
              <div key={row.key} className={`metric-row metric-row--${row.key}`}>
                <div className="metric-row__head">
                  <span className="metric-row__label">{row.label}</span>
                  <span className="metric-row__value">
                    {row.count} students · {share(row.count)}%
                  </span>
                </div>
                <div className="metric-row__track">
                  <div className="metric-row__fill" style={{ width: `${share(row.count)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student-wise Attendance Comparison & Insights */}
      <div className="dashboard-grid">
        {/* Student-wise Attendance Table */}
        <section className="panel" aria-label="Student-wise comparison">
          <div className="panel__header">
            <div>
              <h3 className="panel__title">Student-Wise Attendance Performance</h3>
              <p className="panel__subtitle">Cumulative session records and percentages per student</p>
            </div>
            <span className="welcome__chip" style={{ fontSize: '0.76rem' }}>
              <Users size={13} /> {studentStats.length} Students
            </span>
          </div>

          <div className="panel__body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.7rem 1rem' }}>Student</th>
                    <th style={{ padding: '0.7rem 1rem' }}>Roll Number</th>
                    <th style={{ padding: '0.7rem 1rem' }}>Attendance Rate</th>
                    <th style={{ padding: '0.7rem 1rem', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((st) => (
                    <tr key={st.roll} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{st.name}</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)' }}>{st.roll}</td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--color-track)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${st.hasRecords ? st.pct : 0}%`,
                                height: '100%',
                                background: !st.hasRecords
                                  ? 'transparent'
                                  : st.pct >= threshold
                                  ? 'var(--color-present)'
                                  : 'var(--color-absent)',
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 800, minWidth: '38px', textAlign: 'right' }}>
                            {st.hasRecords ? `${st.pct}%` : '—'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                        {!st.hasRecords ? (
                          <span className="status-badge status-badge--neutral" style={{ fontSize: '0.72rem' }}>
                            No Records
                          </span>
                        ) : st.pct >= threshold ? (
                          <span className="status-badge status-badge--present" style={{ fontSize: '0.72rem' }}>
                            Eligible
                          </span>
                        ) : (
                          <span className="status-badge status-badge--absent" style={{ fontSize: '0.72rem' }}>
                            Shortage
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Attendance Insights & Watchlist */}
        <section className="panel" aria-label="Attendance insights">
          <div className="panel__header">
            <div>
              <h3 className="panel__title">Attendance Insights</h3>
              <p className="panel__subtitle">Automated policy checks & academic milestones</p>
            </div>
            <Award size={18} className="text-brand" />
          </div>

          <div className="panel__body">
            <div className="insight-list">
              <div className="insight-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Users size={16} className="text-brand" />
                  Active Class Cohort
                </span>
                <strong>{studentStats.length} Students Recorded</strong>
              </div>

              <div className="insight-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Award size={16} className="text-present" />
                  Highest Attendance
                </span>
                <strong>
                  {bestStudent ? `${bestStudent.name} (${bestStudent.pct}%)` : '—'}
                </strong>
              </div>

              <div className="insight-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertTriangle size={16} className="text-absent" />
                  Shortage Watchlist (&lt;{threshold}%)
                </span>
                <strong style={{ color: lowAttendanceStudents.length > 0 ? 'var(--color-absent)' : 'var(--color-present)' }}>
                  {lowAttendanceStudents.length} Students
                </strong>
              </div>

              <div className="insight-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <CheckCircle2 size={16} className="text-present" />
                  Exam Eligibility Turnout
                </span>
                <strong>
                  {Math.round(((studentStats.length - lowAttendanceStudents.length) / (studentStats.length || 1)) * 100)}% Qualified
                </strong>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Session-Wise Comparison Table */}
      {sessions.length > 0 && (
        <section className="panel" aria-label="Session-wise comparison">
          <div className="panel__header">
            <div>
              <h3 className="panel__title">Session-Wise Attendance Comparison</h3>
              <p className="panel__subtitle">Comparative attendance metrics across scheduled classroom lectures</p>
            </div>
            <span className="welcome__chip" style={{ fontSize: '0.76rem' }}>
              <Calendar size={13} /> {sessions.length} Sessions
            </span>
          </div>

          <div className="panel__body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="session-comparison-table" style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.7rem 1rem' }}>Session Topic / Lecture</th>
                    <th style={{ padding: '0.7rem 1rem' }}>Date & Schedule</th>
                    <th style={{ padding: '0.7rem 1rem' }}>Roster Turnout</th>
                    <th style={{ padding: '0.7rem 1rem' }}>Status Counts</th>
                    <th style={{ padding: '0.7rem 1rem', textAlign: 'right' }}>Session Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionStats.map((st) => {
                    const enrolledCount = (students && students.length > 0) ? students.length : 8;
                    const turnoutRate = Math.min(100, Math.round((st.total / enrolledCount) * 100));
                    return (
                      <tr key={st.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>
                          <div>{st.name}</div>
                          {st.id === activeSession?.id && (
                            <span className="status-badge status-badge--present" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginTop: '0.2rem' }}>
                              Active Session
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--color-text-muted)' }}>
                          <div>{st.date}</div>
                          {st.startTime && st.endTime && (
                            <div style={{ fontSize: '0.74rem' }}>{st.startTime} – {st.endTime}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <strong>{st.total} / {enrolledCount}</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginLeft: '0.35rem' }}>
                            ({turnoutRate}%)
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <span style={{ color: 'var(--color-present)', fontWeight: 650 }}>{st.present} P</span>
                          {' · '}
                          <span style={{ color: 'var(--color-absent)', fontWeight: 650 }}>{st.absent} A</span>
                          {' · '}
                          <span style={{ color: 'var(--color-late)', fontWeight: 650 }}>{st.late} L</span>
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                          <span
                            className={`status-badge status-badge--${st.pct >= threshold ? 'present' : st.total === 0 ? 'neutral' : 'absent'}`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {st.total > 0 ? `${st.pct}%` : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
        </>
      )}

      {/* ======================= INTERACTIVE REPORT BUILDER ======================= */}
      {analyticsTab === 'builder' && (
        <section className="panel" aria-label="Interactive report builder">
          <div className="panel__header">
            <div>
              <h3 className="panel__title">Interactive Attendance Report Builder</h3>
              <p className="panel__subtitle">Generate customized, filterable academic reports for departments, subjects and cohorts</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={onPrint}
              >
                <Printer size={14} /> Print Report
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleDownloadBuilderCSV}
              >
                <Download size={14} /> Download Filtered CSV
              </button>
            </div>
          </div>

          <div className="panel__body">
            {/* Builder Filter Toolbar */}
            <div className="table-controls" style={{ background: 'var(--color-surface)', padding: '0.85rem 1.1rem', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div className="sort-group">
                <label className="sort-group__label">Date Range:</label>
                <select
                  className="sort-group__select"
                  value={builderRange}
                  onChange={(e) => setBuilderRange(e.target.value)}
                >
                  <option value="all">All Dates Recorded</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>

              <div className="sort-group">
                <label className="sort-group__label">Subject:</label>
                <select
                  className="sort-group__select"
                  value={builderSubj}
                  onChange={(e) => setBuilderSubj(e.target.value)}
                >
                  <option value="ALL">All Subjects</option>
                  <option value="React JS & Web Technologies">React JS & Web Tech</option>
                  <option value="Data Structures & Algorithms (DSA)">Data Structures (DSA)</option>
                  <option value="Database Management Systems (DBMS)">DBMS</option>
                  <option value="Engineering Mathematics II">Engineering Mathematics II</option>
                </select>
              </div>

              <div className="sort-group">
                <label className="sort-group__label">Session:</label>
                <select
                  className="sort-group__select"
                  value={builderSess}
                  onChange={(e) => setBuilderSess(e.target.value)}
                >
                  <option value="ALL">All Sessions</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sort-group">
                <label className="sort-group__label">Student Cohort:</label>
                <select
                  className="sort-group__select"
                  value={builderCohort}
                  onChange={(e) => setBuilderCohort(e.target.value)}
                >
                  <option value="ALL">All Students</option>
                  <option value="SHORTAGE">Shortage Watchlist (&lt;{threshold}%)</option>
                  <option value="HIGH">High Performers (≥90%)</option>
                </select>
              </div>

              <div className="sort-group">
                <label className="sort-group__label">Status:</label>
                <select
                  className="sort-group__select"
                  value={builderStatus}
                  onChange={(e) => setBuilderStatus(e.target.value)}
                  aria-label="Filter report by attendance status"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Present">Present Only</option>
                  <option value="Absent">Absent Only</option>
                  <option value="Late">Late Only</option>
                </select>
              </div>
            </div>

            {/* Generated Report Summary Metrics */}
            <div className="report-summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block' }}>Cohort Evaluated</span>
                <strong style={{ fontSize: '1.25rem' }}>{cohortStudents.length} Students</strong>
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block' }}>Session Records</span>
                <strong style={{ fontSize: '1.25rem' }}>{builderTotalRecords} Entries</strong>
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block' }}>Cohort Turnout Rate</span>
                <strong style={{ fontSize: '1.25rem', color: builderAvgPct >= threshold ? 'var(--color-present)' : 'var(--color-absent)' }}>
                  {builderAvgPct}%
                </strong>
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block' }}>Present / Absent</span>
                <strong style={{ fontSize: '1.25rem' }}>
                  <span className="text-present">{builderTotalPresent}</span> / <span className="text-absent">{builderTotalAbsent}</span>
                </strong>
              </div>
            </div>

            {/* Report Table */}
            <div className="records-table-container">
              <table className="directory-table" role="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Evaluated Sessions</th>
                    <th>Turnout (P / A / L)</th>
                    <th>Attendance %</th>
                    <th>Academic Status</th>
                    <th style={{ textAlign: 'right' }}>Improvement Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortStudents.map((st) => {
                    const needed = st.total > 0 && st.pct < threshold
                      ? Math.ceil((threshold * st.total - 100 * st.present) / (100 - threshold))
                      : 0;

                    return (
                      <tr key={st.rollNumber}>
                        <td><strong>{st.name}</strong></td>
                        <td><span className="code-chip">{st.rollNumber}</span></td>
                        <td>{st.total} lectures</td>
                        <td>
                          <span className="text-present" style={{ fontWeight: 650 }}>{st.present}P</span> ·{' '}
                          <span className="text-absent" style={{ fontWeight: 650 }}>{st.absent}A</span> ·{' '}
                          <span className="text-late" style={{ fontWeight: 650 }}>{st.late}L</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: st.total === 0 ? 'var(--color-text-muted)' : st.pct >= threshold ? 'var(--color-present)' : 'var(--color-absent)' }}>
                            {st.total > 0 ? `${st.pct}%` : 'N/A'}
                          </span>
                        </td>
                        <td>
                          {st.total === 0 ? (
                            <span className="status-badge status-badge--neutral">No Records</span>
                          ) : st.pct >= threshold ? (
                            <span className="status-badge status-badge--present">Eligible</span>
                          ) : (
                            <span className="status-badge status-badge--absent">Shortage Warning</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontSize: '0.76rem' }}>
                          {st.total === 0 ? (
                            <span style={{ color: 'var(--color-text-muted)' }}>Pending Attendance</span>
                          ) : needed > 0 ? (
                            <span style={{ color: 'var(--color-absent)', fontWeight: 600 }}>
                              Must attend next {needed} classes
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-present)', fontWeight: 600 }}>
                              Qualified for End-Sem Exam
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ===================== MONTHLY ATTENDANCE HEATMAP ===================== */}
      {analyticsTab === 'heatmap' && (
        <AttendanceHeatmap records={records} sessions={sessions} />
      )}
    </div>
  );
}

export default AttendanceAnalytics;
