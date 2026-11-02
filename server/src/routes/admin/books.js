import { Router } from 'express';
import Book from '../../models/Book.js';
import Author from '../../models/Author.js';
import { destroyAsset } from '../../config/cloudinary.js';
import { HttpError, escapeRegex, uniqueSlug } from '../../utils/http.js';
import { CATEGORIES, STATUSES } from '../../utils/constants.js';
import { bookInput } from '../../validators.js';

const router = Router();

router.get('/', async (req, res) => {
  const filter = {};
  const q = String(req.query.q || '').trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ 'title.en': rx }, { 'title.ar': rx }, { isbn: rx }];
  }
  if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (CATEGORIES.includes(req.query.category)) filter.category = req.query.category;

  const books = await Book.find(filter)
    .select('-sample -synopsis')
    .populate('author', 'name')
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ books });
});

router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) throw new HttpError(404, 'Book not found', 'not_found');
  res.json({ book });
});

async function assertAuthor(id) {
  if (!(await Author.exists({ _id: id }))) {
    throw new HttpError(400, 'Choose an author', 'validation', [
      { path: 'author', code: 'invalid', message: 'Choose an author' },
    ]);
  }
}

async function clearOtherFeatured(id) {
  await Book.updateMany({ _id: { $ne: id }, featured: true }, { $set: { featured: false } });
}

router.post('/', async (req, res) => {
  const data = bookInput.parse(req.body || {});
  await assertAuthor(data.author);
  const slug = await uniqueSlug(Book, data.title.en || data.title.ar);
  const book = await Book.create({ ...data, slug });
  if (book.featured) await clearOtherFeatured(book._id);
  res.status(201).json({ book });
});

router.put('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new HttpError(404, 'Book not found', 'not_found');
  const data = bookInput.parse(req.body || {});
  await assertAuthor(data.author);

  const oldImage = book.cover?.image?.publicId;
  const newImage = data.cover?.image?.publicId;
  book.set(data);
  await book.save();

  if (oldImage && oldImage !== newImage) await destroyAsset(oldImage);
  if (book.featured) await clearOtherFeatured(book._id);
  res.json({ book });
});

router.delete('/:id', async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) throw new HttpError(404, 'Book not found', 'not_found');
  await destroyAsset(book.cover?.image?.publicId);
  res.status(204).end();
});

export default router;
