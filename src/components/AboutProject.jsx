import React from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Users,
  Layers,
  FileSpreadsheet,
  LineChart,
  Database,
  HardDrive,
  ShieldCheck,
  UserCog,
  ArrowRight,
} from 'lucide-react';

const APP_VERSION = '1.0.0';

/**
 * AboutProject Component (Page 08 — Help & Project Overview)
 *
 * Presented as professional product documentation rather than a textbook page.
 * Sections:
 *  1. Product Overview
 *  2. Intended Users
 *  3. Core Capabilities
 *  4. How It Works
 *  5. Case Study Requirements (traceability)
 *  6. Technology Stack
 *  7. Data & Storage
 *  8. Privacy & Data Handling
 *  9. Project Information
 *
 * @param {Object} props
 * @param {Array} [props.records]   - Live attendance records from App state
 * @param {Array} [props.students]  - Enrolled students from App state
 * @param {Array} [props.sessions]  - Classroom sessions from App state
 * @param {number} [props.threshold] - Configured attendance threshold (e.g. 75)
 */
function AboutProject({
  records = [],
  students = [],
  sessions = [],
  threshold = 75,
}) {
  // The five compulsory requirements of Case Study 6, mapped to the code that
  // actually implements each one.
  const requirements = [
    {
      num: 1,
      requirement: 'Attendance form with Student Name, Roll Number and Attendance Status',
      implementation: 'Controlled form with Present / Absent / Late status selection',
      location: 'AttendanceForm.jsx',
    },
    {
      num: 2,
      requirement: 'Reusable Attendance Card component that receives details through props',
      implementation: 'Pure presentational card — every field arrives as a prop',
      location: 'AttendanceCard.jsx',
    },
    {
      num: 3,
      requirement: 'useState to store and manage attendance records',
      implementation: 'Attendance records held in root useState; filters/form use local state',
      location: 'App.jsx',
    },
    {
      num: 4,
      requirement: 'Add Attendance and Delete Attendance functionality',
      implementation: 'Add, edit and delete with a confirmation step before removal',
      location: 'App.jsx',
    },
    {
      num: 5,
      requirement: 'Display records dynamically and show a message when none are available',
      implementation: 'Records rendered with map() and stable keys; designed empty states',
      location: 'AttendanceList.jsx',
    },
  ];

  // Only capabilities that genuinely exist in this build.
  const capabilities = [
    {
      title: 'Attendance Entry',
      desc: 'Record a single student or mark a whole class, with validation and duplicate guards.',
      icon: <ClipboardList size={18} />,
    },
    {
      title: 'Student Directory',
      desc: 'Maintain the roster with per-student attendance summaries and standing.',
      icon: <Users size={18} />,
    },
    {
      title: 'Attendance Records',
      desc: 'Search, filter, sort, edit, delete and export the full record history.',
      icon: <BookOpen size={18} />,
    },
    {
      title: 'Attendance Monitoring',
      desc: 'Flag students below the configured threshold in a single watchlist.',
      icon: <Layers size={18} />,
    },
    {
      title: 'Analytics & Reports',
      desc: 'Trends, status distribution and student/session comparisons from real data.',
      icon: <LineChart size={18} />,
    },
    {
      title: 'Data Export',
      desc: 'Download attendance records and the student roster as CSV.',
      icon: <FileSpreadsheet size={18} />,
    },
  ];

  // §12 "How It Works" — the data flow through the application.
  const workflow = [
    'Student information',
    'Attendance entry',
    'React state update',
    'Record display',
    'Dashboard & analytics',
    'Report export',
  ];

  const techStack = [
    { name: 'React JS', role: 'Component-driven user interface', tag: 'Library' },
    { name: 'JavaScript (ES6+)', role: 'Language and array/object processing', tag: 'Language' },
    { name: 'HTML5', role: 'Semantic document structure', tag: 'Markup' },
    { name: 'CSS3', role: 'Responsive design system with custom properties', tag: 'Styling' },
    { name: 'Vite', role: 'Development server and production build', tag: 'Build Tool' },
    { name: 'Recharts', role: 'Attendance trend and distribution charts', tag: 'Charts' },
    { name: 'Lucide React', role: 'Interface iconography', tag: 'Icons' },
    { name: 'Browser localStorage', role: 'Client-side persistence between sessions', tag: 'Storage' },
  ];

  const projectInfo = [
    { label: 'Project Name', value: 'AttendTrack' },
    { label: 'Case Study', value: 'Case Study 6' },
    { label: 'Technology', value: 'React JS' },
    { label: 'Case Study Title', value: 'Student Attendance Record System' },
    { label: 'Classification', value: 'Academic React JS Case Study Project' },
    { label: 'Version', value: `v${APP_VERSION}` },
  ];

  return (
    <div
      className="about-attendtrack-container"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* Page header — §12 page title */}
      <section className="welcome">
        <div className="welcome__main">
          <span className="welcome__greeting">Product Documentation</span>
          <h2 className="welcome__title">AttendTrack — Product Overview</h2>
          <p className="welcome__sub">
            How the application works, what it is built with, and where its data lives.
          </p>
          <div className="welcome__meta">
            <span className="welcome__chip">
              <GraduationCap size={14} aria-hidden="true" />
              B.Tech CSE &bull; Semester II
            </span>
            <span className="welcome__chip">
              <BookOpen size={14} aria-hidden="true" />
              Case Study 6
            </span>
            <span className="welcome__chip">
              <ShieldCheck size={14} aria-hidden="true" />
              v{APP_VERSION}
            </span>
          </div>
        </div>
      </section>

      {/* 1. Product Overview */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3 className="panel__title">Product Overview</h3>
            <p className="panel__subtitle">What AttendTrack does and the problem it solves</p>
          </div>
        </div>
        <div className="panel__body">
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--color-text-soft)' }}>
            AttendTrack is a browser-based workspace for recording and reviewing classroom attendance.
            It replaces paper registers and ad-hoc spreadsheets with a single consistent record: every
            entry is tied to a student, a dated session and an attendance status. Because all screens
            read from that one set of records, the dashboard, student directory, record history and
            analytics views can never disagree with each other.
          </p>
        </div>
      </section>

      {/* 2. Intended Users */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3 className="panel__title">Intended Users</h3>
            <p className="panel__subtitle">Who the application is designed for</p>
          </div>
          <span className="badge">
            <UserCog size={13} aria-hidden="true" /> Classroom Teacher
          </span>
        </div>
        <div className="panel__body">
          <ul className="doc-list">
            <li className="doc-list__item">
              The primary user is a <strong>classroom teacher or academic administrator</strong> taking
              attendance for a single class group across a series of dated sessions.
            </li>
            <li className="doc-list__item">
              It helps them keep an organised register: mark attendance quickly, see who is falling
              below the monitoring threshold, and review or correct any past entry.
            </li>
            <li className="doc-list__item">
              It is scoped to a <strong>single teacher and one class</strong> — there is no
              multi-role access, no shared institutional account and no student-facing portal.
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Core Capabilities */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3 className="panel__title">Core Capabilities</h3>
            <p className="panel__subtitle">Capabilities implemented in this version</p>
          </div>
          <span className="badge">
            <CheckCircle2 size={13} aria-hidden="true" /> {capabilities.length} modules
          </span>
        </div>
        <div className="panel__body">
          <div className="concepts-grid">
            {capabilities.map((item) => (
              <div key={item.title} className="concept-card">
                <span className="concept-card__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h4 className="concept-card__title">{item.title}</h4>
                <p className="concept-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3 className="panel__title">How It Works</h3>
            <p className="panel__subtitle">The path a record takes through the application</p>
          </div>
        </div>
        <div className="panel__body">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            {workflow.map((step, index) => (
              <React.Fragment key={step}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      background: 'var(--color-primary-soft)',
                      color: 'var(--color-primary-main)',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  {step}
                </span>
                {index < workflow.length - 1 && (
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Case Study Requirements */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3 className="panel__title">Case Study Requirements</h3>
            <p className="panel__subtitle">
              Each compulsory requirement traced to its implementation
            </p>
          </div>
          <span className="pill pill--success">
            <CheckCircle2 size={13} aria-hidden="true" /> 5 of 5 Implemented
          </span>
        </div>
        <div className="panel__body">
          <div className="records-table-container">
            <table className="directory-table" role="table">
              <thead>
                <tr>
                  <th style={{ width: '56px' }}>#</th>
                  <th>Requirement</th>
                  <th>Implementation</th>
                  <th style={{ width: '170px' }}>Component</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((req) => (
                  <tr key={req.num}>
                    <td>
                      <span className="code-chip" style={{ fontWeight: 700 }}>
                        {String(req.num).padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <strong>{req.requirement}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', color: 'var(--color-text-soft)' }}>
                        {req.implementation}
                      </span>
                    </td>
                    <td>
                      <code className="code-chip">{req.location}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Technology Stack + 9. Project Information */}
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3 className="panel__title">Technology Stack</h3>
              <p className="panel__subtitle">Technologies actually used in this project</p>
            </div>
          </div>
          <div className="panel__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--color-text)' }}>
                      {tech.name}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {tech.role}
                    </div>
                  </div>
                  <span className="badge" style={{ flexShrink: 0 }}>
                    {tech.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <h3 className="panel__title">Project Information</h3>
              <p className="panel__subtitle">Academic context for this submission</p>
            </div>
          </div>
          <div className="panel__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {projectInfo.map((row, index) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    fontSize: '0.85rem',
                    paddingBottom: index < projectInfo.length - 1 ? '0.6rem' : 0,
                    borderBottom:
                      index < projectInfo.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>{row.label}</span>
                  <strong style={{ color: 'var(--color-text)', textAlign: 'right' }}>{row.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 7. Data & Storage */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3 className="panel__title">Data &amp; Storage</h3>
            <p className="panel__subtitle">How records are managed and persisted</p>
          </div>
          <span className="badge">
            <Database size={13} aria-hidden="true" /> {records.length} records &middot; {students.length}{' '}
            students &middot; {sessions.length} sessions
          </span>
        </div>
        <div className="panel__body">
          <ul className="doc-list">
            <li className="doc-list__item">
              Attendance records are the single source of truth. They are held in React{' '}
              <code className="code-chip">useState</code> while the app runs, and every dashboard
              figure, chart and table is derived from them at render time.
            </li>
            <li className="doc-list__item">
              Records, students, sessions and settings are persisted to this browser&apos;s{' '}
              <code className="code-chip">localStorage</code>, so they survive a page refresh on the
              same browser and device.
            </li>
            <li className="doc-list__item">
              Stored data is read defensively on load — malformed or missing values fall back to safe
              defaults instead of breaking the application.
            </li>
            <li className="doc-list__item">
              <strong>Limitations:</strong> this is a frontend academic project. Browser-local storage
              is not a shared cloud database, it is not encrypted, and it does not synchronise between
              devices or users.
            </li>
            <li className="doc-list__item">
              Clearing browser storage — or using a different browser — removes the saved records.
              Export a CSV or JSON backup from Settings first.
            </li>
            <li className="doc-list__item">
              The application ships with a small demonstration dataset so the charts and monitoring
              panels have realistic data. Use <strong>Reset Demo Data</strong> in Settings to restore
              it, or clear all records to start from scratch.
            </li>
            <li className="doc-list__item">
              The configured attendance threshold is currently <strong>{threshold}%</strong>, set in
              Settings.
            </li>
          </ul>
        </div>
      </section>

      {/* 8. Privacy & Data Handling */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3 className="panel__title">Privacy &amp; Data Handling</h3>
            <p className="panel__subtitle">Where student data is stored and how it should be used</p>
          </div>
        </div>
        <div className="panel__body">
          <ul className="doc-list">
            <li className="doc-list__item">
              Student names, roll numbers and attendance records are stored only in the browser
              storage configured for this application.
            </li>
            <li className="doc-list__item">
              No data is transmitted anywhere. There is{' '}
              <strong>no backend, database, API or authentication service</strong>, and nothing is
              uploaded or shared.
            </li>
            <li className="doc-list__item">
              The dataset should be used for <strong>demonstration or authorised academic purposes
              only</strong>, and the demonstration roster should not be treated as real student
              information.
            </li>
          </ul>

          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="badge">
              <HardDrive size={13} aria-hidden="true" /> Browser localStorage
            </span>
            <span className="badge">
              <Database size={13} aria-hidden="true" /> No backend or database
            </span>
            <span className="badge">
              <ShieldCheck size={13} aria-hidden="true" /> Data stays on this device
            </span>
          </div>
        </div>
      </section>

      {/* 9. Known Limitations & Academic Scope */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3 className="panel__title">Known Limitations &amp; Academic Scope</h3>
            <p className="panel__subtitle">Clear project boundaries and implementation scope</p>
          </div>
        </div>
        <div className="panel__body">
          <ul className="doc-list">
            <li className="doc-list__item">
              <strong>Device &amp; Browser Isolation:</strong> All records live in browser <code>localStorage</code>. Data is specific to the current browser and device and does not automatically synchronize across computers.
            </li>
            <li className="doc-list__item">
              <strong>No Cloud Database:</strong> There is intentionally no external cloud database, Firestore, or SQL server. Use the built-in <strong>Export CSV</strong> or <strong>JSON Backup</strong> features in Settings to transfer data between machines.
            </li>
            <li className="doc-list__item">
              <strong>Single-Teacher Workstation:</strong> Designed as an instructor-facing attendance entry and analytics tool; concurrent multi-teacher editing on shared live documents is outside this case study scope.
            </li>
            <li className="doc-list__item">
              <strong>No Student Self-Service Portal:</strong> This build focuses on faculty administration, eligibility auditing, and session turnout rather than student logins or parent notification gateways.
            </li>
            <li className="doc-list__item">
              <strong>Academic Purpose:</strong> Developed as a B.Tech CSE Semester II React.js Case Study demonstrating component architecture, state lifting, controlled form inputs, custom hooks, and dynamic rendering.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default AboutProject;
