import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'corporate') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get all employees
    const employees = await User.find({ 
      corporateId: decoded.userId,
      role: 'employee'
    });

    const employeeIds = employees.map(e => e._id);

    // Get total wallet balance
    const totalWalletBalance = employees.reduce((sum, emp) => sum + (emp.walletBalance || 0), 0);

    // Get all cards
    const cards = await Card.find({ userId: { $in: employeeIds } });
    const activeCards = cards.filter(c => c.status === 'active').length;

    // Get monthly spend (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await Transaction.find({
      userId: { $in: employeeIds },
      type: 'debit',
      createdAt: { $gte: startOfMonth }
    });

    const monthlySpend = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      totalEmployees: employees.length,
      walletBalance: totalWalletBalance,
      activeCards,
      monthlySpend
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
