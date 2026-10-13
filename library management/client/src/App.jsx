import React, { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import Navbar from './components/Navbar';
import BookCatalog from './components/BookCatalog';
import BookDetailsModal from './components/BookDetailsModal';
import MemberDashboard from './components/MemberDashboard';
import DigitalLibraryPass from './components/DigitalLibraryPass';
import AdminPortal from './components/AdminPortal';
import UniversityPortalLogin from './components/UniversityPortalLogin';
import NotificationDrawer from './components/NotificationDrawer';
import FloorNavigatorModal from './components/FloorNavigatorModal';
import FacultyDesk from './components/FacultyDesk';
import HandoverModal from './components/HandoverModal';
import AISyllabusFinder from './components/AISyllabusFinder';
import KarmaHistoryModal from './components/KarmaHistoryModal';
import MembershipActivationModal from './components/MembershipActivationModal';
import { initialBooksData } from './data/booksData';
import { getKarmaProfile, addKarmaRecord, KARMA_TIERS } from './utils/karmaManager';
import { api } from './services/api';

const INITIAL_FACULTY_RESERVES = [
  {
    id: 'fres_seed_1',
    bookId: 3,
    bookTitle: 'Operating System Concepts',
    author: 'Abraham Silberschatz, Peter B. Galvin',
    professorId: '4502',
    professorName: 'Prof. S. R. Ramanathan',
    professorDesignation: 'Associate Professor',
    courseCode: 'CS303',
    courseTitle: 'Operating Systems Principles',
    examLabel: 'Mid-Sem Prep',
    expiryDate: '2026-11-25',
    restrictedReadingOnly: true,
    recommendationNote: 'Required reading for Kernel Concurrency and Deadlocks questions.',
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'fres_seed_2',
    bookId: 1,
    bookTitle: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    professorId: '2105',
    professorName: 'Prof. Elena Rostova',
    professorDesignation: 'Senior Professor',
    courseCode: 'CS301',
    courseTitle: 'Data Structures & Algorithms',
    examLabel: 'Mid-Sem Prep',
    expiryDate: '2026-11-20',
    restrictedReadingOnly: false,
    recommendationNote: 'Focus on Single-Source Shortest Paths and Dynamic Programming algorithms.',
    createdAt: '2026-10-03T11:00:00.000Z'
  }
];

export default function App() {
  // 1. Gatekeeper Workflow (Authentication State)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('library_token');
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('library_user_profile');
    if (!saved) return null;
    try {
      const user = JSON.parse(saved);
      const isFaculty = user._decoded?.idType === 'FACULTY' ||
        (Number(user.memberId) > 0 && Number(user.memberId) <= 15000) ||
        user.role === 'FACULTY';

      if (isFaculty) {
        user.isMembershipActive = true;
        user.membershipStatus = 'ACTIVE FACULTY SCHOLAR';
        user.membershipPlan = 'KL University Faculty Complimentary Pass';
        user.borrowQuota = user.borrowQuota ?? 10;
        user.loanPeriodDays = 30;
      } else if (user.memberId) {
        const memStatus = localStorage.getItem(`membership_active_${user.memberId}`);
        if (memStatus === 'true') {
          user.isMembershipActive = true;
          user.membershipStatus = 'ACTIVE SCHOLAR';
        } else if (user.isMembershipActive === undefined) {
          user.isMembershipActive = false;
          user.membershipStatus = 'PENDING PAYMENT (₹50)';
        }
      }
      return user;
    } catch {
      return null;
    }
  });

  // Navigation tab for authenticated view: 'catalog' | 'dashboard' | 'admin' | 'faculty'
  const [currentTab, setCurrentTab] = useState('catalog');

  // Book catalog state & faculty reserves state
  const [facultyReserves, setFacultyReserves] = useState(() => {
    const saved = localStorage.getItem('athenaeum_faculty_reserves');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY_RESERVES;
  });

  const [rawBooks, setRawBooks] = useState(initialBooksData);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Modals & Panels state
  const [selectedBook, setSelectedBook] = useState(null);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // ₹50 Universal Institutional Membership System State
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [membershipModalMessage, setMembershipModalMessage] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Feature 2: Floor Navigator Modal State
  const [floorNavBook, setFloorNavBook] = useState(null);
  const [isFloorNavOpen, setIsFloorNavOpen] = useState(false);

  // Feature 4: Campus P2P Handover State
  const [handoverBook, setHandoverBook] = useState(null);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  // Feature 5: AI Syllabus Index Drawer State
  const [isAISyllabusOpen, setIsAISyllabusOpen] = useState(false);

  // Feature 6: Karma Profile & History Modal State
  const [karmaProfile, setKarmaProfile] = useState(null);
  const [isKarmaModalOpen, setIsKarmaModalOpen] = useState(false);

  // Member circulation state (Loans, Reservations, Notifications)
  const [myLoans, setMyLoans] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Set browser tab document title
  useEffect(() => {
    document.title = 'KL University — Central Library Portal';
  }, []);

  // Synchronize karma profile whenever user logs in or ID changes
  useEffect(() => {
    if (currentUser?.memberId) {
      setKarmaProfile(getKarmaProfile(currentUser.memberId));
    }
  }, [currentUser]);

  // Persist faculty course reserves
  useEffect(() => {
    localStorage.setItem('athenaeum_faculty_reserves', JSON.stringify(facultyReserves));
  }, [facultyReserves]);

  // Attach faculty reserves dynamically to books
  const books = rawBooks.map((b) => {
    const bId = b._id || b.id;
    const matchedReserve = facultyReserves.find((r) => String(r.bookId) === String(bId));
    return {
      ...b,
      facultyReserve: matchedReserve || null
    };
  });

  // Fetch book catalog from API
  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (availableOnly) params.availableOnly = 'true';
      if (sortBy) params.sort = sortBy;

      const data = await api.getBooks(params);
      if (data.books && data.books.length > 0) {
        // Merge with enriched chapter and coordinate metadata from initialBooksData
        const merged = data.books.map((b) => {
          const match = initialBooksData.find((init) => init.isbn === b.isbn || init.title === b.title);
          return match ? { ...match, ...b } : b;
        });
        setRawBooks(merged);
      } else {
        setRawBooks(initialBooksData);
      }
    } catch (err) {
      console.warn('Backend books sync fallback to enriched catalog:', err.message);
      setRawBooks(initialBooksData);
    } finally {
      setLoadingBooks(false);
    }
  };

  // Sync member records when logged in
  const fetchMemberCirculation = async () => {
    if (!currentUser) return;
    try {
      const [circRes, notifRes] = await Promise.all([
        api.getMyLoans(),
        api.getNotifications()
      ]);
      if (circRes?.loans?.length > 0) {
        setMyLoans(circRes.loans);
      }
      if (circRes?.reservations?.length > 0) {
        setMyReservations(circRes.reservations);
      }
      if (notifRes?.notifications?.length > 0) {
        setNotifications(notifRes.notifications);
        setUnreadCount(notifRes.unreadCount || 0);
      }
    } catch (err) {
      console.log('Member circulation running in local active session mode.');
    }
  };

  // Fetch books on filter change when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchBooks();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, searchTerm, selectedCategory, availableOnly, sortBy]);

  // Load circulation records on user login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchMemberCirculation();
    }
  }, [isAuthenticated, currentUser]);

  // Sign out handler
  const handleSignOut = () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user_profile');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentTab('catalog');
    setPassModalOpen(false);
    setNotificationsOpen(false);
    setSelectedBook(null);
    setIsFloorNavOpen(false);
    setIsHandoverOpen(false);
    setIsAISyllabusOpen(false);
    setIsKarmaModalOpen(false);
    setMyLoans([]);
    setMyReservations([]);
  };

  // Feature 2: Open Interactive Floor Plan Navigator
  const handleOpenFloorMap = (book) => {
    setFloorNavBook(book);
    setIsFloorNavOpen(true);
  };

  // Interactive Book Borrowing (Checks Karma privileges & restrictions)
  const handleBorrow = async (bookId) => {
    if (!currentUser) return;

    const isFacultyUser = currentUser._decoded?.idType === 'FACULTY' ||
      (Number(currentUser.memberId) > 0 && Number(currentUser.memberId) <= 15000) ||
      currentUser.role === 'FACULTY';

    // 0. Borrow Lock ONLY for unactivated students:
    if (!isFacultyUser && !currentUser.isMembershipActive) {
      setMembershipModalMessage('Please activate your ₹50 annual library membership to issue books.');
      setIsMembershipModalOpen(true);
      return;
    }

    const targetBook = books.find((b) => (b._id === bookId || b.id === bookId));
    const bookTitle = targetBook?.title || 'Academic Textbook';

    // 1. Check if book has faculty restriction: Reference Reading Only
    if (targetBook?.facultyReserve?.restrictedReadingOnly && !isFacultyUser) {
      alert(`Borrow restricted: "${bookTitle}" is tagged by ${targetBook.facultyReserve.professorName} for ${targetBook.facultyReserve.examLabel} as In-Library Reference Reading Only.`);
      return;
    }

    // 2. Check if user already borrowed this book
    const alreadyBorrowed = myLoans.some((l) => {
      const bId = l.book?._id || l.bookId || l._id || l.id;
      return bId === bookId || l.book?.title === bookTitle;
    });

    if (alreadyBorrowed) {
      alert(`You currently have "${bookTitle}" checked out!`);
      return;
    }

    // 3. Check loan slot quota (10 books for Faculty, 5 + bonus slots for Students)
    const baseQuota = isFacultyUser ? 10 : (currentUser.borrowQuota || 5);
    const bonusSlots = isFacultyUser ? 0 : (karmaProfile?.tier?.extraSlots || 0);
    const totalMaxQuota = baseQuota + bonusSlots;
    if (myLoans.length >= totalMaxQuota) {
      alert(`Borrow limit reached (${myLoans.length}/${totalMaxQuota} books). Return a title to check out new books.`);
      return;
    }

    // 4. Calculate loan period (30 days for Faculty, 14 days for Students)
    const loanDurationDays = isFacultyUser ? 30 : (karmaProfile?.tier?.loanDays || 14);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDurationDays);

    // 5. Decrement available copies in book state
    setRawBooks((prev) =>
      prev.map((b) =>
        (b._id === bookId || b.id === bookId)
          ? { ...b, availableCopies: Math.max(0, (b.availableCopies ?? 1) - 1) }
          : b
      )
    );

    // 6. Create active loan item
    const newLoan = {
      _id: 'loan_' + Date.now(),
      bookId: bookId,
      book: targetBook || { _id: bookId, title: bookTitle },
      title: bookTitle,
      borrowedAt: new Date(),
      dueDate: dueDate,
      status: 'BORROWED'
    };
    setMyLoans((prev) => [newLoan, ...prev]);

    // 7. Try backend sync
    try {
      await api.borrowBook(bookId, currentUser._id);
    } catch (apiErr) {
      // Optimistic loan recorded
    }

    // 8. Add notification
    setNotifications((prev) => [
      {
        _id: 'notif_' + Date.now(),
        type: 'BORROW_SUCCESS',
        title: 'Book Borrowed Successfully',
        message: `You borrowed "${bookTitle}". Due in ${loanDurationDays} days (${dueDate.toLocaleDateString()}).`,
        createdAt: new Date()
      },
      ...prev
    ]);
    setUnreadCount((c) => c + 1);

    setSelectedBook(null);
    alert(`Success! "${bookTitle}" has been checked out to ID: ${currentUser.memberId}. Return due in ${loanDurationDays} days.`);
  };

  // Interactive Book Returning (Checks for waitlist to trigger Feature 4 P2P Handover & awards Karma)
  const handleReturn = async (bookId) => {
    if (!currentUser) return;

    const targetBook = books.find((b) => (b._id === bookId || b.id === bookId));
    const targetLoan = myLoans.find((l) => {
      const bId = l.book?._id || l.bookId || l._id || l.id;
      return bId === bookId || l.book?.title === targetBook?.title;
    });

    const bookTitle = targetBook?.title || targetLoan?.book?.title || targetLoan?.title || 'Academic Textbook';

    // Feature 4 Check: If this book has an active waitlist user or waitlistCount > 0, offer Peer-to-Peer Campus Handover
    const hasWaitlist = (targetBook?.waitlistCount ?? 0) > 0 || !!targetBook?.activeWaitlistUser;
    if (hasWaitlist) {
      setHandoverBook(targetBook || { _id: bookId, title: bookTitle });
      setIsHandoverOpen(true);
      return;
    }

    // Standard drop-off return
    executeReturnProcess(bookId, bookTitle, targetLoan);
  };

  const executeReturnProcess = (bookId, bookTitle, targetLoan) => {
    // 1. Increment available copies
    setRawBooks((prev) =>
      prev.map((b) =>
        (b._id === bookId || b.id === bookId || b.title === bookTitle)
          ? { ...b, availableCopies: (b.availableCopies ?? 0) + 1 }
          : b
      )
    );

    // 2. Remove from myLoans
    setMyLoans((prev) =>
      prev.filter((l) => {
        const bId = l.book?._id || l.bookId || l._id || l.id;
        return !(bId === bookId || l.book?.title === bookTitle);
      })
    );

    // 3. Award +10 On-Time Karma points
    if (currentUser?.memberId) {
      const updatedProfile = addKarmaRecord(currentUser.memberId, 10, 'On-Time Circulation Desk Return', bookTitle);
      setKarmaProfile(updatedProfile);
    }

    // 4. Backend sync
    try {
      if (targetLoan?._id && !targetLoan._id.startsWith('loan_')) {
        api.returnBook(targetLoan._id);
      }
    } catch (apiErr) {
      // Optimistic return handled
    }

    // 5. Add notification
    setNotifications((prev) => [
      {
        _id: 'notif_' + Date.now(),
        type: 'RETURN_SUCCESS',
        title: 'Book Returned (+10 Karma)',
        message: `"${bookTitle}" returned to circulation. +10 Karma points added to your score!`,
        createdAt: new Date()
      },
      ...prev
    ]);
    setUnreadCount((c) => c + 1);

    setSelectedBook(null);
    alert(`Success! "${bookTitle}" returned to the library. +10 Library Karma awarded!`);
  };

  // Feature 4: Confirm Direct P2P Campus Handover Transfer
  const handleConfirmDirectTransfer = (book, waitlistStudent, pairingCode) => {
    const bookIdentifier = book._id || book.id;
    const bookTitle = book.title;

    // 1. Remove from User A's active loans
    setMyLoans((prev) =>
      prev.filter((l) => {
        const bId = l.book?._id || l.bookId || l._id || l.id;
        return !(bId === bookIdentifier || l.book?.title === bookTitle);
      })
    );

    // 2. Award User A +15 Karma Points for Zero-Shelf Queue Transfer!
    if (currentUser?.memberId) {
      const updatedProfile = addKarmaRecord(
        currentUser.memberId,
        15,
        `Zero-Shelf Campus Handover to ${waitlistStudent.name} (${waitlistStudent.id})`,
        bookTitle
      );
      setKarmaProfile(updatedProfile);
    }

    // 3. Add notification
    setNotifications((prev) => [
      {
        _id: 'notif_' + Date.now(),
        type: 'HANDOVER_SUCCESS',
        title: 'P2P Handover Complete (+15 Karma)',
        message: `Successfully transferred "${bookTitle}" directly to ${waitlistStudent.name}. +15 Karma points earned!`,
        createdAt: new Date()
      },
      ...prev
    ]);
    setUnreadCount((c) => c + 1);
  };

  // Feature 4: Claim book from classmate by entering pairing code
  const handleAcceptHandoverCode = (pairingCode) => {
    const defaultBook = initialBooksData[2]; // Operating System Concepts
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const transferredLoan = {
      _id: 'loan_p2p_' + Date.now(),
      bookId: defaultBook.id,
      book: defaultBook,
      title: defaultBook.title,
      borrowedAt: new Date(),
      dueDate: dueDate,
      status: 'BORROWED',
      transferSource: 'P2P_CAMPUS_HANDOVER',
      pairingCode
    };

    setMyLoans((prev) => [transferredLoan, ...prev]);

    // Award recipient +15 Karma points as well!
    if (currentUser?.memberId) {
      const updatedProfile = addKarmaRecord(
        currentUser.memberId,
        15,
        `Accepted P2P Handover (Code: ${pairingCode})`,
        defaultBook.title
      );
      setKarmaProfile(updatedProfile);
    }

    setNotifications((prev) => [
      {
        _id: 'notif_' + Date.now(),
        type: 'HANDOVER_RECEIVED',
        title: 'Book Transferred Directly (+15 Karma)',
        message: `You received "${defaultBook.title}" via Campus Handover! +15 Karma awarded.`,
        createdAt: new Date()
      },
      ...prev
    ]);
    setUnreadCount((c) => c + 1);

    alert(`Success! "${defaultBook.title}" transferred directly to your account. Return due in 14 days.`);
  };

  // Interactive Reservation (Checks low karma restriction)
  const handleReserve = async (bookId) => {
    if (!currentUser) return;

    // Feature 6 Check: Low Tier Karma (< 50) restricts hold reservations
    if (karmaProfile?.score < 50) {
      alert('Hold reservations suspended: Your Library Karma is below 50 points due to overdue infractions. Please return overdue titles to restore privileges.');
      return;
    }

    const targetBook = books.find((b) => (b._id === bookId || b.id === bookId));
    const bookTitle = targetBook?.title || 'Academic Textbook';

    const newReservation = {
      _id: 'res_' + Date.now(),
      bookId: bookId,
      book: targetBook || { _id: bookId, title: bookTitle },
      queuePosition: 1,
      status: 'WAITING',
      createdAt: new Date()
    };
    setMyReservations((prev) => [newReservation, ...prev]);

    try {
      await api.reserveBook(bookId);
    } catch (apiErr) {
      // Optimistic reservation recorded
    }

    setNotifications((prev) => [
      {
        _id: 'notif_' + Date.now(),
        type: 'RESERVATION_CONFIRMED',
        title: 'Hold Reservation Placed',
        message: `You are in line for "${bookTitle}". We will notify you when a copy is available.`,
        createdAt: new Date()
      },
      ...prev
    ]);
    setUnreadCount((c) => c + 1);

    setSelectedBook(null);
    alert(`Hold reservation confirmed for "${bookTitle}"! Position #1 in queue.`);
  };

  // Feature 1: One-Click Reserve Bundle Handler
  const handleBatchReserveBundle = async (prescribedBooks = []) => {
    if (!currentUser || prescribedBooks.length === 0) return;

    const isFacultyUser = currentUser._decoded?.idType === 'FACULTY' ||
      (Number(currentUser.memberId) > 0 && Number(currentUser.memberId) <= 15000) ||
      currentUser.role === 'FACULTY';

    // 0. Borrow Lock ONLY for unactivated students:
    if (!isFacultyUser && !currentUser.isMembershipActive) {
      setMembershipModalMessage('Please activate your ₹50 annual library membership to issue books.');
      setIsMembershipModalOpen(true);
      return;
    }

    let borrowedCount = 0;
    let reservedCount = 0;
    const newLoansList = [];
    const newResList = [];

    const loanDurationDays = isFacultyUser ? 30 : (karmaProfile?.tier?.loanDays || 14);

    prescribedBooks.forEach((book) => {
      const bId = book._id || book.id;
      const isAlreadyBorrowed = myLoans.some((l) => (l.book?._id || l.bookId || l._id || l.id) === bId);
      if (isAlreadyBorrowed) return;

      const isAvailable = (book.availableCopies ?? 0) > 0 && book.status !== 'RESERVED OUT';

      if (isAvailable && !book.facultyReserve?.restrictedReadingOnly) {
        borrowedCount++;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + loanDurationDays);

        newLoansList.push({
          _id: 'loan_bundle_' + Date.now() + '_' + bId,
          bookId: bId,
          book: book,
          title: book.title,
          borrowedAt: new Date(),
          dueDate: dueDate,
          status: 'BORROWED'
        });

        // Decrement local inventory
        setRawBooks((prev) =>
          prev.map((b) => ((b._id === bId || b.id === bId) ? { ...b, availableCopies: Math.max(0, (b.availableCopies ?? 1) - 1) } : b))
        );
      } else {
        reservedCount++;
        newResList.push({
          _id: 'res_bundle_' + Date.now() + '_' + bId,
          bookId: bId,
          book: book,
          queuePosition: 1,
          status: 'WAITING',
          createdAt: new Date()
        });
      }
    });

    if (newLoansList.length > 0) {
      setMyLoans((prev) => [...newLoansList, ...prev]);
    }
    if (newResList.length > 0) {
      setMyReservations((prev) => [...newResList, ...prev]);
    }

    setNotifications((prev) => [
      {
        _id: 'notif_' + Date.now(),
        type: 'BUNDLE_PROCESSED',
        title: 'Semester Bundle Reserved',
        message: `Processed ${prescribedBooks.length} core textbooks: ${borrowedCount} checked out to pass, ${reservedCount} hold holds placed.`,
        createdAt: new Date()
      },
      ...prev
    ]);
    setUnreadCount((c) => c + 1);
  };

  // Feature 3: Faculty Reserve Management Handlers
  const handleAddFacultyReserve = (newReserve) => {
    setFacultyReserves((prev) => [newReserve, ...prev]);
  };

  const handleRemoveFacultyReserve = (reserveId) => {
    setFacultyReserves((prev) => prev.filter((r) => r.id !== reserveId));
  };

  // Student ₹50 Library Card Activation Handler
  const handleActivateMembership = (paymentDetails) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      isMembershipActive: true,
      membershipPlan: 'KL University Student Library Card',
      membershipStatus: 'ACTIVE SCHOLAR',
      membershipFeePaid: 50,
      membershipPaymentDetails: paymentDetails,
      membershipActivatedAt: new Date().toISOString(),
      membershipValidUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('library_user_profile', JSON.stringify(updatedUser));
    if (currentUser.memberId) {
      localStorage.setItem(`membership_active_${currentUser.memberId}`, 'true');
    }

    // Add activity notification
    setNotifications((prev) => [
      {
        _id: 'notif_mem_' + Date.now(),
        type: 'MEMBERSHIP_ACTIVATED',
        title: 'Student Library Card Activated',
        message: 'Your ₹50 Student Library Card is active for Academic Session 2026–2027. You can now borrow books!',
        createdAt: new Date()
      },
      ...prev
    ]);
    setUnreadCount((c) => c + 1);

    // Show clean success toast requested by user
    showToast('Membership Activated! You can now borrow books.');
    setIsMembershipModalOpen(false);
    setMembershipModalMessage('');
  };

  // =========================================================================
  // GATEKEEPER VIEW: When isAuthenticated === false
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <UniversityPortalLogin
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setCurrentUser(user);
        }}
      />
    );
  }

  // =========================================================================
  // UNLOCKED VIEW: When isAuthenticated === true
  // =========================================================================
  const isSelectedBookBorrowed = selectedBook && myLoans.some((l) => {
    const bId = l.book?._id || l.bookId || l._id || l.id;
    return bId === (selectedBook._id || selectedBook.id) || l.book?.title === selectedBook.title;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans animate-fadeIn">
      {/* Top Navbar with Sign Out button */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleSignOut}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        unreadCount={unreadCount}
        onToggleNotifications={() => setNotificationsOpen(true)}
        onOpenPass={() => setPassModalOpen(true)}
        onOpenAISyllabus={() => setIsAISyllabusOpen(true)}
        karmaProfile={karmaProfile}
        onOpenKarmaLedger={() => setIsKarmaModalOpen(true)}
        onOpenMembershipModal={() => {
          setMembershipModalMessage('');
          setIsMembershipModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {currentTab === 'catalog' && (
          <BookCatalog
            books={books}
            loading={loadingBooks}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onSelectBook={(book) => setSelectedBook(book)}
            onQuickBorrow={handleBorrow}
            onQuickReserve={handleReserve}
            onQuickReturn={handleReturn}
            onOpenFloorMap={handleOpenFloorMap}
            onOpenAISyllabus={() => setIsAISyllabusOpen(true)}
            onBatchReserveBundle={handleBatchReserveBundle}
            myLoans={myLoans}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'dashboard' && currentUser && (
          <MemberDashboard
            currentUser={currentUser}
            loans={myLoans}
            reservations={myReservations}
            onRefresh={() => { fetchMemberCirculation(); fetchBooks(); }}
            onShowPass={() => setPassModalOpen(true)}
            onReturnBook={handleReturn}
            karmaProfile={karmaProfile}
            onOpenKarmaLedger={() => setIsKarmaModalOpen(true)}
            onInitiateHandover={(book) => {
              setHandoverBook(book);
              setIsHandoverOpen(true);
            }}
            onAcceptHandoverCode={handleAcceptHandoverCode}
            onOpenMembershipModal={() => {
              setMembershipModalMessage('');
              setIsMembershipModalOpen(true);
            }}
          />
        )}

        {currentTab === 'faculty' && currentUser && (
          <FacultyDesk
            currentUser={currentUser}
            books={books}
            facultyReserves={facultyReserves}
            onAddFacultyReserve={handleAddFacultyReserve}
            onRemoveFacultyReserve={handleRemoveFacultyReserve}
            onSelectBook={(book) => setSelectedBook(book)}
          />
        )}

        {currentTab === 'admin' && currentUser && (currentUser.role === 'ADMIN' || (currentUser.borrowQuota ?? 0) >= 10) && (
          <AdminPortal
            currentUser={currentUser}
            onInventoryUpdated={() => { fetchBooks(); fetchMemberCirculation(); }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-6 bg-slate-950 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div>
            © 2026 KL University Online Library Management System
          </div>
          <div className="flex flex-wrap gap-4 text-slate-400">
            <span>Universal ₹50 Institutional Card</span>
            <span>•</span>
            <span>Syllabus Auto-Matcher</span>
            <span>•</span>
            <span>2D Floor Plan Navigator</span>
            <span>•</span>
            <span>Faculty Course Reserves</span>
            <span>•</span>
            <span>P2P Campus Handover</span>
            <span>•</span>
            <span>Library Karma Score</span>
          </div>
        </div>
      </footer>

      {/* Book Details Modal */}
      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBorrow={handleBorrow}
        onReserve={handleReserve}
        onReturn={handleReturn}
        onOpenFloorMap={handleOpenFloorMap}
        isBorrowedByMe={isSelectedBookBorrowed}
        currentUser={currentUser}
      />

      {/* Feature 2: Interactive 2D Floor & Rack Navigator Modal */}
      <FloorNavigatorModal
        isOpen={isFloorNavOpen}
        book={floorNavBook}
        onClose={() => setIsFloorNavOpen(false)}
      />

      {/* Feature 4: Peer-to-Peer Campus Handover Modal */}
      <HandoverModal
        isOpen={isHandoverOpen}
        book={handoverBook}
        currentUser={currentUser}
        onClose={() => setIsHandoverOpen(false)}
        onConfirmDirectTransfer={handleConfirmDirectTransfer}
        onConfirmNormalReturn={(bId) => {
          const tBook = books.find((b) => (b._id === bId || b.id === bId));
          executeReturnProcess(bId, tBook?.title, null);
        }}
      />

      {/* Feature 5: AI Syllabus Index & Chapter Topic Matcher Drawer */}
      <AISyllabusFinder
        isOpen={isAISyllabusOpen}
        books={books}
        onClose={() => setIsAISyllabusOpen(false)}
        onSelectBook={(book) => setSelectedBook(book)}
        onOpenFloorMap={handleOpenFloorMap}
        onQuickBorrow={handleBorrow}
      />

      {/* Feature 6: Karma History Timeline Modal */}
      <KarmaHistoryModal
        isOpen={isKarmaModalOpen}
        karmaProfile={karmaProfile}
        currentUser={currentUser}
        onClose={() => setIsKarmaModalOpen(false)}
      />

      {/* Digital Library Pass Modal (with "✕", backdrop click, and Escape key dismiss) */}
      <DigitalLibraryPass
        isOpen={passModalOpen}
        currentUser={currentUser}
        loans={myLoans}
        onReturnBook={handleReturn}
        karmaProfile={karmaProfile}
        onOpenKarmaLedger={() => setIsKarmaModalOpen(true)}
        onOpenMembershipModal={() => {
          setPassModalOpen(false);
          setMembershipModalMessage('');
          setIsMembershipModalOpen(true);
        }}
        onClose={() => setPassModalOpen(false)}
      />

      {/* ₹50 Universal Institutional Membership Activation Modal */}
      <MembershipActivationModal
        isOpen={isMembershipModalOpen}
        onClose={() => {
          setIsMembershipModalOpen(false);
          setMembershipModalMessage('');
        }}
        currentUser={currentUser}
        onActivateMembership={handleActivateMembership}
        initialMessage={membershipModalMessage}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          id="app-membership-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 border border-emerald-500/50 text-white rounded-2xl shadow-2xl shadow-emerald-500/25 animate-slideUp"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">KL Central Library</div>
            <div className="text-xs font-semibold text-emerald-300">{toast.message}</div>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={fetchMemberCirculation}
      />
    </div>
  );
}
