import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { creditWallet } from '@/utils/walletUtils';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { userId, amount, reason } = await request.json();

    if (!amount || amount <= 0) return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    if (!reason) return NextResponse.json({ message: 'Reason is required' }, { status: 400 });

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const result = await creditWallet(user, parseFloat(amount), reason, 'ADM-CR');

    const msg = result.debtSettled > 0
      ? `₹${amount} added. ₹${result.debtSettled.toFixed(2)} auto-deducted to settle debt.`
      : 'Balance added successfully';

    return NextResponse.json({
      message: msg,
      user: { id: user._id, name: user.name, walletBalance: result.newBalance },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
