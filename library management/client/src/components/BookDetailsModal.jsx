import React, { useEffect } from 'react';
import { X, MapPin, Calendar, BookCheck, ShieldAlert, Layers, BookOpen, Bookmark, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function BookDetailsModal({
  book,
  onClose,
  onBorrow,
  onReserve,
  onReturn,
  onOpenFloorMap,
  isBorrowedByMe = false,
  currentUser
}) {
  useEffect(() => {
    if (!book) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, onClose]);

  if (!book) return null;

  const availableCopies = book.availableCopies ?? 0;
  const isAvailable = availableCopies > 0 && book.status !== 'RESERVED OUT';

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
            Book Specification & Shelf Record
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            {/* Cover */}
            <div style={{
              width: '150px',
              height: '210px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)'
            }}>
              <img
                src={book.coverImage || book.coverImageUrl || 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg'}
                alt={book.title}
                onError={(e) => {
                  e.currentTarget.src = 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0f172a' }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {isBorrowedByMe ? (
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid rgba(52, 211, 153, 0.6)' }}>
                    <CheckCircle2 size={12} className="mr-0.5 inline" /> Borrowed By You
                  </span>
                ) : (
                  <span className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
                    {isAvailable ? `${availableCopies} Copies Available` : 'All Checked Out'}
                  </span>
                )}
                {book.category && <span className="badge badge-role">{book.category}</span>}
                {book.categories?.map((cat) => (
                  <span key={cat} className="badge badge-role">{cat}</span>
                ))}
              </div>

              <h2 style={{ fontSize: '1.4rem', lineHeight: 1.25, marginBottom: '6px' }}>
                {book.title}
              </h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
                by {book.author || (Array.isArray(book.authors) ? book.authors.join(', ') : book.authors)}
              </div>

              {/* Faculty Course Reserve Golden Banner */}
              {book.facultyReserve && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: '#fef08a'
                }}>
                  <div>
                    <strong>⭐ Recommended by {book.facultyReserve.professorName}</strong> for {book.facultyReserve.examLabel}
                    {book.facultyReserve.recommendationNote && (
                      <div style={{ fontSize: '0.75rem', color: '#fde047', marginTop: '2px', fontStyle: 'italic' }}>
                        "{book.facultyReserve.recommendationNote}"
                      </div>
                    )}
                  </div>
                  {book.facultyReserve.restrictedReadingOnly && (
                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid rgba(248, 113, 113, 0.4)', flexShrink: 0 }}>
                      🔒 In-Library Reference Reading Only
                    </span>
                  )}
                </div>
              )}

              {/* Shelf Location Grid with 2D Map Button */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  fontSize: '0.8rem',
                  marginBottom: '10px'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>AISLE</div>
                    <div style={{ fontWeight: 600, color: '#06b6d4' }}>{book.shelfLocation?.aisle || 'A-1'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>RACK</div>
                    <div style={{ fontWeight: 600, color: '#06b6d4' }}>{book.shelfLocation?.rack || 'R-01'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>SHELF</div>
                    <div style={{ fontWeight: 600, color: '#06b6d4' }}>{book.shelfLocation?.shelfNumber || 'S-1'}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenFloorMap) onOpenFloorMap(book);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.78rem', color: '#67e8f9', borderColor: 'rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.1)' }}
                >
                  <MapPin size={13} color="#06b6d4" />
                  <span>Launch 2D Floor Plan Navigator ("Find My Shelf")</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-main)' }}>Summary & Abstract</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {book.description || 'Standard university academic reference and curriculum textbook.'}
            </p>
          </div>

          {/* Meta Specifications */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '0.85rem',
            background: 'var(--bg-surface)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>ISBN: </span>
              <span style={{ fontFamily: 'monospace' }}>{book.isbn}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Publisher: </span>
              <span>{book.publisher || 'Academic Press'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Publication Year: </span>
              <span>{book.publicationYear || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Total Holdings: </span>
              <span>{book.totalCopies || 5} physical copies</span>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {isBorrowedByMe ? (
              <button
                type="button"
                onClick={() => onReturn(book._id || book.id)}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                  fontSize: '0.95rem'
                }}
              >
                <RotateCcw size={18} />
                <span>Return This Book to Library</span>
              </button>
            ) : isAvailable ? (
              <button
                type="button"
                onClick={() => onBorrow(book._id || book.id)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <BookOpen size={18} />
                <span>Borrow This Book (14-Day Loan)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReserve(book._id || book.id)}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24'
                }}
              >
                <Bookmark size={18} />
                <span>Join Waitlist / Reserve Hold</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
