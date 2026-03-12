import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';

export async function PUT(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { cardId, spendingLimit, status } = await request.json();

    const updateData = {};
    if (spendingLimit !== undefined) updateData.spendingLimit = spendingLimit;
    if (status !== undefined) updateData.status = status;

    const card = await Card.findByIdAndUpdate(cardId, updateData, { new: true });
    
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, card });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}