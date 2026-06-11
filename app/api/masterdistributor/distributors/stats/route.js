import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';
import Settlement from '@/models/Settlement';
import KYC from '@/models/KYC';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get('distributorId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!distributorId) return NextResponse.json({ error: 'distributorId required' }, { status: 400 });

    // Build date filter
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); dateFilter.$lte = toDate; }
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Verify distributor belongs to this master distributor
    const distributor = await User.findOne({
      _id: distributorId,
      masterDistributorId: decoded.userId,
      role: 'distributor',
    }).select('-password');

    if (!distributor) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    // Get all users under this distributor
    const users = await User.find({ distributorId, role: 'user' })
      .select('_id name email status walletBalance createdAt').lean();
    const userIds = users.map(u => u._id);

    // Cards — date filtered
    const allCards = await Card.find({
      userId: { $in: userIds },
      ...(hasDateFilter ? { createdAt: dateFilter } : {}),
    }).select('userId status balance createdAt').lean();
    const activeCards = allCards.filter(c => c.status === 'active').length;
    const frozenCards = allCards.filter(c => c.status === 'frozen').length;
    const totalCardBalance = allCards.reduce((s, c) => s + (c.balance || 0), 0);

    // Transactions — date filtered
    const transactions = await Transaction.find({
      userId: { $in: userIds },
      ...(hasDateFilter ? { createdAt: dateFilter } : {}),
    }).select('type amount description createdAt').sort({ createdAt: -1 }).lean();
    const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalDebit  = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const recentTransactions = transactions.slice(0, 5);

    // Redemption Summary
    const redemptions = transactions.filter(t =>
      t.type === 'debit' && t.description?.toLowerCase().includes('redeemed via gateway')
    );
    const totalRedemptions = redemptions.length;
    const totalSpendAmount = redemptions.reduce((s, t) => s + t.amount, 0);

    // Settlements — date filtered
    const settlements = await Settlement.find({
      userId: { $in: userIds },
      ...(hasDateFilter ? { createdAt: dateFilter } : {}),
    }).select('status settlementAmount createdAt').lean();
    const pendingSettlements  = settlements.filter(s => s.status === 'pending').length;
    const processedSettlements = settlements.filter(s => s.status === 'processed').length;
    const totalSettled = settlements.filter(s => s.status === 'processed').reduce((sum, s) => sum + (s.settlementAmount || 0), 0);

    // KYC — always all (not date filtered)
    const kycList = await KYC.find({ userId: { $in: userIds } }).select('userId status').lean();
    const kycApproved = kycList.filter(k => k.status === 'approved').length;
    const kycPending  = kycList.filter(k => k.status === 'pending').length;

    // User status breakdown — always all
    const activeUsers  = users.filter(u => u.status === 'approved').length;
    const blockedUsers = users.filter(u => u.status === 'blocked').length;
    const pendingUsers = users.filter(u => u.status === 'pending').length;

    // Monthly transaction chart (within date range or last 6 months)
    const chartFrom = hasDateFilter && from ? new Date(from) : (() => { const d = new Date(); d.setMonth(d.getMonth() - 6); return d; })();
    const monthlyData = {};
    transactions.filter(t => new Date(t.createdAt) >= chartFrom).forEach(t => {
      const key = new Date(t.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      if (!monthlyData[key]) monthlyData[key] = { month: key, credit: 0, debit: 0, count: 0 };
      if (t.type === 'credit') monthlyData[key].credit += t.amount;
      if (t.type === 'debit')  monthlyData[key].debit  += t.amount;
      monthlyData[key].count++;
    });

    // Top 5 users by wallet balance
    const topUsers = [...users].sort((a, b) => (b.walletBalance || 0) - (a.walletBalance || 0)).slice(0, 5);

    return NextResponse.json({
      distributor: {
        name: distributor.name,
        email: distributor.email,
        phone: distributor.phone,
        status: distributor.status,
        isOnHold: distributor.isOnHold,
        walletBalance: distributor.walletBalance || 0,
        createdAt: distributor.createdAt,
      },
      dateRange: hasDateFilter ? { from, to } : null,
      users:        { total: users.length, active: activeUsers, blocked: blockedUsers, pending: pendingUsers },
      cards:        { total: allCards.length, active: activeCards, frozen: frozenCards, totalBalance: totalCardBalance },
      transactions: { total: transactions.length, totalCredit, totalDebit, recent: recentTransactions },
      redemptions:  { total: totalRedemptions, totalSpendAmount },
      settlements:  { total: settlements.length, pending: pendingSettlements, processed: processedSettlements, totalSettled },
      kyc:          { approved: kycApproved, pending: kycPending },
      monthlyChart: Object.values(monthlyData),
      topUsers,
    });

  } catch (error) {
    console.error('Distributor stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
