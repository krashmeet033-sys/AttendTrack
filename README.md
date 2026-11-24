# AttendTrack 2.0 — Smart Student Attendance Management System

<p align="center">
  <a href="https://attend-track-7j5799t00-krashmeet033-sys-projects.vercel.app"><strong>🌐 View Live Website</strong></a>
  &nbsp; • &nbsp;
  <a href="https://github.com/krashmeet033-sys/AttendTrack"><strong>GitHub Repository</strong></a>
</p>

**Degree & Branch:** B.Tech Computer Science & Engineering (2025–29)  
**Semester:** II  
**Subject:** React JS  
**Academic Role:** Case Study Project & Practical Submission

**Official Problem Statement:** Develop a React application to maintain basic attendance records of students for classroom activities.

---

## 1. Project Overview

**AttendTrack 2.0** is a modern, client-side classroom attendance management platform built using React.js and Vite. It provides a centralized interface for recording attendance, managing student information, organizing classroom sessions, monitoring attendance performance, and reviewing attendance reports.

The project demonstrates reusable React components, custom hooks, state management, form validation, data persistence, attendance calculations, and responsive user interface design.

The application is designed around the academic scope of the React JS case study while incorporating additional classroom management and analytics functionality.

### Key Highlights

- **Centralized State Management:** Custom React hooks organize attendance, student, session, and settings logic.
- **Attendance Tracking:** Record Present, Absent, and Late statuses with validation and duplicate prevention.
- **Student Management:** Maintain a student directory and view student-wise attendance information.
- **Session Management:** Organize classroom sessions and manage session-related attendance.
- **Attendance Analytics:** View attendance trends, status distributions, and student metrics.
- **Data Persistence:** Versioned browser `localStorage` keeps application data on the user's device.
- **Audit History:** Review attendance changes and use available undo functionality for supported actions.
- **Automated Testing:** Includes a 22-test component, utility, and system test suite.
- **Vercel Deployment:** Hosted as a production web application.

---

## 2. Live Demo

