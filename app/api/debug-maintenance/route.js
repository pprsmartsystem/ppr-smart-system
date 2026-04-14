import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  const result = {
    step: '',
    readyState: -1,
    dbName: '',
    collections: [],
    maintenanceDocs: [],
    error: null,
  };

  try {
    result.step = 'connecting';
    await connectDB();

    result.step = 'checking readyState';
    result.readyState = mongoose.connection.readyState;

    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Connection timeout')), 5000);
        mongoose.connection.once('connected', () => { clearTimeout(t); resolve(); });
      });
    }

    result.step = 'getting db';
    result.dbName = mongoose.connection.db.databaseName;

    result.step = 'listing collections';
    const cols = await mongoose.connection.db.listCollections().toArray();
    result.collections = cols.map(c => c.name);

    result.step = 'querying usersettings';
    const col = mongoose.connection.db.collection('usersettings');
    const docs = await col.find({}, { projection: { userId: 1, maintenanceMode: 1 } }).limit(5).toArray();
    result.maintenanceDocs = docs.map(d => ({
      userId: d.userId?.toString(),
      maintenanceMode: d.maintenanceMode,
    }));

    result.step = 'done';
  } catch (err) {
    result.error = err.message;
  }

  return NextResponse.json(result);
}
