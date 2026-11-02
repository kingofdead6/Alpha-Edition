import slugify from 'slugify';

export class HttpError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function uniqueSlug(Model, base, excludeId) {
  const root =
    slugify(String(base || ''), { lower: true, strict: true, trim: true }) ||
    `item-${Date.now().toString(36)}`;
  let slug = root;
  let n = 2;
  const filter = (s) => ({ slug: s, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists(filter(slug))) slug = `${root}-${n++}`;
  return slug;
}

export const isObjectId = (v) => /^[0-9a-f]{24}$/i.test(String(v));
