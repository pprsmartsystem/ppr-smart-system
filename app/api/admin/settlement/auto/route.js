import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Settlement from '@/models/Settlement';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

// GET — next run time & pending count
export async function GET() {
  try {
    const now = new Date();
    // 10:30 AM IST = 05:00 UTC
    const nextRun = new Date();
    nextRun.setUTCHours(5, 0, 0, 0);
    if (now.getUTCHours() >= 5) nextRun.setUTCDate(nextRun.getUTCDate() + 1);

    await connectDB();
    const pendingCount = await Settlement.countDocuments({ status: 'pending', type: { $ne: 'user' } });

    return NextResponse.json({
      nextRun: nextRun.toISOString(),
      nextRunIST: nextRun.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric' }),
      pendingCount,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST — trigger auto-settlement (admin only)
export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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
          description: `Auto Settlement - ${new Date().toLocaleDateString('en-IN')}`,
          reference: `AUTO-SETTLE-${Date.now()}-${count}`,
        });
        count++;
      } catch { failed++; }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-settlement complete: ${count} processed${failed ? `, ${failed} failed` : ''}`,
      count,
      failed,
    });
  } catch {
    return NextResponse.json({ error: 'Auto-settlement failed' }, { status: 500 });
  }
}
