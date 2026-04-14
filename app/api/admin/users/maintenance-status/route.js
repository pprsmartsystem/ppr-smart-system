import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserSettings from '@/models/UserSettings';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const settings = await UserSettings.find({ maintenanceMode: true }).select('userId');
    const maintenanceUserIds = settings.map(s => s.userId.toString());

    return NextResponse.json({ maintenanceUserIds });
  } catch {
    return NextResponse.json({ maintenanceUserIds: [] });
  }
}
