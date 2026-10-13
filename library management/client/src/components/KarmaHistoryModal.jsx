import React, { useEffect } from 'react';
import {
  X, Award, ShieldCheck, TrendingUp, TrendingDown, Clock,
  Sparkles, CheckCircle2, AlertTriangle, Info, ArrowUpRight
} from 'lucide-react';
import { KARMA_TIERS } from '../utils/karmaManager';

export default function KarmaHistoryModal({
  isOpen,
  onClose,
  karmaProfile,
  currentUser
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !karmaProfile) return null;

  const { score, tier, history = [] } = karmaProfile;

  // Next milestone progress
  const targetScore = tier === KARMA_TIERS.HIGH ? 200 : 150;
  const progressPercent = Math.min(100, Math.round((score / targetScore) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Library Karma & Merit Score Ledger</span>
              </h3>
              <div className="text-[11px] text-slate-400">
                Stewardship tracking, borrowing privileges & audit history
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Karma Modal"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Big Score Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950/50 border border-amber-500/30 rounded-2xl p-5 shadow-xl text-center relative overflow-hidden">
            <div className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-1">
              Active Member Standing
            </div>
            <div className="text-4xl md:text-5xl font-black text-white my-1 font-mono tracking-tight flex items-center justify-center gap-2">
              <span>{score}</span>
              <span className="text-sm text-amber-400 font-sans font-bold">Points</span>
            </div>

            {/* Current Tier Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border mt-1 ${tier.badgeClass}`}>
              <span>{tier.icon}</span>
              <span>{tier.tierName}</span>
            </div>

            <p className="text-xs text-slate-300 mt-2.5 max-w-sm mx-auto leading-relaxed">
              {tier.description}
            </p>

            {/* Progress to next tier */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-left">
              <div className="flex justify-between items-center text-[11px] mb-1.5 text-slate-300">
                <span>Progress to {tier === KARMA_TIERS.HIGH ? 'Master Fellow (200 pts)' : 'Gold Scholar (150 pts)'}</span>
                <span className="font-mono font-bold text-amber-300">{score} / {targetScore}</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gamification Rule Matrix */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Merit & Penalty Rule Matrix</span>
              <span className="text-[10px] text-slate-500">Automated</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                <span className="text-slate-300">On-Time Return</span>
                <span className="text-emerald-400 font-mono font-bold">+10 pts</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-indigo-500/20 rounded-lg flex items-center justify-between">
                <span className="text-slate-300">Campus P2P Handover</span>
                <span className="text-indigo-400 font-mono font-bold">+15 pts</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-rose-500/20 rounded-lg flex items-center justify-between">
                <span className="text-slate-300">Overdue Return</span>
                <span className="text-rose-400 font-mono font-bold">-15 pts / day</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-amber-500/20 rounded-lg flex items-center justify-between">
                <span className="text-slate-300">Tier &gt; 150 Privilege</span>
                <span className="text-amber-300 font-mono font-bold">+1 Slot & 21 Days</span>
              </div>
            </div>
          </div>

          {/* Karma History Timeline */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-400" />
              <span>Activity & Points Timeline ({history.length})</span>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No history entries yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => {
                  const isPositive = item.delta > 0;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-200 truncate">
                            {item.reason}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-mono font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPositive ? `+${item.delta}` : item.delta} pts
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Balance: {item.resultingScore}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
