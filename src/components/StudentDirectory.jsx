import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserX,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  ShieldCheck,
  Calculator,
  Info,
} from 'lucide-react';

/**
 * StudentDirectory Component
 *
 * Dedicated Student Management Area.
 * Lists students enrolled in the class, calculates their cumulative attendance
 * records, and allows adding, editing, and viewing individual attendance profiles.
 *
 * @param {Object} props
 * @param {Array} props.students           - List of students [{ id, name, rollNumber, className, semester }]
 * @param {Array} props.records            - All attendance records from App state
 * @param {Function} props.onAddStudent    - Handler to add a new student
 * @param {Function} props.onEditStudent   - Handler to update an existing student
 * @param {Function} props.onDeleteStudent - Handler to delete a student
 * @param {Function} props.onMarkStudent   - Handler to jump to Mark Attendance for a student
 * @param {number} props.threshold         - Attendance warning threshold (e.g. 75%)
 * @param {{id: string, nonce: number}} [props.focusRequest] - Opens a student profile
 *        when the Dashboard "Students Requiring Attention" list links to one.
 * @param {boolean} [props.isSampleData] - True while the bundled demonstration roster
 *        is still in place, so the list can be labelled as sample data.
 */
function StudentDirectory({
  students = [],
  records = [],
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onMarkStudent,
  threshold = 75,
  lateRule = 'separate',
  sessions = [],
  activeSession,
  focusRequest,
  isSampleData = false,
  onOpenStudentProfile,
}) {
  const [search, setSearch] = useState('');
  const [filterEligibility, setFilterEligibility] = useState('all'); // 'all' | 'eligible' | 'shortage' | 'unrecorded'
  const [sortBy, setSortBy] = useState('name-asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingProfileStudent, setViewingProfileStudent] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importParsedList, setImportParsedList] = useState([]);
  const [importError, setImportError] = useState('');

  // Form state for add / edit
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    className: 'B.Tech CSE',
    semester: 'Semester II',
  });
  const [formErrors, setFormErrors] = useState({});

  // Deep link from the Dashboard attention list straight into a student profile.
  useEffect(() => {
    if (!focusRequest || !focusRequest.id) return;
    const target = students.find((s) => s.id === focusRequest.id);
    if (target) setViewingProfileStudent(target);
  }, [focusRequest, students]);

  // Compute metrics per student taking lateRule into account
  const studentMetrics = useMemo(() => {
    return students.map((student) => {
      const studentRecords = records.filter(
        (r) =>
          String(r.rollNumber).trim().toLowerCase() ===
          String(student.rollNumber).trim().toLowerCase()
      );
      const totalSessions = studentRecords.length;
      const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
      const absentCount = studentRecords.filter((r) => r.status === 'Absent').length;
      const lateCount = studentRecords.filter((r) => r.status === 'Late').length;

      let effectivePresent = presentCount;
      if (lateRule === 'present') effectivePresent += lateCount;
      else if (lateRule === 'half') effectivePresent += lateCount * 0.5;

      const percentage =
        totalSessions > 0 ? Math.min(100, Math.round((effectivePresent / totalSessions) * 100)) : 0;
      const isEligible = totalSessions > 0 && percentage >= threshold;

      return {
        ...student,
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        percentage,
        isEligible,
        records: studentRecords,
      };
    });
  }, [students, records, threshold, lateRule]);

  // Overall directory stats — all enrolled students strictly accounted for
  const totalStudents = students.length;
  const eligibleCount = studentMetrics.filter((s) => s.totalSessions > 0 && s.isEligible).length;
  const shortageCount = studentMetrics.filter((s) => s.totalSessions > 0 && !s.isEligible).length;
  const unrecordedCount = studentMetrics.filter((s) => s.totalSessions === 0).length;
  const avgAttendance =
    studentMetrics.filter((s) => s.totalSessions > 0).length > 0
      ? Math.round(
          studentMetrics
            .filter((s) => s.totalSessions > 0)
            .reduce((sum, s) => sum + s.percentage, 0) /
            studentMetrics.filter((s) => s.totalSessions > 0).length
        )
      : 0;

  // Filter and sort
  const filteredStudents = useMemo(() => {
    return studentMetrics
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(search.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filterEligibility === 'eligible') {
          return student.totalSessions > 0 && student.isEligible;
        }
        if (filterEligibility === 'shortage') {
          return student.totalSessions > 0 && !student.isEligible;
        }
        if (filterEligibility === 'unrecorded') {
          return student.totalSessions === 0;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'roll-asc') return a.rollNumber.localeCompare(b.rollNumber);
        if (sortBy === 'pct-desc') return b.percentage - a.percentage;
        if (sortBy === 'pct-asc') return a.percentage - b.percentage;
        return 0;
      });
  }, [studentMetrics, search, filterEligibility, sortBy]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      rollNumber: '',
      className: 'B.Tech CSE',
      semester: 'Semester II',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      className: student.className || 'B.Tech CSE',
      semester: student.semester || 'Semester II',
    });
    setFormErrors({});
  };

  // Validate form
  const validateStudentForm = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedRoll = formData.rollNumber.trim();

    if (!trimmedName) {
      errors.name = 'Student name is required.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!trimmedRoll) {
      errors.rollNumber = 'Roll number is required.';
    } else if (trimmedRoll.length < 2) {
      errors.rollNumber = 'Roll number must be at least 2 characters.';
    } else {
      // Duplicate roll number check (excluding currently edited student)
      const isDuplicate = students.some(
        (s) =>
          (!editingStudent || s.id !== editingStudent.id) &&
          s.rollNumber.trim().toLowerCase() === trimmedRoll.toLowerCase()
      );
      if (isDuplicate) {
        errors.rollNumber = `Roll number "${trimmedRoll}" is already assigned to a student.`;
      }
    }

    return errors;
  };

  // Submit Add / Edit
  const handleSaveStudent = (e) => {
    e.preventDefault();
    const errors = validateStudentForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (editingStudent) {
      onEditStudent({
        ...editingStudent,
        name: formData.name.trim(),
        rollNumber: formData.rollNumber.trim(),
        className: formData.className.trim(),
        semester: formData.semester.trim(),
      });
      setEditingStudent(null);
    } else {
      onAddStudent({
        id: `std_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: formData.name.trim(),
        rollNumber: formData.rollNumber.trim(),
        className: formData.className.trim(),
        semester: formData.semester.trim(),
      });
      setIsAddModalOpen(false);
    }
  };

  // CSV Import Handlers
  const handleParseCsv = (text) => {
    setImportCsvText(text);
    setImportError('');
    if (!text.trim()) {
      setImportParsedList([]);
      return;
    }
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    const parsed = [];
    lines.forEach((line, index) => {
      // Skip header row if it contains 'name' or 'roll'
      if (index === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('roll'))) {
        return;
      }
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const rollNumber = parts[1];
        const className = parts[2] || 'B.Tech CSE';
        const semester = parts[3] || 'Semester II';
        const isDuplicate = students.some(
          (s) => s.rollNumber.trim().toLowerCase() === rollNumber.toLowerCase()
        );
        parsed.push({
          id: `std_${Date.now()}_${index}`,
          name,
          rollNumber,
          className,
          semester,
          isDuplicate,
        });
      }
    });
    if (parsed.length === 0 && lines.length > 0) {
      setImportError('No valid student rows recognized. Expected format: Name, Roll Number, Section');
    }
    setImportParsedList(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        handleParseCsv(text);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const validStudents = importParsedList.filter((s) => !s.isDuplicate);
    if (validStudents.length === 0) return;
    validStudents.forEach((s) => {
      onAddStudent({
        id: s.id,
        name: s.name,
        rollNumber: s.rollNumber,
        className: s.className,
        semester: s.semester,
      });
    });
    setIsImportModalOpen(false);
    setImportCsvText('');
    setImportParsedList([]);
  };

  return (
    <div className="student-directory">
      {/* Overview Stat Cards */}
      <section className="kpi-grid" aria-label="Student directory metrics">
        <div className="stat-card stat-card--navy">
          <div className="stat-card__head">
            <span className="stat-card__label">Total Enrolled</span>
            <span className="stat-card__icon" aria-hidden="true">
              <Users size={19} />
            </span>
          </div>
          <div className="stat-card__value">{totalStudents}</div>
          <p className="stat-card__hint">B.Tech CSE · Semester II</p>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__head">
            <span className="stat-card__label">Exam Eligible (≥{threshold}%)</span>
            <span className="stat-card__icon" aria-hidden="true">
              <UserCheck size={19} />
            </span>
          </div>
          <div className="stat-card__value">{eligibleCount}</div>
          <p className="stat-card__hint">Students in good attendance standing</p>
        </div>

        <div className="stat-card stat-card--red">
          <div className="stat-card__head">
            <span className="stat-card__label">Attendance Shortage</span>
            <span className="stat-card__icon" aria-hidden="true">
              <AlertTriangle size={19} />
            </span>
          </div>
          <div className="stat-card__value">{shortageCount}</div>
          <p className="stat-card__hint">Students below {threshold}% threshold</p>
        </div>

        <div className="stat-card stat-card--amber">
          <div className="stat-card__head">
            <span className="stat-card__label">Class Average</span>
            <span className="stat-card__icon" aria-hidden="true">
              <TrendingUp size={19} />
            </span>
          </div>
          <div className="stat-card__value">{avgAttendance}%</div>
          <p className="stat-card__hint">Overall classroom attendance rate</p>
        </div>
      </section>

      {/* Directory Management Panel */}
      <section className="panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">Student Directory</h2>
            <p className="panel__subtitle">
              Manage student roster, track cumulative attendance and review exam eligibility.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setIsImportModalOpen(true);
                setImportCsvText('');
                setImportParsedList([]);
                setImportError('');
              }}
              title="Import students from CSV file or text"
            >
              <FileSpreadsheet size={16} />
              Import CSV
            </button>
            <button type="button" className="btn btn--primary" onClick={handleOpenAdd}>
              <UserPlus size={16} />
              Add Student
            </button>
          </div>
        </div>

        <div className="panel__body">
          {isSampleData && (
            <div
              role="note"
              className="sample-data-note"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.7rem 1rem',
                marginBottom: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8rem',
                color: 'var(--color-text-soft)',
                lineHeight: 1.5,
              }}
            >
              <Info size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                <strong style={{ color: 'var(--color-text)' }}>Sample data:</strong> this roster is a
                demonstration dataset bundled with the project so the directory can be evaluated. The
                students listed are fictional — edit or replace them with your real class roster
                before recording attendance.
              </span>
            </div>
          )}

          {/* Controls: Search, Filter, Sort */}
          <div className="table-controls">
            <div className="table-controls__search">
              <div className="search-field">
                <span className="search-field__icon" aria-hidden="true">
                  <Search size={16} />
                </span>
                <input
                  type="search"
                  className="search-field__input"
                  placeholder="Search by student name or roll number…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search students"
                />
              </div>
            </div>

            <div className="table-controls__filters">
              <div className="filter-tabs" role="tablist" aria-label="Filter students by eligibility">
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterEligibility === 'all'}
                  className={`filter-tab ${filterEligibility === 'all' ? 'filter-tab--active' : ''}`}
                  onClick={() => setFilterEligibility('all')}
                >
                  All ({students.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterEligibility === 'eligible'}
                  className={`filter-tab ${filterEligibility === 'eligible' ? 'filter-tab--active' : ''}`}
                  onClick={() => setFilterEligibility('eligible')}
                >
                  Eligible ({eligibleCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterEligibility === 'shortage'}
                  className={`filter-tab ${filterEligibility === 'shortage' ? 'filter-tab--active' : ''}`}
                  onClick={() => setFilterEligibility('shortage')}
                >
                  Shortage ({shortageCount})
                </button>
                {unrecordedCount > 0 && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={filterEligibility === 'unrecorded'}
                    className={`filter-tab ${filterEligibility === 'unrecorded' ? 'filter-tab--active' : ''}`}
                    onClick={() => setFilterEligibility('unrecorded')}
                  >
                    Unrecorded ({unrecordedCount})
                  </button>
                )}
              </div>

              <div className="sort-group">
                <label htmlFor="sort-students" className="sort-group__label">
                  Sort:
                </label>
                <select
                  id="sort-students"
                  className="sort-group__select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name-asc">Name (A–Z)</option>
                  <option value="name-desc">Name (Z–A)</option>
                  <option value="roll-asc">Roll Number</option>
                  <option value="pct-desc">Attendance % (High–Low)</option>
                  <option value="pct-asc">Attendance % (Low–High)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredStudents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">
                <Users size={28} />
              </div>
              <h3 className="empty-state__title">No matching students found</h3>
              <p className="empty-state__text">
                {search
                  ? `No students found matching "${search}". Try checking your spelling or clearing filters.`
                  : 'Start by enrolling your first student in the directory.'}
              </p>
              {search && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setSearch('');
                    setFilterEligibility('all');
                  }}
                  style={{ marginTop: '0.8rem' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="records-table-container">
              <table className="directory-table" role="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Class / Semester</th>
                    <th>Sessions</th>
                    <th>P / A / L</th>
                    <th>Cumulative %</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const initials = student.name
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={student.id} className="directory-table__row">
                        <td>
                          <div
                            className="student-profile-cell"
                            style={{ cursor: 'pointer' }}
                            onClick={() => (onOpenStudentProfile ? onOpenStudentProfile(student) : setViewingProfileStudent(student))}
                            title="Click to view full student profile"
                          >
                            <span className="attendance-card__avatar" aria-hidden="true">
                              {initials}
                            </span>
                            <div>
                              <span className="directory-table__name">{student.name}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="code-chip">{student.rollNumber}</span>
                        </td>
                        <td>
                          <span className="directory-table__class">
                            {student.className} · {student.semester}
                          </span>
                        </td>
                        <td>
                          <span className="directory-table__sessions">
                            {student.totalSessions} {student.totalSessions === 1 ? 'session' : 'sessions'}
                          </span>
                        </td>
                        <td>
                          <span className="breakdown-text">
                            <strong className="text-present">{student.presentCount}P</strong> ·{' '}
                            <strong className="text-absent">{student.absentCount}A</strong> ·{' '}
                            <strong className="text-late">{student.lateCount}L</strong>
                          </span>
                        </td>
                        <td>
                          <div className="pct-progress-cell">
                            <div className="pct-bar-bg">
                              <div
                                className={`pct-bar-fill ${
                                  student.percentage >= threshold
                                    ? 'pct-bar-fill--green'
                                    : student.percentage >= 60
                                    ? 'pct-bar-fill--amber'
                                    : 'pct-bar-fill--red'
                                }`}
                                style={{ width: `${Math.min(100, student.percentage)}%` }}
                              />
                            </div>
                            <span className="pct-number">{student.percentage}%</span>
                          </div>
                        </td>
                        <td>
                          {student.totalSessions === 0 ? (
                            <span className="status-badge status-badge--neutral">
                              <span className="status-badge__dot" aria-hidden="true" />
                              No Records
                            </span>
                          ) : student.isEligible ? (
                            <span className="status-badge status-badge--present">
                              <span className="status-badge__dot" aria-hidden="true" />
                              Eligible
                            </span>
                          ) : (
                            <span className="status-badge status-badge--absent">
                              <span className="status-badge__dot" aria-hidden="true" />
                              Shortage
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-action-btns">
                            <button
                              type="button"
                              className="card-icon-btn"
                              onClick={() => (onOpenStudentProfile ? onOpenStudentProfile(student) : setViewingProfileStudent(student))}
                              title="View student attendance profile"
                              aria-label={`View attendance profile for ${student.name}`}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              className="card-icon-btn"
                              onClick={() => handleOpenEdit(student)}
                              title="Edit student details"
                              aria-label={`Edit ${student.name}`}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="card-icon-btn card-icon-btn--danger"
                              onClick={() => onDeleteStudent(student.id)}
                              title="Delete student"
                              aria-label={`Delete ${student.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="student-modal-title">
          <div className="modal-card modal-card--form">
            <div className="modal-card__header">
              <div className="modal-card__icon" aria-hidden="true">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="modal-card__title" id="student-modal-title">
                  {editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
                </h3>
                <p className="modal-card__subtitle">
                  {editingStudent
                    ? 'Update student information and classroom assignment'
                    : 'Add a student to the B.Tech CSE Semester II roster'}
                </p>
              </div>
              <button
                type="button"
                className="modal-card__close"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} noValidate>
              <div className="modal-form-grid">
                <div className={`field ${formErrors.name ? 'field--error' : ''}`}>
                  <label className="field__label" htmlFor="modal-student-name">
                    Student Full Name <span className="field__required">*</span>
                  </label>
                  <input
                    id="modal-student-name"
                    type="text"
                    className="field__input"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && (
                    <span className="field__error" role="alert">
                      {formErrors.name}
                    </span>
                  )}
                </div>

                <div className={`field ${formErrors.rollNumber ? 'field--error' : ''}`}>
                  <label className="field__label" htmlFor="modal-student-roll">
                    University Roll Number <span className="field__required">*</span>
                  </label>
                  <input
                    id="modal-student-roll"
                    type="text"
                    className="field__input"
                    placeholder="e.g. 24CSE001"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  />
                  {formErrors.rollNumber && (
                    <span className="field__error" role="alert">
                      {formErrors.rollNumber}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="modal-student-class">
                    Academic Class
                  </label>
                  <input
                    id="modal-student-class"
                    type="text"
                    className="field__input"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="modal-student-sem">
                    Current Semester
                  </label>
                  <input
                    id="modal-student-sem"
                    type="text"
                    className="field__input"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-card__actions" style={{ marginTop: '1.4rem' }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Student Attendance Profile Modal (Section 13.1) */}
      {viewingProfileStudent && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
          <div className="modal-card modal-card--profile">
            <div className="modal-card__header">
              <div className="student-profile-header">
                <span className="student-profile-header__avatar" aria-hidden="true">
                  {viewingProfileStudent.name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </span>
                <div>
                  <h3 className="modal-card__title" id="profile-modal-title">
                    {viewingProfileStudent.name}
                  </h3>
                  <p className="modal-card__subtitle">
                    {viewingProfileStudent.rollNumber} · {viewingProfileStudent.className} ({viewingProfileStudent.semester})
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-card__close"
                onClick={() => setViewingProfileStudent(null)}
                aria-label="Close profile"
              >
                <X size={18} />
              </button>
            </div>

            {/* Threshold Status Banner */}
            <div
              className={`profile-status-banner ${
                viewingProfileStudent.totalSessions === 0
                  ? 'profile-status-banner--neutral'
                  : viewingProfileStudent.isEligible
                  ? 'profile-status-banner--eligible'
                  : 'profile-status-banner--shortage'
              }`}
            >
              {viewingProfileStudent.totalSessions === 0 ? (
                <>
                  <Clock size={18} />
                  <span>No attendance sessions recorded yet for this student.</span>
                </>
              ) : viewingProfileStudent.isEligible ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>
                    <strong>Good Standing:</strong> Cumulative attendance is {viewingProfileStudent.percentage}%, meeting the university requirement (≥{threshold}%).
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} />
                  <span>
                    <strong>Low Attendance Warning:</strong> Cumulative attendance is {viewingProfileStudent.percentage}%, below the required {threshold}% threshold.
                  </span>
                </>
              )}
            </div>

            {/* Stats Breakdown */}
            <div className="profile-stats-grid">
              <div className="profile-stat-box">
                <span className="profile-stat-box__label">Total Recorded</span>
                <span className="profile-stat-box__val">{viewingProfileStudent.totalSessions}</span>
              </div>
              <div className="profile-stat-box text-present">
                <span className="profile-stat-box__label">Present</span>
                <span className="profile-stat-box__val">{viewingProfileStudent.presentCount}</span>
              </div>
              <div className="profile-stat-box text-absent">
                <span className="profile-stat-box__label">Absent</span>
                <span className="profile-stat-box__val">{viewingProfileStudent.absentCount}</span>
              </div>
              <div className="profile-stat-box text-late">
                <span className="profile-stat-box__label">Late</span>
                <span className="profile-stat-box__val">{viewingProfileStudent.lateCount}</span>
              </div>
            </div>

            {/* Attendance Improvement Tracker (Phase 5 & 9) */}
            {(() => {
              const totalS = viewingProfileStudent.totalSessions;
              const presentS = viewingProfileStudent.presentCount;
              const curP = viewingProfileStudent.percentage;
              const targetT = threshold || 75;

              let needed = 0;
              let safeAbsences = 0;
              if (totalS > 0) {
                if (curP < targetT) {
                  needed = Math.ceil((targetT * totalS - 100 * presentS) / (100 - targetT));
                  if (needed < 0) needed = 0;
                } else {
                  safeAbsences = Math.floor((100 * presentS - targetT * totalS) / targetT);
                  if (safeAbsences < 0) safeAbsences = 0;
                }
              }

              return (
                <div className="profile-improvement-box" style={{ margin: '1rem 0', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 650, fontSize: '0.86rem' }}>
                      <Calculator size={16} className="text-brand" />
                      Attendance Improvement Tracker
                    </div>
                    <span className="code-chip" style={{ fontSize: '0.72rem' }}>
                      Target: {targetT}% Eligibility
                    </span>
                  </div>

                  {totalS === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      No sessions recorded yet. Attendance eligibility calculations activate upon first session attendance.
                    </p>
                  ) : curP < targetT ? (
                    <div>
                      <div className="status-shortage-banner" style={{ margin: '0.4rem 0', padding: '0.55rem 0.85rem', fontSize: '0.82rem' }}>
                        <AlertTriangle size={16} />
                        <span>
                          Action Required: Student must attend the next <strong>{needed} consecutive {needed === 1 ? 'class' : 'classes'}</strong> as Present to reach the {targetT}% threshold.
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                        Mathematical Formula: <code>⌈({targetT} × {totalS} - 100 × {presentS}) / (100 - {targetT})⌉ = {needed} sessions</code>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="status-good-banner" style={{ margin: '0.4rem 0', padding: '0.55rem 0.85rem', fontSize: '0.82rem' }}>
                        <ShieldCheck size={16} className="text-present" />
                        <span>
                          Eligibility Safe: Student is currently above the {targetT}% requirement ({curP}%). Can miss up to <strong>{safeAbsences} {safeAbsences === 1 ? 'class' : 'classes'}</strong> while remaining eligible.
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                        Buffer Formula: <code>⌊(100 × {presentS} - {targetT} × {totalS}) / {targetT}⌋ = {safeAbsences} allowed absences</code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Subject-Wise Attendance Breakdown */}
            <div className="profile-subjects-section" style={{ margin: '1rem 0' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={15} className="text-brand" />
                Subject-Wise Attendance Breakdown
              </h4>
              <div className="profile-subjects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {[
                  { name: 'React JS & Web Technologies', short: 'React JS' },
                  { name: 'Data Structures & Algorithms (DSA)', short: 'DSA' },
                  { name: 'Database Management Systems (DBMS)', short: 'DBMS' },
                  { name: 'Engineering Mathematics II', short: 'Mathematics' },
                ].map((sub) => {
                  const subRecords = viewingProfileStudent.records.filter(
                    (r) =>
                      (r.sessionName && r.sessionName.toLowerCase().includes(sub.short.toLowerCase())) ||
                      (sessions.find((s) => s.id === r.sessionId && s.subject === sub.name))
                  );
                  const subTot = subRecords.length;
                  const subPres = subRecords.filter((r) => r.status === 'Present').length;
                  const subP = subTot > 0 ? Math.round((subPres / subTot) * 100) : 0;

                  return (
                    <div key={sub.short} style={{ padding: '0.55rem 0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600 }}>{sub.short}</span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: subTot === 0 ? 'var(--color-text-muted)' : subP >= threshold ? 'var(--color-present)' : 'var(--color-absent)' }}>
                          {subTot > 0 ? `${subP}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="pct-bar-bg" style={{ height: '4px' }}>
                        <div
                          className={`pct-bar-fill ${subP >= threshold ? 'pct-bar-fill--green' : 'pct-bar-fill--red'}`}
                          style={{ width: `${subTot > 0 ? subP : 0}%` }}
                        />
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', display: 'block' }}>
                        {subTot > 0 ? `${subPres}/${subTot} lectures attended` : 'No sessions recorded'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance History */}
            <div className="profile-history">
              <h4 className="profile-history__title">Session Attendance History</h4>
              {viewingProfileStudent.records.length === 0 ? (
                <p className="empty-state__text" style={{ padding: '1rem 0' }}>
                  No individual attendance logs found for this student.
                </p>
              ) : (
                <div className="profile-history__list">
                  {viewingProfileStudent.records.map((rec) => {
                    const dateText = rec.recordedAt
                      ? new Date(rec.recordedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Session Date';
                    const timeText = rec.recordedAt
                      ? new Date(rec.recordedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';

                    return (
                      <div key={rec.id} className="profile-history__item">
                        <div>
                          <div style={{ fontWeight: 650, fontSize: '0.85rem' }}>
                            {rec.sessionName || 'Classroom Lecture'}
                          </div>
                          <div className="profile-history__date" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            {dateText} {timeText && `· ${timeText}`}
                          </div>
                        </div>
                        <span className={`status-badge status-badge--${rec.status.toLowerCase()}`}>
                          <span className="status-badge__dot" aria-hidden="true" />
                          {rec.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-card__actions" style={{ marginTop: '1.2rem' }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  onMarkStudent(viewingProfileStudent);
                  setViewingProfileStudent(null);
                }}
              >
                Mark Attendance for {viewingProfileStudent.name}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setViewingProfileStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Student Import Modal */}
      {isImportModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsImportModalOpen(false)}>
          <div
            className="modal-card modal-card--lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="csv-import-title"
          >
            <div className="modal-card__header">
              <div>
                <h3 className="modal-card__title" id="csv-import-title">Import Students via CSV</h3>
                <p className="modal-card__subtitle">
                  Bulk import enrolled students from standard comma-separated text or CSV file.
                </p>
              </div>
              <button
                type="button"
                className="modal-card__close"
                onClick={() => setIsImportModalOpen(false)}
                aria-label="Close import dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-card__body">
              <div className="format-guide" style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                color: 'var(--color-text-soft)'
              }}>
                <div style={{ fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                  Required CSV Format:
                </div>
                <code>Name, Roll Number, Section (optional)</code>
                <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Example: <code>Aarav Sharma, 24CSE001, B.Tech CSE</code>
                </div>
              </div>

              <div className="field" style={{ marginBottom: '1rem' }}>
                <label className="field__label" htmlFor="csv-file-input">
                  Upload CSV File
                </label>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv,text/plain"
                  className="field__input"
                  onChange={handleFileUpload}
                  style={{ padding: '0.45rem' }}
                />
              </div>

              <div className="field" style={{ marginBottom: '1rem' }}>
                <label className="field__label" htmlFor="csv-text-input">
                  Or Paste CSV Data
                </label>
                <textarea
                  id="csv-text-input"
                  className="field__input"
                  rows={4}
                  placeholder="Aarav Sharma, 24CSE001&#10;Ananya Patel, 24CSE007&#10;Vihaan Joshi, 24CSE051"
                  value={importCsvText}
                  onChange={(e) => handleParseCsv(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
              </div>

              {importError && (
                <div className="field__error" style={{ marginBottom: '1rem' }}>
                  <AlertTriangle size={14} />
                  <span>{importError}</span>
                </div>
              )}

              {importParsedList.length > 0 && (
                <div className="csv-preview" style={{ marginTop: '0.8rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    fontSize: '0.84rem'
                  }}>
                    <strong>Import Preview ({importParsedList.length} rows recognized)</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {importParsedList.filter((s) => !s.isDuplicate).length} Ready to Import ·{' '}
                      {importParsedList.filter((s) => s.isDuplicate).length} Duplicates
                    </span>
                  </div>

                  <div style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                          <th style={{ padding: '0.5rem 0.75rem' }}>Name</th>
                          <th style={{ padding: '0.5rem 0.75rem' }}>Roll Number</th>
                          <th style={{ padding: '0.5rem 0.75rem' }}>Section</th>
                          <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importParsedList.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '0.45rem 0.75rem', fontWeight: '600' }}>{item.name}</td>
                            <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.rollNumber}</td>
                            <td style={{ padding: '0.45rem 0.75rem' }}>{item.className}</td>
                            <td style={{ padding: '0.45rem 0.75rem' }}>
                              {item.isDuplicate ? (
                                <span className="status-badge status-badge--absent" style={{ fontSize: '0.72rem' }}>
                                  Duplicate Roll
                                </span>
                              ) : (
                                <span className="status-badge status-badge--present" style={{ fontSize: '0.72rem' }}>
                                  Ready
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="modal-card__actions" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleConfirmImport}
                  disabled={importParsedList.filter((s) => !s.isDuplicate).length === 0}
                >
                  Confirm & Import ({importParsedList.filter((s) => !s.isDuplicate).length}) Students
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDirectory;

