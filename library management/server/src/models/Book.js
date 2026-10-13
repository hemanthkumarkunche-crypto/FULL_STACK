import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  isbn: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  authors: [{ type: String, required: true, trim: true }],
  publisher: { type: String, default: '' },
  publicationYear: { type: Number, default: 2024 },
  categories: [{ type: String, trim: true }],
  description: { type: String, default: '' },
  coverImageUrl: { type: String, default: '' },
  shelfLocation: {
    aisle: { type: String, default: 'A-1' },
    rack: { type: String, default: 'R-03' },
    shelfNumber: { type: String, default: 'S-2' }
  },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  reservedCopies: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', authors: 'text', categories: 'text', isbn: 'text' });

export default mongoose.model('Book', bookSchema);
