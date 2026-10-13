import React, { useState } from 'react';
import {
  Sparkles, Search, BookOpen, Layers, MapPin, ArrowRight,
  Bookmark, CheckCircle2, ChevronRight, X, ExternalLink, Hash
} from 'lucide-react';

export default function AISyllabusFinder({
  isOpen,
  onClose,
  books = [],
  onSelectBook,
  onOpenFloorMap,
  onQuickBorrow
}) {
  const [topicQuery, setTopicQuery] = useState('');

  // Sample prompt chips for quick student exploration
  const SAMPLE_TOPICS = [
    "Dijkstra's Shortest Path",
    "Laplace Transforms",
    "MOSFET Biasing",
    "Deadlocks & Banker's Algorithm",
    "Normalization 3NF & BCNF",
    "Convolutional Neural Networks",
    "TCP 3-Way Handshake",
    "Pointers and Dynamic Memory"
  ];

  // Search indexed chapters across all books
  const performSearch = (query) => {
    const q = (query || topicQuery).trim().toLowerCase();
    if (!q) return [];

    const results = [];

    books.forEach((book) => {
      if (!book.chapters || !Array.isArray(book.chapters)) return;

      book.chapters.forEach((chap) => {
        let matchScore = 0;
        const matchedTopics = [];

        // Check chapter title
        if (chap.title.toLowerCase().includes(q)) {
          matchScore += 45;
        }

        // Check topics array
        chap.topics?.forEach((top) => {
          if (top.toLowerCase().includes(q) || q.includes(top.toLowerCase())) {
            matchScore += 50;
            matchedTopics.push(top);
          } else {
            // Token match
            const qWords = q.split(/\s+/);
            const topWords = top.toLowerCase().split(/\s+/);
            const wordOverlap = qWords.filter((w) => w.length > 2 && topWords.includes(w));
            if (wordOverlap.length > 0) {
              matchScore += wordOverlap.length * 20;
              matchedTopics.push(top);
            }
          }
        });

        // Check book title
        if (book.title.toLowerCase().includes(q)) {
          matchScore += 25;
        }

        if (matchScore > 0) {
          results.push({
            book,
            chapter: chap,
            matchScore: Math.min(99, Math.max(72, matchScore)),
            matchedTopics: Array.from(new Set(matchedTopics))
          });
        }
      });
    });

    return results.sort((a, b) => b.matchScore - a.matchScore);
  };

  const results = performSearch(topicQuery);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl h-full bg-slate-900 border-l border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>AI Syllabus Index & Chapter Topic Matcher</span>
                </h3>
                <div className="text-[11px] text-slate-400">
                  Semantic university curriculum and textbook section search
                </div>
              </div>
            </div>

            <button
              type="button"
              id="close-ai-syllabus-drawer-btn"
              onClick={onClose}
              aria-label="Close AI Syllabus Drawer"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Box Input */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              id="ai-topic-search-input"
              value={topicQuery}
              onChange={(e) => setTopicQuery(e.target.value)}
              placeholder="Enter syllabus topic (e.g. Dijkstra, Laplace, MOSFET, Deadlocks)..."
              className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl text-xs md:text-sm text-white placeholder-slate-500 outline-none transition shadow-inner"
              autoFocus
            />
            {topicQuery && (
              <button
                type="button"
                onClick={() => setTopicQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Query Topic Chips */}
          <div className="mt-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Popular Exam Syllabus Topics
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setTopicQuery(topic)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    topicQuery === topic
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Results Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!topicQuery.trim() ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles size={24} />
              </div>
              <h4 className="text-sm font-bold text-white">
                Deep Textbook Chapter Index Search
              </h4>
              <p className="text-xs max-w-sm mx-auto text-slate-400 leading-relaxed">
                Type an engineering or science syllabus concept above or pick one of the quick chips. Our AI index will surface the exact chapter, page range, and physical shelf coordinate.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <BookOpen size={32} className="mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-white">No indexed chapters matched "{topicQuery}"</h4>
              <p className="text-xs text-slate-500">
                Try searching for related mathematical terms, algorithm names, or circuit topologies.
              </p>
            </div>
          ) : (
            <div>
              <div className="text-xs text-slate-400 mb-3 flex items-center justify-between font-semibold">
                <span>Matched {results.length} Textbook Chapter Readings</span>
                <span className="text-indigo-400">Ranked by Syllabus Relevance</span>
              </div>

              <div className="space-y-4">
                {results.map(({ book, chapter, matchScore, matchedTopics }, idx) => (
                  <div
                    key={`${book.id}-${chapter.chapterNumber}-${idx}`}
                    className="p-4 bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition shadow-lg space-y-3"
                  >
                    {/* Header: Book Title + Relevance Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          {book.category} • Call No: {book.callNumber || 'Standard Stacks'}
                        </div>
                        <h4
                          onClick={() => {
                            if (onSelectBook) onSelectBook(book);
                            onClose();
                          }}
                          className="text-sm font-extrabold text-white hover:text-indigo-200 transition cursor-pointer truncate"
                          title={book.title}
                        >
                          {book.title}
                        </h4>
                        <div className="text-xs text-slate-400">
                          by {book.author}
                        </div>
                      </div>

                      <div className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Sparkles size={10} />
                        <span>{matchScore}% Match</span>
                      </div>
                    </div>

                    {/* Exact Chapter & Page Range Callout */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                          <Hash size={13} /> Chapter {chapter.chapterNumber}: {chapter.title}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Pages {chapter.pages}
                        </span>
                      </div>

                      {/* Matched Concepts */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chapter.topics?.map((top, tIdx) => (
                          <span
                            key={tIdx}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                              top.toLowerCase().includes(topicQuery.toLowerCase())
                                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 font-bold'
                                : 'bg-slate-950 text-slate-400'
                            }`}
                          >
                            {top}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Shelf Location Pin & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin size={13} className="text-cyan-400 shrink-0" />
                        <span>{book.location || 'Aisle A-1 • Rack R-01'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenFloorMap) onOpenFloorMap(book);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition cursor-pointer"
                        >
                          Find Shelf 📍
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectBook) onSelectBook(book);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition cursor-pointer"
                        >
                          View Book Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
