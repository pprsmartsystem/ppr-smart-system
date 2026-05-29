import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    // Get all distributors under this master distributor
    const distributors = await User.find({ masterDistributorId: decoded.userId, role: 'distributor' });
    const distributorIds = distributors.map(d => d._id);

    // Get all users under these distributors
    const users = await User.find({ distributorId: { $in: distributorIds }, role: 'user' })
      .select('-password')
      .populate('distributorId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
