import React, { useState } from 'react';
import { BookOpen, Bookmark, MapPin, RotateCcw, CheckCircle2 } from 'lucide-react';

// ─── Category → cover palette ──────────────────────────────────────────────
// Each entry: [spineGrad, coverGrad, accentColor, labelColor]
const CATEGORY_THEMES = {
  'COMPUTER SCIENCE':      ['#312e81,#1e1b4b', '#1e1b4b,#0f172a', '#818cf8', '#c7d2fe'],
  'SOFTWARE ENGINEERING':  ['#14532d,#052e16', '#052e16,#0a0f0d', '#34d399', '#a7f3d0'],
  'ARTIFICIAL INTELLIGENCE': ['#4c1d95,#2e1065', '#2e1065,#0d0521', '#a78bfa', '#ede9fe'],
  'PROGRAMMING':           ['#1e3a5f,#0c2340', '#0c2340,#060f1a', '#38bdf8', '#bae6fd'],
  'MATHEMATICS':           ['#14532d,#064e3b', '#064e3b,#022c22', '#6ee7b7', '#d1fae5'],
  'ELECTRONICS':           ['#7c2d12,#431407', '#431407,#1c0a03', '#fb923c', '#fed7aa'],
  'NETWORKING':            ['#164e63,#083344', '#083344,#021b24', '#22d3ee', '#a5f3fc'],
  'ENGINEERING':           ['#1e3a8a,#172554', '#172554,#0a1128', '#60a5fa', '#bfdbfe'],
  'PHYSICS':               ['#581c87,#3b0764', '#3b0764,#1a0330', '#c084fc', '#e9d5ff'],
  'CHEMISTRY':             ['#134e4a,#0f3b37', '#0f3b37,#071f1d', '#2dd4bf', '#99f6e4'],
};
const DEFAULT_THEME = ['#27272a,#18181b', '#18181b,#09090b', '#a1a1aa', '#d4d4d8'];

function getTheme(category) {
  const upper = (category || '').toUpperCase();
  for (const [key, val] of Object.entries(CATEGORY_THEMES)) {
    if (upper.includes(key)) return val;
  }
  return DEFAULT_THEME;
}

