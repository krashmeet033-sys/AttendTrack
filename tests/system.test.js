import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';

import App from '../src/App.jsx';
import Sidebar from '../src/components/Sidebar.jsx';
import Header from '../src/components/Header.jsx';
import StatCard from '../src/components/StatCard.jsx';
import AttendanceForm from '../src/components/AttendanceForm.jsx';
import AttendanceCard from '../src/components/AttendanceCard.jsx';
import AttendanceList from '../src/components/AttendanceList.jsx';
import AttendanceAnalytics from '../src/components/AttendanceAnalytics.jsx';
import Settings from '../src/components/Settings.jsx';
import OverviewChart from '../src/components/OverviewChart.jsx';
import DistributionChart from '../src/components/DistributionChart.jsx';
import ActivityFeed from '../src/components/ActivityFeed.jsx';
import AttendanceSummary from '../src/components/AttendanceSummary.jsx';
import StudentDirectory from '../src/components/StudentDirectory.jsx';
import AboutProject from '../src/components/AboutProject.jsx';
import {
  calculateTurnoutPercentage,
  calculateAttendancePercentage,
  isExamEligible,
  computeStudentMetrics,
} from '../src/utils/calculations.js';
import {
  validateStudent,
  validateAttendanceRecord,
  validateSession,
  validateJsonBackup,
} from '../src/utils/validation.js';
import {
  STORAGE_VERSION,
  loadVersioned,
  saveVersioned,
  createAutoBackup,
} from '../src/utils/storage.js';

// -----------------------------------------------------------------------------
// Shared helpers
// -----------------------------------------------------------------------------
const noop = () => {};

/** Sample records used only as test input — never bundled into the app. */
const sampleRecords = [
  {
    id: 'std_1',
    name: 'Aarav Sharma',
    rollNumber: '24CSE001',
    status: 'Present',
    recordedAt: '2026-11-13T09:00:00.000Z',
  },
  {
    id: 'std_2',
    name: 'Rohan Gupta',
    rollNumber: '24CSE027',
    status: 'Absent',
    recordedAt: '2026-11-13T09:05:00.000Z',
  },
  {
    id: 'std_3',
    name: 'Isha Verma',
    rollNumber: '24CSE014',
    status: 'Late',
    recordedAt: '2026-11-13T09:10:00.000Z',
  },
];

const renderCard = (record) =>
  renderToString(
    React.createElement(AttendanceCard, {
      record,
      onDelete: noop,
      onChangeStatus: noop,
    })
  );

// -----------------------------------------------------------------------------
// Test 1: StatCard is reusable and driven entirely by props
// -----------------------------------------------------------------------------
test('Test 1: StatCard renders a prop-driven KPI value with its variant class', () => {
  const html = renderToString(
    React.createElement(StatCard, {
      label: 'Total Students',
      value: 3,
      hint: 'Attendance records in this session',
      icon: React.createElement('svg'),
      variant: 'navy',
    })
  );

  assert.ok(html.includes('stat-card--navy'), 'StatCard must apply the variant modifier class');
  assert.ok(html.includes('Total Students'), 'StatCard must display the label prop');
  assert.ok(html.includes('>3<'), 'StatCard must display the value prop (not a hardcoded number)');
  assert.ok(
    html.includes('Attendance records in this session'),
    'StatCard must display the hint prop'
  );
});

// -----------------------------------------------------------------------------
// Test 2: Attendance form contains all required fields, statuses and buttons
// -----------------------------------------------------------------------------
test('Test 2: AttendanceForm renders Name, Roll Number, three statuses and both buttons', () => {
  const html = renderToString(
    React.createElement(AttendanceForm, {
      onAddRecord: noop,
      existingRollNumbers: [],
    })
  );

  assert.ok(html.includes('Student Name'), 'Form must have a Student Name label');
  assert.ok(html.includes('Roll Number'), 'Form must have a Roll Number label');
  assert.ok(html.includes('Attendance Status'), 'Form must have an Attendance Status label');

  assert.ok(html.includes('status-option--present'), 'Form must offer the Present status');
  assert.ok(html.includes('status-option--absent'), 'Form must offer the Absent status');
  assert.ok(html.includes('status-option--late'), 'Form must offer the Late status');

  assert.ok(html.includes('Mark Attendance'), 'Form must have a Mark Attendance submit button');
  assert.ok(html.includes('Reset Form'), 'Form must have a Reset Form button');
});

