import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is on hold FIRST (before general status check)
    if (user.isOnHold) {
      return NextResponse.json(
        { success: false, message: `Your account is temporarily on hold${user.holdReason ? '. Reason: ' + user.holdReason : '. Please contact admin.'}` },
        { status: 403 }
      );
    }

    if (user.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'Your account is pending approval' },
        { status: 403 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    const redirectUrl = `/${user.role}`;
    
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      redirectUrl: redirectUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // Set to false for localhost
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    console.log('✅ Login successful:', user.email, '→', redirectUrl);
    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
