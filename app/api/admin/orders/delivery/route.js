import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
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
    const { orderId, deliveryProof, deliveryNotes, deliveryDate } = await request.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.deliveryProof = deliveryProof;
    order.deliveryNotes = deliveryNotes;
    order.deliveryStatus = 'delivered';
    order.deliveredAt = deliveryDate ? new Date(deliveryDate) : new Date();
    order.status = 'completed';
    await order.save();

    await AuditLog.create({
      userId: decoded.userId,
      action: `Uploaded delivery proof for order ${order.orderId}`,
      module: 'delivery',
      details: deliveryNotes,
    });

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
