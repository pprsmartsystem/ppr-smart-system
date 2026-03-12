import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';
import Settlement from '@/models/Settlement';
import Cashback from '@/models/Cashback';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { userId } = await request.json();

    // Delete all user cards
    await Card.deleteMany({ userId });

    // Delete all user transactions
    await Transaction.deleteMany({ userId });

    // Delete all user settlements
    await Settlement.deleteMany({ userId });

    // Delete all user cashbacks
    await Cashback.deleteMany({ userId });

    // Reset wallet balance to 0
    await User.findByIdAndUpdate(userId, { walletBalance: 0 });

    return NextResponse.json({ 
      success: true,
      message: 'User history reset successfully' 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
