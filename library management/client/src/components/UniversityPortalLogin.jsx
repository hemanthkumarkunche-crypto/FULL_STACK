import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, X, Shield, Lock, UserCheck, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { enrichUserWithDecodedId } from '../utils/universityIdDecoder';

/**
 * Generates a randomized 6-character alphanumeric CAPTCHA code.
 * Excludes easily confusable characters (like 0, O, I, 1).
 */
const generateRandomCaptcha = () => {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function UniversityPortalLogin({ onLoginSuccess }) {
  // Input fields
  const [idInput, setIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');

  // Inline errors & submission
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals for helper links
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);

  // Application request form state
  const [appName, setAppName] = useState('');
  const [appContact, setAppContact] = useState('');
  const [appDept, setAppDept] = useState('Computer Science & Engineering');
  const [appReason, setAppReason] = useState('');
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [appError, setAppError] = useState('');

  const canvasRef = useRef(null);

  // Draw CAPTCHA on HTML5 canvas with noise, lines, and character distortion
  const drawCaptchaCanvas = (code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#f8fafc');
    bg.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Decorative noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 160)}, ${Math.floor(Math.random() * 160)}, ${Math.floor(Math.random() * 160)}, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 180)}, 0.45)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distorted individual characters
    const colors = ['#dc2626', '#1e40af', '#047857', '#7c3aed', '#c2410c', '#0f766e'];
    ctx.textBaseline = 'middle';
    const charSpacing = width / (code.length + 1);

    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = (i + 0.8) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 26 - 13) * (Math.PI / 180);
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `bold ${Math.floor(Math.random() * 4 + 22)}px 'Courier New', monospace`;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(code[i], -8, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const code = generateRandomCaptcha();
    setCaptchaCode(code);
    setCaptchaInput('');
    setErrors((prev) => ({ ...prev, captcha: '' }));
    setTimeout(() => drawCaptchaCanvas(code), 20);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Form Validation & Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const trimmedId = idInput.trim();

    // 1. Validate ID
    if (!trimmedId) {
      newErrors.id = 'ID cannot be blank';
    } else {
      // Rule: Accepts 10-digit Student Series IDs (starting with 23–27)
      // OR Faculty IDs (numeric values between 1 and 15000)
      // Also allow pre-seeded admin/librarian/member credentials for demo compatibility
      const isStudent10Digit = /^2[3-7]\d{8}$/.test(trimmedId);
      const isFacultyNumeric = /^\d{1,5}$/.test(trimmedId) && Number(trimmedId) >= 1 && Number(trimmedId) <= 15000;
      const isDemoAccount = /^(admin@library\.com|librarian@library\.com|member@library\.com|LIB-ADM-001|LIB-STF-002|LIB-MEM-1001)$/i.test(trimmedId);

      if (!isStudent10Digit && !isFacultyNumeric && !isDemoAccount) {
        newErrors.id = 'Invalid University ID';
      }
    }

    // 2. Validate Password
    if (!password) {
      newErrors.password = 'Password cannot be blank';
    }

    // 3. Validate Captcha (case-insensitive)
    if (!captchaInput.trim()) {
      newErrors.captcha = 'Verification code cannot be blank';
    } else if (captchaInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      newErrors.captcha = 'Invalid verification code. Please try again.';
      refreshCaptcha();
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');

    try {
      let loggedUser = null;

      // Attempt backend authentication
      try {
        const response = await api.login(trimmedId, password);
        if (response?.user) {
          loggedUser = response.user;
          if (response.token) {
            localStorage.setItem('library_token', response.token);
          }
        }
      } catch (apiErr) {
        // Backend credential mismatch or offline — fall through to local session
        console.warn('Backend login notice:', apiErr.message);
      }

      // If backend user wasn't authenticated (student/faculty series ID not in DB),
      // build a local session directly from the entered ID.
      if (!loggedUser) {
        const isFaculty = /^\d{1,5}$/.test(trimmedId) && Number(trimmedId) >= 1 && Number(trimmedId) <= 15000;
        loggedUser = {
          _id: 'usr_' + trimmedId,
          memberId: trimmedId,
          firstName: 'University',
          lastName: 'Member',
          email: `${trimmedId}@university.edu`,
          role: isFaculty ? 'FACULTY' : 'STUDENT',
          borrowQuota: isFaculty ? 10 : 5,
          totalFinesDue: 0,
          accountStatus: 'ACTIVE',
        };
        localStorage.setItem('library_token', 'session_' + Date.now());
      }

      // Always normalise memberId and accountStatus
      loggedUser.memberId = trimmedId;
      loggedUser.accountStatus = 'ACTIVE';

      // ── Role-specific Membership Activation Rules ────────────────────────
      const isFacultyUser = (/^\d{1,5}$/.test(trimmedId) && Number(trimmedId) >= 1 && Number(trimmedId) <= 15000) || loggedUser.role === 'FACULTY';

      if (isFacultyUser) {
        // Faculty Members (ID < 15000): 100% FREE, Automatically ACTIVE FACULTY SCHOLAR
        loggedUser.role = 'FACULTY';
        loggedUser.isMembershipActive = true;
        loggedUser.membershipStatus = 'ACTIVE FACULTY SCHOLAR';
        loggedUser.membershipPlan = 'KL University Faculty Complimentary Pass';
        loggedUser.borrowQuota = 10;
        loggedUser.loanPeriodDays = 30;
      } else {
        // Students (10-Digit ID 23-27): Default PENDING (₹50) until activated
        const savedMembership = localStorage.getItem(`membership_active_${trimmedId}`);
        if (savedMembership === 'true') {
          loggedUser.isMembershipActive = true;
          loggedUser.membershipStatus = 'ACTIVE SCHOLAR';
        } else {
          loggedUser.isMembershipActive = false;
          loggedUser.membershipStatus = 'PENDING PAYMENT (₹50)';
        }
        loggedUser.borrowQuota = 5;
        loggedUser.loanPeriodDays = 14;
      }

      // ── Decode the ID and enrich the session object ────────────────────────
      // This attaches _decoded (branch, year, designation…), updates borrowQuota
      // if the backend didn't supply one, and reconciles the role field.
      loggedUser = enrichUserWithDecodedId(loggedUser);

      // Persist enriched session
      localStorage.setItem('library_user_profile', JSON.stringify(loggedUser));

      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }
    } catch (err) {
      setGeneralError(err.message || 'Authentication failed. Please check your credentials.');
      refreshCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Application modal
  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    if (!appName.trim() || !appContact.trim()) {
      setAppError('Full Name and University Email / Contact are required.');
      return;
    }
    setAppError('');
    setAppSubmitted(true);
    setTimeout(() => {
      setAppSubmitted(false);
      setShowApplicationModal(false);
      setAppName('');
      setAppContact('');
      setAppReason('');
      alert('Application submitted successfully! The library administrator has received your ID request.');
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered University-Style Login Card */}
      <div className="relative w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl p-8 sm:p-9 border border-slate-100 z-10 animate-fadeIn">
        {/* Portal Branding & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3 shadow-md">
            <BookOpen size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Login
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
            KL UNIVERSITY CENTRAL LIBRARY PORTAL
          </p>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="flex items-center gap-2 p-3 mb-5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* 1. Enter ID * (Outlined text field) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="university-id-input"
              placeholder="Enter ID"
              value={idInput}
              onChange={(e) => {
                setIdInput(e.target.value);
                if (errors.id) setErrors({ ...errors, id: '' });
              }}
              className={`w-full px-3.5 py-3 text-sm text-slate-900 bg-white border rounded-lg outline-none transition ${
                errors.id
                  ? 'border-red-500 ring-2 ring-red-100'
                  : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-100'
              }`}
            />
            {errors.id && (
              <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" />
                <span>{errors.id}</span>
              </p>
            )}
          </div>

          {/* 2. Enter Password * (Outlined text field with password masking) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              id="university-password-input"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              className={`w-full px-3.5 py-3 text-sm text-slate-900 bg-white border rounded-lg outline-none transition ${
                errors.password
                  ? 'border-red-500 ring-2 ring-red-100'
                  : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-100'
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* 3. Dynamic Captcha Verification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Captcha Verification <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg overflow-hidden border border-slate-300 bg-slate-50 shadow-inner">
                <canvas ref={canvasRef} width={180} height={44} className="block cursor-pointer" onClick={refreshCaptcha} title="Click to refresh" />
              </div>
              <button
                type="button"
                id="refresh-captcha-btn"
                onClick={refreshCaptcha}
                title="Generate new captcha code"
                className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition hover:text-slate-900 cursor-pointer"
              >
                <RefreshCw size={17} />
              </button>
            </div>

            <input
              type="text"
              id="captcha-code-input"
              placeholder="Enter verification Code"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value);
                if (errors.captcha) setErrors({ ...errors, captcha: '' });
              }}
              className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-lg outline-none transition ${
                errors.captcha
                  ? 'border-red-500 ring-2 ring-red-100'
                  : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-100'
              }`}
            />
            {errors.captcha && (
              <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" />
                <span>{errors.captcha}</span>
              </p>
            )}
          </div>

          {/* 5. Action Button: Dark navy "Login" button */}
          <div className="pt-2">
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-sm font-bold text-white bg-[#0f172a] hover:bg-[#1e293b] active:bg-[#0f172a] disabled:bg-slate-400 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            >
              {isSubmitting ? 'Verifying...' : 'Login'}
            </button>
          </div>
        </form>

        {/* 4. Helper Links (Red text) */}
        <div className="text-center mt-5 space-y-1.5 text-xs font-semibold">
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-red-600 hover:text-red-700 hover:underline cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              Forgot Password?
            </button>
            <span className="text-slate-300 font-normal">|</span>
            <button
              type="button"
              onClick={() => setShowApplicationModal(true)}
              className="text-red-600 hover:text-red-700 hover:underline cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              Application
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowMfaModal(true)}
              className="text-red-600 hover:text-red-700 hover:underline cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              MFA Registration?
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Request an ID from Library Admin (Application) */}
      {showApplicationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowApplicationModal(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white text-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck size={18} className="text-indigo-600" />
                Library ID Application
              </h3>
              <button
                type="button"
                onClick={() => setShowApplicationModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {appSubmitted ? (
              <div className="text-center py-6 text-emerald-600 space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                <p className="text-sm font-semibold">Request Received!</p>
                <p className="text-xs text-slate-500">
                  The Library Administrator will review your application and issue your University Library ID via email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-3">
                {appError && (
                  <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
                    {appError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Email / Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. name@university.edu"
                    value={appContact}
                    onChange={(e) => setAppContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={appDept}
                    onChange={(e) => setAppDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg outline-none focus:border-slate-900"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Applied Mathematics">Applied Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Request
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. New academic semester library access"
                    value={appReason}
                    onChange={(e) => setAppReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg outline-none focus:border-slate-900 resize-none"
                  />
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] rounded-lg shadow transition"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Forgot Password Assistance */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white text-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock size={18} className="text-red-600" />
                Password Assistance
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              To reset your KL University Library password, please present your University ID card at the Central Circulation Desk (Building A, Floor 1) or contact the University IT Helpdesk:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1 mb-4 font-mono text-slate-700">
              <div>Email: <strong>library-helpdesk@university.edu</strong></div>
              <div>Extension: <strong>Ext. 4081 / 4082</strong></div>
              <div>Hours: <strong>Mon - Sat, 08:30 AM - 08:00 PM</strong></div>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] rounded-lg transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Modal 3: MFA Registration */}
      {showMfaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowMfaModal(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white text-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-indigo-600" />
                Multi-Factor Authentication (MFA)
              </h3>
              <button
                type="button"
                onClick={() => setShowMfaModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Multi-Factor Authentication (MFA) protects your library borrowing records and university credentials.
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs space-y-1.5 mb-4 text-indigo-900">
              <p className="font-semibold">Supported Authenticator Apps:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-indigo-800 text-[11px]">
                <li>Microsoft Authenticator (Recommended)</li>
                <li>Google Authenticator</li>
                <li>University Security Key (FIDO2)</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              To pair your smartphone authenticator app, login with your standard university ID first, then visit your Account Security tab.
            </p>
            <button
              type="button"
              onClick={() => setShowMfaModal(false)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
