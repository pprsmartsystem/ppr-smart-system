export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Settlement from '@/models/Settlement';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { sendMail } from '@/lib/mailer';
import { settlementProcessedEmail } from '@/lib/emails/settlementProcessed';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const settlements = await Settlement.find({ source: { $in: ['user', 'masterdistributor'] } })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    const heldUsers = await User.find({ settlementBlocked: true }).select('name email settlementBlockReason');

    return NextResponse.json({ settlements, heldUsers });
  } catch {
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
    const { action, settlementId, reason, userId } = await request.json();

    const settlement = await Settlement.findById(settlementId);
    if (!settlement) return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });
    if (settlement.source === 'admin') return NextResponse.json({ error: 'Not a valid settlement' }, { status: 400 });
    if (settlement.status !== 'pending') return NextResponse.json({ error: 'Settlement already processed' }, { status: 400 });

    if (action === 'approve') {
      settlement.status = 'processed';
      settlement.processedAt = new Date();
      await settlement.save();

      await Transaction.create({
        userId: settlement.userId,
        type: 'credit',
        amount: settlement.settlementAmount,
        status: 'completed',
        description: 'Settlement Approved',
        reference: `SETTLE-USR-${Date.now()}`,
      });

      // Send approval email
      const user = await User.findById(settlement.userId);
      if (user && process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          await sendMail({
            to: user.email,
            subject: '✓ Settlement Approved — PPR Smart System',
            html: settlementProcessedEmail({
              name: user.name,
              amount: settlement.settlementAmount,
              reference: settlement._id.toString(),
              bankDetails: settlement.bankDetails,
              date: new Date(),
              status: 'approved',
            }),
          });
        } catch (emailErr) {
          console.error('Approval email failed:', emailErr);
        }
      }

      return NextResponse.json({ success: true, message: 'Settlement approved' });
    }

    if (action === 'reject') {
      if (!reason?.trim()) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }

      // Refund full spend amount back to wallet
      await User.findByIdAndUpdate(settlement.userId, {
        $inc: { walletBalance: settlement.spendAmount },
      });

      settlement.status = 'rejected';
      settlement.rejectionReason = reason.trim();
      settlement.processedAt = new Date();
      await settlement.save();

      // Send rejection email
      const user = await User.findById(settlement.userId);
      if (user && process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          await sendMail({
            to: user.email,
            subject: '❌ Settlement Rejected — PPR Smart System',
            html: settlementProcessedEmail({
              name: user.name,
              amount: settlement.spendAmount,
              reference: settlement._id.toString(),
              bankDetails: settlement.bankDetails,
              date: new Date(),
              status: 'rejected',
              reason: reason.trim(),
            }),
          });
        } catch (emailErr) {
          console.error('Rejection email failed:', emailErr);
        }
      }

      return NextResponse.json({ success: true, message: 'Settlement rejected and amount refunded' });
    }

    if (action === 'hold_settlement') {
      if (!userId) return NextResponse.json({ error: 'Please select a user' }, { status: 400 });
      if (!reason?.trim()) return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
      await User.findByIdAndUpdate(userId, {
        settlementBlocked: true,
        settlementBlockReason: reason.trim(),
      });
      await Settlement.updateMany(
        { userId, source: { $in: ['user', 'masterdistributor'] }, status: 'pending' },
        { status: 'paused' }
      );
      return NextResponse.json({ success: true, message: 'Settlement held for user' });
    }

    if (action === 'unhold_settlement') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      await User.findByIdAndUpdate(userId, {
        settlementBlocked: false,
        settlementBlockReason: null,
      });
      await Settlement.updateMany(
        { userId, source: { $in: ['user', 'masterdistributor'] }, status: 'paused' },
        { status: 'pending' }
      );
      return NextResponse.json({ success: true, message: 'Settlement resumed for user' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
