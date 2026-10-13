import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, ArrowUpDown, Filter, BookMarked } from 'lucide-react';
import BookCard from './BookCard';
import SemesterSyllabusMatcher from './SemesterSyllabusMatcher';
import { initialBooksData, CATEGORIES } from '../data/booksData';

// Maintain backwards-compatible export for any consumers
export const booksData = initialBooksData;

export default function BookCatalog({
  books = [],
  loading = false,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  availableOnly,
  setAvailableOnly,
  sortBy,
  setSortBy,
  onSelectBook,
  onQuickBorrow,
  onQuickReserve,
  onQuickReturn,
  onOpenFloorMap,
  onOpenAISyllabus,
  onBatchReserveBundle,
  myLoans = [],
  currentUser
}) {
  const [showSyllabusMatcher, setShowSyllabusMatcher] = useState(true);
  const displayBooks = books.length > 0 ? books : initialBooksData;

  return (
    <div>
      {/* Feature 1: Smart Semester & Branch Syllabus Auto-Matcher Section */}
      {currentUser && (
        <div className="mb-4">
          <SemesterSyllabusMatcher
            currentUser={currentUser}
            books={displayBooks}
            myLoans={myLoans}
            onSelectBook={onSelectBook}
            onQuickBorrow={onQuickBorrow}
            onQuickReserve={onQuickReserve}
            onBatchReserveBundle={onBatchReserveBundle}
            onOpenFloorMap={onOpenFloorMap}
          />
        </div>
      )}

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.22), rgba(6, 182, 212, 0.16))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '36px 32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(99, 102, 241, 0.25)',
            border: '1px solid rgba(99, 102, 241, 0.45)',
            color: '#c7d2fe',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '14px'
          }}>
            <Sparkles size={14} color="#818cf8" />
            University Academic Library Repository
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '12px', lineHeight: 1.15, fontWeight: 800 }}>
            Academic Engineering & Science Textbooks
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Access standard reference curricula in Computer Science, Software Engineering, AI, Mathematics, Electronics, and Networks. Check physical shelf locations and borrow directly online.
          </p>

          {/* Search Box Row with AI Syllabus Finder Quick Launch */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              flex: 1,
              minWidth: '280px',
              display: 'flex',
              alignItems: 'center',
              background: '#131b2e',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '10px 16px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
            }}>
              <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <input
                type="text"
                id="catalog-search-input"
                placeholder="Search by title (e.g. Algorithms), author (e.g. Cormen), or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Feature 5 Drawer Trigger Button */}
            <button
              type="button"
              id="ai-topic-search-drawer-trigger-btn"
              onClick={onOpenAISyllabus}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 border border-cyan-500/40 shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              title="Open AI Syllabus Index & Chapter Topic Matcher"
            >
              <Sparkles size={16} className="text-cyan-300" />
              <span>AI Syllabus Topic Matcher</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px',
        background: 'var(--bg-surface)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                background: selectedCategory === cat ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toggles & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              id="available-only-checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }}
            />
            Available Only
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="newest">Latest Editions</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Standard Academic Book Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Loading academic catalog...</div>
          <div style={{ fontSize: '0.85rem' }}>Fetching real-time inventory from library database</div>
        </div>
      ) : displayBooks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-surface)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <BookOpen size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No textbooks match your query</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Try adjusting your search terms or selecting "All" categories.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '24px'
        }}>
          {displayBooks.map((book) => {
            const bookIdentifier = book._id || book.id;
            const isBorrowed = myLoans?.some((loan) => {
              const loanBookId = loan.book?._id || loan.bookId || loan._id || loan.id;
              return loanBookId === bookIdentifier || loan.book?.title === book.title;
            });

            return (
              <BookCard
                key={bookIdentifier}
                book={book}
                onSelect={onSelectBook}
                onBorrow={onQuickBorrow}
                onReserve={onQuickReserve}
                onReturn={onQuickReturn}
                onOpenFloorMap={onOpenFloorMap}
                isBorrowedByMe={isBorrowed}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
