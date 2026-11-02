import mongoose from 'mongoose';
import { Media, i18nField } from './shared.js';
import { STATUSES } from '../utils/constants.js';

const authorSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: i18nField(),
    bio: i18nField(),
    /** Pull quote shown in the "Author in residence" section */
    quote: i18nField(),
    /** Short line under the name, e.g. an upcoming reading */
    note: i18nField(),
    photo: { type: Media, default: null },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: STATUSES, default: 'published' },
  },
  { timestamps: true }
);

export default mongoose.model('Author', authorSchema);
