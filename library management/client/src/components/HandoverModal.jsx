import React, { useState, useEffect } from 'react';
import {
  X, Users, QrCode, CheckCircle2, Clock, MapPin, ArrowRight,
  Sparkles, Award, ShieldCheck, Copy, Check, AlertCircle, RefreshCw
} from 'lucide-react';

export default function HandoverModal({
  isOpen,
  onClose,
  book,
  currentUser,
  activeWaitlistUser,
  onConfirmDirectTransfer,
  onConfirmNormalReturn
}) {
  const [step, setStep] = useState('prompt'); // 'prompt' | 'active_code' | 'success'
  const [pairingCode, setPairingCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [partnerVerified, setPartnerVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Generate unique pairing code on opening
  useEffect(() => {
    if (isOpen) {
      setStep('prompt');
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const code = `ATH-${randomDigits}-P2P`;
      setPairingCode(code);
      setTimeLeft(900);
      setPartnerVerified(false);
      setInputCode('');
    }
  }, [isOpen]);

  // Countdown timer when on 'active_code' step
  useEffect(() => {
    if (!isOpen || step !== 'active_code') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const waitlistStudent = activeWaitlistUser || book.activeWaitlistUser || {
    id: '2500030041',
    name: 'Aarav Sharma',
    branch: 'CSE',
    year: 2
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const copyCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartHandover = () => {
    setStep('active_code');
  };

  const handleVerifyAndCompleteTransfer = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStep('success');
      if (onConfirmDirectTransfer) {
        onConfirmDirectTransfer(book, waitlistStudent, pairingCode);
      }
    }, 1200);
  };

  const handleNormalReturn = () => {
    if (onConfirmNormalReturn) {
      onConfirmNormalReturn(book._id || book.id);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Peer-to-Peer Campus Handover</span>
                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Zero-Shelf Queue Transfer
                </span>
              </h3>
              <div className="text-[11px] text-slate-400">
                Direct campus physical handoff between students
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Handover Modal"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: INITIAL PROMPT */}
          {step === 'prompt' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Highlight Card */}
              <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-cyan-950/40 border border-indigo-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
                    {waitlistStudent.name?.[0] || 'A'}
                  </div>
                  <div>
                    <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                      Waitlist #1 Priority Student Found
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {waitlistStudent.name} (ID: {waitlistStudent.id})
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Enrolled in <strong className="text-cyan-300">{waitlistStudent.branch} (Year {waitlistStudent.year})</strong> is currently waiting for:
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 italic">
                      "{book.title}"
                    </div>
                  </div>
                </div>
              </div>

              {/* Karma Incentive & Efficiency Benefit */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="text-slate-300 flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-400 shrink-0" />
                  <span>
                    <strong>Skip the shelving delay:</strong> Transfer this textbook directly to {waitlistStudent.name.split(' ')[0]} on campus.
                  </span>
                </div>
                <div className="text-emerald-400 font-bold flex items-center gap-2 pt-1 border-t border-slate-900">
                  <Award size={15} className="shrink-0" />
                  <span>Earn +15 Library Karma points for zero-shelf community transfer!</span>
                </div>
              </div>

              {/* Handover Hotspot Suggestion */}
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <MapPin size={14} className="text-cyan-400 shrink-0" />
                <span>
                  <strong>Suggested meeting point:</strong> Library Central Atrium, Ground Floor Kiosk Hub.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  id="initiate-p2p-handover-btn"
                  onClick={handleStartHandover}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-600 hover:from-indigo-600 hover:to-cyan-500 shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <QrCode size={16} />
                  <span>Initiate Direct Campus Handover (+15 Karma)</span>
                </button>

                <button
                  type="button"
                  onClick={handleNormalReturn}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  No thanks, drop off at Circulation Desk instead
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ACTIVE PAIRING CODE & SIMULATED SCAN */}
          {step === 'active_code' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center">
                <div className="text-xs text-slate-400">
                  Show this pairing code or QR to <strong className="text-white">{waitlistStudent.name}</strong>
                </div>
                <div className="text-2xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-white my-3">
                  {pairingCode}
                </div>

                {/* Countdown Timer */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Clock size={13} />
                  <span>Expires in: {timeFormatted}</span>
                </div>
              </div>

              {/* Synchronized QR Simulation Box */}
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center max-w-[200px] mx-auto shadow-xl">
                <div className="w-36 h-36 border-4 border-slate-900 rounded-lg p-2 flex flex-col justify-between">
                  {/* Simulated QR Pattern */}
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                    <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 bg-slate-900" />
                    <div className="w-3 h-3 bg-indigo-600" />
                    <div className="w-3 h-3 bg-slate-900" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                    <div className="w-8 h-8 bg-slate-900 rounded-sm" />
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-800 font-bold mt-2">
                  KL UNIVERSITY P2P SECURE
                </div>
              </div>

              {/* Copy Code & Fast Match Section */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pairing Token:</span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy Token'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-900 text-xs">
                  <label className="block text-slate-400 text-[11px] mb-1.5">
                    Peer Confirmation (Enter pairing code when recipient confirms physically):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={pairingCode}
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      id="confirm-peer-transfer-btn"
                      onClick={handleVerifyAndCompleteTransfer}
                      disabled={verifying}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      {verifying ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      <span>{verifying ? 'Verifying...' : 'Verify Transfer'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('prompt')}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  ← Go back to return options
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & KARMA REWARD CONFIRMATION */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={36} />
              </div>

              <h4 className="text-lg font-extrabold text-white">
                Zero-Shelf Handover Complete!
              </h4>

              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Loan ownership for <strong className="text-white">"{book.title}"</strong> has been successfully transferred from your account to <strong className="text-cyan-300">{waitlistStudent.name}</strong>.
              </p>

              {/* Karma Badge Reward */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm shadow-md">
                <Award size={18} />
                <span>+15 Karma Points Awarded!</span>
              </div>

              <div className="text-[11px] text-slate-400">
                Digital circulation records have been synchronized immediately.
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
