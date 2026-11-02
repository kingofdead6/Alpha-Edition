import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

const { cloudName, apiKey, apiSecret } = env.cloudinary;
export const cloudinaryReady = Boolean(cloudName && apiKey && apiSecret);

if (cloudinaryReady) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
} else {
  console.warn('  Cloudinary is not configured: image and manuscript uploads are disabled.');
}

export function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

export async function destroyAsset(publicId, { resourceType = 'image', type = 'upload' } = {}) {
  if (!publicId || !cloudinaryReady) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type, invalidate: true });
  } catch (err) {
    console.warn(`  Could not delete Cloudinary asset ${publicId}: ${err.message}`);
  }
}

/** Short-lived signed link to a private manuscript */
export function signedManuscriptUrl(publicId, ttlSeconds = 600) {
  if (!publicId || !cloudinaryReady) return null;
  // Expiring, signed download link (valid for ttlSeconds, default 10 min).
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

export const ownsAsset = (publicId) =>
  typeof publicId === 'string' && publicId.startsWith(`${env.cloudinary.folder}/`);
