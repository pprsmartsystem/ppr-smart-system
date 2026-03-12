import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Settlement from '@/models/Settlement';
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
    const settlements = await Settlement.find().populate('userId', 'name email').sort({ createdAt: -1 });
    return NextResponse.json({ settlements });
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
    const { action, userId, settlementId, enabled, spendAmount } = await request.json();

    if (action === 'process' && settlementId) {
      const settlement = await Settlement.findById(settlementId);
      const user = await User.findById(settlement.userId);
      
      user.walletBalance += settlement.settlementAmount;
      await user.save();

      settlement.status = 'processed';
      settlement.processedAt = new Date();
      await settlement.save();

      await Transaction.create({
        userId: settlement.userId,
        type: 'credit',
        amount: settlement.settlementAmount,
        status: 'completed',
        description: 'Settlement',
        reference: `SETTLE${Date.now()}`,
      });

      return NextResponse.json({ success: true, message: 'Settlement processed' });
    }

    if (action === 'toggle_auto' && userId) {
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        { $set: { autoSettlement: enabled } },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, settings });
    }

    if (action === 'create_settlement' && userId && spendAmount) {
      const settlementRate = 1.77;
      const deductionAmount = (spendAmount * settlementRate) / 100;
      const settlementAmount = spendAmount - deductionAmount; // Spend minus deduction

      const settlement = await Settlement.create({
        userId,
        spendAmount,
        settlementRate,
        settlementAmount,
        type: 'manual',
        status: 'pending',
      });

      return NextResponse.json({ success: true, settlement });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}