import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 0;
    const page = parseInt(searchParams.get('page')) || 1;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    await connectDB();

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    if (userId) filter.userId = userId;

    const skip = limit > 0 ? (page - 1) * limit : 0;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit || 0),
      Transaction.countDocuments(filter)
    ]);

    return NextResponse.json({ 
      transactions,
      total,
      page,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
