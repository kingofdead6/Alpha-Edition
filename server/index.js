import env, { requireEnv } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { createApp } from './src/app.js';
import Admin from './src/models/Admin.js';
import Settings from './src/models/Settings.js';

requireEnv(['MONGODB_URI', 'JWT_SECRET']);

await connectDB();
await Settings.getSingleton();

// Create the first admin from .env if there is none yet
if (!(await Admin.exists({}))) {
  if (env.admin.email && env.admin.password) {
    await Admin.create({
      name: env.admin.name,
      email: env.admin.email,
      passwordHash: await Admin.hash(env.admin.password),
    });
    console.log(`  Admin account created for ${env.admin.email}`);
  } else {
    console.warn('  No admin account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env and restart.');
  }
}

createApp().listen(env.port, () => {
  console.log(`  API ready on http://localhost:${env.port}`);
});
