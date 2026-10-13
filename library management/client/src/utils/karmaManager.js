/**
 * karmaManager.js
 * Library Karma & Academic Merit Score System
 * Tracks student stewardship, unlocks borrowing privileges, and enforces rule penalties.
 */

const STORAGE_PREFIX = 'athenaeum_karma_';

export const KARMA_TIERS = {
  HIGH: {
    tierName: 'Gold Scholar / KL University Fellow',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    extraSlots: 1,
    loanDays: 21,
    canReserve: true,
    minScore: 150,
    icon: '🏆',
    description: 'Elite standing: +1 extra loan slot unlocked & extended 21-day loan duration.'
  },
  STANDARD: {
    tierName: 'Silver Scholar / Good Standing',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    extraSlots: 0,
    loanDays: 14,
    canReserve: true,
    minScore: 50,
    icon: '⭐',
    description: 'Active good standing: Standard 5 book quota with 14-day loan period.'
  },
  LOW: {
    tierName: 'Restricted / At Risk',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    extraSlots: 0,
    loanDays: 7,
    canReserve: false,
    minScore: 0,
    icon: '⚠️',
    description: 'Hold reservations temporarily suspended due to overdue infractions.'
  }
};

export function getKarmaProfile(userId) {
  if (!userId) {
    return {
      score: 100,
      tier: KARMA_TIERS.STANDARD,
      history: [
        {
          id: 'init-1',
          timestamp: new Date().toISOString(),
          delta: 100,
          reason: 'Initial Academic Registration Grant',
          resultingScore: 100
        }
      ]
    };
  }

  const key = `${STORAGE_PREFIX}${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const tier = resolveKarmaTier(parsed.score);
      return { ...parsed, tier };
    } catch (e) {
      // Fallback
    }
  }

  const defaultProfile = {
    score: 110,
    history: [
      {
        id: 'init-1',
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        delta: 100,
        reason: 'Initial Academic Registration Grant',
        resultingScore: 100
      },
      {
        id: 'init-2',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        delta: 10,
        reason: 'On-Time Circulation Desk Return',
        resultingScore: 110
      }
    ]
  };

  saveKarmaProfile(userId, defaultProfile);
  return { ...defaultProfile, tier: resolveKarmaTier(defaultProfile.score) };
}

export function saveKarmaProfile(userId, profile) {
  if (!userId) return;
  const key = `${STORAGE_PREFIX}${userId}`;
  localStorage.setItem(key, JSON.stringify(profile));
}

export function resolveKarmaTier(score) {
  if (score >= 150) return KARMA_TIERS.HIGH;
  if (score >= 50) return KARMA_TIERS.STANDARD;
  return KARMA_TIERS.LOW;
}

/**
 * Adjusts user's karma score by delta and records entry in history.
 */
export function addKarmaRecord(userId, delta, reason, bookTitle = null) {
  const current = getKarmaProfile(userId);
  const newScore = Math.max(0, current.score + delta);
  const newEntry = {
    id: `karma_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    delta,
    reason: bookTitle ? `${reason} ("${bookTitle}")` : reason,
    resultingScore: newScore
  };

  const updated = {
    score: newScore,
    history: [newEntry, ...current.history].slice(0, 50)
  };

  saveKarmaProfile(userId, updated);
  return { ...updated, tier: resolveKarmaTier(newScore) };
}
