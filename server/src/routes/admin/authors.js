import { Router } from 'express';
import Author from '../../models/Author.js';
import Book from '../../models/Book.js';
import { destroyAsset } from '../../config/cloudinary.js';
import { HttpError, escapeRegex, uniqueSlug } from '../../utils/http.js';
import { authorInput } from '../../validators.js';

const router = Router();

router.get('/', async (req, res) => {
  const filter = {};
  const q = String(req.query.q || '').trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ 'name.en': rx }, { 'name.ar': rx }];
  }
  const [authors, counts] = await Promise.all([
    Author.find(filter).select('-bio').sort({ 'name.en': 1 }).lean(),
    Book.aggregate([{ $group: { _id: '$author', n: { $sum: 1 } } }]),
  ]);
  const byAuthor = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json({ authors: authors.map((a) => ({ ...a, bookCount: byAuthor[String(a._id)] || 0 })) });
});

router.get('/:id', async (req, res) => {
  const author = await Author.findById(req.params.id).lean();
  if (!author) throw new HttpError(404, 'Author not found', 'not_found');
  res.json({ author });
});

async function clearOtherFeatured(id) {
  await Author.updateMany({ _id: { $ne: id }, featured: true }, { $set: { featured: false } });
}

router.post('/', async (req, res) => {
  const data = authorInput.parse(req.body || {});
  const slug = await uniqueSlug(Author, data.name.en || data.name.ar);
  const author = await Author.create({ ...data, slug });
  if (author.featured) await clearOtherFeatured(author._id);
  res.status(201).json({ author });
});

router.put('/:id', async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (!author) throw new HttpError(404, 'Author not found', 'not_found');
  const data = authorInput.parse(req.body || {});
  const oldPhoto = author.photo?.publicId;
  author.set(data);
  await author.save();
  if (oldPhoto && oldPhoto !== data.photo?.publicId) await destroyAsset(oldPhoto);
  if (author.featured) await clearOtherFeatured(author._id);
  res.json({ author });
});

router.delete('/:id', async (req, res) => {
  const count = await Book.countDocuments({ author: req.params.id });
  if (count) {
    throw new HttpError(
      409,
      `This author has ${count} book(s). Move or delete those books first.`,
      'author_has_books'
    );
  }
  const author = await Author.findByIdAndDelete(req.params.id);
  if (!author) throw new HttpError(404, 'Author not found', 'not_found');
  await destroyAsset(author.photo?.publicId);
  res.status(204).end();
});

export default router;
