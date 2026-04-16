import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, generateToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Verify admin
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', request.url));

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate a short-lived token for the target user (1 hour)
    const impersonateToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      impersonatedBy: decoded.userId,
    });

    // Redirect to user's dashboard with the token set as cookie
    const redirectUrl = new URL(`/${user.role}`, request.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('token', impersonateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[impersonate]', err.message);
    return NextResponse.json({ error: 'Failed to impersonate' }, { status: 500 });
  }
}
