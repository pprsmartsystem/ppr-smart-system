export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await connectDB();

    const { masterDistributorId, action, reason } = await request.json();

    const md = await User.findOne({ _id: masterDistributorId, role: 'masterdistributor' });
    if (!md) return NextResponse.json({ error: 'Master Distributor not found' }, { status: 404 });

    if (action === 'hold') {
      md.isOnHold = true;
      md.status = 'blocked';
      md.holdReason = reason || 'Account held by admin';
      md.heldAt = new Date();
    } else if (action === 'unhold') {
      md.isOnHold = false;
      md.status = 'approved';
      md.holdReason = null;
      md.heldAt = null;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await md.save();

    return NextResponse.json({ success: true, message: action === 'hold' ? 'Master Distributor placed on hold' : 'Hold removed' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
