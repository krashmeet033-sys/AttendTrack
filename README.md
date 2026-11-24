# AttendTrack 2.0 — Smart Student Attendance Management System

**Degree & Branch:** B.Tech Computer Science & Engineering (2025–29)  
**Semester:** II  •  **Subject:** React JS  
**Academic Role:** Case Study Project & Practical Submission  

**Official Problem Statement:** Develop a React application to maintain basic attendance records of students for classroom activities.

---

## 1. Executive Summary & Architecture Overview

**AttendTrack 2.0** is an enterprise-grade, client-side classroom attendance management platform designed with production React engineering patterns. While strictly respecting the academic scope of the B.Tech CSE Semester II curriculum (no bloated external backend or unnecessary biometric/AI gimmicks), it delivers senior-level architecture, rigorous data integrity, mathematical consistency, versioned resilience, and an intuitive user experience.

### Architectural Highlights

1. **Centralised Custom Hooks:** State logic is decoupled from UI presentation into reusable custom hooks:
   - `useAttendance`: Single source of truth for records, status transitions, derived statistics, local audit trail, and instant Undo.
   - `useStudents`: Student roster management, unique roll number validation, cohort metrics derivation, and exam eligibility classification.
   - `useSessions`: Academic lecture sessions, active session context, schedule timing validation, and session turnout analysis.
   - `useSettings`: Institutional policies (75% threshold, late-arrival weighting, read-only editing lock).
2. **Mathematically Rigorous Calculations:** `src/utils/calculations.js` enforces accurate derivations:
   - **Roster Turnout %** = `(Recorded Entries ÷ Enrolled Students) × 100`
   - **Session Attendance %** = `(Effective Present ÷ Evaluated Records) × 100` (factoring institutional late policies: `separate`, `half`, `present`).
3. **Data Integrity & Stable Identifiers:** Every student (`std_xxx`), session (`sess_xxx`), and record (`rec_xxx`) has a deterministic UUID. Duplicate marking within the same classroom session is strictly prevented at the validation layer.
4. **Versioned Persistence & Auto-Backup:** `src/utils/storage.js` manages versioned storage (`STORAGE_VERSION = 5`), automatic schema validation, safe fallbacks on corrupted data, and pre-destructive auto-backups.
5. **Local Audit History & One-Click Undo:** Every attendance mark, status toggle, edit, or deletion generates an audit log entry. Teachers can instantly click **"Undo"** on the toast notification to reverse accidental actions.
6. **Print-Ready Academic Sheets:** Clean, high-contrast `@media print` layout featuring college header, department info, subject, session, student marks, and formal signature blocks.
7. **Offline PWA Readiness:** Web app manifest (`manifest.json`) and service worker (`sw.js`) support uninterrupted attendance tracking during classroom connectivity drops.
8. **Automated Verification:** 22/22 unit and system tests pass with 0 failures, compiling via esbuild in <400ms.

---

## 2. Mandatory Requirements (Case Study Compliance)

| # | Requirement | Where it is implemented | Architectural Verification |
|---|---|---|---|
| 1 | Attendance form with Student Name, Roll Number and Attendance Status | [AttendanceForm.jsx](src/components/AttendanceForm.jsx) | Controlled components, inline field-level validation, autocomplete |
| 2 | Reusable `AttendanceCard` component using props | [AttendanceCard.jsx](src/components/AttendanceCard.jsx) | Pure presentational component, status badges, action locks |
| 3 | `useState` to store and manage attendance records | [useAttendance.js](src/hooks/useAttendance.js) + [App.jsx](src/App.jsx) | Centralized state hook, versioned storage synchronization |
| 4 | Add Attendance and Delete Attendance (with confirmation) | [App.jsx](src/App.jsx) + [AttendanceForm.jsx](src/components/AttendanceForm.jsx) | Modal confirmation dialogs + 1-click Undo toast |
| 5 | Display all records dynamically + empty-state message | [AttendanceList.jsx](src/components/AttendanceList.jsx) | Dynamic `.map()`, search, multi-filter, sort, CSV export |

