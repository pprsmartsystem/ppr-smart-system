import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { otpStore } from '../send-otp/route';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const { mobile, otp } = await request.json();

    if (!mobile || !otp) {
      return NextResponse.json({ error: 'Mobile and OTP required' }, { status: 400 });
    }

    const storedData = otpStore.get(mobile);

    if (!storedData) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    if (storedData.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 403 });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(mobile);
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (storedData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // OTP verified successfully
    otpStore.delete(mobile);

    return NextResponse.json({ 
      success: true, 
      message: 'Mobile number verified successfully' 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ 
      error: 'Verification failed' 
    }, { status: 500 });
  }
}
