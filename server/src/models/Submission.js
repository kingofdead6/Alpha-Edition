import mongoose from 'mongoose';
import { CATEGORIES, SUBMISSION_LANGUAGES, SUBMISSION_STATUSES } from '../utils/constants.js';

const submissionSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    language: { type: String, enum: SUBMISSION_LANGUAGES, default: 'en' },
    words: { type: Number, default: null },
    synopsis: { type: String, required: true },
    siteLang: { type: String, enum: ['en', 'ar'], default: 'en' },
    file: {
      type: new mongoose.Schema(
        { publicId: String, name: String, bytes: Number, format: String },
        { _id: false }
      ),
      default: null,
    },
    status: { type: String, enum: SUBMISSION_STATUSES, default: 'new', index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

submissionSchema.index({ createdAt: -1 });

export default mongoose.model('Submission', submissionSchema);
