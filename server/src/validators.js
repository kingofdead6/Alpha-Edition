import { z } from 'zod';
import {
  CATEGORIES,
  MOTIFS,
  SOURCE_LANGUAGES,
  STATUSES,
  SUBMISSION_LANGUAGES,
  SUBMISSION_STATUSES,
} from './utils/constants.js';

const text = (max) => z.string().trim().max(max);
const i18n = (max = 200) =>
  z.object({ en: text(max).default(''), ar: text(max).default('') }).default({});
const requiredI18n = (max) =>
  i18n(max).refine((v) => v.en || v.ar, { message: 'Required in at least one language' });

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #1D3A5F');
const media = z
  .object({
    url: z.string().url(),
    publicId: z.string().min(1),
    width: z.number().optional(),
    height: z.number().optional(),
  })
  .nullable()
  .default(null);
const objectId = z.string().regex(/^[0-9a-f]{24}$/i, 'Choose an option');
const optionalDate = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.coerce.date().nullable()
);
const num = (min, max) =>
  z.preprocess((v) => (v === '' || v == null ? 0 : v), z.coerce.number().min(min).max(max));

export const bookInput = z.object({
  title: requiredI18n(160),
  author: objectId,
  translator: i18n(120),
  translatedFrom: z.enum(['', ...SOURCE_LANGUAGES]).default(''),
  category: z.enum(CATEGORIES),
  synopsis: i18n(2400),
  excerpt: i18n(400),
  sample: i18n(30000),
  pages: num(0, 5000),
  format: text(60).default('13.5 × 21 cm'),
  price: z.object({ dzd: num(0, 1_000_000), eur: num(0, 10_000) }).default({}),
  isbn: text(20).default(''),
  publishedAt: optionalDate,
  cover: z
    .object({
      mode: z.enum(['generated', 'image']).default('generated'),
      image: media,
      motif: z.enum(MOTIFS).default('dunes'),
      bg: hex.default('#1D3A5F'),
      fg: hex.default('#F2E6CC'),
      accent: hex.default('#E1A24A'),
    })
    .default({}),
  newRelease: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.enum(STATUSES).default('draft'),
});

export const authorInput = z.object({
  name: requiredI18n(120),
  bio: i18n(4000),
  quote: i18n(400),
  note: i18n(200),
  photo: media,
  featured: z.boolean().default(false),
  status: z.enum(STATUSES).default('published'),
});

export const settingsInput = z.object({
  contactEmail: z.string().trim().email().max(120),
  phone: text(40).default(''),
  address: i18n(200),
  hours: i18n(120),
  readingPeriod: z.object({ isOpen: z.boolean(), endsAt: optionalDate }),
  stats: z.object({
    titlesInPrint: num(0, 100000),
    languages: num(0, 500),
    perYear: num(0, 1000),
    sinceYear: num(1800, 2100),
  }),
});

/** Public manuscript form (arrives as multipart text fields) */
export const submissionInput = z.object({
  name: text(120).min(2),
  email: z.string().trim().toLowerCase().email().max(160),
  title: text(200).min(1),
  category: z.enum(CATEGORIES),
  language: z.enum(SUBMISSION_LANGUAGES).default('en'),
  words: z.preprocess(
    (v) => (v === '' || v == null ? null : v),
    z.coerce.number().int().min(0).max(2_000_000).nullable()
  ),
  synopsis: text(2400).min(20),
  siteLang: z.enum(['en', 'ar']).default('en'),
  agree: z.preprocess((v) => v === true || v === 'true' || v === 'on', z.literal(true)),
});

export const submissionUpdate = z.object({
  status: z.enum(SUBMISSION_STATUSES).optional(),
  notes: text(4000).optional(),
});

export const subscriberInput = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  lang: z.enum(['en', 'ar']).default('en'),
});

export const loginInput = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});
