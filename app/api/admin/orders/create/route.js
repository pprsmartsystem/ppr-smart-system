import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Service from '@/models/Service';
import User from '@/models/User';
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
    const { userId, serviceId, serviceName, totalAmount, customerName, customerEmail, paymentMethod, transactionId, orderDate } = await request.json();

    const amount = totalAmount / 1.18;
    const gst = totalAmount - amount;

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (customerEmail) {
      user = await User.findOne({ email: customerEmail });
      if (!user) {
        const bcrypt = require('bcryptjs');
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        user = await User.create({
          name: customerName,
          email: customerEmail,
          password: hashedPassword,
          role: 'user',
          status: 'approved',
          walletBalance: 0,
        });
      }
    }

    let service;
    if (serviceId) {
      service = await Service.findById(serviceId);
      if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }
    } else if (serviceName) {
      // Create temporary service object for custom service
      service = { _id: null, name: serviceName };
    }

    const orderId = `ORD${Date.now()}`;
    const orderCreatedDate = orderDate ? new Date(orderDate) : new Date();
    
    const order = await Order.create({
      orderId,
      userId: user._id,
      serviceId: service._id,
      serviceName: serviceName || service.name,
      amount: totalAmount,
      status: 'completed',
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: 'paid',
      paymentId: transactionId || `pay_${Date.now()}`,
      deliveryStatus: 'pending',
      createdAt: orderCreatedDate,
      updatedAt: orderCreatedDate,
    });

    await AuditLog.create({
      userId: decoded.userId,
      action: `Created order ${orderId} for ${user.name}`,
      module: 'order',
      details: `Service: ${service.name}, Amount: ₹${totalAmount}`,
    });

    return NextResponse.json({ order, amount, gst });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
