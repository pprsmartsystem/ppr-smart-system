export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import KYC from '@/models/KYC';
import Settlement from '@/models/Settlement';
import { sendMail } from '@/lib/mailer';
import { settlementInitiatedEmail } from '@/lib/emails/settlementInitiated';

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

    // Check if settlement is blocked by admin
    if (user.settlementBlocked) {
      return NextResponse.json({ 
        error: user.settlementBlockReason || 'Settlement is currently blocked for your account. Please contact support.' 
      }, { status: 403 });
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

    const GLOBAL_RATE = 1.77;
    const rate = (user.settlementRate !== null && user.settlementRate !== undefined)
      ? user.settlementRate
      : GLOBAL_RATE;

    const deduction = parseFloat(((amount * rate) / 100).toFixed(2));
    const settlementAmount = parseFloat((amount - deduction).toFixed(2));

    // Deduct from wallet immediately
    user.walletBalance -= amount;
    await user.save();

    // Create pending settlement record for admin to process
    await Settlement.create({
      userId: decoded.userId,
      spendAmount: amount,
      settlementRate: rate,
      settlementAmount,
      type: 'manual',
      source: 'user',
      status: 'pending',
      scheduledFor: settlementDate,
    });

    // Send email notification
    try {
      await sendMail({
        to: user.email,
        subject: 'Settlement Initiated — PPR Smart System',
        html: settlementInitiatedEmail({
          name: user.name,
          amount: settlementAmount,
          settlementDate,
          reference: `SETTLE-${Date.now()}`,
          walletBalance: user.walletBalance,
        }),
      });
    } catch (mailErr) {
      console.error('[settlement-mail]', mailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `₹${settlementAmount.toFixed(2)} settlement request submitted${rate > 0 ? ` (after ${rate}% deduction)` : ''}. Amount will be credited on ${settlementDate.toLocaleDateString('en-IN')}`,
      settlementDate,
      settlementAmount,
      deduction,
      rate,
    });
  } catch (error) {
    console.error('Settlement error:', error);
    return NextResponse.json({ error: 'Settlement failed' }, { status: 500 });
  }
}
