import { useState, useEffect, useMemo } from 'react';
import {
  loadVersioned,
  saveVersioned,
  STUDENTS_STORAGE_KEY,
} from '../utils/storage.js';
import { validateStudent } from '../utils/validation.js';
import { computeStudentMetrics } from '../utils/calculations.js';

export const DEFAULT_STUDENTS = [
  { id: 'std_1', name: 'Aarav Sharma', rollNumber: '24CSE001', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_2', name: 'Ananya Patel', rollNumber: '24CSE007', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_3', name: 'Isha Verma', rollNumber: '24CSE014', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_4', name: 'Kabir Mehta', rollNumber: '24CSE019', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_5', name: 'Rohan Gupta', rollNumber: '24CSE027', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_6', name: 'Diya Sen', rollNumber: '24CSE033', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_7', name: 'Tanvi Nair', rollNumber: '24CSE042', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_8', name: 'Vihaan Joshi', rollNumber: '24CSE051', className: 'B.Tech CSE', semester: 'Semester II' },
  { id: 'std_9', name: 'Kavya Reddy', rollNumber: '24CSE058', className: 'B.Tech CSE', semester: 'Semester II' },
];

/**
 * Custom Hook: useStudents
 *
 * Centralizes student roster state, uniqueness enforcement,
 * derived student-wise attendance metrics, and CRUD operations.
 */
export function useStudents({ records = [], threshold = 75, lateRule = 'separate', onToast = () => {} } = {}) {
  const [students, setStudents] = useState(() => {
    return loadVersioned(STUDENTS_STORAGE_KEY, DEFAULT_STUDENTS);
  });

  useEffect(() => {
    saveVersioned(STUDENTS_STORAGE_KEY, students);
  }, [students]);

  // Derived metrics for each enrolled student
  const studentMetrics = useMemo(() => {
    return students.map((student) =>
      computeStudentMetrics(student, records, threshold, lateRule)
    );
  }, [students, records, threshold, lateRule]);

  // Cohort category breakdown
  const eligibleCount = studentMetrics.filter((s) => s.hasRecords && s.isEligible).length;
  const shortageCount = studentMetrics.filter((s) => s.hasRecords && !s.isEligible).length;
  const unrecordedCount = studentMetrics.filter((s) => !s.hasRecords).length;

  const classAverage = useMemo(() => {
    const evaluated = studentMetrics.filter((s) => s.hasRecords);
    if (evaluated.length === 0) return 0;
    const sum = evaluated.reduce((acc, curr) => acc + curr.pct, 0);
    return Math.round(sum / evaluated.length);
  }, [studentMetrics]);

  const handleAddStudent = (studentData) => {
    const validation = validateStudent(studentData, students);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      onToast(firstError, 'error');
      return { success: false, errors: validation.errors };
    }

    const newStudent = {
      id: `std_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: studentData.name.trim(),
      rollNumber: studentData.rollNumber.trim().toUpperCase(),
      className: studentData.className || 'B.Tech CSE',
      semester: studentData.semester || 'Semester II',
    };

    setStudents((prev) => [...prev, newStudent]);
    onToast(`Student "${newStudent.name}" enrolled successfully.`, 'success');
    return { success: true, student: newStudent };
  };

  const handleEditStudent = (updatedStudent) => {
    const validation = validateStudent(updatedStudent, students, updatedStudent.id);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      onToast(firstError, 'error');
      return { success: false, errors: validation.errors };
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s))
    );
    onToast(`Updated student profile for "${updatedStudent.name}".`, 'success');
    return { success: true };
  };

  const handleDeleteStudent = (id) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    onToast(`Removed student "${target ? target.name : id}" from class roster.`, 'info');
  };

  const handleImportRoster = (importedList) => {
    if (!Array.isArray(importedList) || importedList.length === 0) {
      onToast('Import failed: CSV contains no valid student rows.', 'error');
      return false;
    }
    setStudents(importedList);
    onToast(`Imported ${importedList.length} students into roster.`, 'success');
    return true;
  };

  const resetStudents = () => {
    setStudents(DEFAULT_STUDENTS);
    saveVersioned(STUDENTS_STORAGE_KEY, DEFAULT_STUDENTS);
  };

  return {
    students,
    studentMetrics,
    eligibleCount,
    shortageCount,
    unrecordedCount,
    classAverage,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleImportRoster,
    resetStudents,
    setStudents,
  };
}
