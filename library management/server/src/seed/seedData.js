import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Book from '../models/Book.js';
import BorrowRecord from '../models/BorrowRecord.js';
import Reservation from '../models/Reservation.js';
import Notification from '../models/Notification.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library_management_db';

const booksData = [
  {
    isbn: '978-0262033848',
    title: 'Introduction to Algorithms',
    authors: ['Thomas H. Cormen', 'Charles E. Leiserson'],
    publisher: 'MIT Press / PHI Learning',
    publicationYear: 2009,
    categories: ['COMPUTER SCIENCE', 'Algorithms'],
    description: 'The standard worldwide textbook covering a comprehensive spectrum of data structures and modern algorithmic techniques.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg',
    shelfLocation: { aisle: 'A-2', rack: 'R-01', shelfNumber: 'S-2' },
    totalCopies: 5,
    availableCopies: 3,
    reservedCopies: 1
  },
  {
    isbn: '978-0073523323',
    title: 'Database System Concepts',
    authors: ['Abraham Silberschatz', 'Henry F. Korth'],
    publisher: 'McGraw-Hill Education',
    publicationYear: 2011,
    categories: ['COMPUTER SCIENCE', 'Databases'],
    description: 'The fundamental relational database textbook covering SQL, transaction processing, concurrency control, and distributed storage systems.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780073523323-L.jpg',
    shelfLocation: { aisle: 'A-3', rack: 'R-04', shelfNumber: 'S-1' },
    totalCopies: 4,
    availableCopies: 2,
    reservedCopies: 0
  },
  {
    isbn: '978-1119800361',
    title: 'Operating System Concepts',
    authors: ['Abraham Silberschatz', 'Peter B. Galvin'],
    publisher: 'John Wiley & Sons',
    publicationYear: 2018,
    categories: ['COMPUTER SCIENCE', 'Systems'],
    description: 'The foundational dinosaur book on OS architectures, memory virtualization, CPU scheduling, deadlocks, and POSIX threads.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781119800361-L.jpg',
    shelfLocation: { aisle: 'A-1', rack: 'R-02', shelfNumber: 'S-3' },
    totalCopies: 4,
    availableCopies: 0,
    reservedCopies: 2
  },
  {
    isbn: '978-0132126953',
    title: 'Computer Networks',
    authors: ['Andrew S. Tanenbaum', 'David J. Wetherall'],
    publisher: 'Pearson Education',
    publicationYear: 2011,
    categories: ['NETWORKING', 'Computer Science'],
    description: 'Classic networking reference explaining the full OSI and TCP/IP protocol stacks from physical routing to DNS and application sockets.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg',
    shelfLocation: { aisle: 'B-1', rack: 'R-05', shelfNumber: 'S-2' },
    totalCopies: 6,
    availableCopies: 4,
    reservedCopies: 0
  },
  {
    isbn: '978-0132350884',
    title: 'Clean Code: Agile Software Craftsmanship',
    authors: ['Robert C. Martin'],
    publisher: 'Prentice Hall',
    publicationYear: 2008,
    categories: ['SOFTWARE ENGINEERING', 'Best Practices'],
    description: 'Principles, patterns, and practices of writing clean, maintainable, and elegant software systems.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    shelfLocation: { aisle: 'A-4', rack: 'R-03', shelfNumber: 'S-1' },
    totalCopies: 5,
    availableCopies: 3,
    reservedCopies: 0
  },
  {
    isbn: '978-0136042594',
    title: 'Artificial Intelligence: A Modern Approach',
    authors: ['Stuart Russell', 'Peter Norvig'],
    publisher: 'Pearson Education',
    publicationYear: 2009,
    categories: ['ARTIFICIAL INTELLIGENCE', 'Computer Science'],
    description: 'The definitive standard text in artificial intelligence, covering rational agents, state search, logic, and probabilistic reasoning.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780136042594-L.jpg',
    shelfLocation: { aisle: 'A-5', rack: 'R-02', shelfNumber: 'S-4' },
    totalCopies: 3,
    availableCopies: 1,
    reservedCopies: 0
  },
  {
    isbn: '978-0131103627',
    title: 'The C Programming Language',
    authors: ['Brian W. Kernighan', 'Dennis M. Ritchie'],
    publisher: 'Prentice Hall',
    publicationYear: 1988,
    categories: ['PROGRAMMING', 'Computer Science'],
    description: 'The definitive ANSI C reference written by the original designers of the C language and Unix operating system.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780131103627-L.jpg',
    shelfLocation: { aisle: 'B-3', rack: 'R-01', shelfNumber: 'S-2' },
    totalCopies: 8,
    availableCopies: 6,
    reservedCopies: 0
  },
  {
    isbn: '978-0078022128',
    title: 'Software Engineering: A Practitioner\'s Approach',
    authors: ['Roger S. Pressman', 'Bruce R. Maxim'],
    publisher: 'McGraw-Hill Education',
    publicationYear: 2014,
    categories: ['SOFTWARE ENGINEERING', 'Management'],
    description: 'Comprehensive guide to software process models, agile methods, architectural design, testing, and quality assurance.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780078022128-L.jpg',
    shelfLocation: { aisle: 'A-4', rack: 'R-06', shelfNumber: 'S-3' },
    totalCopies: 4,
    availableCopies: 0,
    reservedCopies: 1
  },
  {
    isbn: '978-8174091955',
    title: 'Higher Engineering Mathematics',
    authors: ['B.S. Grewal'],
    publisher: 'Khanna Publishers',
    publicationYear: 2017,
    categories: ['MATHEMATICS', 'Engineering'],
    description: 'Standard textbook for undergraduate engineering students covering calculus, differential equations, linear algebra, and Fourier series.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9788174091955-L.jpg',
    shelfLocation: { aisle: 'M-2', rack: 'R-03', shelfNumber: 'S-1' },
    totalCopies: 8,
    availableCopies: 5,
    reservedCopies: 0
  },
  {
    isbn: '978-0470458365',
    title: 'Advanced Engineering Mathematics',
    authors: ['Erwin Kreyszig'],
    publisher: 'John Wiley & Sons',
    publicationYear: 2011,
    categories: ['MATHEMATICS', 'Engineering'],
    description: 'Comprehensive mathematical foundation for engineers covering ODEs, linear algebra, vector calculus, complex analysis, and numerical methods.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780470458365-L.jpg',
    shelfLocation: { aisle: 'M-1', rack: 'R-02', shelfNumber: 'S-2' },
    totalCopies: 6,
    availableCopies: 4,
    reservedCopies: 0
  },
  {
    isbn: '978-0132622264',
    title: 'Electronic Devices and Circuit Theory',
    authors: ['Robert L. Boylestad', 'Louis Nashelsky'],
    publisher: 'Pearson Education',
    publicationYear: 2013,
    categories: ['ELECTRONICS', 'Circuits'],
    description: 'Standard reference on semiconductor physics, BJTs, FETs, operational amplifiers, and frequency response analysis in electronic systems.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780132622264-L.jpg',
    shelfLocation: { aisle: 'E-4', rack: 'R-02', shelfNumber: 'S-4' },
    totalCopies: 5,
    availableCopies: 2,
    reservedCopies: 0
  },
  {
    isbn: '978-0138147570',
    title: 'Signals and Systems',
    authors: ['Alan V. Oppenheim', 'Alan S. Willsky'],
    publisher: 'Pearson Education',
    publicationYear: 1996,
    categories: ['ELECTRONICS', 'Signal Processing'],
    description: 'Classic text on continuous-time and discrete-time signals, linear time-invariant systems, Fourier and Laplace transforms, and sampling theory.',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780138147570-L.jpg',
    shelfLocation: { aisle: 'E-2', rack: 'R-04', shelfNumber: 'S-1' },
    totalCopies: 5,
    availableCopies: 3,
    reservedCopies: 0
  }
];

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB');

    await User.deleteMany({});
    await Book.deleteMany({});
    await BorrowRecord.deleteMany({});
    await Reservation.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Cleared existing data');

    const adminUser = await User.create({
      memberId: 'LIB-ADM-001',
      firstName: 'Eleanor',
      lastName: 'Vance',
      email: 'admin@library.com',
      password: 'admin123',
      role: 'ADMIN',
      phone: '+1-555-0101'
    });

    const librarianUser = await User.create({
      memberId: 'LIB-STF-002',
      firstName: 'Marcus',
      lastName: 'Holloway',
      email: 'librarian@library.com',
      password: 'librarian123',
      role: 'LIBRARIAN',
      phone: '+1-555-0102'
    });

    const memberUser = await User.create({
      memberId: 'LIB-MEM-1001',
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'member@library.com',
      password: 'member123',
      role: 'MEMBER',
      phone: '+1-555-0199',
      borrowQuota: 5
    });

    console.log('[Seed] Users created');

    const createdBooks = await Book.insertMany(booksData);
    console.log(`[Seed] Seeded ${createdBooks.length} standard academic textbooks`);

    // Sample active loan for Sarah Connor (Introduction to Algorithms)
    const pastBorrowDate = new Date();
    pastBorrowDate.setDate(pastBorrowDate.getDate() - 5);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 9);

    await BorrowRecord.create({
      book: createdBooks[0]._id, // Introduction to Algorithms
      user: memberUser._id,
      issueDeskOperator: librarianUser._id,
      borrowedAt: pastBorrowDate,
      dueDate: dueDate,
      status: 'BORROWED'
    });

    // Sample reservation for Operating System Concepts (which has 0 available)
    await Reservation.create({
      book: createdBooks[2]._id,
      user: memberUser._id,
      queuePosition: 1,
      status: 'WAITING'
    });

    await Notification.create({
      recipient: memberUser._id,
      type: 'BORROW_SUCCESS',
      title: 'Book Borrowed',
      message: `You borrowed "${createdBooks[0].title}". Due date: ${dueDate.toLocaleDateString()}.`
    });

    console.log('[Seed] Complete! 12 engineering textbooks seeded in MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seed();