Required empty-state message shown when there are no records:

> **No attendance records available. Start by adding your first student attendance record.**

---

## 3. Project Directory Structure

```
React Final Project/
├── index.html                 # HTML shell, PWA manifest link, Google Fonts
├── vite.config.js             # Vite 5 + React plugin configuration
├── package.json               # Dependencies, scripts (dev, build, test)
├── public/
│   ├── manifest.json          # PWA Web App Manifest
│   ├── sw.js                  # Service Worker for offline classroom caching
│   └── icon.svg               # App iconography
├── src/
│   ├── main.jsx               # Entry point (createRoot + StrictMode + ErrorBoundary + SW)
│   ├── App.jsx                # Root coordinator integrating custom hooks & views
│   ├── App.css                # Enterprise design tokens, dark/light themes, print CSS
│   ├── index.css              # Global CSS reset and typography
│   ├── data/
│   │   └── defaultData.js     # Default roster, sessions, and demo records
│   ├── hooks/
│   │   ├── index.js           # Reusable custom hooks entry point
│   │   ├── useAttendance.js   # Records, metrics derivation, audit trail, undo
│   │   ├── useStudents.js     # Roster management, eligibility, cohort metrics
│   │   ├── useSessions.js     # Session management, active context, timetable
│   │   └── useSettings.js     # Institutional policies, thresholds, editing locks
│   ├── utils/
│   │   ├── calculations.js    # Mathematically rigorous attendance & turnout math
│   │   ├── validation.js      # Student, record, session, and backup validation
│   │   └── storage.js         # Versioned localStorage, auto-backup, schema checks
│   └── components/
│       ├── ErrorBoundary.jsx      # Production crash-prevention fallback UI
│       ├── Header.jsx             # Breadcrumbs, date, quick search, theme, profile
│       ├── Sidebar.jsx            # Desktop collapsible navigation rail & mobile drawer
│       ├── CommandPalette.jsx     # Cmd+K / Ctrl+K global search & command launcher
│       ├── StatCard.jsx           # Reusable KPI card with trend indicator
│       ├── AttendanceForm.jsx     # Controlled entry form with duplicate check
│       ├── AttendanceCard.jsx     # Presentational table row / card with actions
│       ├── AttendanceList.jsx     # Data table with filters, search, CSV, print layout
│       ├── StudentDirectory.jsx   # Enrolled cohort directory, eligibility badges
│       ├── SessionsView.jsx       # Lecture session cards, turnout analysis
│       ├── AttendanceCalendar.jsx # November 2026 interactive calendar & day drawer
│       ├── AttendanceAnalytics.jsx# Turnout vs attendance, distribution donut, trend
│       ├── AuditTrailModal.jsx    # Complete local audit history modal
│       ├── Settings.jsx           # Preferences, rules, JSON backup/restore
│       └── AboutProject.jsx       # Comprehensive viva defense & scope documentation
└── tests/
    ├── system.test.js         # 22 automated unit, component, and system tests
    └── run-tests.js           # esbuild + Node.js native test runner
```

---

## 4. Getting Started

### Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Start the local Vite development server
npm run dev

# 3. Build for production (outputs to dist/)
npm run build

# 4. Preview the production build locally
npm run preview

