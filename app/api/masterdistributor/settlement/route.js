import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Settlement from '@/models/Settlement';
import Transaction from '@/models/Transaction';
import { sendMail } from '@/lib/mailer';
import { settlementInitiatedEmail } from '@/lib/emails/settlementInitiated';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const settlements = await Settlement.find({
      userId: decoded.userId,
      source: 'masterdistributor',
    }).sort({ createdAt: -1 });

    const user = await User.findById(decoded.userId).select('walletBalance settlementRate settlementActivated createdAt');

    const hoursSinceCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60);
    const isWithin72Hours = hoursSinceCreation < 72;
    const limitActive = isWithin72Hours && !user.settlementActivated;
    const hoursRemaining = Math.max(0, Math.ceil(72 - hoursSinceCreation));

    return NextResponse.json({
      settlements,
      walletBalance: user.walletBalance,
      settlementRate: user.settlementRate,
      settlementActivated: user.settlementActivated,
      limitActive,
      hoursRemaining,
      maxAmount: limitActive ? 25000 : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const { amount, bankDetails } = await request.json();

    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (amount < 10000) return NextResponse.json({ error: 'Minimum settlement amount is ₹10,000' }, { status: 400 });

    if (!bankDetails?.accountNumber || !bankDetails?.ifscCode || !bankDetails?.bankName) {
      return NextResponse.json({ error: 'Bank details are required' }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);

    if (user.isOnHold || user.status === 'blocked') {
      return NextResponse.json({ error: 'Your account is on hold' }, { status: 403 });
    }

    if (user.walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // 72-hour limit check: ₹25,000 max until activated
    const hoursSinceCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60);
    const isWithin72Hours = hoursSinceCreation < 72;

    if (isWithin72Hours && !user.settlementActivated) {
      if (amount > 25000) {
        return NextResponse.json({
          error: 'Settlement limit is ₹25,000 for the first 72 hours. Request activation from admin to increase limit.',
          limitActive: true,
        }, { status: 400 });
      }
    }

    // Check for existing pending settlement
    const existing = await Settlement.findOne({ userId: decoded.userId, source: 'masterdistributor', status: 'pending' });
    if (existing) return NextResponse.json({ error: 'You already have a pending settlement request' }, { status: 400 });

    // Check daily limit - one settlement per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySettlement = await Settlement.findOne({
      userId: decoded.userId,
      source: 'masterdistributor',
      createdAt: { $gte: today },
    });
    if (todaySettlement) {
      return NextResponse.json({ error: 'You can only initiate one settlement per day' }, { status: 400 });
    }

    // Calculate deduction: ₹300 per ₹100,000
    const deduction = parseFloat(((amount / 100000) * 300).toFixed(2));
    const settlementAmount = parseFloat((amount - deduction).toFixed(2));

    // Deduct from wallet immediately
    user.walletBalance -= amount;
    await user.save();

    // Create transaction for deduction
    await Transaction.create({
      userId: decoded.userId,
      type: 'debit',
      amount,
      status: 'completed',
      description: 'Settlement request initiated - wallet deducted',
      reference: `MD-SETTLE-${Date.now()}`,
    });

    const settlement = await Settlement.create({
      userId: decoded.userId,
      spendAmount: amount,
      settlementRate: 0.3, // Store as 0.3% for reference
      settlementAmount,
      type: 'manual',
      source: 'masterdistributor',
      status: 'pending',
      bankDetails,
    });

    // Send email notification
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        await sendMail({
          to: user.email,
          subject: '⏳ Settlement Request Submitted — PPR Smart System',
          html: settlementInitiatedEmail({
            name: user.name,
            amount: settlementAmount,
            deduction,
            requestedAmount: amount,
            reference: settlement._id.toString(),
            bankDetails,
            date: new Date(),
          }),
        });
      } catch (emailErr) {
        console.error('Settlement email notification failed:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Settlement request of ₹${settlementAmount.toFixed(2)} submitted. Awaiting admin approval.`,
      deduction,
      settlementAmount,
    });
  } catch (error) {
    console.error('[md-settlement]', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
