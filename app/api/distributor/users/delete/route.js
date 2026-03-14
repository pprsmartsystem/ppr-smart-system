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
    if (decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Verify user belongs to this distributor
    const user = await User.findOne({
      _id: userId,
      distributorId: decoded.userId
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all user data
    await Card.deleteMany({ userId });
    await Transaction.deleteMany({ userId });
    await Settlement.deleteMany({ userId });
    await Cashback.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
