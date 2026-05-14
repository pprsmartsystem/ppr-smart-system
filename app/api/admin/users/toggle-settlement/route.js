import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { userId, action, reason } = await request.json();

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'block') {
      user.settlementBlocked = true;
      user.settlementBlockReason = reason || 'Settlement blocked by admin';
    } else if (action === 'unblock') {
      user.settlementBlocked = false;
      user.settlementBlockReason = null;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: action === 'block'
        ? 'Settlement blocked for user'
        : 'Settlement unblocked for user',
    });
  } catch (err) {
    console.error('[toggle-settlement]', err.message);
    return NextResponse.json({ error: 'Failed to update settlement status' }, { status: 500 });
  }
}
