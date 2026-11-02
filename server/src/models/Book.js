import mongoose from 'mongoose';
import { Media, i18nField } from './shared.js';
import { CATEGORIES, MOTIFS, STATUSES } from '../utils/constants.js';

const coverSchema = new mongoose.Schema(
  {
    mode: { type: String, enum: ['generated', 'image'], default: 'generated' },
    image: { type: Media, default: null },
    motif: { type: String, enum: MOTIFS, default: 'dunes' },
    bg: { type: String, default: '#1D3A5F' },
    fg: { type: String, default: '#F2E6CC' },
    accent: { type: String, default: '#E1A24A' },
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: i18nField(),
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true, index: true },
    translator: i18nField(),
    translatedFrom: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    synopsis: i18nField(),
    excerpt: i18nField(),
    /** Opening pages for the "Look inside" reader. Pages break on blank lines. */
    sample: i18nField(),
    pages: { type: Number, default: 0 },
    format: { type: String, default: '13.5 × 21 cm' },
    price: {
      dzd: { type: Number, default: 0 },
      eur: { type: Number, default: 0 },
    },
    isbn: { type: String, default: '' },
    publishedAt: { type: Date, default: null },
    cover: { type: coverSchema, default: () => ({}) },
    newRelease: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: STATUSES, default: 'draft', index: true },
  },
  { timestamps: true }
);

bookSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model('Book', bookSchema);
