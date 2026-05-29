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
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { distributorId, amount, type, remark } = await request.json();

    if (!distributorId || !amount || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // Verify distributor belongs to this master distributor
    const distributor = await User.findOne({
      _id: distributorId,
      masterDistributorId: decoded.userId,
      role: 'distributor'
    });

    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    const masterDistributor = await User.findById(decoded.userId);

    if (type === 'add') {
      // Check if master distributor has sufficient balance
      if (masterDistributor.walletBalance < amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      // Deduct from master distributor
      masterDistributor.walletBalance -= amount;
      await masterDistributor.save();

      // Add to distributor
      distributor.walletBalance += amount;
      await distributor.save();

      // Create transaction records
      await Transaction.create({
        userId: decoded.userId,
        type: 'debit',
        amount,
        description: `Transferred to distributor: ${distributor.name}`,
        status: 'completed'
      });

      await Transaction.create({
        userId: distributorId,
        type: 'credit',
        amount,
        description: `Received from master distributor: ${masterDistributor.name}`,
        status: 'completed'
      });

      return NextResponse.json({ 
        success: true, 
        message: `₹${amount.toFixed(2)} added to distributor wallet` 
      });

    } else if (type === 'deduct') {
      if (!remark) {
        return NextResponse.json({ error: 'Remark is required for deduction' }, { status: 400 });
      }

      // Deduct from distributor
      distributor.walletBalance -= amount;
      await distributor.save();

      // Add to master distributor
      masterDistributor.walletBalance += amount;
      await masterDistributor.save();

      // Create transaction records
      await Transaction.create({
        userId: distributorId,
        type: 'debit',
        amount,
        description: `Deducted by master distributor. Reason: ${remark}`,
        status: 'completed'
      });

      await Transaction.create({
        userId: decoded.userId,
        type: 'credit',
        amount,
        description: `Recovered from distributor: ${distributor.name}. Reason: ${remark}`,
        status: 'completed'
      });

      return NextResponse.json({ 
        success: true, 
        message: `₹${amount.toFixed(2)} deducted from distributor wallet` 
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Wallet Operation Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
