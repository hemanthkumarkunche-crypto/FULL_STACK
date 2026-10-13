import Book from '../models/Book.js';

// @route   GET /api/v1/books
export const getBooks = async (req, res) => {
  try {
    const { search, category, availableOnly, sort } = req.query;
    let query = { isDeleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authors: { $elemMatch: { $regex: search, $options: 'i' } } },
        { isbn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.categories = category;
    }

    if (availableOnly === 'true') {
      query.availableCopies = { $gt: 0 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'title_asc') sortOption = { title: 1 };
    if (sort === 'title_desc') sortOption = { title: -1 };
    if (sort === 'year_desc') sortOption = { publicationYear: -1 };

    const books = await Book.find(query).sort(sortOption);
    res.json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/v1/books/:id
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isDeleted: false });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/v1/books
export const createBook = async (req, res) => {
  try {
    const {
      isbn, title, authors, publisher, publicationYear,
      categories, description, coverImageUrl, shelfLocation,
      totalCopies
    } = req.body;

    const existingBook = await Book.findOne({ isbn, isDeleted: false });
    if (existingBook) {
      return res.status(400).json({ success: false, message: 'Book with this ISBN already exists' });
    }

    const book = await Book.create({
      isbn,
      title,
      authors: Array.isArray(authors) ? authors : (authors || '').split(',').map(a => a.trim()),
      publisher,
      publicationYear: publicationYear ? Number(publicationYear) : 2024,
      categories: Array.isArray(categories) ? categories : (categories || '').split(',').map(c => c.trim()),
      description,
      coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
      shelfLocation: shelfLocation || { aisle: 'A-1', rack: 'R-01', shelfNumber: 'S-1' },
      totalCopies: Number(totalCopies) || 1,
      availableCopies: Number(totalCopies) || 1
    });

    res.status(201).json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/v1/books/:id
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || book.isDeleted) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const {
      title, authors, publisher, publicationYear,
      categories, description, coverImageUrl, shelfLocation,
      totalCopies, availableCopies
    } = req.body;

    if (title) book.title = title;
    if (authors) book.authors = Array.isArray(authors) ? authors : authors.split(',').map(a => a.trim());
    if (publisher !== undefined) book.publisher = publisher;
    if (publicationYear) book.publicationYear = Number(publicationYear);
    if (categories) book.categories = Array.isArray(categories) ? categories : categories.split(',').map(c => c.trim());
    if (description !== undefined) book.description = description;
    if (coverImageUrl) book.coverImageUrl = coverImageUrl;
    if (shelfLocation) book.shelfLocation = shelfLocation;
    if (totalCopies !== undefined) book.totalCopies = Number(totalCopies);
    if (availableCopies !== undefined) book.availableCopies = Number(availableCopies);

    await book.save();
    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/v1/books/:id
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    book.isDeleted = true;
    await book.save();
    res.json({ success: true, message: 'Book removed from active catalog' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
