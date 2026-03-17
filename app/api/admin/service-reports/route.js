import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(dateFilter).populate('serviceId');

    const serviceStats = {};
    let totalOrders = 0;
    let totalRevenue = 0;

    orders.forEach(order => {
      const serviceName = order.serviceId?.name || 'Unknown';
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = { totalOrders: 0, totalRevenue: 0 };
      }
      serviceStats[serviceName].totalOrders++;
      serviceStats[serviceName].totalRevenue += order.amount;
      totalOrders++;
      totalRevenue += order.amount;
    });

    const reports = Object.keys(serviceStats).map(serviceName => ({
      serviceName,
      totalOrders: serviceStats[serviceName].totalOrders,
      totalRevenue: serviceStats[serviceName].totalRevenue,
      avgOrderValue: serviceStats[serviceName].totalRevenue / serviceStats[serviceName].totalOrders,
    }));

    const topService = reports.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.serviceName || '';

    return NextResponse.json({
      reports,
      stats: { totalOrders, totalRevenue, topService },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