// Truncate long strings for the cover face
function truncate(str, max) {
  return str && str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export default function BookCard({
  book,
  onSelect,
  onBorrow,
  onReserve,
  onReturn,
  onOpenFloorMap,
  isBorrowedByMe = false
}) {
  const [imgError, setImgError] = useState(false);

  // Normalize fields between mock dataset and DB schema
  const title        = book.title;
  const author       = book.author || (Array.isArray(book.authors) ? book.authors.join(', ') : book.authors) || 'Unknown Author';
  const category     = (book.category || (Array.isArray(book.categories) ? book.categories[0] : book.categories) || 'ENGINEERING').toUpperCase();
  const location     = book.location || `Aisle ${book.shelfLocation?.aisle || 'A-1'} • Rack ${book.shelfLocation?.rack || 'R-01'}`;
  const availableCopies = book.availableCopies ?? 0;
  const isAvailable  = availableCopies > 0 && book.status !== 'RESERVED OUT';
  const coverUrl     = book.coverImage || book.coverImageUrl;

  const [spineGrad, coverGrad, accentColor, labelColor] = getTheme(category);

  // ── Styled Academic Textbook Fallback Cover ─────────────────────────────
  const FallbackCover = () => (
    <div style={{
      width: '172px',
      height: '244px',
      borderRadius: '6px 3px 3px 6px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.65), -6px 0 12px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.08)',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Left spine strip */}
      <div style={{
        width: '14px',
        background: `linear-gradient(180deg, ${spineGrad})`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: `1px solid ${accentColor}30`,
      }}>
        <span style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: '0.45rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          color: accentColor,
          textTransform: 'uppercase',
          opacity: 0.85,
          transform: 'rotate(180deg)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          maxHeight: '120px',
        }}>
          {truncate(title, 22)}
        </span>
      </div>

      {/* Cover face */}
      <div style={{
        flex: 1,
        background: `linear-gradient(160deg, ${coverGrad})`,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 10px 8px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative top accent bar */}
        <div style={{
          height: '3px',
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          borderRadius: '2px',
          marginBottom: '10px',
          opacity: 0.8,
        }} />

        {/* Category chip */}
        <div style={{
          fontSize: '0.48rem',
          fontWeight: 800,
          color: accentColor,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          marginBottom: '8px',
          opacity: 0.9,
        }}>
          {truncate(category, 20)}
        </div>

        {/* Open-book icon centrepiece */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px',
          opacity: 0.25,
        }}>
          <BookOpen size={34} color={accentColor} strokeWidth={1.5} />
        </div>

        {/* Book title */}
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#f8fafc',
          lineHeight: 1.3,
          marginBottom: '6px',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          wordBreak: 'break-word',
          hyphens: 'auto',
        }}>
          {truncate(title, 52)}
        </div>

        {/* Author name */}
        <div style={{
          fontSize: '0.58rem',
          color: labelColor,
          lineHeight: 1.3,
          opacity: 0.85,
          marginTop: 'auto',
          marginBottom: '8px',
          wordBreak: 'break-word',
        }}>
          {truncate(author, 38)}
        </div>

        {/* Publisher strip + barcode */}
        <div style={{
          borderTop: `1px solid ${accentColor}25`,
          paddingTop: '6px',
        }}>
          <div style={{
            fontSize: '0.42rem',
            color: labelColor,
            opacity: 0.55,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            KL UNIVERSITY PRESS
          </div>
          {/* Simulated barcode lines */}
          <div style={{
            display: 'flex',
            gap: '1.5px',
            height: '12px',
            alignItems: 'stretch',
            opacity: 0.4,
          }}>
            {[2,1,3,1,2,1,2,3,1,2,1,3,2,1,2,1,3,1,2,1,3,2,1,2].map((w, i) => (
              <div
                key={i}
                style={{
                  width: `${w}px`,
                  background: i % 2 === 0 ? labelColor : 'transparent',
                  borderRadius: '0.5px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Subtle diagonal watermark */}
        <div style={{
          position: 'absolute',
          bottom: '28px',
          right: '-8px',
          fontSize: '2.8rem',
          fontWeight: 900,
          color: accentColor,
          opacity: 0.04,
          transform: 'rotate(-30deg)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          {category.slice(0, 3)}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '16px',
        background: '#131b2e',
        border: isBorrowedByMe ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = isBorrowedByMe ? 'rgba(16, 185, 129, 0.7)' : 'rgba(99, 102, 241, 0.4)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isBorrowedByMe ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Book Cover Container */}
      <div
        onClick={() => onSelect(book)}
        style={{
          height: '280px',
          position: 'relative',
          overflow: 'hidden',
          background: imgError || !coverUrl
            ? `linear-gradient(160deg, ${coverGrad})`
            : 'linear-gradient(135deg, #1e293b, #0f172a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '16px',
        }}
      >
        {/* Actual Book Image or Styled Fallback */}
        {!imgError && coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            onError={() => setImgError(true)}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: '6px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), -4px 0 8px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <FallbackCover />
        )}

        {/* Status Badge */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
          {isBorrowedByMe ? (
            <span
              className="badge"
              style={{
                backdropFilter: 'blur(8px)',
                background: 'rgba(16, 185, 129, 0.25)',
                border: '1px solid rgba(52, 211, 153, 0.6)',
                color: '#6ee7b7'
              }}
            >
              <CheckCircle2 size={12} className="mr-0.5 inline" /> BORROWED BY YOU
            </span>
          ) : (
            <span
              className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}
              style={{
                backdropFilter: 'blur(8px)',
                background: isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${isAvailable ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                color: isAvailable ? '#6ee7b7' : '#fca5a5'
              }}
            >
              {isAvailable ? `${availableCopies} AVAILABLE` : 'RESERVED OUT'}
            </span>
          )}
        </div>
      </div>

      {/* Book Metadata */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Faculty Course Reserve Golden Badge */}
        {book.facultyReserve && (
          <div className="mb-2 p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[11px] font-semibold flex items-center justify-between gap-1 shadow-sm">
            <div className="flex items-center gap-1 truncate">
              <span>⭐ Recommended by {book.facultyReserve.professorName} for {book.facultyReserve.examLabel || 'Mid-Sem Prep'}</span>
            </div>
            {book.facultyReserve.restrictedReadingOnly && (
              <span className="shrink-0 text-[10px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                🔒 In-Library Only
              </span>
            )}
          </div>
        )}

        {/* Category Pill */}
        <div style={{
          fontSize: '0.7rem',
          color: '#818cf8',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>
          {category}
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(book)}
          style={{
            fontSize: '1.15rem',
            lineHeight: 1.3,
            fontWeight: 700,
            marginBottom: '6px',
            cursor: 'pointer',
            color: '#f8fafc'
          }}
          title={title}
        >
          {title}
        </h3>

        {/* Author */}
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '14px', lineHeight: 1.4 }}>
          by {author}
        </div>

        {/* Shelf Location Pin — Clickable Interactive 2D Floor Navigator */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenFloorMap) onOpenFloorMap(book);
          }}
          title="Click to view interactive 2D Library Floor & Rack Navigator"
          className="group/loc w-full text-left flex items-center justify-between gap-2 text-xs text-slate-300 bg-slate-900/80 hover:bg-indigo-950/60 border border-slate-800 hover:border-cyan-500/50 p-2 rounded-lg mb-4 transition cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin size={14} className="text-cyan-400 group-hover/loc:scale-110 transition shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider group-hover/loc:underline shrink-0 flex items-center gap-0.5">
            Find Shelf 📍
          </span>
        </button>

        {/* Action Controls */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onSelect(book)}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            Details
          </button>

          {isBorrowedByMe ? (
            <button
              type="button"
              onClick={() => onReturn && onReturn(book._id || book.id)}
              className="btn btn-sm"
              style={{
                flex: 1.3,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <RotateCcw size={14} />
              <span>Return Book</span>
            </button>
          ) : book.facultyReserve?.restrictedReadingOnly ? (
            <button
              type="button"
              onClick={() => alert(`"${title}" is under active Faculty Course Reserve for ${book.facultyReserve.examLabel}. In-library physical reading room only.`)}
              className="btn btn-secondary btn-sm"
              style={{
                flex: 1.3,
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#fca5a5'
              }}
              title="Restricted: In-Library Reference Reading Only"
            >
              <span>🔒 Reading Only</span>
            </button>
          ) : isAvailable ? (
            <button
              type="button"
              onClick={() => onBorrow(book._id || book.id)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.3 }}
            >
              <BookOpen size={14} />
              <span>Borrow</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onReserve(book._id || book.id)}
              className="btn btn-secondary btn-sm"
              style={{
                flex: 1.3,
                background: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                color: '#fbbf24'
              }}
            >
              <Bookmark size={14} />
              <span>Reserve Hold</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