# 5. Run the 22-test automated verification suite
npm test
```

---

## 5. Automated Test Suite

`npm test` bundles tests with `esbuild` and runs them via Node's native test runner (`node:test`):

```
✔ Test 1:  StatCard renders a prop-driven KPI value with its variant class
✔ Test 2:  AttendanceForm renders Name, Roll Number, three statuses and both buttons
✔ Test 3:  AttendanceCard renders a Present record with green styling and a delete action
✔ Test 4:  AttendanceCard renders an Absent record with red styling
✔ Test 5:  AttendanceCard renders a Late record with amber styling
✔ Test 6:  AttendanceList shows the required empty-state message when there are no records
✔ Test 7:  AttendanceList maps every record to a card and exposes filter/sort/export controls
✔ Test 8:  AttendanceList filters records by the search query (name or roll number)
✔ Test 9:  AttendanceAnalytics shows Present/Absent/Late counts and the attendance percentage
✔ Test 10: AttendanceAnalytics renders an empty state instead of fabricated analytics
✔ Test 11: Sidebar renders the required navigation pages
✔ Test 12: Header renders the logo, search field, theme toggle and user profile
✔ Test 13: Settings renders theme options, data actions and the requirement mapping
✔ Test 14: App renders the five dashboard KPI cards backed by demo data
✔ Test 15: Dashboard renders the attendance widgets and greets the Class Teacher
✔ Test 16: OverviewChart, DistributionChart, ActivityFeed and AttendanceSummary take data from props
✔ Test 17: StudentDirectory renders student roster, search, and metrics
✔ Test 18: AboutProject renders the product overview, requirement mapping and metadata
✔ Test 19: Centralized calculation functions accurately compute turnout, late rules, and exam eligibility
✔ Test 20: Centralized validation functions enforce data integrity and prevent duplicates
✔ Test 21: Versioned storage defines storage version and safe fallbacks
✔ Test 22: AttendanceList renders official academic print report header, metadata, and signatures

