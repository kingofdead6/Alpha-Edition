import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import Admin from '../models/Admin.js';
import { HttpError } from '../utils/http.js';

export const signToken = (admin) =>
  jwt.sign({ sub: String(admin._id), tv: admin.tokenVersion || 0 }, env.jwtSecret, { expiresIn: '12h' });

export async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Please sign in', 'unauthorized');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Your session has expired. Sign in again.', 'unauthorized');
  }

  const admin = await Admin.findById(payload.sub).select('-passwordHash').lean();
  if (!admin) throw new HttpError(401, 'Please sign in', 'unauthorized');
  if ((admin.tokenVersion || 0) !== (payload.tv || 0)) {
    throw new HttpError(401, 'Your session has expired. Sign in again.', 'unauthorized');
  }
  req.admin = admin;
  next();
}
