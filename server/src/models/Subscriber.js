import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    lang: { type: String, enum: ['en', 'ar'], default: 'en' },
  },
  { timestamps: true }
);

export default mongoose.model('Subscriber', subscriberSchema);
