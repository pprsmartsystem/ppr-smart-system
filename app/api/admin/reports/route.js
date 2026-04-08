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

    // Build date filter with IST offset (+5:30)
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setTime(start.getTime() - IST_OFFSET); // IST midnight -> UTC
        dateFilter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setTime(end.getTime() - IST_OFFSET + (24 * 60 * 60 * 1000) - 1); // IST end of day -> UTC
        dateFilter.createdAt.$lte = end;
      }
    }

    const reports = await Promise.all(
      users.map(async (user) => {
        const baseFilter = { userId: user._id, ...dateFilter };

        // Total redeem: debit transactions from gateway
        const redeemTxns = await Transaction.find({
          ...baseFilter,
          type: 'debit',
          description: { $regex: 'redeem|gateway', $options: 'i' },
        });
        const totalRedeem = redeemTxns.reduce((sum, t) => sum + t.amount, 0);

        // Settlement initiated: debit transactions T+1
        const initiatedTxns = await Transaction.find({
          ...baseFilter,
          type: 'debit',
          description: { $regex: 'settlement initiated', $options: 'i' },
        });
        const settlementInitiated = initiatedTxns.reduce((sum, t) => sum + t.amount, 0);

        // Pending settlements from Settlement model
        const pendingSettlements = await Settlement.find({
          userId: user._id,
          status: 'pending',
          ...dateFilter,
        });
        const pendingSettlement = pendingSettlements.reduce((sum, s) => sum + s.settlementAmount, 0);

        return {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          totalRedeem,
          settlementInitiated,
          pendingSettlement,
        };
      })
    );

    // Filter out users with no activity
    const activeReports = reports.filter(r => r.totalRedeem > 0 || r.settlementInitiated > 0 || r.pendingSettlement > 0);

    return NextResponse.json({ reports: activeReports });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
