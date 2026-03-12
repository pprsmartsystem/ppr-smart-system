import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Settlement from '@/models/Settlement';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const settlements = await Settlement.find({
      userId: decoded.userId,
      status: 'pending'
    });

    const totalPending = settlements.reduce((sum, s) => sum + s.settlementAmount, 0);

    return NextResponse.json({ 
      settlements,
      totalPending 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
