import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Wallet,
  BookOpen,
  Calendar,
  Sparkles,
  AlertCircle,
  Lock,
  Loader2,
  FileText,
  Building,
  GraduationCap,
  Award,
  Check
} from 'lucide-react';
import { decodeUniversityId } from '../utils/universityIdDecoder';

export default function MembershipActivationModal({
  isOpen,
  onClose,
  currentUser,
  onActivateMembership,
  initialMessage = ''
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'erp'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isProcessing]);

  if (!isOpen || !currentUser) return null;

  const decoded = currentUser._decoded ?? decodeUniversityId(currentUser.memberId ?? '');
  const isFaculty = decoded.idType === 'FACULTY' || (Number(currentUser.memberId) > 0 && Number(currentUser.memberId) <= 15000) || currentUser.role === 'FACULTY';

  const handlePayAndActivate = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessingStep(1);

    // Step 1: 0.6s
    setTimeout(() => {
      setProcessingStep(2);
    }, 600);

    // Step 2: 1.1s
    setTimeout(() => {
      setProcessingStep(3);
    }, 1100);

    // Step 3: Complete at 1.5s
    setTimeout(() => {
      const paymentDetails = {
        method: paymentMethod === 'upi' ? `UPI (${selectedUpiApp.toUpperCase()})` : 'CAMPUS_ERP_WALLET',
        amount: 50,
        currency: 'INR',
        transactionId: 'TXN-KLU-' + Math.floor(100000 + Math.random() * 900000),
        activatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        session: '2026–2027 Academic Year'
      };

      setIsProcessing(false);
      setProcessingStep(0);
      onActivateMembership(paymentDetails);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        if (!isProcessing) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
              isFaculty
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/20'
                : 'bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-indigo-500/20'
            }`}>
              {isFaculty ? <GraduationCap size={18} className="text-white" /> : <ShieldCheck size={18} className="text-white" />}
            </div>
            <div>
              <h3 id="membership-modal-title" className="text-sm font-bold text-white tracking-wide">
                KL University Central Library
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isFaculty ? 'Faculty Institutional Pass Details' : 'Student Annual Pass Activation'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-membership-modal-btn"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close Membership Modal"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Borrow Interception Notice Banner (only shown if triggered by attempt to borrow for students) */}
          {!isFaculty && initialMessage && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-200">
              <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-amber-300">Checkout Notice: </span>
                {initialMessage}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              FACULTY PASS VIEW (100% FREE - INSTITUTIONAL BENEFIT)
             ═══════════════════════════════════════════════════════════════════ */}
          {isFaculty ? (
            <div className="space-y-5">
              {/* Faculty Card Presentation */}
              <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-5 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 rounded-full uppercase tracking-wider">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                        100% Free • Institutional Benefit
                      </span>
                      <h4 className="text-lg font-extrabold text-white mt-2 leading-tight">
                        KL University Faculty Library Pass
                      </h4>
                      <p className="text-xs text-emerald-200/80 mt-0.5">
                        Active Faculty Scholar (Complimentary Unrestricted Access)
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                        FREE
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Institutional Grant
                      </div>
                    </div>
                  </div>

                  {/* Status Row */}
                  <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-emerald-500/20">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-[11px] text-slate-400 font-medium">Faculty Member:</span>
                      <span className="font-semibold text-white">
                        {currentUser.firstName !== 'University' && currentUser.firstName !== 'Faculty'
                          ? `${currentUser.firstName} ${currentUser.lastName}`
                          : decoded.line1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-bold text-emerald-300 uppercase">
                        Active Faculty Scholar
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Faculty Privileges List */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Award size={14} className="text-emerald-400" />
                    Faculty Privileges Included
                  </h5>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    Unrestricted Access
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0">
                      <BookOpen size={12} />
                    </span>
                    <span>
                      <strong className="text-white font-semibold">10 Book Borrow Limit:</strong> Check out up to 10 physical textbooks and references simultaneously.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-md bg-teal-500/10 text-teal-400 shrink-0">
                      <Calendar size={12} />
                    </span>
                    <span>
                      <strong className="text-white font-semibold">30-Day Borrow Period:</strong> Extended loan cycle tailored for curriculum preparation and syllabus research.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-md bg-cyan-500/10 text-cyan-400 shrink-0">
                      <FileText size={12} />
                    </span>
                    <span>
                      <strong className="text-white font-semibold">IEEE & ScienceDirect Access:</strong> Unlimited digital access to international journals, citation databases & question banks.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-md bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Building size={12} />
                    </span>
                    <span>
                      <strong className="text-white font-semibold">Dedicated Faculty Cubicles:</strong> Exclusive access to private research pods on the 3rd floor Central Library.
                    </span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                  <Check size={14} className="shrink-0 text-emerald-400" />
                  <span>Faculty members never encounter paywalls or checkout fees. Privileges are permanent and complimentary.</span>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════════════
               STUDENT PASS VIEW (₹50 ANNUAL MAINTENANCE FEE)
               ═══════════════════════════════════════════════════════════════════ */
            <div className="space-y-5">
              {/* Student Card Presentation */}
              <div className="relative rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-5 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 rounded-full uppercase tracking-wider">
                        <Sparkles size={11} className="text-indigo-400" />
                        Universal Standard Pass
                      </span>
                      <h4 className="text-lg font-extrabold text-white mt-2 leading-tight">
                        KL University Student Library Card
                      </h4>
                      <p className="text-xs text-indigo-200/80 mt-0.5">
                        Universal Student Pass (All students equal — no gold/silver tiers)
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                        ₹50
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Annual Maintenance Fee
                      </div>
                    </div>
                  </div>

                  {/* Status Row */}
                  <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-indigo-500/20">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-[11px] text-slate-400 font-medium">Student:</span>
                      <span className="font-semibold text-white">
                        {currentUser.firstName !== 'University'
                          ? `${currentUser.firstName} ${currentUser.lastName}`
                          : decoded.line1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${currentUser.isMembershipActive ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                      <span className={`text-[11px] font-bold uppercase ${currentUser.isMembershipActive ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {currentUser.isMembershipActive ? 'Status: Active Scholar' : 'Status: Pending (₹50)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Privileges List */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Student Privileges Upon Activation
                  </h5>
                  <span className="text-[10px] text-indigo-400 font-mono font-semibold">
                    Standard Academic Quota
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0">
                      <BookOpen size={12} />
                    </span>
                    <span>
                      <strong className="text-white font-semibold">5 Book Borrow Limit:</strong> Check out up to 5 course textbooks simultaneously.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-md bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Calendar size={12} />
                    </span>
                    <span>
                      <strong className="text-white font-semibold">14-Day Borrow Period:</strong> Flexible 2-week loan cycle with up to <strong className="text-white font-semibold">2 free online renewals</strong>.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-md bg-cyan-500/10 text-cyan-400 shrink-0">
                      <FileText size={12} />
                    </span>
                    <span>
                      <strong className="text-white font-semibold">Digital Academic Access:</strong> Free digital access to campus research portals, syllabus indices & question banks.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 p-1 rounded-md bg-purple-500/10 text-purple-400 shrink-0">
                      <Building size={12} />
                    </span>
                    <span>
                      <strong className="text-white font-semibold">Study Halls Access:</strong> Full physical access to central library reading halls and study areas.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Payment Methods Simulation */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Payment Method (₹50 Pre-filled)
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Instant UPI QR Code */}
                  <button
                    type="button"
                    id="payment-method-upi-btn"
                    onClick={() => setPaymentMethod('upi')}
                    disabled={isProcessing}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2">
                        <QrCode size={16} className={paymentMethod === 'upi' ? 'text-indigo-400' : 'text-slate-400'} />
                        <span className="text-xs font-bold">Instant UPI QR</span>
                      </div>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'upi' ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`}>
                        {paymentMethod === 'upi' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      PhonePe, GPay, Paytm Simulator
                    </p>
                  </button>

                  {/* Option 2: Campus ERP Student Wallet */}
                  <button
                    type="button"
                    id="payment-method-erp-btn"
                    onClick={() => setPaymentMethod('erp')}
                    disabled={isProcessing}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'erp'
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className={paymentMethod === 'erp' ? 'text-indigo-400' : 'text-slate-400'} />
                        <span className="text-xs font-bold">Campus ERP Wallet</span>
                      </div>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'erp' ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`}>
                        {paymentMethod === 'erp' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Student Fee Ledger Deduction
                    </p>
                  </button>
                </div>

                {/* UPI QR Detailed Simulator */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-300 font-semibold">
                        Instant UPI Payment (PhonePe / GPay / Paytm)
                      </div>
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        ₹50.00
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                      {/* Dynamic QR Code Simulation */}
                      <div className="relative p-2.5 bg-white rounded-xl shadow-lg shrink-0 flex flex-col items-center">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-24 h-24 text-slate-950"
                          fill="currentColor"
                        >
                          {/* Corner markers */}
                          <rect x="5" y="5" width="26" height="26" fill="black" rx="3" />
                          <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                          <rect x="13" y="13" width="10" height="10" fill="black" rx="1" />

                          <rect x="69" y="5" width="26" height="26" fill="black" rx="3" />
                          <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                          <rect x="77" y="13" width="10" height="10" fill="black" rx="1" />

                          <rect x="5" y="69" width="26" height="26" fill="black" rx="3" />
                          <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                          <rect x="13" y="77" width="10" height="10" fill="black" rx="1" />

                          {/* Data dots */}
                          <rect x="36" y="8" width="6" height="6" />
                          <rect x="46" y="8" width="8" height="6" />
                          <rect x="58" y="8" width="6" height="6" />
                          <rect x="36" y="20" width="8" height="8" />
                          <rect x="48" y="20" width="6" height="6" />
                          <rect x="36" y="36" width="6" height="6" />
                          <rect x="46" y="36" width="8" height="6" />
                          <rect x="58" y="36" width="6" height="6" />
                          <rect x="68" y="36" width="8" height="8" />
                          <rect x="80" y="36" width="6" height="6" />
                          <rect x="8" y="44" width="8" height="6" />
                          <rect x="20" y="44" width="6" height="6" />
                          <rect x="36" y="48" width="8" height="8" />
                          <rect x="48" y="48" width="6" height="6" />
                          <rect x="58" y="48" width="8" height="8" />
                          <rect x="70" y="48" width="6" height="6" />
                          <rect x="82" y="48" width="6" height="6" />
                          <rect x="36" y="68" width="6" height="6" />
                          <rect x="46" y="68" width="8" height="8" />
                          <rect x="58" y="68" width="6" height="6" />
                          <rect x="68" y="68" width="8" height="6" />
                          <rect x="80" y="68" width="6" height="6" />
                          <rect x="36" y="80" width="8" height="6" />
                          <rect x="48" y="80" width="6" height="6" />
                          <rect x="58" y="80" width="8" height="8" />
                          <rect x="70" y="80" width="6" height="6" />
                          <rect x="82" y="80" width="8" height="6" />
                        </svg>

                        {/* ₹50 Badge in center */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="px-1.5 py-0.5 bg-indigo-600 text-[9px] font-black text-white rounded shadow border border-white">
                            ₹50
                          </div>
                        </div>
                      </div>

                      {/* App Selection & Details */}
                      <div className="space-y-2 flex-1 text-xs">
                        <div className="text-slate-400">
                          Pre-filled ₹50 UPI intent simulator:
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: 'gpay', label: 'Google Pay', color: 'hover:border-blue-400' },
                            { id: 'phonepe', label: 'PhonePe', color: 'hover:border-purple-400' },
                            { id: 'paytm', label: 'Paytm', color: 'hover:border-sky-400' },
                            { id: 'bhim', label: 'BHIM UPI', color: 'hover:border-emerald-400' }
                          ].map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.id)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition cursor-pointer ${
                                selectedUpiApp === app.id
                                  ? 'bg-indigo-500/25 border-indigo-400 text-indigo-300'
                                  : 'bg-slate-900 border-slate-700 text-slate-300'
                              } ${app.color}`}
                            >
                              {app.label}
                            </button>
                          ))}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono pt-1">
                          VPA: <strong className="text-slate-200">klu.library@sbi</strong> • Amount: <strong className="text-emerald-400">₹50.00</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campus ERP Wallet Simulation */}
                {paymentMethod === 'erp' && (
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Student Fee Ledger Deduction</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Ledger Active
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 text-xs space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span>Student Roll No:</span>
                        <span className="font-mono text-slate-200">{currentUser.memberId}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Current ERP Ledger Balance:</span>
                        <span className="font-mono text-white font-bold">₹450.00</span>
                      </div>
                      <div className="flex justify-between text-amber-300 border-t border-slate-800/80 pt-2 font-medium">
                        <span>Library Maintenance Fee:</span>
                        <span className="font-mono font-bold">- ₹50.00</span>
                      </div>
                      <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-2 text-[11px]">
                        <span>Remaining Ledger Balance:</span>
                        <span className="font-mono font-semibold text-emerald-400">₹400.00</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
            <Lock size={13} className="text-slate-500" />
            <span>256-bit Institutional Security</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition cursor-pointer disabled:opacity-40"
            >
              {isFaculty ? 'Close' : 'Cancel'}
            </button>

            {!isFaculty && (
              <button
                type="button"
                id="confirm-pay-50-btn"
                onClick={handlePayAndActivate}
                disabled={isProcessing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-75 disabled:cursor-wait"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-white" />
                    <span>
                      {processingStep === 1 && 'Connecting to Gateway...'}
                      {processingStep === 2 && 'Deducting ₹50 Fee...'}
                      {processingStep === 3 && 'Activating Pass...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Pay ₹50 & Activate Pass</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
