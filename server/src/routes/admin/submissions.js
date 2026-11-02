import { Router } from 'express';
import Submission from '../../models/Submission.js';
import { destroyAsset, signedManuscriptUrl } from '../../config/cloudinary.js';
import { HttpError, escapeRegex } from '../../utils/http.js';
import { SUBMISSION_STATUSES } from '../../utils/constants.js';
import { submissionUpdate } from '../../validators.js';

const router = Router();
const PAGE_SIZE = 20;

router.get('/', async (req, res) => {
  const filter = {};
  if (SUBMISSION_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  const q = String(req.query.q || '').trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { title: rx }, { reference: rx }];
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const [items, total, counts] = await Promise.all([
    Submission.find(filter)
      .select('-synopsis -notes')
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Submission.countDocuments(filter),
    Submission.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);

  res.json({
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    counts: Object.fromEntries(counts.map((c) => [c._id, c.n])),
  });
});

router.get('/:id', async (req, res) => {
  const submission = await Submission.findById(req.params.id).lean();
  if (!submission) throw new HttpError(404, 'Submission not found', 'not_found');
  const fileUrl = submission.file?.publicId ? signedManuscriptUrl(submission.file.publicId) : null;
  res.json({ submission, fileUrl });
});

router.patch('/:id', async (req, res) => {
  const data = submissionUpdate.parse(req.body || {});
  const submission = await Submission.findByIdAndUpdate(req.params.id, { $set: data }, { new: true }).lean();
  if (!submission) throw new HttpError(404, 'Submission not found', 'not_found');
  res.json({ submission });
});

router.delete('/:id', async (req, res) => {
  const submission = await Submission.findByIdAndDelete(req.params.id);
  if (!submission) throw new HttpError(404, 'Submission not found', 'not_found');
  await destroyAsset(submission.file?.publicId, { resourceType: 'raw', type: 'authenticated' });
  res.status(204).end();
});

export default router;
