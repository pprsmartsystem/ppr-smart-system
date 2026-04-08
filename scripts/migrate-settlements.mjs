import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

await mongoose.connect(process.env.MONGODB_URI);

const Settlement = mongoose.model('Settlement', new mongoose.Schema({}, { strict: false }));

// Tag all records that have scheduledFor set as source:'user' (user-initiated)
const userResult = await Settlement.updateMany(
  { scheduledFor: { $exists: true }, source: { $exists: false } },
  { $set: { source: 'user' } }
);

// Tag all remaining records without source as source:'admin'
const adminResult = await Settlement.updateMany(
  { source: { $exists: false } },
  { $set: { source: 'admin' } }
);

console.log(`Tagged ${userResult.modifiedCount} records as source:'user'`);
console.log(`Tagged ${adminResult.modifiedCount} records as source:'admin'`);

await mongoose.disconnect();
console.log('Migration complete.');
