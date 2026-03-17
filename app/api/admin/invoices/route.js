import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const invoices = await Invoice.find()
      .populate('orderId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ invoices });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