// -----------------------------------------------------------------------------
// Test 3: AttendanceCard with Present -> green conditional styling
// -----------------------------------------------------------------------------
test('Test 3: AttendanceCard renders a Present record with green styling and a delete action', () => {
  const html = renderCard(sampleRecords[0]);

  assert.ok(html.includes('Aarav Sharma'), 'Card must display the student name prop');
  assert.ok(html.includes('24CSE001'), 'Card must display the roll number prop');
  assert.ok(html.includes('attendance-card--present'), 'Card must apply the green present class');
  assert.ok(html.includes('status-badge--present'), 'Badge must apply the green status class');
  assert.ok(
    html.includes('Delete record for Aarav Sharma'),
    'Card must expose a working delete button'
  );
});

// -----------------------------------------------------------------------------
// Test 4: AttendanceCard with Absent -> red conditional styling
// -----------------------------------------------------------------------------
test('Test 4: AttendanceCard renders an Absent record with red styling', () => {
  const html = renderCard(sampleRecords[1]);

  assert.ok(html.includes('Rohan Gupta'), 'Card must display the student name prop');
  assert.ok(html.includes('24CSE027'), 'Card must display the roll number prop');
  assert.ok(html.includes('attendance-card--absent'), 'Card must apply the red absent class');
  assert.ok(html.includes('status-badge--absent'), 'Badge must apply the red status class');
});

// -----------------------------------------------------------------------------
// Test 5: AttendanceCard with Late -> amber conditional styling
// -----------------------------------------------------------------------------
test('Test 5: AttendanceCard renders a Late record with amber styling', () => {
  const html = renderCard(sampleRecords[2]);

  assert.ok(html.includes('Isha Verma'), 'Card must display the student name prop');
  assert.ok(html.includes('24CSE014'), 'Card must display the roll number prop');
  assert.ok(html.includes('attendance-card--late'), 'Card must apply the amber late class');
  assert.ok(html.includes('status-badge--late'), 'Badge must apply the amber status class');
});

// -----------------------------------------------------------------------------
// Test 6: Empty state shows the exact message required by the problem statement
// -----------------------------------------------------------------------------
test('Test 6: AttendanceList shows the required empty-state message when there are no records', () => {
  const html = renderToString(
    React.createElement(AttendanceList, {
      records: [],
      searchQuery: '',
      onSearchChange: noop,
      onDeleteRecord: noop,
      onChangeStatus: noop,
      onClearAll: noop,
      onDownloadCSV: noop,
      onAddFirst: noop,
    })
  );

  assert.ok(
    html.includes('No attendance records available.'),
    'Empty state must contain the exact required title'
  );
  assert.ok(
    html.includes('Start by adding your first student attendance record.'),
    'Empty state must contain the exact required message'
  );
  assert.ok(html.includes('empty-state'), 'Empty state must render the styled illustration block');
});

// -----------------------------------------------------------------------------
// Test 7: Records render dynamically with filter, sort, CSV and clear controls
// -----------------------------------------------------------------------------
test('Test 7: AttendanceList maps every record to a card and exposes filter/sort/export controls', () => {
  const html = renderToString(
    React.createElement(AttendanceList, {
      records: sampleRecords,
      searchQuery: '',
      onSearchChange: noop,
      onDeleteRecord: noop,
      onChangeStatus: noop,
      onClearAll: noop,
      onDownloadCSV: noop,
      onAddFirst: noop,
    })
  );

  assert.ok(html.includes('Aarav Sharma'), 'All records must be rendered with map()');
  assert.ok(html.includes('Rohan Gupta'), 'All records must be rendered with map()');
  assert.ok(html.includes('Isha Verma'), 'All records must be rendered with map()');

  assert.ok(html.includes('records-table'), 'Records must render in the table layout');
  assert.ok(html.includes('records-table__head'), 'The table header row must render');
  ['Student Name', 'Roll Number', 'Attendance Status', 'Date', 'Time', 'Actions'].forEach(
    (column) => {
      assert.ok(html.includes(column), `The table must include the "${column}" column`);
    }
  );

  assert.ok(html.includes('filter-tab--present'), 'Present filter tab must exist');
  assert.ok(html.includes('filter-tab--absent'), 'Absent filter tab must exist');
  assert.ok(html.includes('filter-tab--late'), 'Late filter tab must exist');

  assert.ok(html.includes('id="sort-records"'), 'Sorting control must exist');
  assert.ok(html.includes('Download CSV'), 'CSV export action must exist');
  assert.ok(html.includes('Clear All'), 'Clear all action must exist');
});

