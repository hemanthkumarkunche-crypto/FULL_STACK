/**
 * curriculumData.js
 * University Semester & Branch Syllabus Auto-Matcher Engine
 */

export const BRANCH_META = {
  CSE:   { name: 'Computer Science & Engineering', code: 'CSE', icon: '💻', defaultAisle: 'A' },
  ECE:   { name: 'Electronics & Communication Engineering', code: 'ECE', icon: '⚡', defaultAisle: 'E' },
  'AI&DS': { name: 'Artificial Intelligence & Data Science', code: 'AI&DS', icon: '🤖', defaultAisle: 'A' },
  'CS&IT': { name: 'Computer Science & Information Technology', code: 'CS&IT', icon: '🌐', defaultAisle: 'A' },
  EEE:   { name: 'Electrical & Electronics Engineering', code: 'EEE', icon: '🔌', defaultAisle: 'E' },
  IOT:   { name: 'Internet of Things Engineering', code: 'IOT', icon: '📡', defaultAisle: 'B' },
  Civil: { name: 'Civil Engineering', code: 'Civil', icon: '🏛️', defaultAisle: 'M' }
};

/**
 * Calculates current ongoing semester from admission year.
 * Reference baseline: Academic Year 2026–2027 (Current month is October 2026, which is Odd/Fall Semester):
 * - 2026 admission -> Year 1 -> Semester 1
 * - 2025 admission -> Year 2 -> Semester 3
 * - 2024 admission -> Year 3 -> Semester 5
 * - 2023 admission -> Year 4 -> Semester 7
 */
export function calculateSemesterFromAdmissionYear(admissionYear) {
  if (!admissionYear) return 3; // default 2nd year semester 3
  const currentAcademicYear = 2026;
  const yearDiff = currentAcademicYear - Number(admissionYear);

  if (yearDiff <= 0) return 1;       // 1st year (Semester 1)
  if (yearDiff === 1) return 3;      // 2nd year (Semester 3)
  if (yearDiff === 2) return 5;      // 3rd year (Semester 5)
  if (yearDiff >= 3) return 7;       // 4th year (Semester 7)
  return 3;
}

export function getSemesterOrdinal(semNumber) {
  const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  return ordinals[semNumber - 1] || `${semNumber}th`;
}

export function getAcademicYearLabel(semNumber) {
  if (semNumber <= 2) return '1st Year (Freshman)';
  if (semNumber <= 4) return '2nd Year (Sophomore)';
  if (semNumber <= 6) return '3rd Year (Junior)';
  return '4th Year (Senior)';
}

/**
 * Finds core textbooks prescribed for a specific branch & semester.
 */
export function getPrescribedTextbooks(books = [], branch = 'CSE', semester = 3) {
  const normalizedBranch = String(branch || 'CSE').trim();
  const semNum = Number(semester || 3);

  return books.filter((book) => {
    if (!book.curriculum || !Array.isArray(book.curriculum)) return false;
    return book.curriculum.some((curr) => {
      const matchBranch = curr.branch?.toUpperCase() === normalizedBranch.toUpperCase();
      const matchSem = Number(curr.semester) === semNum;
      return matchBranch && matchSem;
    });
  }).map((book) => {
    // Attach matching curriculum item for quick reference
    const matchedCurriculum = book.curriculum.find(
      (c) => c.branch?.toUpperCase() === normalizedBranch.toUpperCase() && Number(c.semester) === semNum
    );
    return {
      ...book,
      matchedCourse: matchedCurriculum
    };
  });
}
