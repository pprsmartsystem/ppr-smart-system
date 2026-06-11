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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { masterDistributorId } = await request.json();
    if (!masterDistributorId) {
      return NextResponse.json({ error: 'Missing masterDistributorId' }, { status: 400 });
    }

    const md = await User.findOne({ _id: masterDistributorId, role: 'masterdistributor' });
    if (!md) return NextResponse.json({ error: 'Master Distributor not found' }, { status: 404 });

    if (md.settlementActivated) {
      return NextResponse.json({ error: 'Settlement already activated' }, { status: 400 });
    }

    md.settlementActivated = true;
    md.settlementActivatedAt = new Date();
    await md.save();

    return NextResponse.json({ success: true, message: 'Settlement limit activated — no cap on settlement amount.' });
  } catch (err) {
    console.error('Activate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
