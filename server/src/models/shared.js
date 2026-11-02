import mongoose from 'mongoose';

/** A text field stored in both languages: { en, ar } */
export const I18n = new mongoose.Schema(
  {
    en: { type: String, trim: true, default: '' },
    ar: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

/** An asset stored on Cloudinary */
export const Media = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
  },
  { _id: false }
);

export const i18nField = () => ({ type: I18n, default: () => ({}) });