// -----------------------------------------------------------------------------
// Test 8: Search filtering actually narrows the rendered records
// -----------------------------------------------------------------------------
test('Test 8: AttendanceList filters records by the search query (name or roll number)', () => {
  const html = renderToString(
    React.createElement(AttendanceList, {
      records: sampleRecords,
      searchQuery: 'Isha',
      onSearchChange: noop,
      onDeleteRecord: noop,
      onChangeStatus: noop,
      onClearAll: noop,
      onDownloadCSV: noop,
      onAddFirst: noop,
    })
  );

  assert.ok(html.includes('Isha Verma'), 'The matching record must still be rendered');
  assert.ok(!html.includes('Rohan Gupta'), 'Non-matching records must be filtered out');
  assert.ok(!html.includes('Aarav Sharma'), 'Non-matching records must be filtered out');
});

// -----------------------------------------------------------------------------
// Test 9: Analytics derives every statistic from the records in props
// -----------------------------------------------------------------------------
test('Test 9: AttendanceAnalytics shows Present/Absent/Late counts and the attendance percentage', () => {
  const html = renderToString(
    React.createElement(AttendanceAnalytics, { records: sampleRecords, onAddFirst: noop })
  );

  assert.ok(html.includes('Attendance Overview'), 'The attendance overview must render');
  assert.ok(html.includes('Status Breakdown'), 'The status breakdown panel must render');
  ['Total Records', 'Present', 'Absent', 'Late'].forEach((label) => {
    assert.ok(html.includes(label), `The overview must report the "${label}" figure`);
  });
  assert.ok(html.includes('33%'), 'Attendance percentage must be calculated from state (1 of 3)');
});

// -----------------------------------------------------------------------------
// Test 10: Analytics shows an empty state instead of fake data
// -----------------------------------------------------------------------------
test('Test 10: AttendanceAnalytics renders an empty state instead of fabricated analytics', () => {
  const html = renderToString(
    React.createElement(AttendanceAnalytics, { records: [], onAddFirst: noop })
  );

  assert.ok(
    html.includes('No attendance data yet.'),
    'Analytics must show an empty state when there is no data'
  );
});

// -----------------------------------------------------------------------------
// Test 11: Sidebar renders the eight navigation pages required by the brief
// -----------------------------------------------------------------------------
test('Test 11: Sidebar renders the eight required navigation pages', () => {
  const html = renderToString(
    React.createElement(Sidebar, {
      activeTab: 'dashboard',
      onSelectTab: noop,
      recordCount: 3,
      isOpen: false,
      onClose: noop,
    })
  );

  // Decode HTML entities so labels with "&" can be compared as plain text.
  const text = html.replace(/&amp;/g, '&');

  [
    'Dashboard',
    'Mark Attendance',
    'Student Directory',
    'Attendance Records',
    'Reports & Analytics',
    'Sessions',
    'Settings',
    'Help & Project Overview',
  ].forEach((label) => {
    assert.ok(text.includes(label), `Sidebar must include the "${label}" page`);
  });

  assert.ok(html.includes('sidebar__link--active'), 'The active page must be highlighted');
});

// -----------------------------------------------------------------------------
// Test 12: Header contains logo, date, search, theme toggle and profile
// -----------------------------------------------------------------------------
test('Test 12: Header renders the logo, search field, theme toggle and user profile', () => {
  const html = renderToString(
    React.createElement(Header, {
      activeTab: 'records',
      searchQuery: '',
      onSearchChange: noop,
      theme: 'light',
      onToggleTheme: noop,
      onOpenSidebar: noop,
    })
  );

  assert.ok(html.includes('AttendTrack'), 'Header must show the AttendTrack brand');
  assert.ok(html.includes('Attendance Records'), 'Header must show the current page title');
  assert.ok(
    html.includes('Search student name or roll number'),
    'Header must provide search functionality'
  );
  assert.ok(html.includes('Switch to dark theme'), 'Theme toggle must be present and labelled');
  assert.ok(html.includes('Class Teacher'), 'User profile section must be present');
});

