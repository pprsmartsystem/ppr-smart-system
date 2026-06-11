export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { distributorId, action, reason } = await request.json();

    if (!distributorId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify distributor belongs to this master distributor
    const distributor = await User.findOne({
      _id: distributorId,
      masterDistributorId: decoded.userId,
      role: 'distributor'
    });

    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    if (action === 'hold') {
      distributor.status = 'blocked';
      distributor.holdReason = reason || 'Account temporarily held by master distributor';
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
  } catch (error) {
    console.error('Hold/Unhold Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
