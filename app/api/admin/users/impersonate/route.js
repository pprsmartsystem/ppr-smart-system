import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, generateToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate 1-hour token for target user
    const impersonateToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      impersonatedBy: decoded.userId,
    });

    return NextResponse.json({
      success: true,
      token: impersonateToken,
      role: user.role,
      redirectUrl: `/${user.role}`,
    });

  } catch (err) {
    console.error('[impersonate]', err.message);
    return NextResponse.json({ error: 'Failed to impersonate' }, { status: 500 });
  }
}
