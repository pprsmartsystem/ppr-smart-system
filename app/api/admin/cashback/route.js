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
    const users = await User.find({ role: 'user', status: 'approved' }).select('name email');
    const settings = await UserSettings.find().lean();
    
    const usersWithSettings = users.map(user => {
      const userSetting = settings.find(s => s.userId.toString() === user._id.toString());
      return {
        ...user.toObject(),
        cashbackRate: userSetting?.cashbackRate || 4,
        autoCashback: userSetting?.autoCashback !== false
      };
    });

    return NextResponse.json({ cashbacks, users: usersWithSettings });
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
    const { action, userId, cashbackId, enabled, spendAmount, cashbackRate, cashbackIds } = await request.json();

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
        description: `Cashback ${cashback.cashbackRate}%`,
        reference: `CASH${Date.now()}`,
      });

      return NextResponse.json({ success: true, message: 'Cashback processed' });
    }

    if (action === 'bulk_process' && cashbackIds?.length) {
      let processed = 0;
      for (const id of cashbackIds) {
        const cashback = await Cashback.findById(id);
        if (cashback && cashback.status === 'pending') {
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
            description: `Cashback ${cashback.cashbackRate}%`,
            reference: `CASH${Date.now()}${processed}`,
          });
          processed++;
        }
      }
      return NextResponse.json({ success: true, message: `${processed} cashbacks processed` });
    }

    if (action === 'manual_cashback' && userId && spendAmount) {
      const settings = await UserSettings.findOne({ userId }) || { cashbackRate: 4 };
      const rate = cashbackRate || settings.cashbackRate || 4;
      const cashbackAmount = (spendAmount * rate) / 100;

      const cashback = await Cashback.create({
        userId,
        spendAmount,
        cashbackRate: rate,
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
        description: `Manual Cashback ${rate}%`,
        reference: `CASH${Date.now()}`,
      });

      return NextResponse.json({ success: true, cashback });
    }

    if (action === 'toggle_auto' && userId) {
      await UserSettings.findOneAndUpdate(
        { userId },
        { $set: { autoCashback: enabled } },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'set_rate' && userId && cashbackRate !== undefined) {
      await UserSettings.findOneAndUpdate(
        { userId },
        { $set: { cashbackRate } },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'delete' && cashbackIds?.length) {
      await Cashback.deleteMany({ _id: { $in: cashbackIds } });
      return NextResponse.json({ success: true, message: `${cashbackIds.length} cashbacks deleted` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}