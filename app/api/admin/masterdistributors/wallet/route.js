export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { sendMail } from '@/lib/mailer';
import { walletLoadingEmail } from '@/lib/emails/walletLoading';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await connectDB();

    const { masterDistributorId, amount, action, remark } = await request.json();

    if (!masterDistributorId || !amount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (amount <= 0) return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });

    const md = await User.findOne({ _id: masterDistributorId, role: 'masterdistributor' });
    if (!md) return NextResponse.json({ error: 'Master Distributor not found' }, { status: 404 });

    if (action === 'deduct' && !remark) return NextResponse.json({ error: 'Remark required for deduction' }, { status: 400 });

    if (action === 'add') {
      md.walletBalance += amount;
      const utr = `UTR${Date.now()}${Math.floor(Math.random() * 900000 + 100000)}`;
      const txn = await Transaction.create({
        userId: md._id,
        type: 'credit',
        amount,
        description: `Wallet credited by admin`,
        status: 'completed',
        reference: utr,
        balanceBefore: md.walletBalance - amount,
        balanceAfter: md.walletBalance,
      });
      await md.save();
      
      // Send email notification (non-blocking)
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          await sendMail({
            to: md.email,
            subject: '✓ Wallet Loading Initiated — PPR Smart System',
            html: walletLoadingEmail({
              name: md.name,
              amount,
              newBalance: md.walletBalance,
              reference: txn._id.toString(),
              date: new Date(),
            }),
          });
        } catch (emailErr) {
          console.error('Email notification failed:', emailErr);
        }
      }
    } else {
      const balBefore = md.walletBalance;
      md.walletBalance -= amount;
      const utr = `UTR${Date.now()}${Math.floor(Math.random() * 900000 + 100000)}`;
      await Transaction.create({
        userId: md._id,
        type: 'debit',
        amount,
        description: `Wallet deducted by admin. Reason: ${remark}`,
        status: 'completed',
        reference: utr,
        balanceBefore: balBefore,
        balanceAfter: md.walletBalance,
      });
      await md.save();
    }

    return NextResponse.json({ success: true, message: `Balance ${action === 'add' ? 'added' : 'deducted'} successfully` });
  } catch (err) {
    console.error('Wallet operation error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
