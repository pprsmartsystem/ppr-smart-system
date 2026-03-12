import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function PUT(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id, amount, description, status, type } = await request.json();

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { amount, description, status, type },
      { new: true }
    );

    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
