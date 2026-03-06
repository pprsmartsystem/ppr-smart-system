import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const { utrNumber, name, amount } = await request.json();

    const transaction = await Transaction.create({
      userId: decoded.userId,
      type: 'payment_request',
      amount: parseFloat(amount),
      status: 'pending',
      description: 'Wallet Loading Request',
      reference: utrNumber,
      metadata: { name, utrNumber }
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
