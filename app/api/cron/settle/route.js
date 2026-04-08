import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settlement from '@/models/Settlement';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const settlements = await Settlement.find({ status: 'pending', type: { $ne: 'user' } });

    if (!settlements.length) {
      return NextResponse.json({ success: true, message: 'No pending settlements', count: 0 });
    }

    let count = 0;
    let failed = 0;

    for (const s of settlements) {
      try {
        const user = await User.findById(s.userId);
        if (!user) { failed++; continue; }

        user.walletBalance += s.settlementAmount;
        await user.save();

        s.status = 'processed';
        s.processedAt = new Date();
        await s.save();

        await Transaction.create({
          userId: s.userId,
          type: 'credit',
          amount: s.settlementAmount,
          status: 'completed',
          description: `Auto Settlement - ${new Date().toLocaleDateString('en-IN')}`,
          reference: `AUTO-SETTLE-${Date.now()}-${count}`,
        });
        count++;
      } catch { failed++; }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-settlement: ${count} processed${failed ? `, ${failed} failed` : ''}`,
      count,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
