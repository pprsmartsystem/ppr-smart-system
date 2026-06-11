export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['block', 'unblock'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user || user.role !== 'user') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user belongs to a distributor under this master distributor
    const distributor = await User.findOne({
      _id: user.distributorId,
      masterDistributorId: decoded.userId,
      role: 'distributor'
    });

    if (!distributor) {
      return NextResponse.json({ error: 'You do not have permission to manage this user' }, { status: 403 });
    }

    // Update user status
    if (action === 'block') {
      user.status = 'blocked';
    } else {
      user.status = user.status === 'blocked' ? 'approved' : user.status;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: `User ${action === 'block' ? 'blocked' : 'unblocked'} successfully`
    });

  } catch (error) {
    console.error('Block/Unblock error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
