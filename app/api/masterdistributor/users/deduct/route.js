export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { userId, amount, remark } = await request.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!remark?.trim()) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Verify user belongs to a distributor under this master distributor
    const user = await User.findById(userId);
    if (!user || user.role !== 'user') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const distributor = await User.findOne({
      _id: user.distributorId,
      masterDistributorId: decoded.userId,
      role: 'distributor',
    });

    if (!distributor) {
      return NextResponse.json({ error: 'You do not have permission to manage this user' }, { status: 403 });
    }

    if (user.walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    const balanceBefore = user.walletBalance;
    user.walletBalance = parseFloat((user.walletBalance - amount).toFixed(2));
    await user.save();

    // Credit deducted amount to master distributor wallet
    const masterDistributor = await User.findById(decoded.userId);
    masterDistributor.walletBalance = parseFloat((masterDistributor.walletBalance + amount).toFixed(2));
    await masterDistributor.save();

    // Transaction for user (debit)
    await Transaction.create({
      userId: user._id,
      type: 'debit',
      amount,
      status: 'completed',
      description: `Wallet deducted by master distributor. Reason: ${remark.trim()}`,
      reference: `MD-DEDUCT-${Date.now()}`,
      balanceBefore,
      balanceAfter: user.walletBalance,
    });

    // Transaction for master distributor (credit)
    await Transaction.create({
      userId: decoded.userId,
      type: 'credit',
      amount,
      status: 'completed',
      description: `Received from user ${user.name} wallet deduction. Reason: ${remark.trim()}`,
      reference: `MD-RECV-${Date.now()}`,
      balanceBefore: masterDistributor.walletBalance - amount,
      balanceAfter: masterDistributor.walletBalance,
    });

    return NextResponse.json({
      success: true,
      message: `₹${amount.toFixed(2)} deducted from ${user.name}'s wallet and credited to your wallet`,
      newBalance: user.walletBalance,
    });

  } catch (error) {
    console.error('Deduct wallet error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
