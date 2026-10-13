import React, { useState } from 'react';
import {
  GraduationCap, Bookmark, ShieldAlert, Calendar, CheckCircle2,
  Lock, BookOpen, Trash2, Plus, Sparkles, AlertCircle, Info, Search
} from 'lucide-react';
import { decodeUniversityId } from '../utils/universityIdDecoder';

export default function FacultyDesk({
  currentUser,
  books = [],
  facultyReserves = [],
  onAddFacultyReserve,
  onRemoveFacultyReserve,
  onSelectBook
}) {
  const decoded = currentUser?._decoded || decodeUniversityId(currentUser?.memberId || '');
  const professorName = currentUser?.firstName && currentUser.firstName !== 'University'
    ? `Prof. ${currentUser.firstName} ${currentUser.lastName}`
    : `Prof. (${decoded.designation || 'Faculty Member'})`;

  // Form state
  const [selectedBookId, setSelectedBookId] = useState('');
  const [courseCode, setCourseCode] = useState('CS301');
  const [courseTitle, setCourseTitle] = useState('Data Structures & Algorithms');
  const [examLabel, setExamLabel] = useState('Mid-Sem Prep 2026');
  const [expiryDate, setExpiryDate] = useState('2026-11-20');
  const [restrictedReadingOnly, setRestrictedReadingOnly] = useState(true);
  const [recommendationNote, setRecommendationNote] = useState('Mandatory reference chapters 5, 8, & 12 for final examination prep.');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      alert('Please select a textbook from the catalog to tag.');
      return;
    }

    const targetBook = books.find((b) => String(b._id || b.id) === String(selectedBookId));
    if (!targetBook) return;

    const newReserve = {
      id: `fres_${Date.now()}`,
      bookId: targetBook._id || targetBook.id,
      bookTitle: targetBook.title,
      author: targetBook.author,
      professorId: currentUser.memberId,
      professorName: professorName,
      professorDesignation: decoded.designation || 'Professor',
      courseCode,
      courseTitle,
      examLabel,
      expiryDate,
      restrictedReadingOnly,
      recommendationNote,
      createdAt: new Date().toISOString()
    };

    if (onAddFacultyReserve) {
      onAddFacultyReserve(newReserve);
    }

    setFeedbackMsg(`"${targetBook.title}" successfully tagged as Course Reserve!`);
    setTimeout(() => setFeedbackMsg(null), 4000);

    // Reset some fields
    setSelectedBookId('');
  };

  const filteredCatalog = books.filter((b) =>
    b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Faculty Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-3">
              <GraduationCap size={15} />
              <span>Faculty Academic Reserve Command</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Professor's Course Reserves & Exam Desk
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              Welcome, <strong className="text-white">{professorName}</strong>.
              Tag essential textbooks as mandatory course references for mid-semesters and finals.
              Enforce "In-Library Reference Reading Only" lockouts to ensure high-demand copies remain accessible.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 text-xs shrink-0">
            <div className="text-slate-400">Faculty Seniority</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">{decoded.seniority || 'Faculty Level'}</div>
            <div className="text-slate-500 font-mono mt-1">ID: {currentUser.memberId}</div>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Grid: Tag Form + Active Reserves List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tag a Book Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-800">
            <Plus size={18} className="text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Tag New Course Reference
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Book Picker with filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Select Textbook from Catalog *
              </label>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Filter textbooks..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose a textbook to reserve --</option>
                {filteredCatalog.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.title} ({b.category}) - {b.availableCopies} available
                  </option>
                ))}
              </select>
            </div>

            {/* Course Code & Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Course Code</label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. CS301"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Exam Event</label>
                <input
                  type="text"
                  value={examLabel}
                  onChange={(e) => setExamLabel(e.target.value)}
                  placeholder="e.g. Mid-Sem Prep"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Course Title</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Operating Systems Principles"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Course Reserve Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* In-Library Reference Restriction Toggle */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restrictedReadingOnly}
                  onChange={(e) => setRestrictedReadingOnly(e.target.checked)}
                  className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock size={13} className="text-amber-400" />
                    <span>Restricted: Reference Reading Only</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    If checked, books cannot be checked out or taken off-campus during the exam period. Students can only consult physical copies inside the library.
                  </div>
                </div>
              </label>
            </div>

            {/* Recommendation Note */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Faculty Note for Students
              </label>
              <textarea
                rows={2}
                value={recommendationNote}
                onChange={(e) => setRecommendationNote(e.target.value)}
                placeholder="e.g. Chapters 3 and 7 are primary sources for Question 4..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              Tag as Official Course Reference
            </button>
          </form>
        </div>

        {/* Right Column: Active Course Reserves */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Active Faculty Reserves ({facultyReserves.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Visible to all enrolled students
              </span>
            </div>

            {facultyReserves.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-sm">
                No active faculty reserves currently registered. Tag a textbook using the form on the left!
              </div>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {facultyReserves.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-slate-700 transition"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 mr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          ⭐ {res.examLabel || 'Course Reference'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {res.courseCode}: {res.courseTitle}
                        </span>
                        {res.restrictedReadingOnly && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Lock size={10} /> Reading Room Only
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">
                        {res.bookTitle}
                      </h4>
                      <div className="text-xs text-slate-400">
                        by {res.author} • Recommended by <strong className="text-emerald-400">{res.professorName}</strong>
                      </div>

                      {res.recommendationNote && (
                        <p className="text-[11px] text-slate-400 italic bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          "{res.recommendationNote}"
                        </p>
                      )}

                      <div className="text-[10px] text-slate-500 flex items-center gap-3">
                        <span>Expires: {res.expiryDate}</span>
                        <span>•</span>
                        <span>Added: {new Date(res.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const bk = books.find((b) => (b._id || b.id) === res.bookId);
                          if (bk && onSelectBook) onSelectBook(bk);
                        }}
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        Inspect
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveFacultyReserve && onRemoveFacultyReserve(res.id)}
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer flex items-center gap-1"
                        title="Remove Course Reserve Tag"
                      >
                        <Trash2 size={13} />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-2">
            <Info size={14} className="text-emerald-400 shrink-0" />
            <span>Students searching the catalog will see golden recommendation badges with your name and exam instructions.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