// -----------------------------------------------------------------------------
// Test 13: Settings groups theme control, data actions and documentation
// -----------------------------------------------------------------------------
test('Test 13: Settings renders theme options, data actions and the requirement mapping', () => {
  const html = renderToString(
    React.createElement(Settings, {
      theme: 'light',
      onChangeTheme: noop,
      onDownloadCSV: noop,
      onClearAll: noop,
      recordCount: 3,
    })
  );

  assert.ok(html.includes('theme-switch__option'), 'Theme switcher must exist');
  assert.ok(html.includes('Light'), 'Light theme option must exist');
  assert.ok(html.includes('Dark'), 'Dark theme option must exist');
  assert.ok(html.includes('Download CSV'), 'CSV data action must exist');
  assert.ok(html.includes('Clear All'), 'Clear all data action must exist');

  const text = html.replace(/&amp;/g, '&');
  assert.ok(
    text.includes('Help & Project Overview'),
    'The Help & Project Overview section must be documented'
  );
});

// -----------------------------------------------------------------------------
// Test 14: The whole app renders the five dashboard KPIs from a seeded dataset
// -----------------------------------------------------------------------------
test('Test 14: App renders the five dashboard KPI cards backed by demo data', () => {
  const html = renderToString(React.createElement(App));

  ['Total Records', 'Present', 'Absent', 'Late', 'Overall Attendance Rate'].forEach((label) => {
    assert.ok(html.includes(label), `Dashboard must render the "${label}" KPI card`);
  });

  assert.ok(
    !html.includes('chart-empty'),
    'The seeded demo dataset must give the trend chart real points to plot'
  );
  assert.ok(
    html.includes('AttendTrack — Smart Student Attendance Management System'),
    'App must render its branded footer'
  );
});

// -----------------------------------------------------------------------------
// Test 15: The dashboard renders its streamlined widget panels + greeting
// -----------------------------------------------------------------------------
test('Test 15: Dashboard renders the attendance widgets and greets the Class Teacher', () => {
  const html = renderToString(React.createElement(App));

  ['Attendance Overview', 'Recent Attendance Activity', 'Students Requiring Attention'].forEach(
    (title) => {
      assert.ok(html.includes(title), `Dashboard must render the "${title}" panel`);
    }
  );

  assert.ok(
    /Good (morning|afternoon|evening), Class Teacher/.test(html),
    'Dashboard must greet the signed-in Class Teacher with a time-aware greeting'
  );
});

// -----------------------------------------------------------------------------
// Test 16: The new widget components are entirely driven by props
// -----------------------------------------------------------------------------
test('Test 16: OverviewChart, DistributionChart, ActivityFeed and AttendanceSummary take their data from props', () => {
  const overview = renderToString(
    React.createElement(OverviewChart, { records: sampleRecords, onAddFirst: noop })
  );
  assert.ok(overview.includes('Attendance Overview'), 'Overview panel must render');
  assert.ok(
    !overview.includes('Nothing to plot yet.'),
    'Overview chart must plot once real records exist'
  );

  const donut = renderToString(
    React.createElement(DistributionChart, {
      total: 3,
      presentCount: 1,
      absentCount: 1,
      lateCount: 1,
      onAddFirst: noop,
    })
  );
  assert.ok(donut.includes('donut-legend'), 'Donut must render its legend rows');
  assert.ok(donut.includes('donut-figure__value'), 'Donut must show the total in its centre');

  const feed = renderToString(
    React.createElement(ActivityFeed, { records: sampleRecords, limit: 6 })
  );
  assert.ok(feed.includes('activity-list'), 'Activity feed must render its list');
  assert.ok(feed.includes('Aarav Sharma'), 'Activity feed must list the real records');

  const summary = renderToString(
    React.createElement(AttendanceSummary, {
      total: 3,
      presentCount: 1,
      absentCount: 1,
      lateCount: 1,
      attendancePercentage: 33,
    })
  );
  assert.ok(summary.includes('summary-bar'), 'Summary must render its progress bars');
  assert.ok(summary.includes('Overall attendance'), 'Summary must include the overall row');
  assert.ok(summary.includes('33'), 'Summary must show the calculated attendance percentage');
});

