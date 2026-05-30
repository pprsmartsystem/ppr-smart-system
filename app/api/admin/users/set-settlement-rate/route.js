import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { userId, rate } = await request.json();

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    // rate = null means reset to global default (1.77%)
    if (rate !== null && (isNaN(rate) || rate < 0 || rate > 100)) {
      return NextResponse.json({ error: 'Rate must be between 0 and 100' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.settlementRate = rate === null || rate === '' ? null : parseFloat(rate);
    await user.save();

    return NextResponse.json({
      success: true,
      message: rate === null || rate === ''
        ? 'Settlement rate reset to global default (1.77%)'
        : `Settlement rate set to ${rate}% for ${user.name}`,
    });
  } catch (err) {
    console.error('[set-settlement-rate]', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
