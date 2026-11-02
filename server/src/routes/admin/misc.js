import { Router } from 'express';
import env from '../../config/env.js';
import { cloudinaryReady, destroyAsset, ownsAsset, uploadBuffer } from '../../config/cloudinary.js';
import { imageUpload } from '../../middleware/upload.js';
import Book from '../../models/Book.js';
import Author from '../../models/Author.js';
import Submission from '../../models/Submission.js';
import Subscriber from '../../models/Subscriber.js';
import Settings from '../../models/Settings.js';
import { HttpError } from '../../utils/http.js';
import { SUBMISSION_STATUSES } from '../../utils/constants.js';
import { settingsInput } from '../../validators.js';

const router = Router();

/* ---------- Dashboard ---------- */
router.get('/stats', async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthAgo = new Date(now.getTime() - 30 * 86400_000);

  const [published, drafts, authors, byStatus, monthly, recent, subscribers, newSubscribers, byCategory] =
    await Promise.all([
      Book.countDocuments({ status: 'published' }),
      Book.countDocuments({ status: 'draft' }),
      Author.countDocuments(),
      Submission.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Submission.find({ createdAt: { $gte: start } }).select('createdAt').lean(),
      Submission.find().select('reference name title category status createdAt').sort({ createdAt: -1 }).limit(6).lean(),
      Subscriber.countDocuments(),
      Subscriber.countDocuments({ createdAt: { $gte: monthAgo } }),
      Book.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]),
    ]);

  const statusCounts = Object.fromEntries(SUBMISSION_STATUSES.map((s) => [s, 0]));
  byStatus.forEach((s) => { statusCounts[s._id] = s.n; });

  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = monthly.filter((m) => {
      const c = new Date(m.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    months.push({ month, count });
  }

  res.json({
    books: { published, drafts },
    authors,
    submissions: { byStatus: statusCounts, total: Object.values(statusCounts).reduce((a, b) => a + b, 0), months, recent },
    subscribers: { total: subscribers, last30: newSubscribers },
    categories: Object.fromEntries(byCategory.map((c) => [c._id, c.n])),
    uploadsEnabled: cloudinaryReady,
  });
});

/* ---------- Image uploads ---------- */
router.post('/uploads', imageUpload.single('image'), async (req, res) => {
  if (!cloudinaryReady) throw new HttpError(503, 'Cloudinary is not configured in server/.env', 'uploads_disabled');
  if (!req.file) throw new HttpError(400, 'Choose an image to upload', 'validation');
  const kind = ['covers', 'authors'].includes(req.body?.kind) ? req.body.kind : 'misc';
  const result = await uploadBuffer(req.file.buffer, {
    folder: `${env.cloudinary.folder}/${kind}`,
    resource_type: 'image',
    overwrite: false,
  });
  res.status(201).json({
    media: { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height },
  });
});

/** Discard an image that was uploaded but never saved */
router.delete('/uploads', async (req, res) => {
  const publicId = String(req.body?.publicId || '');
  if (!ownsAsset(publicId)) throw new HttpError(400, 'Unknown image', 'validation');
  const inUse =
    (await Book.exists({ 'cover.image.publicId': publicId })) ||
    (await Author.exists({ 'photo.publicId': publicId }));
  if (!inUse) await destroyAsset(publicId);
  res.status(204).end();
});

/* ---------- Subscribers ---------- */
router.get('/subscribers', async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
  res.json({ subscribers });
});

router.delete('/subscribers/:id', async (req, res) => {
  const sub = await Subscriber.findByIdAndDelete(req.params.id);
  if (!sub) throw new HttpError(404, 'Subscriber not found', 'not_found');
  res.status(204).end();
});

/* ---------- Settings ---------- */
router.get('/settings', async (req, res) => {
  res.json({ settings: await Settings.getSingleton() });
});

router.put('/settings', async (req, res) => {
  const data = settingsInput.parse(req.body || {});
  const settings = await Settings.getSingleton();
  settings.set(data);
  await settings.save();
  res.json({ settings });
});

export default router;
