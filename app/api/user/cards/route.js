import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';
import User from '@/models/User';
import { generateCardNumber, generateCVV, calculateExpiryDate } from '@/utils/cardUtils';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const cards = await Card.find({
      userId: decoded.userId,
      $or: [
        { balance: { $gt: 0 } },
        { updatedAt: { $gte: todayStart } },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { spendingLimit, initialBalance } = await request.json();

    if (!spendingLimit || spendingLimit <= 0) {
      return NextResponse.json({ message: 'Invalid spending limit' }, { status: 400 });
    }

    await connectDB();

    // Check user wallet balance
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const balance = initialBalance || 0;
    if (balance > user.walletBalance) {
      return NextResponse.json({ message: 'Insufficient wallet balance' }, { status: 400 });
    }

    // Create new card
    const card = new Card({
      userId: decoded.userId,
      cardNumber: generateCardNumber(),
      expiryDate: calculateExpiryDate(),
      cvv: generateCVV(),
      spendingLimit,
      balance,
      status: 'active',
    });

    await card.save();

    // Deduct from wallet if initial balance is set
    if (balance > 0) {
      user.walletBalance -= balance;
      await user.save();
    }

    return NextResponse.json({ message: 'Card created successfully', card });
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}