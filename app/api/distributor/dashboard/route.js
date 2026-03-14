import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get distributor info
    const distributor = await User.findById(decoded.userId);

    // Get all users under this distributor
    const users = await User.find({ 
      distributorId: decoded.userId,
      role: 'user'
    });

    const userIds = users.map(u => u._id);

    // Get total cards
    const totalCards = await Card.countDocuments({ userId: { $in: userIds } });

    // Get total transactions
    const totalTransactions = await Transaction.countDocuments({ userId: { $in: userIds } });

    return NextResponse.json({
      walletBalance: distributor.walletBalance || 0,
      totalUsers: users.length,
      totalCards,
      totalTransactions
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