Total: 22 passed · 0 failed · 0 skipped
```

---

## 6. Viva Defense & Evaluator Notes

1. **Decoupled Architecture:** `App.jsx` delegates domain operations to custom hooks (`useAttendance`, `useStudents`, `useSessions`, `useSettings`), maintaining unidirectional data flow and easy testability without external state libraries.
2. **Data Consistency:** Roster cohort figures mathematically balance: `6 Eligible + 2 Shortage + 1 Unrecorded = 9 Total Students`.
3. **Turnout vs. Attendance:** The application explicitly differentiates **Roster Turnout %** (how many students had their attendance logged in a session) from **Session Attendance %** (how many of those evaluated were Present).
4. **Academic Scope & Boundaries:**
   - Single-workstation classroom tool for teachers.
   - Client-side persistence via versioned `localStorage` (`STORAGE_VERSION = 5`).
   - Pure, reliable React without unnecessary backend dependencies.

---

## Pages

1. **Dashboard** — "Welcome back, Class Teacher" welcome section with the live date and record count, four dynamic KPI cards, an Attendance Overview chart, an Attendance Distribution donut, Recent Attendance Activity and an Attendance Summary.
2. **Mark Attendance** — the controlled attendance form with validation and duplicate-roll-number prevention.
3. **Attendance Records** — the full record set in a clean data table with search, status filters, sorting, CSV export and clear-all.
4. **Reports & Analytics** — an at-a-glance overview, the attendance trend chart, the status distribution and a percentage breakdown, all from the live records.
5. **Settings** — appearance (light default), attendance data export/reset actions and the About AttendTrack panel.

---

## Features

- **Attendance form** — Student Name, Roll Number and Attendance Status (Present / Absent / Late).
- **Validation** — required fields, minimum length, and clear inline error messages.
- **Duplicate prevention** — a roll number can only be recorded once (case-insensitive check).
- **Reusable `AttendanceCard`** — receives its record entirely through props and colours itself conditionally:
  - Green badge for **Present**
  - Red badge for **Absent**
  - Amber badge for **Late**
- **Dynamic KPI cards** — Total Records, Present, Absent and Late, all calculated from state (nothing is hardcoded).
- **Search** — instant filtering by student name or roll number from the header or the records toolbar.
- **Filter & sort** — filter by All / Present / Absent / Late; sort by name or roll number ascending/descending, or newest first.
- **Delete with confirmation** — every delete asks for confirmation before the record is removed.
- **Clear all with confirmation** — resets the app back to its empty state.
- **CSV export** — downloads the current records with meaningful column headings (Sl No, Student Name, Roll Number, Attendance Status, Date, Time).
- **Toast notifications** — feedback for adding, deleting, changing status, exporting and clearing.
- **Empty states** — a designed empty state for the records table, each dashboard chart and the analytics page; no fabricated data is ever shown.
- **Collapsible sidebar** — the desktop navigation can be collapsed to an icon-only rail; a drawer is used on mobile.
- **Light-first theming** — a light lavender interface by default, with an optional dark theme available in the header and in Settings, remembered per device.
- **Responsive layout** — a collapsing sidebar drawer and stacked layouts on tablets and phones.
- **Optional persistence** — records and theme are saved to `localStorage`, but the app works perfectly using `useState` alone.

---

## Project Structure

```
React Final Project/
├── index.html                 # HTML shell, Inter + Plus Jakarta Sans fonts, favicon, meta tags
├── vite.config.js             # Vite + React plugin configuration
├── package.json
├── src/
│   ├── main.jsx               # React entry point (createRoot + StrictMode)
│   ├── index.css              # Design tokens, light (default) + dark themes, base reset
│   ├── App.css                # All component styling
│   ├── App.jsx                # Root component: state, handlers, page routing
│   └── components/
│       ├── Sidebar.jsx            # Collapsible navigation (5 pages)
│       ├── Header.jsx             # Page title, wordmark, date, search, theme, profile
│       ├── StatCard.jsx           # Reusable KPI card (props-driven)
│       ├── AttendanceForm.jsx     # Controlled form + validation
│       ├── AttendanceCard.jsx     # Reusable record row/card (props-driven)
│       ├── AttendanceList.jsx     # Table with search / filter / sort / export + empty state
│       ├── OverviewChart.jsx      # Attendance Overview — 7-day stacked bar chart
│       ├── DistributionChart.jsx  # Attendance Distribution donut
│       ├── ActivityFeed.jsx       # Recent Attendance Activity list
│       ├── AttendanceSummary.jsx  # Attendance summary progress bars
│       ├── ChartTooltip.jsx       # Shared Recharts tooltip
│       ├── AttendanceAnalytics.jsx# Reports overview, charts and status breakdown
│       └── Settings.jsx           # Appearance, data actions and About AttendTrack
└── tests/
    ├── system.test.js         # 16 automated component/system tests
    └── run-tests.js           # esbuild + Node test runner
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Canvas | `#F7F5FC` | App background |
| Surface | `#FFFFFF` | Cards and panels |
| Surface alt | `#F0ECFA` | Secondary surfaces |
| Primary violet | `#7952D6` | Primary actions, active states |
| Deep plum | `#241A38` | Sidebar and structural elements |
| Lavender accent | `#A88AE8` | Highlights, accents |
| Text | `#28213A` | Primary text |
| Text muted | `#777087` | Secondary text |
| Present | `#159B72` | Present status |
| Absent | `#E45B70` | Absent status |
| Late | `#D69A32` | Late status |
| Borders | `#E8E2F2` | Dividers and outlines |

- **Typography:** Plus Jakarta Sans (headings, KPI values, brand) + Inter (body copy, labels, inputs) from Google Fonts.
- **Theming:** CSS custom properties defined on `:root` (light lavender, the default appearance) and overridden by `[data-theme="dark"]` (optional dark appearance) on `<html>`; React switches the attribute via `useEffect`.
- **Styling:** clean, flat surfaces with subtle borders and restrained transitions — no neon, no heavy glow, no gradient overload.

---

## React Concepts Demonstrated

- Functional components and JSX
- `useState` for records, form fields, filters, sorting, theme and toasts
- `useEffect` for `localStorage` synchronisation and applying the theme
- **Props** for one-way data flow (parent → child)
- Lifting state up — `App.jsx` owns the single source of truth
- **Event handling** — `onSubmit`, `onChange`, `onClick`
- **Conditional rendering** and conditional CSS class names
- `Array.map()` to render records and `Array.filter()` for search/status filtering, plus `Array.sort()` for sorting
- Controlled inputs and form validation
- Reusable components (`StatCard`, `AttendanceCard`, `OverviewChart`, `DistributionChart`, `ActivityFeed`, `AttendanceSummary`)
- `useMemo` to bucket records into the Attendance Overview's seven-day window

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Create a production build
npm run build

