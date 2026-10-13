import React, { useState } from 'react';
import {
  BookOpen, Bell, LogOut, QrCode, LayoutDashboard, Database,
  GraduationCap, Sparkles, Award, CheckCircle2, ShieldCheck, CreditCard
} from 'lucide-react';
import { decodeUniversityId } from '../utils/universityIdDecoder';

export default function Navbar({
  currentUser,
  onLogout,
  currentTab,
  setCurrentTab,
  unreadCount,
  onToggleNotifications,
  onOpenPass,
  onOpenAISyllabus,
  karmaProfile,
  onOpenKarmaLedger,
  onOpenMembershipModal
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ── Resolve decoded identity ─────────────────────────────────────────────
  // Use pre-attached _decoded if available (set at login), otherwise decode now.
  const decoded = currentUser
    ? (currentUser._decoded ?? decodeUniversityId(currentUser.memberId ?? ''))
    : null;

  const isFaculty = decoded?.idType === 'FACULTY' || (Number(currentUser?.memberId) > 0 && Number(currentUser?.memberId) <= 15000);

  // Avatar background colour keyed to user type
  const avatarBg = {
    STUDENT:   'bg-indigo-600',
    FACULTY:   'bg-emerald-700',
    ADMIN:     'bg-rose-700',
    LIBRARIAN: 'bg-violet-700',
    MEMBER:    'bg-sky-700',
    UNKNOWN:   'bg-slate-600',
  }[decoded?.idType ?? 'UNKNOWN'] ?? 'bg-indigo-600';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-6">
      <div className="max-w-7xl mx-auto h-[70px] flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('catalog')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <BookOpen size={22} className="text-white" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              KL UNIVERSITY
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Online Library Management
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <button
            type="button"
            id="nav-tab-catalog"
            onClick={() => setCurrentTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
              currentTab === 'catalog'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen size={16} />
            <span>Academic Catalog</span>
          </button>

          {currentUser && (
            <button
              type="button"
              id="nav-tab-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
          )}

          {/* Exclusive Faculty Desk toggle when Faculty ID logs in (< 15,000) */}
          {currentUser && isFaculty && (
            <button
              type="button"
              id="nav-tab-faculty"
              onClick={() => setCurrentTab('faculty')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'faculty'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap size={16} className="text-emerald-400" />
              <span>Faculty Desk</span>
            </button>
          )}

          {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'LIBRARIAN' || (currentUser.borrowQuota ?? 0) >= 10) && (
            <button
              type="button"
              id="nav-tab-admin"
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'admin'
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database size={16} />
              <span>Admin Desk</span>
            </button>
          )}
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2.5">
          {currentUser && (
            <>
              {/* Role-Specific Institutional Membership System Badge & Trigger */}
              {isFaculty ? (
                /* Faculty Members (ID < 15000): 100% FREE Complimentary Institutional Benefit */
                <button
                  type="button"
                  id="navbar-membership-faculty-badge"
                  onClick={onOpenMembershipModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/35 hover:bg-emerald-500/25 rounded-lg transition cursor-pointer"
                  title="KL University Faculty Pass: 100% Free Complimentary Institutional Benefit (Click to view privileges)"
                >
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="hidden sm:inline">MEMBERSHIP:</span>
                  <span>ACTIVE (FACULTY COMPLIMENTARY)</span>
                </button>
              ) : !currentUser?.isMembershipActive ? (
                /* Students (10-Digit ID 23-27): Pending ₹50 Annual Card */
                <div className="flex items-center gap-1.5">
                  <div
                    id="navbar-membership-pending-badge"
                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/35 rounded-lg"
                    title="KL University Student Library Card: Pending Annual ₹50 Activation"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>MEMBERSHIP: PENDING (₹50)</span>
                  </div>
                  <button
                    type="button"
                    id="navbar-activate-card-btn"
                    onClick={onOpenMembershipModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-lg shadow-md shadow-amber-500/25 transition cursor-pointer"
                    title="Click to activate your ₹50 Student Library Card"
                  >
                    <Sparkles size={13} className="text-amber-100" />
                    <span>Activate Card (₹50)</span>
                  </button>
                </div>
              ) : (
                /* Students (Activated): Active Scholar */
                <button
                  type="button"
                  id="navbar-membership-active-badge"
                  onClick={onOpenMembershipModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/35 hover:bg-emerald-500/25 rounded-lg transition cursor-pointer"
                  title="KL University Student Library Card: Active Scholar Member (Click to view pass benefits)"
                >
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="hidden sm:inline">MEMBERSHIP:</span>
                  <span>ACTIVE SCHOLAR</span>
                </button>
              )}

              {/* AI Syllabus Topic Search Button */}
              <button
                type="button"
                id="navbar-ai-syllabus-btn"
                onClick={onOpenAISyllabus}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition cursor-pointer"
                title="Search chapters and pages by course syllabus topic"
              >
                <Sparkles size={14} className="text-cyan-400" />
                <span>AI Syllabus</span>
              </button>

              {/* Karma Badge Button */}
              {karmaProfile && (
                <button
                  type="button"
                  id="navbar-karma-btn"
                  onClick={onOpenKarmaLedger}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition cursor-pointer font-mono"
                  title="Click to view Library Karma Merit Ledger"
                >
                  <Award size={14} className="text-amber-400" />
                  <span>{karmaProfile.score} pts</span>
                </button>
              )}

              {/* Digital Pass Button */}
              <button
                type="button"
                id="navbar-digital-pass-btn"
                onClick={onOpenPass}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition cursor-pointer"
              >
                <QrCode size={15} />
                <span className="hidden sm:inline">Digital Pass</span>
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                id="navbar-notif-btn"
                onClick={onToggleNotifications}
                aria-label="View notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-600 border border-slate-950 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  id="navbar-user-profile-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                    {decoded?.avatarLetter ?? currentUser.firstName?.[0] ?? 'U'}
                  </div>
                  {/* Two-line identity card */}
                  <div className="text-left leading-tight hidden lg:block">
                    <div className="text-xs font-semibold truncate max-w-[150px]">
                      {decoded?.line1 ?? `${currentUser.firstName} ${currentUser.lastName}`}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                      {decoded?.line2 ?? `ID: ${currentUser.memberId}`}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                      {/* Avatar + decoded title row */}
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0`}>
                          {decoded?.avatarLetter ?? currentUser.firstName?.[0] ?? 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {decoded?.line1 ?? `${currentUser.firstName} ${currentUser.lastName}`}
                          </div>
                          <div className="text-[10px] text-indigo-400 font-mono truncate">
                            {decoded?.line2 ?? `ID: ${currentUser.memberId}`}
                          </div>
                        </div>
                      </div>
                      {/* Full name (from backend/session) */}
                      {currentUser.firstName && currentUser.firstName !== 'University' && (
                        <div className="text-[11px] text-slate-300 font-medium pl-[2.875rem]">
                          {currentUser.firstName} {currentUser.lastName}
                        </div>
                      )}
                      
                      {/* Universal Institutional Membership Status in Dropdown */}
                      <div className="mt-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {isFaculty ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                              <span className="text-emerald-300 font-bold">Faculty Complimentary (Free)</span>
                            </>
                          ) : currentUser?.isMembershipActive ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                              <span className="text-emerald-300 font-bold">Active Scholar (₹50/yr)</span>
                            </>
                          ) : (
                            <>
                              <CreditCard size={13} className="text-amber-400 shrink-0" />
                              <span className="text-amber-300 font-bold">Membership Pending (₹50)</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenMembershipModal) onOpenMembershipModal();
                            setShowUserMenu(false);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                            isFaculty
                              ? 'text-emerald-300 hover:text-white bg-emerald-500/20'
                              : currentUser?.isMembershipActive
                              ? 'text-indigo-300 hover:text-white bg-indigo-500/20'
                              : 'text-amber-200 bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/40'
                          }`}
                        >
                          {isFaculty || currentUser?.isMembershipActive ? 'View Pass' : 'Pay ₹50'}
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-2">
                        Status: <span className="text-emerald-400 font-bold">{currentUser.accountStatus || 'ACTIVE'}</span>
                        {decoded?.borrowQuota != null && (
                          <span className="ml-2 text-slate-500">• Quota: <span className="text-sky-400 font-semibold">{decoded.borrowQuota} books</span></span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { onOpenPass(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-500/10 rounded-lg transition"
                    >
                      <QrCode size={14} className="text-indigo-400" />
                      <span>View Digital Library Pass</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenMembershipModal) onOpenMembershipModal();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-500/10 rounded-lg transition"
                    >
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Universal Institutional Card (₹50)</span>
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Prominent Navbar Sign Out Button */}
              <button
                type="button"
                id="top-navbar-signout-btn"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition cursor-pointer"
                title="Sign Out of Library System"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
