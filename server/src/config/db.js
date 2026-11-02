import mongoose from 'mongoose';
import env from './env.js';

// Unknown fields in filters are dropped. User input is always cast with String()
// or parsed by zod before it reaches a query, so operator injection is not possible.
mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log(`  MongoDB connected (${mongoose.connection.name})`);
  } catch (err) {
    console.error('\n  Could not connect to MongoDB. Check MONGODB_URI in server/.env');
    console.error(`  ${err.message}\n`);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
