import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserSettings from '@/models/UserSettings';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get user settings for each user
    const usersWithSettings = await Promise.all(
      users.map(async (user) => {
        const settings = await UserSettings.findOne({ userId: user._id }) || {
          autoSettlement: true,
          autoCashback: true
        };
        return {
          ...user.toObject(),
          autoSettlement: settings.autoSettlement,
          autoCashback: settings.autoCashback
        };
      })
    );

    return NextResponse.json({ users: usersWithSettings });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
