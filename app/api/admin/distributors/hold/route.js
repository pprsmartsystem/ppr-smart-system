import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { distributorId, action, reason } = await request.json();

    if (!distributorId) return NextResponse.json({ error: 'distributorId required' }, { status: 400 });

    const distributor = await User.findOne({ _id: distributorId, role: 'distributor' });
    if (!distributor) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    if (action === 'hold') {
      distributor.status = 'blocked';
      distributor.holdReason = reason || 'Account temporarily held by admin';
      distributor.heldAt = new Date();
      distributor.isOnHold = true;
    } else if (action === 'unhold') {
      distributor.status = 'approved';
      distributor.holdReason = null;
      distributor.heldAt = null;
      distributor.isOnHold = false;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await distributor.save();

    return NextResponse.json({
      success: true,
      message: action === 'hold'
        ? 'Distributor account placed on hold'
        : 'Distributor account hold removed',
    });
  } catch (err) {
    console.error('[distributor/hold]', err.message);
    return NextResponse.json({ error: 'Failed to update hold status' }, { status: 500 });
  }
}
