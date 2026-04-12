import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settlement from '@/models/Settlement';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { checkIsBankingDay } from '@/utils/bankingDays';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  try {
    // Verify Vercel Cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const { isBankingDay, reason } = checkIsBankingDay(now);

    // Skip if not a banking day
    if (!isBankingDay) {
      console.log(`[CRON] Skipped auto-settlement: ${reason}`);
      return NextResponse.json({
        success: true,
        skipped: true,
        reason,
        message: `Settlement skipped — ${reason}`,
        count: 0,
      });
    }

    await connectDB();

    const settlements = await Settlement.find({ status: 'pending', type: { $ne: 'user' } });

    if (!settlements.length) {
      console.log('[CRON] Auto-settlement: no pending settlements');
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
          description: `Auto Settlement - ${now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
          reference: `AUTO-SETTLE-${Date.now()}-${count}`,
        });
        count++;
      } catch (err) {
        console.error('[CRON] Settlement error:', err.message);
        failed++;
      }
    }

    console.log(`[CRON] Auto-settlement done: ${count} processed, ${failed} failed`);
    return NextResponse.json({
      success: true,
      message: `Auto-settlement complete: ${count} processed${failed ? `, ${failed} failed` : ''}`,
      count,
      failed,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
