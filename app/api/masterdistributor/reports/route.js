export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';
import KYC from '@/models/KYC';

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
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Get all distributors
    const distributors = await User.find({
      masterDistributorId: decoded.userId,
      role: 'distributor',
    }).select('-password').lean();

    const distributorIds = distributors.map(d => d._id);

    // Get all users under these distributors
    const users = await User.find({
      distributorId: { $in: distributorIds },
      role: 'user',
      ...(hasDateFilter ? { createdAt: dateFilter } : {}),
    }).select('_id distributorId walletBalance status name email createdAt').lean();

    const userIds = users.map(u => u._id);

    // Bulk fetch cards, transactions, KYC
    const allCards = await Card.find({ userId: { $in: userIds } }).select('userId status').lean();
    
    const txnQuery = { userId: { $in: userIds }, ...(hasDateFilter ? { createdAt: dateFilter } : {}) };
    const allTransactions = await Transaction.find(txnQuery).select('userId type amount').lean();

    const kycList = await KYC.find({ userId: { $in: userIds } }).select('userId status').lean();

    // Build lookup maps
    const cardsByUser = {};
    allCards.forEach(c => {
      const uid = c.userId.toString();
      cardsByUser[uid] = (cardsByUser[uid] || 0) + 1;
    });

    const txnsByUser = {};
    allTransactions.forEach(t => {
      const uid = t.userId.toString();
      if (!txnsByUser[uid]) txnsByUser[uid] = { count: 0, credit: 0, debit: 0 };
      txnsByUser[uid].count++;
      if (t.type === 'credit') txnsByUser[uid].credit += t.amount;
      else txnsByUser[uid].debit += t.amount;
    });

    const kycByUser = {};
    kycList.forEach(k => { kycByUser[k.userId.toString()] = k.status; });

    // Build distributor breakdown
    const distUserMap = {};
    users.forEach(u => {
      const did = u.distributorId?.toString();
      if (!distUserMap[did]) distUserMap[did] = [];
      distUserMap[did].push(u);
    });

    const distributorBreakdown = distributors.map(dist => {
      const distUsers = distUserMap[dist._id.toString()] || [];
      const distUserIds = distUsers.map(u => u._id.toString());

      let txnCount = 0, creditVol = 0, debitVol = 0;
      distUserIds.forEach(uid => {
        if (txnsByUser[uid]) {
          txnCount += txnsByUser[uid].count;
          creditVol += txnsByUser[uid].credit;
          debitVol += txnsByUser[uid].debit;
        }
      });

      const cardCount = distUserIds.reduce((s, uid) => s + (cardsByUser[uid] || 0), 0);
      const activeUserCount = distUsers.filter(u => u.status === 'approved').length;

      return {
        _id: dist._id.toString(),
        name: dist.name,
        email: dist.email,
        status: dist.status,
        isOnHold: dist.isOnHold,
        walletBalance: dist.walletBalance || 0,
        createdAt: dist.createdAt,
        userCount: distUsers.length,
        activeUserCount,
        cardCount,
        transactionCount: txnCount,
        transactionVolume: debitVol,
        creditVolume: creditVol,
        debitVolume: debitVol,
      };
    });

    // Build user breakdown
    const distNameMap = {};
    distributors.forEach(d => { distNameMap[d._id.toString()] = d.name; });

    const userBreakdown = users.map(u => {
      const uid = u._id.toString();
      return {
        _id: uid,
        name: u.name,
        email: u.email,
        status: u.status,
        walletBalance: u.walletBalance || 0,
        distributorId: u.distributorId?.toString(),
        distributorName: distNameMap[u.distributorId?.toString()] || '—',
        cardCount: cardsByUser[uid] || 0,
        transactionCount: txnsByUser[uid]?.count || 0,
        kycStatus: kycByUser[uid] || null,
        createdAt: u.createdAt,
      };
    });

    // Global transaction stats
    const totalCredit = allTransactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalDebit = allTransactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const activeTransactingUsers = Object.keys(txnsByUser).length;
    const avgTransactionPerUser = userIds.length > 0
      ? Math.round((totalCredit + totalDebit) / userIds.length)
      : 0;

    return NextResponse.json({
      totalDistributors: distributors.length,
      totalUsers: users.length,
      totalCards: allCards.length,
      totalTransactions: allTransactions.length,
      totalVolume: totalDebit,
      totalCredit,
      totalDebit,
      activeTransactingUsers,
      avgTransactionPerUser,
      distributorBreakdown,
      userBreakdown,
    });

  } catch (error) {
    console.error('Reports Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
