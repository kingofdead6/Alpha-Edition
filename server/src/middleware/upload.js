import multer from 'multer';
import { HttpError } from '../utils/http.js';

const storage = multer.memoryStorage();

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const DOC_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export const imageUpload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    IMAGE_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(400, 'Use a JPG, PNG, WebP or AVIF image', 'bad_file_type')),
});

export const manuscriptUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 20, fieldSize: 20_000 },
  fileFilter: (req, file, cb) =>
    DOC_TYPES[file.mimetype]
      ? cb(null, true)
      : cb(new HttpError(400, 'Attach a PDF or Word document', 'bad_file_type')),
});
