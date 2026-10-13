import React, { useState } from 'react';
import {
  GraduationCap, BookMarked, Sparkles, CheckCircle2, ArrowRight,
  Bookmark, BookOpen, Layers, Check, AlertCircle, ShoppingBag
} from 'lucide-react';
import {
  BRANCH_META, calculateSemesterFromAdmissionYear, getSemesterOrdinal,
  getAcademicYearLabel, getPrescribedTextbooks
} from '../data/curriculumData';
import { decodeUniversityId } from '../utils/universityIdDecoder';

export default function SemesterSyllabusMatcher({
  currentUser,
  books = [],
  myLoans = [],
  onSelectBook,
  onQuickBorrow,
  onQuickReserve,
  onBatchReserveBundle,
  onOpenFloorMap
}) {
  const decoded = currentUser?._decoded || decodeUniversityId(currentUser?.memberId || '');

  // Default to student's decoded branch and calculated ongoing semester
  const defaultBranch = decoded.branch || 'CSE';
  const defaultAdmissionYear = decoded.admissionYear || 2025;
  const calculatedOngoingSemester = calculateSemesterFromAdmissionYear(defaultAdmissionYear);

  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const [selectedSemester, setSelectedSemester] = useState(calculatedOngoingSemester);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [bundleSuccess, setBundleSuccess] = useState(null);

  // Retrieve prescribed core textbooks matching current branch & semester
  const prescribedBooks = getPrescribedTextbooks(books, selectedBranch, selectedSemester);

  const totalPrescribed = prescribedBooks.length;
  const availableCount = prescribedBooks.filter((b) => (b.availableCopies ?? 0) > 0 && b.status !== 'RESERVED OUT').length;
  const alreadyBorrowedCount = prescribedBooks.filter((b) =>
    myLoans.some((l) => (l.book?._id || l.bookId || l._id || l.id) === (b._id || b.id) || l.book?.title === b.title)
  ).length;

  const handleBundleClick = async () => {
    if (prescribedBooks.length === 0) return;
    setBundleLoading(true);
    try {
      if (onBatchReserveBundle) {
        await onBatchReserveBundle(prescribedBooks);
      }
      setBundleSuccess(`Bundle requested! ${prescribedBooks.length} core textbooks queued/checked out.`);
      setTimeout(() => setBundleSuccess(null), 5000);
    } catch (e) {
      alert('Error processing bundle: ' + e.message);
    } finally {
      setBundleLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-indigo-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-3">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Smart Curriculum Auto-Matcher Engine</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>My Semester Prescribed Textbooks</span>
          </h2>

          <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Auto-resolved for <strong className="text-white">{decoded.line1 || 'Student'}</strong> (
            Batch of {defaultAdmissionYear} • Ongoing: <span className="text-cyan-300 font-bold">{getSemesterOrdinal(selectedSemester)} Sem, {getAcademicYearLabel(selectedSemester)}</span>).
            Surfacing verified syllabus textbooks for upcoming mid-term examinations.
          </p>
        </div>

        {/* Branch & Semester Selector Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 shrink-0">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500"
            >
              {Object.keys(BRANCH_META).map((bKey) => (
                <option key={bKey} value={bKey}>
                  {BRANCH_META[bKey].icon} {bKey}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s} ({getSemesterOrdinal(s)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Curriculum Summary & "One-Click Reserve Bundle" CTA */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 border border-indigo-500/20 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">
              Department: <strong className="text-white">{BRANCH_META[selectedBranch]?.name || selectedBranch}</strong>
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="text-slate-300">
            Core Textbooks: <strong className="text-white">{totalPrescribed} Books</strong>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="text-slate-300">
            Available on Physical Shelf: <strong className="text-emerald-400 font-bold">{availableCount} Copies</strong>
          </div>
        </div>

        {/* Action Button: One-Click Reserve Bundle */}
        <div className="flex items-center gap-3">
          {bundleSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 size={15} /> {bundleSuccess}
            </span>
          )}

          <button
            type="button"
            id="one-click-reserve-bundle-btn"
            onClick={handleBundleClick}
            disabled={bundleLoading || totalPrescribed === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-600 hover:from-indigo-600 hover:to-cyan-500 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 cursor-pointer"
          >
            <ShoppingBag size={16} />
            <span>{bundleLoading ? 'Processing Bundle...' : `One-Click Reserve Bundle (${totalPrescribed} Books)`}</span>
          </button>
        </div>
      </div>

      {/* Grid of Matched Prescribed Textbooks */}
      {prescribedBooks.length === 0 ? (
        <div className="relative z-10 text-center py-10 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-400 text-sm">
          No core textbooks registered for {selectedBranch} Semester {selectedSemester} yet.
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescribedBooks.map((book) => {
            const isAvailable = (book.availableCopies ?? 0) > 0 && book.status !== 'RESERVED OUT';
            const isBorrowed = myLoans.some((l) =>
              (l.book?._id || l.bookId || l._id || l.id) === (book._id || book.id) || l.book?.title === book.title
            );

            return (
              <div
                key={book._id || book.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 group shadow-lg"
              >
                <div>
                  {/* Course Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {book.matchedCourse?.courseCode || 'CORE'}: {book.matchedCourse?.courseTitle || book.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isBorrowed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isAvailable
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}>
                      {isBorrowed ? 'ACTIVE ON LOAN' : isAvailable ? `${book.availableCopies} on shelf` : 'Waitlist Hold'}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <h4
                    onClick={() => onSelectBook && onSelectBook(book)}
                    className="text-sm font-bold text-white group-hover:text-indigo-200 transition cursor-pointer line-clamp-1"
                    title={book.title}
                  >
                    {book.title}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {book.author}
                  </div>

                  {/* Physical Shelf Pin & Navigator Trigger */}
                  <div className="flex items-center justify-between mt-3 py-1.5 px-2 bg-slate-950/80 rounded-lg text-[11px] text-slate-300 border border-slate-800/80">
                    <span className="truncate">{book.location || 'Aisle A-1 • Rack R-01'}</span>
                    <button
                      type="button"
                      onClick={() => onOpenFloorMap && onOpenFloorMap(book)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-[10px] shrink-0 ml-1 cursor-pointer"
                    >
                      Find Shelf 📍
                    </button>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectBook && onSelectBook(book)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    Details
                  </button>

                  {isBorrowed ? (
                    <span className="text-xs text-emerald-400 font-bold px-2 py-1 flex items-center gap-1">
                      <Check size={14} /> In Your Bag
                    </span>
                  ) : isAvailable ? (
                    <button
                      type="button"
                      onClick={() => onQuickBorrow && onQuickBorrow(book._id || book.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
                    >
                      Borrow
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onQuickReserve && onQuickReserve(book._id || book.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                    >
                      Reserve Hold
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
