import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request) {
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
    const { userId, amount } = await request.json();

    // Get distributor
    const distributor = await User.findById(decoded.userId);
    if (distributor.walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // Verify user belongs to this distributor
    const user = await User.findOne({
      _id: userId,
      distributorId: decoded.userId
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Deduct from distributor wallet
    distributor.walletBalance -= amount;
    await distributor.save();

    // Add to user wallet
    user.walletBalance += amount;
    await user.save();

    // Create transaction for distributor (debit)
    await Transaction.create({
      userId: decoded.userId,
      type: 'debit',
      amount: amount,
      status: 'completed',
      description: `Wallet recharge to ${user.name}`,
      reference: `DIST${Date.now()}`
    });

    // Create transaction for user (credit)
    await Transaction.create({
      userId: userId,
      type: 'credit',
      amount: amount,
      status: 'completed',
      description: 'Wallet recharged by distributor',
      reference: `DIST${Date.now()}`
    });

    return NextResponse.json({ 
      success: true,
      distributorBalance: distributor.walletBalance,
      userBalance: user.walletBalance
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
