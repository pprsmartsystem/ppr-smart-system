import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Settlement from '@/models/Settlement';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import UserSettings from '@/models/UserSettings';
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
    const settlements = await Settlement.find({ type: 'auto', source: 'admin' }).populate('userId', 'name email').sort({ createdAt: -1 });
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
    const { action, userId, settlementId, settlementIds, enabled, spendAmount } = await request.json();

    // Process single settlement
    if (action === 'process' && settlementId) {
      const settlement = await Settlement.findById(settlementId);
      if (!settlement || settlement.status === 'processed') {
        return NextResponse.json({ error: 'Settlement not found or already processed' }, { status: 400 });
      }
      const user = await User.findById(settlement.userId);

      user.walletBalance += settlement.settlementAmount;
      await user.save();

      settlement.status = 'processed';
      settlement.processedAt = new Date();
      await settlement.save();

      const reference = `SETTLE${Date.now()}`;
      await Transaction.create({
        userId: settlement.userId,
        type: 'credit',
        amount: settlement.settlementAmount,
        status: 'completed',
        description: 'Settlement',
        reference,
      });

      // Send email
      try {
        if (user.email) {
          await sendMail({
            to: user.email,
            subject: 'Settlement Credited — PPR Smart System',
            html: settlementProcessedEmail({
              name: user.name,
              amount: settlement.settlementAmount,
              newBalance: user.walletBalance,
              reference,
              date: new Date(),
            }),
          });
        }
      } catch (e) { console.error('[settle-mail]', e.message); }

      return NextResponse.json({ success: true, message: 'Settlement processed' });
    }

    // Bulk process settlements
    if (action === 'bulk_process' && settlementIds?.length) {
      const settlements = await Settlement.find({ _id: { $in: settlementIds }, status: 'pending' });
      let count = 0;

      for (const settlement of settlements) {
        const user = await User.findById(settlement.userId);
        user.walletBalance += settlement.settlementAmount;
        await user.save();

        settlement.status = 'processed';
        settlement.processedAt = new Date();
        await settlement.save();

        const ref = `SETTLE${Date.now()}-${count}`;
        await Transaction.create({
          userId: settlement.userId,
          type: 'credit',
          amount: settlement.settlementAmount,
          status: 'completed',
          description: 'Settlement',
          reference: ref,
        });

        // Send email
        try {
          if (user.email) {
            await sendMail({
              to: user.email,
              subject: 'Settlement Credited — PPR Smart System',
              html: settlementProcessedEmail({
                name: user.name,
                amount: settlement.settlementAmount,
                newBalance: user.walletBalance,
                reference: ref,
                date: new Date(),
              }),
            });
          }
        } catch (e) { console.error('[bulk-settle-mail]', e.message); }

        count++;
      }

      return NextResponse.json({ success: true, message: `${count} settlements processed` });
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
      const settlementAmount = spendAmount - deductionAmount;

      const settlement = await Settlement.create({
        userId,
        spendAmount,
        settlementRate,
        settlementAmount,
        type: 'manual',
        source: 'admin',
        status: 'pending',
      });

      return NextResponse.json({ success: true, settlement });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { settlementIds } = await request.json();
    const ids = Array.isArray(settlementIds) ? settlementIds : [settlementIds];

    await Settlement.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
