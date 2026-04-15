import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Settlement from '@/models/Settlement';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate  = searchParams.get('startDate');
    const endDate    = searchParams.get('endDate');
    const type       = searchParams.get('type');

    // User filter
    let userFilter = { role: { $in: ['user', 'distributor'] } };
    if (type && type !== 'all') userFilter.role = type;
    const users = await User.find(userFilter).select('_id name email role').lean();

    // Date filter for Total Redeem only (IST → UTC)
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setTime(s.getTime() - IST_OFFSET);
        dateFilter.createdAt.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setTime(e.getTime() - IST_OFFSET + 24 * 60 * 60 * 1000 - 1);
        dateFilter.createdAt.$lte = e;
      }
    }

    const reports = await Promise.all(
      users.map(async (user) => {
        const uid = user._id;

        // Total Redeem: date-filtered — card redemption / gateway spending
        const redeemTxns = await Transaction.find({
          userId: uid,
          type: 'debit',
          description: { $regex: 'redeem|gateway|card redeemed', $options: 'i' },
          ...dateFilter,
        }).lean();
        const totalRedeem = redeemTxns.reduce((s, t) => s + t.amount, 0);

        // Settlement Initiated: date-filtered — T+1 bank settlements initiated by user
        const initiatedSettlements = await Settlement.find({
          userId: uid,
          type: 'manual',
          source: 'user',
          ...dateFilter,
        }).lean();
        const settlementInitiated = initiatedSettlements.reduce((s, t) => s + (t.settlementAmount || 0), 0);

        // Pending Settlement: date-filtered — auto settlements pending wallet credit
        const pendingSettlements = await Settlement.find({
          userId: uid,
          type: 'auto',
          source: 'admin',
          status: 'pending',
          ...dateFilter,
        }).lean();
        const pendingSettlement = pendingSettlements.reduce((s, t) => s + (t.settlementAmount || 0), 0);

        return {
          userId: uid,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          totalRedeem,
          settlementInitiated,
          pendingSettlement,
        };
      })
    );

    // Only show users with any activity
    const activeReports = reports.filter(
      r => r.totalRedeem > 0 || r.settlementInitiated > 0 || r.pendingSettlement > 0
    );

    return NextResponse.json({ reports: activeReports });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
