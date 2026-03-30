import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get('distributorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!distributorId) {
      return NextResponse.json({ error: 'Distributor ID required' }, { status: 400 });
    }

    await dbConnect();

    // Get all users under this distributor
    const users = await User.find({ 
      distributorId: distributorId,
      role: 'user'
    }).select('_id name email status');

    const userIds = users.map(u => u._id);

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    // Get all redemption transactions for these users with date filter
    const redemptions = await Transaction.find({
      userId: { $in: userIds },
      description: { $regex: /redeem/i },
      ...dateFilter
    });

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'approved').length;
    const totalRedemptions = redemptions.length;
    const totalSpendAmount = redemptions.reduce((sum, t) => sum + t.amount, 0);

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRedemptions = redemptions.filter(t => new Date(t.createdAt) >= today);
    const todaySpendAmount = todayRedemptions.reduce((sum, t) => sum + t.amount, 0);

    // This month's stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRedemptions = redemptions.filter(t => new Date(t.createdAt) >= monthStart);
    const monthSpendAmount = monthRedemptions.reduce((sum, t) => sum + t.amount, 0);

    // Top 5 users by spend
    const userSpendMap = {};
    redemptions.forEach(t => {
      const userId = t.userId.toString();
      if (!userSpendMap[userId]) {
        userSpendMap[userId] = { totalSpend: 0, redemptionCount: 0 };
      }
      userSpendMap[userId].totalSpend += t.amount;
      userSpendMap[userId].redemptionCount += 1;
    });

    const topUsers = users
      .map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        totalSpend: userSpendMap[u._id.toString()]?.totalSpend || 0,
        redemptionCount: userSpendMap[u._id.toString()]?.redemptionCount || 0
      }))
      .filter(u => u.totalSpend > 0)
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalRedemptions,
      totalSpendAmount,
      todayRedemptions: todayRedemptions.length,
      todaySpendAmount,
      monthRedemptions: monthRedemptions.length,
      monthSpendAmount,
      topUsers,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
