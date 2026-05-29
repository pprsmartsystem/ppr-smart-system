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
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get master distributor info
    const masterDistributor = await User.findById(decoded.userId);
    
    // Check if master distributor is on hold
    if (masterDistributor.isOnHold || masterDistributor.status === 'blocked') {
      return NextResponse.json({ error: 'Account is on hold' }, { status: 403 });
    }

    // Get all distributors under this master distributor
    const distributors = await User.find({ 
      masterDistributorId: decoded.userId,
      role: 'distributor'
    });

    const distributorIds = distributors.map(d => d._id);

    // Get all users under these distributors
    const users = await User.find({ 
      distributorId: { $in: distributorIds },
      role: 'user'
    });

    const userIds = users.map(u => u._id);

    // Get total cards
    const totalCards = await Card.countDocuments({ userId: { $in: userIds } });

    // Get total transactions
    const totalTransactions = await Transaction.countDocuments({ userId: { $in: userIds } });

    // Count active and held distributors
    const activeDistributors = distributors.filter(d => !d.isOnHold && d.status === 'approved').length;
    const heldDistributors = distributors.filter(d => d.isOnHold || d.status === 'blocked').length;

    return NextResponse.json({
      walletBalance: masterDistributor.walletBalance || 0,
      totalDistributors: distributors.length,
      activeDistributors,
      heldDistributors,
      totalUsers: users.length,
      totalCards,
      totalTransactions
    });
  } catch (error) {
    console.error('Master Distributor Dashboard Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
