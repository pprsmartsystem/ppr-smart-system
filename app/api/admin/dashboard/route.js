import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Corporate from '@/models/Corporate';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Verify admin role
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get statistics
    const [totalUsers, totalCorporates, totalCards, totalTransactions] = await Promise.all([
      User.countDocuments(),
      Corporate.countDocuments(),
      Card.countDocuments(),
      Transaction.countDocuments(),
    ]);

    // Calculate total revenue (mock calculation)
    const transactions = await Transaction.find({ status: 'completed', type: 'debit' });
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount * 0.02), 0); // 2% fee

    // Mock chart data for the last 6 months
    const chartData = [
      { month: 'Jan', transactions: 1200 },
      { month: 'Feb', transactions: 1900 },
      { month: 'Mar', transactions: 3000 },
      { month: 'Apr', transactions: 2800 },
      { month: 'May', transactions: 3900 },
      { month: 'Jun', transactions: 4300 },
    ];

    // User distribution pie chart data
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const pieData = usersByRole.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
    }));

    const stats = {
      totalUsers,
      totalCorporates,
      totalCards,
      totalTransactions,
      totalRevenue: Math.round(totalRevenue),
      monthlyGrowth: 15.2, // Mock growth percentage
    };

    return NextResponse.json({
      stats,
      chartData,
      pieData,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}