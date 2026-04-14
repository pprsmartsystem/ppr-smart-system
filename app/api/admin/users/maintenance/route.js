import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserSettings from '@/models/UserSettings';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { userId, enabled, message } = await request.json();

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const update = { maintenanceMode: enabled };
    if (message !== undefined) update.maintenanceMessage = message;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} for user`,
      settings,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update maintenance mode' }, { status: 500 });
  }
}
