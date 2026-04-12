import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Settlement from '@/models/Settlement';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { checkIsBankingDay, getNextSettlementTime } from '@/utils/bankingDays';

// GET — next banking day run time & pending count
export async function GET() {
  try {
    const now = new Date();
    const { isBankingDay, reason } = checkIsBankingDay(now);
    const nextRun = getNextSettlementTime(now);

    await connectDB();
    const pendingCount = await Settlement.countDocuments({ status: 'pending', type: { $ne: 'user' } });

    return NextResponse.json({
      isBankingDay,
      todayStatus: reason,
      nextRun: nextRun.toISOString(),
      nextRunIST: nextRun.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      pendingCount,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST — manually trigger auto-settlement (admin only, respects banking day)
export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const { isBankingDay, reason } = checkIsBankingDay(now);

    // Check if force flag is passed (admin can override)
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    if (!isBankingDay && !force) {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason,
        message: `Settlement skipped — ${reason}. Use "Force Run" to override.`,
      }, { status: 200 });
    }

    await connectDB();

    const settlements = await Settlement.find({ status: 'pending', type: { $ne: 'user' } });

    if (!settlements.length) {
      return NextResponse.json({ success: true, message: 'No pending settlements to process', count: 0 });
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
          description: `Auto Settlement - ${now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}${force && !isBankingDay ? ' (Forced)' : ''}`,
          reference: `AUTO-SETTLE-${Date.now()}-${count}`,
        });
        count++;
      } catch { failed++; }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-settlement complete: ${count} processed${failed ? `, ${failed} failed` : ''}${force && !isBankingDay ? ' (forced on non-banking day)' : ''}`,
      count,
      failed,
    });
  } catch {
    return NextResponse.json({ error: 'Auto-settlement failed' }, { status: 500 });
  }
}
