import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    await connectDB();
    const transactions = await Transaction.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(1000);

    if (format === 'csv') {
      const csv = [
        'Date,User,Email,Type,Amount,Status,Description,Reference',
        ...transactions.map(t => 
          `${new Date(t.createdAt).toISOString()},${t.userId?.name || 'N/A'},${t.userId?.email || 'N/A'},${t.type},${t.amount},${t.status},"${t.description}",${t.reference}`
        )
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
