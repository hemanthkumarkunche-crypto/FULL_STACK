/**
 * universityIdDecoder.js
 * Pure JS utility — decodes University Member IDs into structured identity
 * objects that drive the Navbar profile card and Digital Library Pass.
 *
 * Supported Formats
 * ─────────────────
 * A. Student ID  →  10-digit string  `YY000BXXXX`
 *    • YY  (idx 0-1) : Admission year suffix  e.g. "25" → 2025
 *    • B   (idx 5)   : Branch/department code digit
 *      1=IOT | 2=Civil | 3=CSE | 4=ECE | 6=EEE | 8=AI&DS | 9=CS&IT
 *    • Year prefix must be 23–27 to be treated as a student.
 *
 * B. Faculty ID  →  Pure numeric string/number 1–15000
 *    •     1 –  2999 : Senior Professor / Dean
 *    •  3000 –  8000 : Associate Professor
 *    •  8001 – 12000 : Assistant Professor
 *    • 12001 – 15000 : Junior Faculty / Fresher
 *
 * C. Admin / Demo accounts (LIB-ADM-*, LIB-STF-*, LIB-MEM-*, email addresses)
 *    → Returned with role ADMIN / LIBRARIAN / MEMBER depending on prefix.
 *
 * Returns a decoded object — see JSDoc below.
 */

// ─── Branch Codes ─────────────────────────────────────────────────────────────
const BRANCH_CODES = {
  '1': { short: 'IOT',   full: 'Internet of Things' },
  '2': { short: 'Civil', full: 'Civil Engineering' },
  '3': { short: 'CSE',   full: 'Computer Science & Engineering' },
  '4': { short: 'ECE',   full: 'Electronics & Communication Engineering' },
  '6': { short: 'EEE',   full: 'Electrical & Electronics Engineering' },
  '8': { short: 'AI&DS', full: 'Artificial Intelligence & Data Science' },
  '9': { short: 'CS&IT', full: 'Computer Science & Information Technology' },
};

// ─── Faculty Designation Resolver ─────────────────────────────────────────────
function resolveFacultyDesignation(numericId) {
  const n = Number(numericId);
  if (n < 3000)  return { designation: 'Senior Professor / Dean', seniority: 'Dean-level / Senior' };
  if (n <= 8000) return { designation: 'Associate Professor',     seniority: 'Experienced' };
  if (n <= 12000) return { designation: 'Assistant Professor',    seniority: 'Mid-career' };
  /* n <= 15000 */ return { designation: 'Junior Faculty / Fresher', seniority: 'Entry-level' };
}

// ─── Main Decoder ──────────────────────────────────────────────────────────────
/**
 * @param {string|number} idString - Raw university ID to decode.
 * @returns {{
 *   idType: 'STUDENT'|'FACULTY'|'ADMIN'|'LIBRARIAN'|'MEMBER'|'UNKNOWN',
 *   branch: string|null,
 *   branchFull: string|null,
 *   admissionYear: number|null,
 *   designation: string|null,
 *   seniority: string|null,
 *   avatarLetter: string,
 *   line1: string,
 *   line2: string,
 *   passTitle: string,
 *   borrowQuota: number,
 * }}
 */
