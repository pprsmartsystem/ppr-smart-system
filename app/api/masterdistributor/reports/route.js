import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); dateFilter.$lte = toDate; }

    // Get all distributors under this master distributor
    const distributors = await User.find({
      masterDistributorId: decoded.userId,
      role: 'distributor',
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    }).select('-password');

    const distributorIds = distributors.map(d => d._id);

    // Get all users under these distributors
    const users = await User.find({ distributorId: { $in: distributorIds }, role: 'user' });
    const userIds = users.map(u => u._id);

    // Get total cards and transactions
    const totalCards = await Card.countDocuments({ userId: { $in: userIds } });
    const txnFilter = { userId: { $in: userIds }, ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) };
    const transactions = await Transaction.find(txnFilter);
    const totalVolume = transactions.reduce((sum, t) => sum + (t.type === 'debit' ? t.amount : 0), 0);

    // Build distributor breakdown
    const distributorBreakdown = await Promise.all(
      distributors.map(async (dist) => {
        const distUsers = await User.find({ distributorId: dist._id, role: 'user' });
        const distUserIds = distUsers.map(u => u._id);
        const cardCount = await Card.countDocuments({ userId: { $in: distUserIds } });
        const txnCount = await Transaction.countDocuments({ userId: { $in: distUserIds } });
        return {
          _id: dist._id,
          name: dist.name,
          email: dist.email,
          walletBalance: dist.walletBalance || 0,
          userCount: distUsers.length,
          cardCount,
          transactionCount: txnCount,
        };
      })
    );

    return NextResponse.json({
      totalDistributors: distributors.length,
      totalUsers: users.length,
      totalCards,
      totalTransactions: transactions.length,
      totalVolume,
      distributorBreakdown,
    });
  } catch (error) {
    console.error('Reports Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
