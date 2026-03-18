import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { userId, distributorId } = await request.json();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const distributor = await User.findOne({ _id: distributorId, role: 'distributor' });
    if (!distributor) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    // Assign user under distributor — all cards, transactions, history remain intact
    user.distributorId = distributorId;
    await user.save();

    return NextResponse.json({
      message: `${user.name} has been assigned to distributor ${distributor.name} successfully`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
