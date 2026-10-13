import React, { useEffect } from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  AlertCircle,
  CreditCard,
  Lock
} from 'lucide-react';
import { decodeUniversityId } from '../utils/universityIdDecoder';

export default function DigitalLibraryPass({
  isOpen,
  currentUser,
  onClose,
  loans = [],
  onReturnBook,
  karmaProfile,
  onOpenKarmaLedger,
  onOpenMembershipModal
}) {
  // Listen for Escape key press to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Hide modal if isOpen is false or user is missing
  if (!isOpen || !currentUser) return null;

  // ── Resolve decoded identity ───────────────────────────────────────────
  const decoded = currentUser._decoded ?? decodeUniversityId(currentUser.memberId ?? '');

  const isFaculty = decoded.idType === 'FACULTY' || (Number(currentUser.memberId) > 0 && Number(currentUser.memberId) <= 15000) || currentUser.role === 'FACULTY';
  // Faculty is automatically active 100% complimentary
  const isMembershipActive = isFaculty || Boolean(currentUser.isMembershipActive);

  const borrowedCount = loans.length;
  // Authoritative borrow quota: 10 for Faculty, 5 for Student (unless overridden)
  const borrowQuota = isFaculty ? (currentUser.borrowQuota ?? 10) : (decoded.borrowQuota ?? currentUser.borrowQuota ?? 5);

  // Role badge styles
  const badgeStyles = {
    STUDENT:   { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', icon: GraduationCap },
    FACULTY:   { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Briefcase },
    ADMIN:     { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: ShieldCheck },
    LIBRARIAN: { bg: 'bg-violet-500/20 text-violet-300 border-violet-500/40', icon: ShieldCheck },
    MEMBER:    { bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40', icon: BookOpen },
    UNKNOWN:   { bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: BookOpen },
  };
  const badge = badgeStyles[decoded.idType] ?? badgeStyles.UNKNOWN;
  const BadgeIcon = badge.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {isFaculty ? 'KL University Faculty Digital Pass' : 'KL University Student Library Pass'}
            </h3>
          </div>
          <button
            type="button"
            id="close-digital-pass-btn"
            onClick={onClose}
            aria-label="Close Digital Library Pass"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pass Card Container */}
        <div className="p-6 flex flex-col items-center">
          <div className={`w-full bg-gradient-to-br ${
            isFaculty ? 'from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/30' : 'from-indigo-950 via-slate-900 to-indigo-900 border-indigo-500/30'
          } border rounded-2xl p-5 shadow-2xl relative overflow-hidden`}>
            {/* Pass Card Header — name, decoded role, ID */}
            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0 flex-1 mr-3">
                <div className={`text-[10px] ${isFaculty ? 'text-emerald-300' : 'text-indigo-300'} uppercase tracking-widest font-bold`}>
                  {isFaculty ? 'KL UNIVERSITY FACULTY LIBRARY PASS' : 'KL UNIVERSITY STUDENT LIBRARY CARD'}
                </div>
                <div className="text-lg font-extrabold text-white mt-0.5 leading-tight">
                  {currentUser.firstName !== 'University' && currentUser.firstName !== 'Faculty'
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : decoded.passTitle.split('(')[0].trim()}
                </div>
                {/* Decoded role badge */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold border rounded-full ${badge.bg}`}>
                    <BadgeIcon size={10} />
                    <span>{decoded.passTitle}</span>
                  </div>

                  {/* Role-Specific Membership Badge */}
                  {isFaculty ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                      <CheckCircle2 size={10} className="text-emerald-400" />
                      <span>Active (Faculty Complimentary)</span>
                    </div>
                  ) : isMembershipActive ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                      <CheckCircle2 size={10} className="text-emerald-400" />
                      <span>Active Scholar</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                      <CreditCard size={10} className="text-amber-400" />
                      <span>Pending ₹50 Activation</span>
                    </div>
                  )}
                </div>

                <div className={`text-xs ${isFaculty ? 'text-emerald-200' : 'text-indigo-200'} font-mono font-semibold mt-1`}>
                  ID: {currentUser.memberId}
                </div>
              </div>

              <div className={`p-2.5 ${isFaculty ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'} border rounded-xl shrink-0`}>
                <BookOpen size={20} />
              </div>
            </div>

            {/* Student Activation Callout Banner if Inactive */}
            {!isFaculty && !isMembershipActive && (
              <div className="mb-4 p-3 bg-amber-500/15 border border-amber-500/35 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-amber-300">₹50 Annual Card Pending</div>
                    <div className="text-[10px] text-amber-200/80">Activate to unlock book checkout</div>
                  </div>
                </div>
                <button
                  type="button"
                  id="pass-modal-activate-btn"
                  onClick={() => {
                    onClose();
                    if (onOpenMembershipModal) onOpenMembershipModal();
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-400 rounded-lg shadow transition cursor-pointer shrink-0"
                >
                  Pay ₹50
                </button>
              </div>
            )}

            {/* Barcode Simulation */}
            <div className={`relative bg-white p-3 rounded-xl flex flex-col items-center mb-4 shadow-md ${!isMembershipActive ? 'opacity-85' : ''}`}>
              <div className="w-full h-11 flex items-stretch justify-center gap-[2px]">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 2, 3, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 4].map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: `${w * 2.2}px`,
                      backgroundColor: idx % 2 === 0 ? '#000000' : 'transparent'
                    }}
                  />
                ))}
              </div>
              <div className="text-black font-mono font-bold text-sm tracking-wider mt-1.5 flex items-center gap-2">
                <span>{currentUser.memberId}</span>
                {isMembershipActive && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-sans font-bold">
                    ✓ VERIFIED {isFaculty ? '(FACULTY)' : ''}
                  </span>
                )}
              </div>

              {!isMembershipActive && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center p-2 text-center">
                  <div className="bg-slate-900 border border-amber-500/50 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                    <Lock size={12} className="text-amber-400" />
                    <span>INACTIVE — ACTIVATE FOR CHECKOUT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Karma & Merit Score Section (for students/members) */}
            {karmaProfile && !isFaculty && (
              <div
                onClick={() => {
                  if (onOpenKarmaLedger) onOpenKarmaLedger();
                }}
                className="mb-3 p-2 bg-slate-950/70 border border-indigo-500/30 hover:border-amber-500/50 rounded-xl flex items-center justify-between cursor-pointer transition group"
                title="Click to view Library Karma History & Merit Ledger"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-500/20 text-amber-300">
                    <Award size={14} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span>Library Karma</span>
                      <span className="text-[9px] text-amber-400 group-hover:underline font-mono">View History →</span>
                    </div>
                    <div className="text-xs font-black text-amber-300 font-mono">
                      {karmaProfile.score} Points • {karmaProfile.tier?.tierName?.split('/')[0]?.trim()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${karmaProfile.tier?.badgeClass}`}>
                    {karmaProfile.tier?.extraSlots ? `+${karmaProfile.tier.extraSlots} Bonus Slot` : 'In Good Standing'}
                  </span>
                </div>
              </div>
            )}

            {/* Status Footer */}
            <div className={`flex justify-between items-center text-xs ${isFaculty ? 'text-emerald-100 border-emerald-500/20' : 'text-indigo-100 border-indigo-500/20'} font-medium pt-1 border-t`}>
              <div>
                STATUS:{' '}
                {isFaculty ? (
                  <strong className="text-emerald-400 font-bold">ACTIVE FACULTY SCHOLAR</strong>
                ) : isMembershipActive ? (
                  <strong className="text-emerald-400 font-bold">ACTIVE SCHOLAR</strong>
                ) : (
                  <strong className="text-amber-400 font-bold">PENDING PAYMENT (₹50)</strong>
                )}
              </div>
              <div>
                HOLDINGS: <strong className="text-white font-bold">{borrowedCount} / {borrowQuota + (karmaProfile?.tier?.extraSlots || 0)} BOOKS</strong>
              </div>
            </div>
          </div>

          {/* Active Borrowed Books Section */}
          {loans.length > 0 && (
            <div className="w-full mt-4 bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Active Loans ({loans.length})</span>
                <span className="text-emerald-400">In Good Standing</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {loans.map((loan) => (
                  <div
                    key={loan._id || loan.id || loan.bookId}
                    className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-200 truncate">
                        {loan.book?.title || loan.title || 'Academic Textbook'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Due: {new Date(loan.dueDate || Date.now() + (isFaculty ? 30 : 14) * 86400000).toLocaleDateString()}
                      </div>
                    </div>
                    {onReturnBook && (
                      <button
                        type="button"
                        onClick={() => onReturnBook(loan.book?._id || loan.bookId || loan._id || loan.id)}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition cursor-pointer"
                      >
                        <RotateCcw size={11} />
                        <span>Return</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-400 text-center leading-relaxed">
            {isFaculty
              ? 'Faculty Institutional Pass: 10 books borrow limit • 30-day loan period • Complimentary access.'
              : isMembershipActive
              ? 'Student Library Card: 5 books borrow limit • 14-day loan period • 2 free online renewals.'
              : 'Please activate your ₹50 annual library membership to issue books.'}
          </p>
        </div>
      </div>
    </div>
  );
}