export function decodeUniversityId(idString) {
  const id = String(idString ?? '').trim();

  if (!id) return _unknown(id);

  // ── A. Admin / Demo library accounts ──────────────────────────────────────
  if (/^LIB-ADM/i.test(id) || /admin@library/i.test(id)) {
    return {
      idType: 'ADMIN',
      branch: null, branchFull: null, admissionYear: null,
      designation: 'System Administrator', seniority: null,
      avatarLetter: 'A',
      line1: 'Admin • Library System',
      line2: `ID: ${id}`,
      passTitle: 'Library Administrator',
      borrowQuota: 15,
    };
  }

  if (/^LIB-STF/i.test(id) || /librarian@library/i.test(id)) {
    return {
      idType: 'LIBRARIAN',
      branch: null, branchFull: null, admissionYear: null,
      designation: 'Librarian', seniority: null,
      avatarLetter: 'L',
      line1: 'Librarian • Circulation Desk',
      line2: `ID: ${id}`,
      passTitle: 'Librarian - Circulation Staff',
      borrowQuota: 10,
    };
  }

  if (/^LIB-MEM/i.test(id) || /member@library/i.test(id)) {
    return {
      idType: 'MEMBER',
      branch: null, branchFull: null, admissionYear: null,
      designation: 'Library Member', seniority: null,
      avatarLetter: 'M',
      line1: 'Member • General Access',
      line2: `ID: ${id}`,
      passTitle: 'Library Member',
      borrowQuota: 5,
    };
  }

  // ── B. Student ID — 10-digit, starts with 23–27 ───────────────────────────
  // Pattern: YY (2 digits) + 000 (3 digits) + B (1 branch digit) + XXXX (4 digits)
  const studentMatch = /^(2[3-7])(\d{3})(\d)(\d{4})$/.exec(id);
  if (studentMatch) {
    const yearSuffix    = studentMatch[1];                 // e.g. "25"
    const branchDigit   = studentMatch[3];                 // 6th character (index 5)
    const admissionYear = 2000 + Number(yearSuffix);       // e.g. 2025

    const branchInfo  = BRANCH_CODES[branchDigit] ?? null;
    const branchShort = branchInfo?.short ?? `Dept-${branchDigit}`;
    const branchFull  = branchInfo?.full  ?? 'Unknown Department';

    return {
      idType: 'STUDENT',
      branch: branchShort,
      branchFull,
      admissionYear,
      designation: null,
      seniority: null,
      avatarLetter: 'S',
      line1: `Student • ${branchShort}`,
      line2: `ID: ${id} • ${admissionYear}`,
      passTitle: `Student - ${branchFull} (Batch ${admissionYear})`,
      borrowQuota: 5,
    };
  }

  // ── C. Faculty ID — pure numeric 1–15000 ──────────────────────────────────
  if (/^\d{1,5}$/.test(id)) {
    const numId = Number(id);
    if (numId >= 1 && numId <= 15000) {
      const { designation, seniority } = resolveFacultyDesignation(numId);
      return {
        idType: 'FACULTY',
        branch: null,
        branchFull: null,
        admissionYear: null,
        designation,
        seniority,
        avatarLetter: 'F',
        line1: `Faculty • ${designation}`,
        line2: `ID: ${id}`,
        passTitle: `Faculty - ${designation}`,
        borrowQuota: 10,
      };
    }
  }

  // ── D. Fallback ────────────────────────────────────────────────────────────
  return _unknown(id);
}

function _unknown(id) {
  return {
    idType: 'UNKNOWN',
    branch: null, branchFull: null, admissionYear: null,
    designation: null, seniority: null,
    avatarLetter: 'U',
    line1: 'University Member',
    line2: id ? `ID: ${id}` : '',
    passTitle: 'University Member',
    borrowQuota: 5,
  };
}

/**
 * Enriches an existing user session object with decoded ID fields.
 * Non-destructive — existing server-provided fields are preserved;
 * the decoded profile is attached as `user._decoded` for the UI to consume.
 *
 * @param {object} user - Raw user object (from API or local session).
 * @returns {object} Enriched user object.
 */
export function enrichUserWithDecodedId(user) {
  if (!user) return user;
  const decoded = decodeUniversityId(user.memberId ?? user._id ?? '');

  return {
    ...user,
    // Full decoded profile — available to all consumers
    _decoded: decoded,
    // Apply quota from decoder only when the API didn't provide one
    borrowQuota: user.borrowQuota ?? decoded.borrowQuota,
    // Persist idType as role if not already set by the backend
    role: user.role || decoded.idType,
  };
}

