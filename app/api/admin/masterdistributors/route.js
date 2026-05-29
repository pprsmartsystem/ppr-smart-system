import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await connectDB();

    const masterDistributors = await User.find({ role: 'masterdistributor' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach distributor count for each
    const result = await Promise.all(
      masterDistributors.map(async (md) => {
        const distributorCount = await User.countDocuments({ masterDistributorId: md._id, role: 'distributor' });
        return { ...md.toObject(), distributorCount };
      })
    );

    return NextResponse.json({ masterDistributors: result });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
