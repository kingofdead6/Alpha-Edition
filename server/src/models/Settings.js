import mongoose from 'mongoose';
import { i18nField } from './shared.js';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    contactEmail: { type: String, default: 'hello@editions-alfa.com' },
    phone: { type: String, default: '+213 21 00 00 00' },
    address: i18nField(),
    hours: i18nField(),
    readingPeriod: {
      isOpen: { type: Boolean, default: true },
      endsAt: { type: Date, default: null },
    },
    stats: {
      titlesInPrint: { type: Number, default: 184 },
      languages: { type: Number, default: 19 },
      perYear: { type: Number, default: 16 },
      sinceYear: { type: Number, default: 1999 },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne({ key: 'site' });
  if (!doc) {
    doc = await this.create({
      key: 'site',
      address: { en: '12 rue des Libraires, Algiers Centre', ar: '12 شارع الكتبيين، الجزائر الوسطى' },
      hours: { en: 'Tue – Sat, 10:00 – 19:00', ar: 'من الثلاثاء إلى السبت، 10:00 – 19:00' },
    });
  }
  return doc;
};

export default mongoose.model('Settings', settingsSchema);
