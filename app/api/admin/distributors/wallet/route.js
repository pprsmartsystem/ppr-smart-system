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
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { distributorId, amount } = await request.json();

    // Get distributor
    const distributor = await User.findById(distributorId);
    if (!distributor || distributor.role !== 'distributor') {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Add balance to distributor wallet
    distributor.walletBalance += amount;
    await distributor.save();

    // Create transaction record
    await Transaction.create({
      userId: distributorId,
      type: 'credit',
      amount: amount,
      status: 'completed',
      description: 'Wallet recharged by admin',
      reference: `ADMIN${Date.now()}`
    });

    return NextResponse.json({ 
      success: true,
      newBalance: distributor.walletBalance 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
