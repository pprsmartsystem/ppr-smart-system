import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const col = mongoose.connection.db.collection('usersettings');
    const docs = await col.find({ maintenanceMode: true }, { projection: { userId: 1 } }).toArray();
    const maintenanceUserIds = docs.map(d => d.userId.toString());

    return NextResponse.json({ maintenanceUserIds });
  } catch (err) {
    console.error('[maintenance-status]', err.message);
    return NextResponse.json({ maintenanceUserIds: [] });
  }
}
