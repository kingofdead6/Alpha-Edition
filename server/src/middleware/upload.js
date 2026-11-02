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

/** Confirms a buffer really is the document type it claims, by magic bytes. */
export function sniffDocType(buffer) {
  if (!buffer || buffer.length < 4) return null;
  const b = buffer;
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'pdf'; // %PDF
  if (b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07)) return 'docx'; // PK zip
  if (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return 'doc'; // OLE
  return null;
}

export const manuscriptUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 20, fieldSize: 20_000 },
  fileFilter: (req, file, cb) =>
    DOC_TYPES[file.mimetype]
      ? cb(null, true)
      : cb(new HttpError(400, 'Attach a PDF or Word document', 'bad_file_type')),
});
