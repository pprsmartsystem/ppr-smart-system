import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { sendOTP } from '@/lib/fast2sms';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    await dbConnect();

    const { mobile } = await request.json();

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (10 minutes)
    otpStore.set(mobile, {
      otp,
      userId: decoded.userId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log(`\n=== OTP Generation ===`);
    console.log(`Mobile: ${mobile}`);
    console.log(`OTP: ${otp}`);
    console.log(`User ID: ${decoded.userId}`);
    console.log(`======================\n`);

    // Send OTP via Fast2SMS
    try {
      const result = await sendOTP(mobile, otp);
      console.log('Fast2SMS Response:', JSON.stringify(result, null, 2));
      
      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully',
        requestId: result.request_id,
        // Include OTP in development mode only
        ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
      });
    } catch (smsError) {
      console.error('\n=== Fast2SMS Error ===');
      console.error('Error:', smsError.message);
      console.error('======================\n');
      
      // Return OTP in error for development testing
      return NextResponse.json({ 
        error: `SMS Error: ${smsError.message}`,
        details: 'Check Fast2SMS credits, API key, or use dev OTP below',
        // Include OTP in development mode for testing
        ...(process.env.NODE_ENV === 'development' && { devOtp: otp, devNote: 'Use this OTP for testing' })
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send OTP' 
    }, { status: 500 });
  }
}

export { otpStore };
