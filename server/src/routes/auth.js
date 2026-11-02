import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { HttpError } from '../utils/http.js';
import { loginInput } from '../validators.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Wait 15 minutes and try again.', code: 'rate_limited' },
});

const shape = (a) => ({ id: String(a._id), name: a.name, email: a.email });

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = loginInput.parse(req.body || {});
  const admin = await Admin.findOne({ email });
  const ok = admin ? await admin.checkPassword(password) : false;
  if (!ok) throw new HttpError(401, 'Email or password is incorrect', 'invalid_credentials');
  res.json({ token: signToken(admin), admin: shape(admin) });
});

router.get('/me', requireAuth, (req, res) => res.json({ admin: shape(req.admin) }));

export default router;
