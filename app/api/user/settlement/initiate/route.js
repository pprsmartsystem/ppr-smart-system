import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import KYC from '@/models/KYC';
import Settlement from '@/models/Settlement';

const MIN_SETTLEMENT = 10000;

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    await dbConnect();

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (amount < MIN_SETTLEMENT) {
      return NextResponse.json({ error: `Minimum settlement amount is ₹${MIN_SETTLEMENT.toLocaleString('en-IN')}` }, { status: 400 });
    }

    const kyc = await KYC.findOne({ userId: decoded.userId });
    if (!kyc || kyc.status !== 'approved') {
      return NextResponse.json({ error: 'KYC verification required to initiate settlement' }, { status: 403 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Check for existing pending settlement
    const existing = await Settlement.findOne({ userId: decoded.userId, status: 'pending' });
    if (existing) {
      return NextResponse.json({ error: 'You already have a pending settlement request' }, { status: 400 });
    }

    const getNextWorkingDay = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) d.setDate(d.getDate() + 1);
      if (d.getDay() === 6) d.setDate(d.getDate() + 2);
      return d;
    };

    const settlementDate = getNextWorkingDay();

    // Deduct from wallet immediately
    user.walletBalance -= amount;
    await user.save();

    // Create pending settlement record for admin to process
    await Settlement.create({
      userId: decoded.userId,
      spendAmount: amount,
      settlementRate: 0,
      settlementAmount: amount,
      type: 'manual',
      source: 'user',
      status: 'pending',
      scheduledFor: settlementDate,
    });

    return NextResponse.json({
      success: true,
      message: `₹${amount.toFixed(2)} settlement request submitted. Amount will be credited on ${settlementDate.toLocaleDateString('en-IN')}`,
      settlementDate,
    });
  } catch (error) {
    console.error('Settlement error:', error);
    return NextResponse.json({ error: 'Settlement failed' }, { status: 500 });
  }
}
