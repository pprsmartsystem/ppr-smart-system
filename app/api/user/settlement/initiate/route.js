import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    await dbConnect();

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const getNextWorkingDay = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
      if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2);
      
      return tomorrow;
    };

    user.walletBalance -= amount;
    await user.save();

    const settlementDate = getNextWorkingDay();
    
    const transaction = new Transaction({
      userId: decoded.userId,
      type: 'debit',
      amount: amount,
      status: 'completed',
      description: `Settlement initiated - T+1 (${settlementDate.toLocaleDateString()})`,
      reference: `SETTLE-${Date.now()}`,
    });
    await transaction.save();

    return NextResponse.json({
      success: true,
      message: `₹${amount.toFixed(2)} settlement initiated. Amount will be credited on ${settlementDate.toLocaleDateString()}`,
      settlementDate: settlementDate,
    });
  } catch (error) {
    console.error('Settlement error:', error);
    return NextResponse.json({ error: 'Settlement failed' }, { status: 500 });
  }
}
