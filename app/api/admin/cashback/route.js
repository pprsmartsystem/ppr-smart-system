import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Cashback from '@/models/Cashback';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import UserSettings from '@/models/UserSettings';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const cashbacks = await Cashback.find().populate('userId', 'name email').sort({ createdAt: -1 });
    return NextResponse.json({ cashbacks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { action, userId, cashbackId, enabled, spendAmount } = await request.json();

    if (action === 'process' && cashbackId) {
      const cashback = await Cashback.findById(cashbackId);
      const user = await User.findById(cashback.userId);
      
      user.walletBalance += cashback.cashbackAmount;
      await user.save();

      cashback.status = 'processed';
      cashback.processedAt = new Date();
      await cashback.save();

      await Transaction.create({
        userId: cashback.userId,
        type: 'credit',
        amount: cashback.cashbackAmount,
        status: 'completed',
        description: 'Cashback',
        reference: `CASH${Date.now()}`,
      });

      return NextResponse.json({ success: true, message: 'Cashback processed' });
    }

    if (action === 'manual_cashback' && userId && spendAmount) {
      const settings = await UserSettings.findOne({ userId }) || { cashbackRate: 4 };
      const cashbackAmount = (spendAmount * settings.cashbackRate) / 100;

      const cashback = await Cashback.create({
        userId,
        spendAmount,
        cashbackRate: settings.cashbackRate,
        cashbackAmount,
        type: 'manual',
        status: 'processed',
        processedAt: new Date(),
      });

      const user = await User.findById(userId);
      user.walletBalance += cashbackAmount;
      await user.save();

      await Transaction.create({
        userId,
        type: 'credit',
        amount: cashbackAmount,
        status: 'completed',
        description: 'Cashback',
        reference: `CASH${Date.now()}`,
      });

      return NextResponse.json({ success: true, cashback });
    }

    if (action === 'toggle_auto' && userId) {
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        { $set: { autoCashback: enabled } },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, settings });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}