# 4. Preview the production build
npm run preview

# 5. Run the automated tests
npm test
```

### Dependencies

| Package | Purpose |
|---|---|
| `react` / `react-dom` | UI library |
| `lucide-react` | Consistent icon set |
| `recharts` | Attendance Overview bar chart, Attendance Distribution donut |
| `vite` + `@vitejs/plugin-react` | Build tooling |

---

## Test Suite

`npm test` compiles the suite with esbuild and runs it through Node's built-in test runner.

```
✔ Test 1  StatCard renders a prop-driven KPI value with its variant class
✔ Test 2  AttendanceForm renders Name, Roll Number, three statuses and both buttons
✔ Test 3  AttendanceCard renders a Present record with green styling and a delete action
✔ Test 4  AttendanceCard renders an Absent record with red styling
✔ Test 5  AttendanceCard renders a Late record with amber styling
✔ Test 6  AttendanceList shows the required empty-state message when there are no records
✔ Test 7  AttendanceList maps every record to a card and exposes filter/sort/export controls
✔ Test 8  AttendanceList filters records by the search query (name or roll number)
✔ Test 9  AttendanceAnalytics shows Present/Absent/Late counts and the attendance percentage
✔ Test 10 AttendanceAnalytics renders an empty state instead of fabricated analytics
✔ Test 11 Sidebar renders the five required navigation pages
✔ Test 12 Header renders the logo, search field, theme toggle and user profile
✔ Test 13 Settings renders theme options, data actions and the requirement mapping
✔ Test 14 App renders the four KPI cards and the empty state on first load
✔ Test 15 Dashboard renders the attendance widget panels and greets the Class Teacher
✔ Test 16 OverviewChart, DistributionChart, ActivityFeed and AttendanceSummary take their data from props
```

---

## Manual Verification Checklist

| Feature | How to verify |
|---|---|
| Add a record | Mark Attendance → fill the form → **Mark Attendance**; the record appears instantly and a toast confirms it |
| Form validation | Submit with empty fields — inline errors appear under Name and Roll Number |
| Duplicate prevention | Submit a roll number that already exists — the form rejects it with an explicit message |
| Dynamic KPIs | The four dashboard cards update immediately after every add, delete or status change |
| Dashboard charts | The Attendance Overview chart and Attendance Distribution donut redraw from the live records |
| Recent activity | Every add or status change appears at the top of "Recent Attendance Activity" with a timestamp |
| Delete with confirmation | Press the trash icon on a row → confirm in the dialog |
| Search | Type a name or roll number in the header — the records table filters instantly |
| Filter by status | Use the All / Present / Absent / Late tabs above the records |
| Sort | Use the "Sort by" dropdown (name or roll number, ascending/descending) |
| Empty state | Clear all records — the required empty-state message is displayed |
| Collapse sidebar | Press the chevron in the sidebar brand block to collapse it to an icon-only rail |
| Theme toggle | Use the sun/moon button in the header or the theme switcher in Settings |
| CSV export | Records page or Settings → **Download CSV**; a `.csv` file downloads |
| Clear all | Records page or Settings → **Clear All** → confirm in the dialog |
| Responsive layout | Resize the window — the sidebar becomes a drawer and the layouts stack |
| Persistence | Reload the page — records and theme are restored from `localStorage` |

---

## Notes for the Viva

- `App.jsx` is the **only** component that owns the attendance records. Every other component receives data through props and reports changes back up through callback props — this is the "lifting state up" pattern.
- The empty-state message required by the problem statement lives in `AttendanceList.jsx` and is rendered with conditional rendering (`records.length === 0`).
- `AttendanceCard.jsx` is purely presentational and reusable: it never manages its own data, only displays what it receives and calls `onDelete` / `onChangeStatus`.
- No statistics are hardcoded. Every KPI, chart value and percentage is derived from the `attendanceRecords` array using `filter()` and simple arithmetic on each render.
