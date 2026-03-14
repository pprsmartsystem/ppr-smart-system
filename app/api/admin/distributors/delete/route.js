import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';
import Settlement from '@/models/Settlement';
import Cashback from '@/models/Cashback';

export async function DELETE(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get all users under this distributor
    const users = await User.find({ 
      distributorId: id,
      role: 'user'
    });

    const userIds = users.map(u => u._id);

    // Delete all user data
    await Card.deleteMany({ userId: { $in: userIds } });
    await Transaction.deleteMany({ userId: { $in: userIds } });
    await Settlement.deleteMany({ userId: { $in: userIds } });
    await Cashback.deleteMany({ userId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });

    // Delete distributor transactions
    await Transaction.deleteMany({ userId: id });

    // Delete distributor
    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
