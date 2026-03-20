import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { userId, amount, remark } = await request.json();

    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!remark?.trim()) return NextResponse.json({ error: 'Remark is required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Allow negative balance — deduct regardless of current balance
    user.walletBalance -= amount;
    await user.save();

    await Transaction.create({
      userId,
      type: 'debit',
      amount,
      status: 'completed',
      description: `Admin deduction: ${remark}`,
      reference: `ADM-DED-${Date.now()}`,
    });

    const msg = user.walletBalance < 0
      ? `₹${amount} deducted. User is now in debt of ₹${Math.abs(user.walletBalance).toFixed(2)}`
      : `₹${amount} deducted successfully`;

    return NextResponse.json({ message: msg, newBalance: user.walletBalance });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
