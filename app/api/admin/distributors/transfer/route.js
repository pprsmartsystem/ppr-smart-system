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

    const { distributorId, masterDistributorId } = await request.json();

    if (!distributorId) return NextResponse.json({ error: 'distributorId required' }, { status: 400 });

    const distributor = await User.findOne({ _id: distributorId, role: 'distributor' });
    if (!distributor) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    // masterDistributorId = null means unlink from master distributor
    if (masterDistributorId) {
      const md = await User.findOne({ _id: masterDistributorId, role: 'masterdistributor' });
      if (!md) return NextResponse.json({ error: 'Master Distributor not found' }, { status: 404 });
      distributor.masterDistributorId = masterDistributorId;
    } else {
      distributor.masterDistributorId = null;
    }

    await distributor.save();

    return NextResponse.json({
      success: true,
      message: masterDistributorId
        ? 'Distributor assigned to Master Distributor'
        : 'Distributor unlinked from Master Distributor',
    });
  } catch (err) {
    console.error('[transfer-distributor]', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
