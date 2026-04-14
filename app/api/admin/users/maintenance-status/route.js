import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

async function getCollection() {
  await connectDB();
  if (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => mongoose.connection.once('connected', resolve));
  }
  return mongoose.connection.db.collection('usersettings');
}

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const col = await getCollection();
    const docs = await col.find(
      { maintenanceMode: true },
      { projection: { userId: 1 } }
    ).toArray();

    const maintenanceUserIds = docs.map(d => d.userId.toString());
    return NextResponse.json({ maintenanceUserIds });
  } catch (err) {
    console.error('[maintenance-status/GET]', err);
    return NextResponse.json({ maintenanceUserIds: [] });
  }
}
