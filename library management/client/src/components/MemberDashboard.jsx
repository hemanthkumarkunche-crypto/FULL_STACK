import React, { useState } from 'react';
import {
  BookOpen, Bookmark, Clock, AlertTriangle, CheckCircle,
  RefreshCw, DollarSign, QrCode, CreditCard, ChevronRight, X, RotateCcw,
  Award, Users, Sparkles, Check
} from 'lucide-react';
import { api } from '../services/api';
import { decodeUniversityId } from '../utils/universityIdDecoder';
import { calculateSemesterFromAdmissionYear, getSemesterOrdinal } from '../data/curriculumData';

export default function MemberDashboard({
  currentUser,
  loans,
  reservations,
  onRefresh,
  onShowPass,
  onReturnBook,
  karmaProfile,
  onOpenKarmaLedger,
  onInitiateHandover,
  onAcceptHandoverCode,
  onOpenMembershipModal
}) {
  const [payingFineId, setPayingFineId] = useState(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const activeLoans = loans.filter((l) => l.status === 'BORROWED' || l.status === 'OVERDUE');
  const pastLoans = loans.filter((l) => l.status === 'RETURNED');
  const isMembershipActive = Boolean(currentUser?.isMembershipActive);

  const handleRenew = async (loanId) => {
    setActionError('');
    try {
      const res = await api.renewLoan(loanId);
      alert(res.message);
      onRefresh();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCancelReserve = async (resId) => {
    if (!window.confirm('Cancel this book reservation?')) return;
    try {
      await api.cancelReservation(resId);
      onRefresh();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleSettleFine = async (loanId) => {
    try {
      const res = await api.payFine(loanId);
      setPaySuccessMsg(`Payment successful! Reference: ${res.paymentReference}`);
      setTimeout(() => setPaySuccessMsg(''), 4000);
      onRefresh();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const decoded = currentUser?._decoded || decodeUniversityId(currentUser?.memberId || '');
  const ongoingSem = calculateSemesterFromAdmissionYear(decoded.admissionYear);
  const isFaculty = decoded.idType === 'FACULTY' || (currentUser?.memberId && Number(currentUser.memberId) <= 15000) || currentUser?.role === 'FACULTY';
  const [exchangeInputCode, setExchangeInputCode] = useState('');
  const [exchangeSuccessMsg, setExchangeSuccessMsg] = useState('');

  const handleClaimExchangeCode = () => {
    if (!exchangeInputCode.trim()) {
      alert('Please enter a valid 6-digit campus handover code (e.g. ATH-8921-P2P)');
      return;
    }
    if (onAcceptHandoverCode) {
      onAcceptHandoverCode(exchangeInputCode.trim());
      setExchangeSuccessMsg(`Pairing code ${exchangeInputCode} submitted successfully!`);
      setExchangeInputCode('');
      setTimeout(() => setExchangeSuccessMsg(''), 4000);
    }
  };

  return (
    <div>
      {/* Header Profile / Pass Bar */}
      <div className="glass-panel" style={{
        padding: '28px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
          }}>
            {currentUser.firstName?.[0] || decoded.avatarLetter || 'M'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{currentUser.firstName} {currentUser.lastName}</h2>
              <span className="badge badge-role">
                {decoded.line1 || 'University Member'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Member ID: <span style={{ color: '#818cf8', fontWeight: 600 }}>{currentUser.memberId}</span> • {decoded.admissionYear ? `Batch ${decoded.admissionYear} • Ongoing ${getSemesterOrdinal(ongoingSem)} Semester` : `Role: ${decoded.idType}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Role-Specific Membership Action Button */}
          {isFaculty ? (
            <button
              type="button"
              id="dashboard-membership-btn"
              onClick={onOpenMembershipModal}
              className="btn btn-secondary border-purple-500/40 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20"
              title="KL University Faculty Scholar Pass (100% Free Institutional Benefit)"
            >
              <CreditCard size={18} className="text-purple-400" />
              <span>Faculty Complimentary (Free)</span>
            </button>
          ) : (
            <button
              type="button"
              id="dashboard-membership-btn"
              onClick={onOpenMembershipModal}
              className={`btn btn-secondary ${
                isMembershipActive
                  ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                  : 'border-amber-500/40 text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 animate-pulse'
              }`}
              title="KL University Student Library Card (₹50 Universal Plan)"
            >
              <CreditCard size={18} className={isMembershipActive ? 'text-emerald-400' : 'text-amber-400'} />
              <span>{isMembershipActive ? 'Active Scholar (₹50)' : 'Activate Pass (₹50)'}</span>
            </button>
          )}

          {karmaProfile && (
            <button
              onClick={onOpenKarmaLedger}
              className="btn btn-secondary"
              style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fde047' }}
              title="Click to view Library Karma Ledger"
            >
              <Award size={18} />
              <span>Karma: {karmaProfile.score} pts</span>
            </button>
          )}

          <button
            onClick={onShowPass}
            className="btn btn-secondary"
            style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}
          >
            <QrCode size={18} />
            <span>Digital Library Pass</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Membership Status Alert Banner */}
      {isFaculty ? (
        <div className="mb-6 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-purple-200">
            <CheckCircle size={16} className="text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-purple-300">MEMBERSHIP: ACTIVE (FACULTY COMPLIMENTARY) — </span>
              <span className="text-slate-300">
                Institutional Complimentary Benefit (100% Free). 10 book borrow quota, 30-day loan duration, unrestricted central library access.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMembershipModal}
            className="text-[11px] font-bold text-purple-300 hover:text-purple-200 underline self-start sm:self-auto cursor-pointer"
          >
            View Privileges
          </button>
        </div>
      ) : !isMembershipActive ? (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-200">
                Student Library Card: Inactive / Pending Payment (₹50)
              </div>
              <div className="text-slate-300 text-xs mt-0.5">
                Annual Student Pass • ₹50 for Academic Session 2026–2027. Activate your card to borrow up to 5 books with 14-day loan cycles.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMembershipModal}
            className="shrink-0 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-lg shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            Activate Card (₹50) →
          </button>
        </div>
      ) : (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-emerald-200">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300">MEMBERSHIP: ACTIVE SCHOLAR — </span>
              <span className="text-slate-300">
                Universal Student Pass Active (Session 2026–2027). 5 book borrow limit, 14-day loan duration, online renewals enabled.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMembershipModal}
            className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 underline self-start sm:self-auto cursor-pointer"
          >
            View Privileges
          </button>
        </div>
      )}

      {actionError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {paySuccessMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#6ee7b7',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px'
        }}>
          {paySuccessMsg}
        </div>
      )}

      {/* Metric Cards (5 Cards including Karma Score) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Karma Score Card */}
        {karmaProfile && (
          <div
            className="glass-panel"
            onClick={onOpenKarmaLedger}
            style={{ padding: '20px', cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#fde047', textTransform: 'uppercase', fontWeight: 700 }}>Library Karma</span>
              <Award size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fef08a' }}>{karmaProfile.score} <span style={{ fontSize: '0.9rem', color: '#fbbf24' }}>pts</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              {karmaProfile.tier?.tierName?.split('/')[0]?.trim()} • View History →
            </div>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Borrows</span>
            <BookOpen size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{activeLoans.length} / {currentUser.borrowQuota + (karmaProfile?.tier?.extraSlots || 0)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {(currentUser.borrowQuota + (karmaProfile?.tier?.extraSlots || 0)) - activeLoans.length} slots remaining
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Holds</span>
            <Bookmark size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{reservations.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            In reservation queues
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fines Due</span>
            <DollarSign size={18} color={(currentUser.totalFinesDue ?? 0) > 0 ? '#ef4444' : '#10b981'} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: (currentUser.totalFinesDue ?? 0) > 0 ? '#f87171' : '#34d399'
          }}>
            ${(currentUser.totalFinesDue ?? 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {(currentUser.totalFinesDue ?? 0) > 0 ? 'Action required for checkout' : 'Clean account record'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Loans</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{pastLoans.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Lifetime returned titles
          </div>
        </div>
      </div>

      {/* Feature 4: Campus Handover Kiosk Exchange Widget */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(6, 182, 212, 0.08))',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
              <Users size={14} /> Campus Peer-to-Peer Handover Exchange ("Zero-Shelf Queue Transfer")
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Have a pairing code from a classmate? Claim your reserved book instantly
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Transfers loan ownership directly to you on campus without shelving delays. Both students earn +15 Karma points!
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              id="campus-handover-code-input"
              placeholder="e.g. ATH-8921-P2P"
              value={exchangeInputCode}
              onChange={(e) => setExchangeInputCode(e.target.value)}
              style={{
                background: '#0b0f19',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.85rem',
                color: '#fff',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                outline: 'none',
                width: '180px'
              }}
            />
            <button
              type="button"
              id="claim-handover-code-btn"
              onClick={handleClaimExchangeCode}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px' }}
            >
              <Check size={14} />
              <span>Claim Book</span>
            </button>
          </div>
        </div>

        {exchangeSuccessMsg && (
          <div style={{ marginTop: '12px', color: '#6ee7b7', fontSize: '0.85rem', fontWeight: 600 }}>
            ✓ {exchangeSuccessMsg}
          </div>
        )}
      </div>

      {/* Active Loans Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Currently Borrowed Books</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeLoans.length} items checked out</span>
        </div>

        {activeLoans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            <BookOpen size={36} color="var(--text-dim)" style={{ marginBottom: '10px' }} />
            <div>You have no books currently checked out.</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>Explore the catalog to borrow or reserve titles.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px 8px' }}>BOOK TITLE</th>
                  <th style={{ padding: '12px 8px' }}>BORROWED DATE</th>
                  <th style={{ padding: '12px 8px' }}>DUE DATE</th>
                  <th style={{ padding: '12px 8px' }}>STATUS</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan) => {
                  const now = new Date();
                  const due = new Date(loan.dueDate);
                  const isOverdue = now > due;
                  const daysDiff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={loan._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={loan.book?.coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                            alt={loan.book?.title}
                            style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{loan.book?.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Shelf: {loan.book?.shelfLocation?.rack || 'R-01'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 8px', color: 'var(--text-muted)' }}>
                        {new Date(loan.borrowedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <div style={{ fontWeight: 600, color: isOverdue ? '#f87171' : 'var(--text-main)' }}>
                          {due.toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isOverdue ? '#f87171' : daysDiff <= 3 ? '#fbbf24' : 'var(--text-dim)' }}>
                          {isOverdue ? `${Math.abs(daysDiff)} days overdue` : `${daysDiff} days remaining`}
                        </div>
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <span className={`badge ${isOverdue ? 'badge-unavailable' : 'badge-available'}`}>
                          {isOverdue ? 'OVERDUE' : 'ACTIVE LOAN'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                          {onInitiateHandover && (
                            <button
                              type="button"
                              onClick={() => onInitiateHandover(loan.book || { _id: loan.bookId, title: loan.title })}
                              className="btn btn-sm"
                              style={{
                                background: 'rgba(99, 102, 241, 0.2)',
                                border: '1px solid rgba(99, 102, 241, 0.4)',
                                color: '#c7d2fe',
                                fontSize: '0.75rem',
                                padding: '4px 10px'
                              }}
                              title="Transfer book directly to next student on campus (+15 Karma)"
                            >
                              <Users size={12} />
                              <span>P2P (+15 Karma)</span>
                            </button>
                          )}
                          {onReturnBook && (
                            <button
                              onClick={() => onReturnBook(loan.book?._id || loan.bookId || loan._id || loan.id)}
                              className="btn btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                              }}
                              title="Return this book to library"
                            >
                              <RotateCcw size={12} />
                              <span>Return</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleRenew(loan._id)}
                            className="btn btn-secondary btn-sm"
                            disabled={loan.renewalCount >= 2}
                            title={loan.renewalCount >= 2 ? 'Max renewals reached' : 'Extend loan by 7 days'}
                          >
                            <RefreshCw size={13} />
                            <span>Renew ({loan.renewalCount}/2)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reservations & Holds Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Active Reservations</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{reservations.length} holds</span>
        </div>

        {reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No active reservations placed.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {reservations.map((res) => (
              <div
                key={res._id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{res.book?.title}</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className={`badge ${res.status === 'READY_FOR_PICKUP' ? 'badge-available' : 'badge-reserved'}`}>
                      {res.status === 'READY_FOR_PICKUP' ? 'READY AT DESK' : `QUEUE #${res.queuePosition}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Reserved {new Date(res.reservedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCancelReserve(res._id)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#f87171' }}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Borrowing History Table */}
      {pastLoans.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Borrowing History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '10px 8px' }}>TITLE</th>
                  <th style={{ padding: '10px 8px' }}>RETURNED DATE</th>
                  <th style={{ padding: '10px 8px' }}>CONDITION</th>
                  <th style={{ padding: '10px 8px' }}>FINE STATUS</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {pastLoans.map((rec) => (
                  <tr key={rec._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 500 }}>{rec.book?.title}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>
                      {rec.returnedAt ? new Date(rec.returnedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className="badge badge-role">{rec.returnCondition}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {rec.fine?.amount > 0 ? (
                        <span style={{ color: rec.fine.isPaid ? '#34d399' : '#f87171', fontWeight: 600 }}>
                          ${rec.fine.amount.toFixed(2)} ({rec.fine.isPaid ? 'Settled' : 'Unpaid'})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      {rec.fine?.amount > 0 && !rec.fine.isPaid && (
                        <button
                          onClick={() => handleSettleFine(rec._id)}
                          className="btn btn-sm btn-primary"
                        >
                          <CreditCard size={12} />
                          <span>Pay ${rec.fine.amount.toFixed(2)}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
