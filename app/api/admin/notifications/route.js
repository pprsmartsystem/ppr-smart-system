import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    
    const notifications = await Transaction.find({
      type: 'debit',
      $or: [
        { description: { $regex: 'Settlement initiated', $options: 'i' } },
        { description: { $regex: 'Card redeemed', $options: 'i' } }
      ]
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
