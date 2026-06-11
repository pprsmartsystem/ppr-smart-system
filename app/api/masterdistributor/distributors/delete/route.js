export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function DELETE(request) {
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

    const { distributorId } = await request.json();

    if (!distributorId) {
      return NextResponse.json({ error: 'distributorId required' }, { status: 400 });
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

    // Get all users under this distributor
    const users = await User.find({ distributorId: distributorId });
    const userIds = users.map(u => u._id);

    // Delete all cards of users under this distributor
    await Card.deleteMany({ userId: { $in: userIds } });

    // Delete all transactions of users under this distributor
    await Transaction.deleteMany({ userId: { $in: userIds } });

    // Delete all users under this distributor
    await User.deleteMany({ distributorId: distributorId });

    // Delete the distributor
    await User.findByIdAndDelete(distributorId);

    return NextResponse.json({ 
      success: true, 
      message: 'Distributor and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error('Delete Distributor Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
