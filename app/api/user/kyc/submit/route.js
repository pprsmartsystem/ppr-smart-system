import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import KYC from '@/models/KYC';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    await dbConnect();

    const data = await request.json();

    const existingKYC = await KYC.findOne({ userId: decoded.userId });
    if (existingKYC) {
      return NextResponse.json({ error: 'KYC already submitted' }, { status: 400 });
    }

    const kyc = new KYC({
      userId: decoded.userId,
      ...data,
    });

    await kyc.save();

    return NextResponse.json({
      success: true,
      message: 'KYC submitted successfully',
    });
  } catch (error) {
    console.error('KYC submit error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
