import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { transactionId, action } = await request.json();

    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.type !== 'payment_request') {
      return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
    }

    if (action === 'approve') {
      const user = await User.findById(transaction.userId);
      user.walletBalance += transaction.amount;
      await user.save();

      transaction.status = 'completed';
      transaction.description = 'Loading Successful';
      await transaction.save();

      await Transaction.create({
        userId: transaction.userId,
        type: 'credit',
        amount: transaction.amount,
        status: 'completed',
        description: 'Loading Successful',
        reference: `LOAD${Date.now()}`,
        metadata: { approvedBy: 'admin', originalUTR: transaction.reference }
      });

      return NextResponse.json({ success: true, message: 'Payment approved' });
    } else if (action === 'reject') {
      transaction.status = 'failed';
      await transaction.save();

      return NextResponse.json({ success: true, message: 'Payment rejected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
