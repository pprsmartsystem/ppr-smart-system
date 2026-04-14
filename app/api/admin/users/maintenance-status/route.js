import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    // Use raw collection to bypass any schema/model cache issues
    const collection = mongoose.connection.collection('usersettings');
    const docs = await collection.find({ maintenanceMode: true }, { projection: { userId: 1 } }).toArray();
    const maintenanceUserIds = docs.map(d => d.userId.toString());

    return NextResponse.json({ maintenanceUserIds });
  } catch (err) {
    console.error('maintenance-status error:', err);
    return NextResponse.json({ maintenanceUserIds: [] });
  }
}
