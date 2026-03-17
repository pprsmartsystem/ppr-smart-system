import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';
import AuditLog from '@/models/AuditLog';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { orderId } = await request.json();

    const order = await Order.findById(orderId).populate('serviceId');
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const invoiceNumber = `PPR${Date.now()}`;
    const baseAmount = order.amount / 1.18;
    const tax = order.amount - baseAmount;

    const invoice = await Invoice.create({
      invoiceNumber,
      orderId: order._id,
      userId: order.userId,
      amount: order.amount,
      tax,
      totalAmount: order.amount,
      status: 'sent',
      items: [{
        description: order.serviceName || order.serviceId?.name || 'Service',
        quantity: 1,
        price: baseAmount,
        amount: baseAmount,
      }],
      createdAt: order.createdAt,
    });

    order.invoiceId = invoiceNumber;
    await order.save();

    await AuditLog.create({
      userId: decoded.userId,
      action: `Generated invoice ${invoiceNumber}`,
      module: 'invoice',
      details: `Order ID: ${order.orderId}`,
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