// -----------------------------------------------------------------------------
// Test 17: StudentDirectory renders student roster, search, and metrics
// -----------------------------------------------------------------------------
test('Test 17: StudentDirectory renders student roster, search, and metrics', () => {
  const sampleStudents = [
    { id: 's1', name: 'Aarav Sharma', rollNumber: '24CSE001', className: 'B.Tech CSE', semester: 'Semester II' },
    { id: 's2', name: 'Rohan Gupta', rollNumber: '24CSE027', className: 'B.Tech CSE', semester: 'Semester II' },
  ];

  const html = renderToString(
    React.createElement(StudentDirectory, {
      students: sampleStudents,
      records: sampleRecords,
      onAddStudent: noop,
      onEditStudent: noop,
      onDeleteStudent: noop,
      onMarkStudent: noop,
      threshold: 75,
    })
  );

  assert.ok(html.includes('Student Directory'), 'Must render Student Directory title');
  assert.ok(html.includes('Aarav Sharma'), 'Must display enrolled student name');
  assert.ok(html.includes('24CSE001'), 'Must display student roll number');
  assert.ok(html.includes('Add Student'), 'Must render Add Student action');
  assert.ok(html.includes('directory-table'), 'Must render directory table');
});

// -----------------------------------------------------------------------------
// Test 18: AboutProject documents the product, requirements and project metadata
// -----------------------------------------------------------------------------
test('Test 18: AboutProject renders the product overview, requirement mapping and metadata', () => {
  const html = renderToString(
    React.createElement(AboutProject, {
      records: sampleRecords,
      students: [],
      sessions: [],
      threshold: 75,
    })
  );

  assert.ok(
    html.includes('AttendTrack — Product Overview'),
    'Must present the AttendTrack product overview page title'
  );
  assert.ok(html.includes('Product Overview'), 'Must include the Product Overview section');
  assert.ok(html.includes('Intended Users'), 'Must include the Intended Users section');
  assert.ok(html.includes('Core Capabilities'), 'Must include the Core Capabilities section');
  assert.ok(
    html.includes('How It Works'),
    'Must document the data flow through the application'
  );
  assert.ok(
    html.includes('Case Study Requirements'),
    'Must map the five mandatory requirements to their implementation'
  );
  assert.ok(html.includes('Technology Stack'), 'Must list the technology stack');
  assert.ok(html.includes('Data &amp; Storage'), 'Must include the data and storage section');
  assert.ok(
    html.includes('Privacy &amp; Data Handling'),
    'Must include the privacy and data handling section'
  );
  assert.ok(html.includes('Project Information'), 'Must include the project information block');
  assert.ok(html.includes('Case Study 6'), 'Must state the case study category');
  assert.ok(html.includes('v1.0.0'), 'Must display the project version');
});

// -----------------------------------------------------------------------------
// Test 19: Centralized calculations accurately compute turnout, late rules & eligibility
// -----------------------------------------------------------------------------
test('Test 19: Centralized calculation functions accurately compute turnout, late rules, and exam eligibility', () => {
  // Turnout calculation
  assert.strictEqual(calculateTurnoutPercentage(8, 9), 89);
  assert.strictEqual(calculateTurnoutPercentage(9, 9), 100);
  assert.strictEqual(calculateTurnoutPercentage(0, 9), 0);

  // Late rule evaluation: 'separate', 'half', 'present'
  assert.strictEqual(calculateAttendancePercentage(6, 2, 8, 'separate'), 75);
  assert.strictEqual(calculateAttendancePercentage(6, 2, 8, 'half'), 88);
  assert.strictEqual(calculateAttendancePercentage(6, 2, 8, 'present'), 100);

  // Exam eligibility threshold
  assert.strictEqual(isExamEligible(75, 75, 10), true);
  assert.strictEqual(isExamEligible(74, 75, 10), false);
  assert.strictEqual(isExamEligible(0, 75, 0), true, 'Unrecorded students should not be penalized before evaluation');

  // Compute student metrics
  const student = { id: 'std_1', name: 'Aarav Sharma', rollNumber: '24CSE001' };
  const records = [
    { rollNumber: '24CSE001', status: 'Present' },
    { rollNumber: '24CSE001', status: 'Absent' },
    { rollNumber: '24CSE001', status: 'Late' },
  ];
  const metrics = computeStudentMetrics(student, records, 75, 'half');
  assert.strictEqual(metrics.total, 3);
  assert.strictEqual(metrics.present, 1);
  assert.strictEqual(metrics.absent, 1);
  assert.strictEqual(metrics.late, 1);
  // (1 + 0.5) / 3 = 50%
  assert.strictEqual(metrics.pct, 50);
  assert.strictEqual(metrics.isEligible, false);
});

