import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { userId, amount, reason } = await request.json();
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ message: 'Reason is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    user.walletBalance += parseFloat(amount);
    await user.save();

    const Transaction = (await import('@/models/Transaction')).default;
    await Transaction.create({
      userId: user._id,
      type: 'credit',
      amount: parseFloat(amount),
      status: 'completed',
      description: reason,
      reference: `ADMIN-${Date.now()}`,
    });

    return NextResponse.json({ 
      message: 'Balance added successfully', 
      user: {
        id: user._id,
        name: user.name,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
