import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const DEFAULT_MESSAGE = `We would like to inform you that due to an internal system update, our platform is currently under maintenance.

During this period, certain services may be temporarily unavailable. We request you to kindly hold your transactions until the maintenance is completed.

Our team is actively working to restore all services at the earliest.`;

async function getCollection() {
  await connectDB();
  // Wait until connection is fully ready
  if (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => mongoose.connection.once('connected', resolve));
  }
  return mongoose.connection.db.collection('usersettings');
}

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, enabled, message } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const col = await getCollection();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    await col.updateOne(
      { userId: userObjectId },
      {
        $set: {
          maintenanceMode: enabled === true,
          maintenanceMessage: message || DEFAULT_MESSAGE,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} for user`,
    });
  } catch (err) {
    console.error('[maintenance/POST]', err);
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
