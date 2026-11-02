/** Shapes database documents into what the public site needs (no internal fields). */

export function publicAuthor(a, full = false) {
  if (!a) return null;
  const out = { id: String(a._id), slug: a.slug, name: a.name };
  if (full) Object.assign(out, { bio: a.bio, quote: a.quote, note: a.note, photo: a.photo || null });
  return out;
}

export function publicBook(b, full = false) {
  const out = {
    id: String(b._id),
    slug: b.slug,
    title: b.title,
    author: publicAuthor(b.author, full),
    translator: b.translator,
    translatedFrom: b.translatedFrom,
    category: b.category,
    synopsis: b.synopsis,
    excerpt: b.excerpt,
    pages: b.pages,
    format: b.format,
    price: b.price,
    isbn: b.isbn,
    publishedAt: b.publishedAt,
    cover: b.cover,
    newRelease: b.newRelease,
    featured: b.featured,
    hasSample: Boolean(b.sample?.en || b.sample?.ar),
  };
  if (full) out.sample = b.sample;
  return out;
}

export function publicSettings(s) {
  const now = new Date();
  const rp = s.readingPeriod || {};
  const open = Boolean(rp.isOpen) && (!rp.endsAt || new Date(rp.endsAt) >= now);
  return {
    contactEmail: s.contactEmail,
    phone: s.phone,
    address: s.address,
    hours: s.hours,
    readingPeriod: { isOpen: open, endsAt: rp.endsAt || null },
    stats: s.stats,
  };
}
