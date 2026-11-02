import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import { cloudinaryReady, uploadBuffer } from '../config/cloudinary.js';
import Book from '../models/Book.js';
import Author from '../models/Author.js';
import Settings from '../models/Settings.js';
import Submission from '../models/Submission.js';
import Subscriber from '../models/Subscriber.js';
import { DOC_TYPES, manuscriptUpload, sniffDocType } from '../middleware/upload.js';
import { HttpError } from '../utils/http.js';
import { publicAuthor, publicBook, publicSettings } from '../utils/serialize.js';
import { submissionInput, subscriberInput } from '../validators.js';

const router = Router();

const limiter = (limit, minutes) =>
  rateLimit({
    windowMs: minutes * 60_000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Try again a little later.', code: 'rate_limited' },
  });

/** Everything the home page needs in one request */
router.get('/home', async (req, res) => {
  const [books, author, settings] = await Promise.all([
    Book.find({ status: 'published' })
      .select('-sample')
      .populate('author', 'name slug')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean(),
    Author.findOne({ featured: true, status: 'published' }).lean(),
    Settings.getSingleton(),
  ]);
  // hasSample needs to know whether a sample exists without sending it
  const withSample = new Set(
    (
      await Book.find({
        status: 'published',
        $or: [{ 'sample.en': { $gt: '' } }, { 'sample.ar': { $gt: '' } }],
      })
        .select('_id')
        .lean()
    ).map((b) => String(b._id))
  );
  res.json({
    books: books.map((b) => ({ ...publicBook(b), hasSample: withSample.has(String(b._id)) })),
    author: publicAuthor(author, true),
    settings: publicSettings(settings),
  });
});

router.get('/books/:slug', async (req, res) => {
  const book = await Book.findOne({ slug: String(req.params.slug), status: 'published' })
    .populate('author', 'name slug bio photo quote note')
    .lean();
  if (!book) throw new HttpError(404, 'Book not found', 'not_found');

  const related = await Book.find({
    status: 'published',
    _id: { $ne: book._id },
    $or: [{ category: book.category }, { author: book.author?._id }],
  })
    .select('-sample')
    .populate('author', 'name slug')
    .sort({ publishedAt: -1 })
    .limit(4)
    .lean();

  res.json({ book: publicBook(book, true), related: related.map((b) => publicBook(b)) });
});

/** All published authors with how many published books each has */
router.get('/authors', async (req, res) => {
  const [authors, counts] = await Promise.all([
    Author.find({ status: 'published' }).sort({ featured: -1, 'name.en': 1 }).lean(),
    Book.aggregate([{ $match: { status: 'published' } }, { $group: { _id: '$author', n: { $sum: 1 } } }]),
  ]);
  const byAuthor = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json({
    authors: authors.map((a) => ({ ...publicAuthor(a, true), featured: a.featured, books: byAuthor.get(String(a._id)) || 0 })),
  });
});

router.get('/authors/:slug', async (req, res) => {
  const author = await Author.findOne({ slug: String(req.params.slug), status: 'published' }).lean();
  if (!author) throw new HttpError(404, 'Author not found', 'not_found');
  // sample is loaded only so hasSample is right; publicBook leaves the text out
  const books = await Book.find({ author: author._id, status: 'published' })
    .populate('author', 'name slug')
    .sort({ publishedAt: -1 })
    .lean();
  res.json({ author: { ...publicAuthor(author, true), featured: author.featured }, books: books.map((b) => publicBook(b)) });
});

router.get('/settings', async (req, res) => {
  res.json(publicSettings(await Settings.getSingleton()));
});

async function uniqueReference() {
  const yy = String(new Date().getFullYear()).slice(2);
  for (let i = 0; i < 20; i++) {
    const ref = `ALF-${yy}-${Math.floor(1000 + Math.random() * 9000)}`;
    // eslint-disable-next-line no-await-in-loop
    if (!(await Submission.exists({ reference: ref }))) return ref;
  }
  return `ALF-${yy}-${Date.now().toString(36).toUpperCase()}`;
}

router.post('/submissions', limiter(6, 60), manuscriptUpload.single('file'), async (req, res) => {
  const settings = publicSettings(await Settings.getSingleton());
  if (!settings.readingPeriod.isOpen) {
    throw new HttpError(403, 'Submissions are closed right now', 'reading_closed');
  }

  // Honeypot: real people never fill the hidden "website" field
  if (req.body?.website) return res.status(201).json({ reference: await uniqueReference() });

  const data = submissionInput.parse(req.body || {});
  const words = data.synopsis.split(/\s+/).filter(Boolean).length;
  if (words > 300) throw new HttpError(400, 'Keep the synopsis to 300 words', 'synopsis_too_long');

  let file = null;
  if (req.file) {
    if (!cloudinaryReady) {
      throw new HttpError(503, 'File uploads are not set up yet', 'uploads_disabled');
    }
    const ext = DOC_TYPES[req.file.mimetype];
    if (sniffDocType(req.file.buffer) !== ext) {
      throw new HttpError(400, 'That file does not look like a real PDF or Word document', 'bad_file_type');
    }
    const base = req.file.originalname
      .replace(/\.[^.]+$/, '')
      .normalize('NFKD')
      .replace(/[^\w-]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60) || 'manuscript';
    const result = await uploadBuffer(req.file.buffer, {
      folder: `${env.cloudinary.folder}/manuscripts`,
      public_id: `${Date.now()}-${base}.${ext}`,
      resource_type: 'raw',
      type: 'authenticated',
    });
    file = { publicId: result.public_id, name: req.file.originalname, bytes: req.file.size, format: ext };
  }

  const { agree, ...rest } = data;
  const reference = await uniqueReference();
  await Submission.create({ ...rest, reference, file });
  res.status(201).json({ reference });
});

router.post('/subscribers', limiter(20, 60), async (req, res) => {
  const { email, lang } = subscriberInput.parse(req.body || {});
  // Upsert quietly and always answer the same way, so the response does not
  // reveal whether an address is already on the list.
  await Subscriber.updateOne({ email }, { $setOnInsert: { email, lang } }, { upsert: true });
  res.status(201).json({ ok: true });
});

export default router;
