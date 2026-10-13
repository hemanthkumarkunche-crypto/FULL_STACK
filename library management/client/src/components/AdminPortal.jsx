import React, { useState, useEffect } from 'react';
import {
  Database, Plus, Trash2, Edit3, CheckCircle, AlertTriangle,
  ArrowRight, DollarSign, BookOpen, Users, Clock, Search, X, Check
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPortal({ currentUser, onInventoryUpdated }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [overdueList, setOverdueList] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [returnDeskRecord, setReturnDeskRecord] = useState(null);
  const [returnCondition, setReturnCondition] = useState('GOOD');

  // Manual Check-out form state
  const [deskUserId, setDeskUserId] = useState('');
  const [deskBookId, setDeskBookId] = useState('');
  const [deskMessage, setDeskMessage] = useState('');

  // Book form fields
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    authors: '',
    publisher: '',
    publicationYear: 2024,
    categories: '',
    description: '',
    coverImageUrl: '',
    totalCopies: 3,
    shelfLocation: { aisle: 'A-1', rack: 'R-01', shelfNumber: 'S-1' }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, overRes, loansRes, booksRes, usersRes] = await Promise.all([
        api.getSummaryReport(),
        api.getOverdueDefaulters(),
        api.getAllCirculationRecords(),
        api.getBooks(),
        api.getUsers()
      ]);
      setSummary(sumRes.summary);
      setOverdueList(overRes.overdueLoans || []);
      setAllLoans(loansRes.records || []);
      setBooks(booksRes.books || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdateBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await api.updateBook(editingBook._id, formData);
      } else {
        await api.createBook(formData);
      }
      setShowAddBook(false);
      setEditingBook(null);
      loadData();
      onInventoryUpdated?.();
    } catch (err) {
      alert(err.message || 'Error saving book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this book from active catalog?')) return;
    try {
      await api.deleteBook(bookId);
      loadData();
      onInventoryUpdated?.();
    } catch (err) {
      alert(err.message || 'Failed to delete book');
    }
  };

  const handleProcessReturn = async () => {
    if (!returnDeskRecord) return;
    try {
      const res = await api.returnBook(returnDeskRecord._id, returnCondition);
      alert(`Book checked in successfully! ${res.fineAmount > 0 ? `Late fine assessed: $${res.fineAmount.toFixed(2)}` : 'No fines.'}`);
      setReturnDeskRecord(null);
      loadData();
      onInventoryUpdated?.();
    } catch (err) {
      alert(err.message || 'Error processing return');
    }
  };

  const handleDeskCheckout = async (e) => {
    e.preventDefault();
    setDeskMessage('');
    if (!deskUserId || !deskBookId) {
      setDeskMessage('Please select both a member and a book.');
      return;
    }
    try {
      await api.borrowBook(deskBookId, deskUserId);
      setDeskMessage('Check-out completed successfully! 14-day loan recorded.');
      setDeskBookId('');
      loadData();
      onInventoryUpdated?.();
    } catch (err) {
      setDeskMessage(`Failed: ${err.message}`);
    }
  };

  const startEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      isbn: book.isbn,
      title: book.title,
      authors: book.authors?.join(', '),
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || 2024,
      categories: book.categories?.join(', '),
      description: book.description || '',
      coverImageUrl: book.coverImageUrl || '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      shelfLocation: book.shelfLocation || { aisle: 'A-1', rack: 'R-01', shelfNumber: 'S-1' }
    });
    setShowAddBook(true);
  };

  return (
    <div>
      {/* Admin Sub Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        marginBottom: '28px'
      }}>
        {[
          { id: 'overview', label: '📊 System Overview' },
          { id: 'inventory', label: '📚 Inventory Catalog' },
          { id: 'circulation', label: '🔄 Issue & Return Desk' },
          { id: 'defaulters', label: `⚠️ Overdue Defaulters (${overdueList.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn btn-secondary btn-sm"
            style={{
              background: activeTab === tab.id ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              border: activeTab === tab.id ? 'none' : '1px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading administrative metrics...
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && summary && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
              }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Catalog Titles</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{summary.totalTitles}</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Members</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{summary.totalMembers}</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Loans In Circulation</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: '#818cf8' }}>{summary.activeLoans}</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delinquent Overdues</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: summary.totalOverdue > 0 ? '#f87171' : '#34d399' }}>
                    {summary.totalOverdue}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outstanding Fines</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: '#fbbf24' }}>
                    ${summary.totalFinesUnpaid?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Category Holdings Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {summary.categoryBreakdown?.map((cat) => (
                    <div
                      key={cat._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{cat._id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{cat.count} unique titles</div>
                      </div>
                      <span className="badge badge-role">{cat.totalCopies} copies</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY CATALOG (CRUD) */}
          {activeTab === 'inventory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Library Book Holdings</h3>
                <button
                  onClick={() => {
                    setEditingBook(null);
                    setFormData({
                      isbn: '',
                      title: '',
                      authors: '',
                      publisher: '',
                      publicationYear: 2024,
                      categories: '',
                      description: '',
                      coverImageUrl: '',
                      totalCopies: 3,
                      shelfLocation: { aisle: 'A-1', rack: 'R-01', shelfNumber: 'S-1' }
                    });
                    setShowAddBook(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} />
                  <span>Add New Book</span>
                </button>
              </div>

              <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '10px 8px' }}>TITLE & AUTHOR</th>
                      <th style={{ padding: '10px 8px' }}>ISBN</th>
                      <th style={{ padding: '10px 8px' }}>LOCATION</th>
                      <th style={{ padding: '10px 8px' }}>COPIES (AVAIL / TOTAL)</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: 600 }}>{b.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.authors?.join(', ')}</div>
                        </td>
                        <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>{b.isbn}</td>
                        <td style={{ padding: '12px 8px' }}>
                          {b.shelfLocation?.aisle}-{b.shelfLocation?.rack}-{b.shelfLocation?.shelfNumber}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`badge ${b.availableCopies > 0 ? 'badge-available' : 'badge-unavailable'}`}>
                            {b.availableCopies} / {b.totalCopies} Available
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => startEditBook(b)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Details"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(b._id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#f87171' }}
                              title="Remove Book"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CIRCULATION DESK (ISSUE & RETURN) */}
          {activeTab === 'circulation' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px' }}>
              {/* Check-Out Desk */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Circulation Check-Out Desk</h3>
                {deskMessage && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: deskMessage.includes('Failed') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: deskMessage.includes('Failed') ? '#fca5a5' : '#6ee7b7',
                    marginBottom: '16px',
                    fontSize: '0.85rem'
                  }}>
                    {deskMessage}
                  </div>
                )}
                <form onSubmit={handleDeskCheckout}>
                  <div className="form-group">
                    <label className="form-label">Select Registered Patron</label>
                    <select
                      className="form-select"
                      value={deskUserId}
                      onChange={(e) => setDeskUserId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {users.filter(u => u.role === 'MEMBER').map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.firstName} {u.lastName} ({u.memberId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Book to Issue</label>
                    <select
                      className="form-select"
                      value={deskBookId}
                      onChange={(e) => setDeskBookId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Available Title --</option>
                      {books.filter(b => b.availableCopies > 0).map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.title} (Available: {b.availableCopies})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    Process Loan Check-Out (14 Days)
                  </button>
                </form>
              </div>

              {/* Active Checked-Out Loans to Return */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Active Loans Awaiting Return</h3>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {allLoans.filter(l => l.status === 'BORROWED' || l.status === 'OVERDUE').map((loan) => (
                    <div
                      key={loan._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 16px',
                        marginBottom: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{loan.book?.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Patron: {loan.user?.firstName} {loan.user?.lastName} ({loan.user?.memberId})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: new Date() > new Date(loan.dueDate) ? '#f87171' : 'var(--text-dim)' }}>
                          Due: {new Date(loan.dueDate).toLocaleDateString()}
                        </div>
                      </div>

                      <button
                        onClick={() => setReturnDeskRecord(loan)}
                        className="btn btn-primary btn-sm"
                      >
                        Check In / Return
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OVERDUE DEFAULTERS */}
          {activeTab === 'defaulters' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Delinquent Overdue Accounts</h3>
                <span className="badge badge-unavailable">{overdueList.length} Defaulters</span>
              </div>

              {overdueList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  All circulating loans are currently in good standing!
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)' }}>
                        <th style={{ padding: '10px 8px' }}>MEMBER</th>
                        <th style={{ padding: '10px 8px' }}>OVERDUE TITLE</th>
                        <th style={{ padding: '10px 8px' }}>DUE DATE</th>
                        <th style={{ padding: '10px 8px' }}>DAYS LATE</th>
                        <th style={{ padding: '10px 8px' }}>ESTIMATED FINE</th>
                        <th style={{ padding: '10px 8px', textAlign: 'right' }}>CONTACT ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueList.map((loan) => (
                        <tr key={loan._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ fontWeight: 600 }}>{loan.user?.firstName} {loan.user?.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.user?.email}</div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>{loan.book?.title}</td>
                          <td style={{ padding: '12px 8px', color: '#f87171' }}>
                            {new Date(loan.dueDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: 700, color: '#f87171' }}>
                            +{loan.daysOverdue} days
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: 600, color: '#fbbf24' }}>
                            ${loan.estimatedFine.toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <button
                              onClick={() => alert(`Email reminder dispatched to ${loan.user?.email}`)}
                              className="btn btn-secondary btn-sm"
                            >
                              Dispatch Reminder Notice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Return Modal */}
      {returnDeskRecord && (
        <div className="modal-backdrop" onClick={() => setReturnDeskRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Process Book Check-In</h3>
            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Checking in: <strong style={{ color: 'var(--text-main)' }}>{returnDeskRecord.book?.title}</strong>
              <br />
              Patron: {returnDeskRecord.user?.firstName} {returnDeskRecord.user?.lastName}
            </div>

            <div className="form-group">
              <label className="form-label">Return Physical Condition</label>
              <select
                className="form-select"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
              >
                <option value="GOOD">Good / Intact</option>
                <option value="DAMAGED">Damaged / Missing Cover</option>
                <option value="NEEDS_BINDING">Needs Binding / Maintenance</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setReturnDeskRecord(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleProcessReturn} className="btn btn-primary" style={{ flex: 1 }}>
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {showAddBook && (
        <div className="modal-backdrop" onClick={() => setShowAddBook(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                {editingBook ? 'Edit Book Record' : 'Add New Book to Inventory'}
              </h3>
              <button onClick={() => setShowAddBook(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateBook} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">ISBN-10 / 13</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    required
                    disabled={!!editingBook}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Physical Copies</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Authors (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Categories (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science, Algorithms"
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Publication Year</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Summary</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px', padding: '12px' }}>
                {editingBook ? 'Save Modifications' : 'Create Book Asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
