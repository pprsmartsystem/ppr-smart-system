import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Settlement from '@/models/Settlement';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    // Build user filter
    let userFilter = { role: { $in: ['user', 'distributor'] } };
    if (type && type !== 'all') {
      userFilter.role = type;
    }

    const users = await User.find(userFilter).select('_id name email role');

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    const reports = await Promise.all(
      users.map(async (user) => {
        // Get total redeem amount (debit transactions from gateway redemption)
        const redeemTransactions = await Transaction.find({
          userId: user._id,
          type: 'debit',
          description: { $regex: /redeem|gateway/i },
          ...dateFilter
        });
        const totalRedeem = redeemTransactions.reduce((sum, t) => sum + t.amount, 0);

        // Get settlement initiated amount (only user-initiated T+1 settlements)
        const initiatedSettlements = await Transaction.find({
          userId: user._id,
          type: 'debit',
          description: { $regex: /settlement initiated.*T\+1/i },
          ...dateFilter
        });
        const settlementInitiated = initiatedSettlements.reduce((sum, t) => sum + t.amount, 0);

        // Get pending settlements from Settlement model
        const pendingSettlements = await Settlement.find({
          userId: user._id,
          status: 'pending',
          ...dateFilter
        });
        const pendingSettlement = pendingSettlements.reduce((sum, s) => sum + s.settlementAmount, 0);

        return {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          totalRedeem,
          settlementInitiated,
          pendingSettlement
        };
      })
    );

    // Filter out users with no activity
    const activeReports = reports.filter(r => r.totalRedeem > 0 || r.settlementInitiated > 0);

    return NextResponse.json({ reports: activeReports });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
