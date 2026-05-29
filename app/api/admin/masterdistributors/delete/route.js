import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function DELETE(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await connectDB();

    const { masterDistributorId } = await request.json();

    const md = await User.findOne({ _id: masterDistributorId, role: 'masterdistributor' });
    if (!md) return NextResponse.json({ error: 'Master Distributor not found' }, { status: 404 });

    // Unlink distributors (don't delete them, just remove masterDistributorId)
    await User.updateMany({ masterDistributorId: masterDistributorId }, { $unset: { masterDistributorId: '' } });

    await User.findByIdAndDelete(masterDistributorId);

    return NextResponse.json({ success: true, message: 'Master Distributor deleted. Distributors have been unlinked.' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