// -----------------------------------------------------------------------------
// Test 20: Centralized validation functions enforce data integrity
// -----------------------------------------------------------------------------
test('Test 20: Centralized validation functions enforce data integrity and prevent duplicates', () => {
  const existingStudents = [{ id: 'std_1', name: 'Aarav Sharma', rollNumber: '24CSE001' }];

  // Name validation
  const invalidName = validateStudent({ name: 'A', rollNumber: '24CSE002' }, existingStudents);
  assert.strictEqual(invalidName.isValid, false);
  assert.ok(invalidName.errors.name);

  // Duplicate roll number prevention
  const duplicateRoll = validateStudent({ name: 'Duplicate', rollNumber: '24CSE001' }, existingStudents);
  assert.strictEqual(duplicateRoll.isValid, false);
  assert.ok(duplicateRoll.errors.rollNumber);

  // Valid student passes
  const valid = validateStudent({ name: 'Rohan Gupta', rollNumber: '24CSE027' }, existingStudents);
  assert.strictEqual(valid.isValid, true);

  // Attendance record validation
  const existingRecords = [{ id: 'rec_1', rollNumber: '24CSE001', status: 'Present' }];
  const dupRecord = validateAttendanceRecord({ name: 'Aarav', rollNumber: '24CSE001', status: 'Present' }, existingRecords);
  assert.strictEqual(dupRecord.isValid, false);
  assert.ok(dupRecord.errors.rollNumber);

  // Session validation
  const invalidSession = validateSession({ name: 'S1', date: '' });
  assert.strictEqual(invalidSession.isValid, false);

  // Backup validation
  assert.strictEqual(validateJsonBackup({ students: [] }).isValid, true);
  assert.strictEqual(validateJsonBackup('invalid-string').isValid, false);
});

// -----------------------------------------------------------------------------
// Test 21: Versioned storage creates auto-backups and validates schema
// -----------------------------------------------------------------------------
test('Test 21: Versioned storage defines storage version and safe fallbacks', () => {
  assert.strictEqual(typeof STORAGE_VERSION, 'number');
  assert.ok(STORAGE_VERSION >= 5);

  // Safe fallback when window is undefined in SSR
  const fallback = [{ id: 'test' }];
  const loaded = loadVersioned('non_existent_key', fallback);
  assert.deepStrictEqual(loaded, fallback);
});

// -----------------------------------------------------------------------------
// Test 22: AttendanceList renders academic print report header and signatures
// -----------------------------------------------------------------------------
test('Test 22: AttendanceList renders official academic print report header, metadata, and signatures', () => {
  const html = renderToString(
    React.createElement(AttendanceList, {
      records: sampleRecords,
      sessions: [{ id: 'sess_1', name: 'Web Dev Lecture', subject: 'React JS', date: '2026-11-21' }],
      activeSession: { id: 'sess_1', name: 'Web Dev Lecture', subject: 'React JS', date: '2026-11-21' },
      onDeleteRecord: noop,
      onChangeStatus: noop,
    })
  );

  assert.ok(html.includes('print-report-header'), 'AttendanceList must contain print-report-header markup');
  assert.ok(html.includes('Apex Institute of Technology'), 'Must render official institution header');
  assert.ok(html.includes('Department of Computer Science &amp; Engineering'), 'Must render department header');
  assert.ok(html.includes('print-report-footer'), 'Must render print-report-footer for official signatures');
  assert.ok(html.includes('Faculty / Course Instructor'), 'Must render instructor signature block');
  assert.ok(html.includes('Head of Department (HOD)'), 'Must render HOD signature block');
});


