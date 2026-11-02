import { ZodError } from 'zod';
import multer from 'multer';
import mongoose from 'mongoose';

export const notFound = (req, res) => res.status(404).json({ message: 'Not found', code: 'not_found' });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Some fields need attention',
      code: 'validation',
      details: err.issues.map((i) => ({ path: i.path.join('.'), code: i.code, message: i.message })),
    });
  }
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    return res.status(400).json({
      message: tooBig ? 'That file is too large' : err.message,
      code: tooBig ? 'file_too_large' : 'upload_failed',
    });
  }
  if (err?.code === 11000) {
    return res.status(409).json({
      message: 'That value is already in use',
      code: 'duplicate',
      details: Object.keys(err.keyPattern || {}).map((path) => ({ path, code: 'duplicate', message: 'Already in use' })),
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ message: 'Not found', code: 'not_found' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'That request is too large', code: 'file_too_large' });
  }
  if (err?.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message, code: err.code, details: err.details });
  }
  if (err?.http_code) {
    console.error('Cloudinary error:', err.message);
    return res.status(502).json({ message: 'The file could not be stored. Try again.', code: 'upload_failed' });
  }
  console.error(err);
  return res.status(err?.status || 500).json({ message: err?.status ? err.message : 'Something went wrong on the server', code: typeof err?.code === 'string' ? err.code : 'server' });
}