| Resource | Link |
|---|---|
| **Live Website** | [AttendTrack – Vercel](https://attend-track-7j5799t00-krashmeet033-sys-projects.vercel.app) |
| **GitHub Repository** | [AttendTrack – GitHub](https://github.com/krashmeet033-sys/AttendTrack) |

---

## 3. Application Features

### Dashboard
- Centralized attendance overview.
- Dynamic KPI cards and attendance statistics.
- Attendance overview and distribution charts.
- Recent attendance activity.
- Quick navigation to application sections.

### Attendance Management
- Record student name, roll number, and attendance status.
- Present, Absent, and Late attendance options.
- Form validation and duplicate-record prevention.
- Search, filter, and sort attendance records.
- Delete records and clear attendance data with confirmation.
- CSV export functionality.

### Student Directory
- View and manage the student roster.
- Search students by name and roll number.
- View student profiles.
- Review student-wise attendance metrics and eligibility information.

### Session Management
- Organize classroom lecture sessions.
- Maintain subject, faculty, room, date, and timing information.
- Manage active and completed sessions.
- Review session-related attendance information.

### Live Session Workspace
- Dedicated classroom attendance workspace.
- View the student roster for a session.
- Mark students Present, Absent, or Late.
- Track attendance completion progress.
- Search students during a session.
- Save and complete session attendance.

### Reports & Analytics
- Attendance overview and trend charts.
- Present, Absent, and Late distribution.
- Student-wise attendance comparison.
- Attendance percentage calculations.
- Attendance insights and printable reports.
- CSV export.

### Attendance Correction Centre
- Review attendance modification history.
- View audit information.
- Search and filter correction entries.
- Track changes made to attendance records.

### Settings & Data Management
- Light and dark appearance options.
- Configurable attendance threshold.
- Late-arrival attendance policies.
- Editing preferences.
- Data export and backup-related functionality.

---

## 4. Mandatory Requirements — Case Study Compliance

| No. | Requirement | Implementation |
|---|---|---|
| 1 | Attendance form with Student Name, Roll Number, and Attendance Status | `AttendanceForm.jsx` |
| 2 | Reusable AttendanceCard component using props | `AttendanceCard.jsx` |
| 3 | `useState` for attendance record management | `App.jsx` and `useAttendance.js` |
| 4 | Add and delete attendance records | Attendance form and record management components |
| 5 | Display attendance records dynamically | `AttendanceList.jsx` |
| 6 | Search, filter, and sort records | Attendance record management |
| 7 | Attendance analytics | `AttendanceAnalytics.jsx` |

**Required empty-state message:**

> No attendance records available. Start by adding your first student attendance record.

---

## 5. Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Component-based user interface |
| JavaScript (ES6+) | Application logic |
| Vite | Development server and production build |
| HTML5 | Web application structure |
| CSS3 | Styling and responsive layouts |
| Recharts | Attendance charts and analytics |
| Lucide React | Icons and interface elements |
| LocalStorage | Client-side data persistence |
| Node.js | Test execution and development environment |
| esbuild | Test-suite bundling |
| Vercel | Production deployment |
| Git & GitHub | Version control and source code hosting |

---

## 6. Project Architecture

The application follows a modular structure with reusable components, custom hooks, utility functions, and test files.

```text
AttendTrack/
│
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icon.svg
│
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── AttendanceForm.jsx
│   │   ├── AttendanceCard.jsx
│   │   ├── AttendanceList.jsx
│   │   ├── StudentDirectory.jsx
│   │   ├── StudentProfileModal.jsx
│   │   ├── SessionsView.jsx
│   │   ├── LiveSessionWorkspace.jsx
│   │   ├── AttendanceAnalytics.jsx
│   │   ├── AttendanceCorrectionCentre.jsx
│   │   ├── AttendanceHeatmap.jsx
│   │   ├── CommandPalette.jsx
│   │   ├── ActivityFeed.jsx
│   │   ├── OverviewChart.jsx
│   │   ├── DistributionChart.jsx
│   │   ├── Settings.jsx
│   │   ├── AboutProject.jsx
│   │   └── ErrorBoundary.jsx
│   │
│   ├── hooks/
│   │   ├── useAttendance.js
│   │   ├── useStudents.js
│   │   ├── useSessions.js
│   │   └── useSettings.js
│   │
│   ├── utils/
│   │   ├── calculations.js
│   │   ├── validation.js
│   │   └── storage.js
│   │
│   ├── data/
│   │   └── defaultData.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── tests/
│   ├── system.test.js
│   └── run-tests.js
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

## 7. Architecture & Data Handling

### Custom React Hooks

The project separates application logic into reusable custom hooks:

- **`useAttendance`** — manages attendance records, status changes, calculated metrics, audit history, and undo functionality.
- **`useStudents`** — manages the student roster, roll number validation, and student attendance metrics.
- **`useSessions`** — manages classroom sessions and active session information.
- **`useSettings`** — manages attendance thresholds, late-arrival rules, and application preferences.

### Attendance Calculations

The application distinguishes between roster turnout and attendance percentage.

**Roster Turnout:**

`(Recorded Entries / Enrolled Students) × 100`

**Session Attendance:**

`(Effective Present / Evaluated Records) × 100`

Late-arrival calculations can follow the configured institutional policy:

- `separate`
- `half`
- `present`

### Data Persistence

AttendTrack uses versioned browser `localStorage` through `src/utils/storage.js`.

The storage utility includes version checking, validation, fallback handling, and backup-related functionality.

**Application Scope:** AttendTrack currently operates as a client-side React application. It does not use a separate backend server or cloud database. Browser-stored records are not automatically synchronized between devices.

### Progressive Web App Foundation

The `public` folder includes a web app manifest and service worker, providing the foundation for installable web app behaviour and application-shell caching.

---

## 8. React Concepts Demonstrated

- Functional components and JSX.
- `useState` for application state.
- `useEffect` for side effects and data synchronization.
- `useMemo` for derived calculations.
- Props and reusable components.
- Controlled form inputs.
- Event handling (`onSubmit`, `onChange`, `onClick`).
- Conditional rendering.
- Dynamic list rendering using `Array.map()`.
- Search and filtering using `Array.filter()`.
- Sorting using `Array.sort()`.
- Custom React hooks.
- Component-based architecture.
- Form validation and data handling.

---

## 9. Automated Test Suite

The project includes **22 automated tests** using Node.js's built-in test runner (`node:test`) and esbuild.

Run the tests using:

```bash
npm test
```

The test suite covers:

1. StatCard rendering and prop-driven values.
2. Attendance form fields and attendance statuses.
3. Present attendance card rendering.
4. Absent attendance card rendering.
5. Late attendance card rendering.
6. Attendance list empty state.
7. Dynamic record rendering and controls.
8. Attendance search functionality.
9. Attendance analytics calculations.
10. Analytics empty state.
11. Sidebar navigation.
12. Header rendering.
13. Settings and application preferences.
14. Dashboard KPI rendering.
15. Dashboard widgets and welcome section.
16. Overview and distribution chart components.
17. Student directory rendering.
18. AboutProject rendering.
19. Attendance calculation utilities.
20. Data validation utilities.
21. Versioned storage utilities.
22. Printable academic attendance report.

**Test suite included:** 22 tests.

---

## 10. Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Step 1 — Clone the Repository

```bash
git clone https://github.com/krashmeet033-sys/AttendTrack.git
```

### Step 2 — Open the Project Folder

```bash
cd AttendTrack
```

### Step 3 — Install Dependencies

```bash
npm install
```

### Step 4 — Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### Step 5 — Create a Production Build

```bash
npm run build
```

### Step 6 — Preview the Production Build

```bash
npm run preview
```

### Step 7 — Run Automated Tests

```bash
npm test
```

---

## 11. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Creates the production build in `dist/` |
| `npm run preview` | Previews the production build |
| `npm test` | Runs the automated test suite |

---

## 12. Deployment

AttendTrack is deployed using **Vercel**, with the GitHub repository connected for deployment.

**Production Website:**  
https://attend-track-7j5799t00-krashmeet033-sys-projects.vercel.app

**Deployment Configuration:**

| Setting | Value |
|---|---|
| Platform | Vercel |
| Framework Preset | Vite |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Source Repository | GitHub |

---

## 13. Screenshots

The following screenshots demonstrate the main application modules.

Add your actual application screenshots to the `screenshots/` folder.

| Screenshot | File |
|---|---|
| Main Dashboard | `screenshots/dashboard.png` |
| Live Session Workspace | `screenshots/live-session.png` |
| Student Directory | `screenshots/student-directory.png` |
| Reports & Analytics | `screenshots/analytics.png` |
| Attendance Correction Centre | `screenshots/attendance-corrections.png` |



# 📊 ATTENDTRACK — MAIN DASHBOARD

The central dashboard provides a comprehensive overview of classroom attendance, key performance indicators, attendance statistics, and recent activity.

<img width="1470" height="646" alt="AttendTrack Main Dashboard" src="https://github.com/user-attachments/assets/c30c9ddf-41c8-4e67-b1fe-e7a35820530e" />

---

# 🚀 LIVE SESSION — ATTENDANCE MANAGEMENT WORKSPACE

A dedicated workspace for managing live classroom sessions, recording student attendance, and monitoring attendance status throughout a lecture.

<img width="1470" height="835" alt="Live Session Attendance Management Workspace" src="https://github.com/user-attachments/assets/4fc1c4f9-2f00-4161-b680-d842df44927e" />

---

# 👩‍🎓 STUDENT DIRECTORY — STUDENT RECORD MANAGEMENT

A centralized student directory to view, search, and manage student profiles, academic information, and individual attendance records.

<img width="1189" height="831" alt="Student Directory and Record Management" src="https://github.com/user-attachments/assets/959e8f95-16eb-4a1f-b2e8-4cfde6d1f04c" />

---

# 📈 ATTENDANCE ANALYTICS — REPORTS & INSIGHTS

An analytical overview of attendance patterns, student performance, attendance distribution, and statistical insights through visual reports and charts.

<img width="1188" height="758" alt="Attendance Analytics and Reports" src="https://github.com/user-attachments/assets/af828b0d-90cb-46b3-ab64-7b894e7156a3" />

---

# 🛡️ ATTENDANCE CORRECTION CENTRE — AUDIT & RECORD MANAGEMENT

A dedicated centre for reviewing attendance corrections, monitoring record modifications, and maintaining transparency in attendance management.

<img width="1469" height="836" alt="Attendance Correction Centre and Audit Management" src="https://github.com/user-attachments/assets/12adb37d-6661-4bd5-99d6-7f1805e7adf8" />

---

## 14. Future Enhancements

- Backend integration and cloud database support.
- Secure teacher authentication and role-based access.
- Multi-device attendance synchronization.
- Enhanced academic report generation.
- Integration with institutional ERP systems.

---

## 15. Author

**Rashmeet Kaur Nanade**

B.Tech Computer Science & Engineering  
ITM Skills University

- **GitHub:** [@krashmeet033-sys](https://github.com/krashmeet033-sys)
- **Project:** [AttendTrack Repository](https://github.com/krashmeet033-sys/AttendTrack)
- **Live Demo:** [AttendTrack – Vercel](https://attend-track-7j5799t00-krashmeet033-sys-projects.vercel.app)

---

<p align="center">
  <strong>AttendTrack 2.0</strong><br/>
  Smart Student Attendance Management System<br/>
  Built with React.js and Vite.
</p>
