/**
 * Fills the database with the sample catalogue.
 *   npm run seed         → only adds data if there are no books yet
 *   npm run seed:fresh   → deletes books and authors, then re-creates them
 *   --reset-admin        → also resets the admin password to ADMIN_PASSWORD
 */
import mongoose from 'mongoose';
import env, { requireEnv } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import Author from '../models/Author.js';
import Book from '../models/Book.js';
import Settings from '../models/Settings.js';
import { uniqueSlug } from '../utils/http.js';
import { authors, books } from './data.js';

const fresh = process.argv.includes('--fresh');
const resetAdmin = process.argv.includes('--reset-admin');

function isbnFor(i) {
  const base = `9789947701${String(i + 1).padStart(2, '0')}`;
  let sum = 0;
  for (let k = 0; k < 12; k++) sum += Number(base[k]) * (k % 2 ? 3 : 1);
  const d = base + ((10 - (sum % 10)) % 10);
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 10)}-${d.slice(10, 12)}-${d[12]}`;
}

async function run() {
  requireEnv(['MONGODB_URI']);
  await connectDB();

  // Admin
  if (env.admin.email && env.admin.password) {
    const existing = await Admin.findOne({ email: env.admin.email });
    if (!existing) {
      await Admin.create({ name: env.admin.name, email: env.admin.email, passwordHash: await Admin.hash(env.admin.password) });
      console.log(`  ✓ Admin created: ${env.admin.email}`);
    } else if (resetAdmin) {
      existing.passwordHash = await Admin.hash(env.admin.password);
      await existing.save();
      console.log(`  ✓ Admin password reset: ${env.admin.email}`);
    } else {
      console.log(`  • Admin already exists: ${env.admin.email}`);
    }
  } else {
    console.log('  • Skipped admin: set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env');
  }

  // Settings
  const settings = await Settings.getSingleton();
  if (!settings.readingPeriod?.endsAt) {
    settings.readingPeriod = { isOpen: true, endsAt: new Date('2027-01-15T23:59:00Z') };
    await settings.save();
  }
  console.log('  ✓ Site settings ready');

  // Catalogue
  if (fresh) {
    await Promise.all([Book.deleteMany({}), Author.deleteMany({})]);
    console.log('  • Cleared books and authors');
  } else if (await Book.exists({})) {
    console.log('  • Books already exist. Run "npm run seed:fresh" to replace them.');
    await disconnectDB();
    return;
  }

  const ids = {};
  for (const a of authors) {
    const { key, ...data } = a;
    // eslint-disable-next-line no-await-in-loop
    const doc = await Author.create({ ...data, slug: await uniqueSlug(Author, data.name.en), status: 'published' });
    ids[key] = doc._id;
  }
  console.log(`  ✓ ${authors.length} authors`);

  for (const [i, b] of books.entries()) {
    // eslint-disable-next-line no-await-in-loop
    await Book.create({
      ...b,
      author: ids[b.author],
      slug: await uniqueSlug(Book, b.title.en),
      isbn: isbnFor(i),
      publishedAt: new Date(b.publishedAt),
      cover: { mode: 'generated', ...b.cover },
      status: 'published',
    });
  }
  console.log(`  ✓ ${books.length} books`);

  await disconnectDB();
  console.log('\n  Done. Start the app with "npm run dev" from the project root.\n');
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
