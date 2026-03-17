import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import Order from '@/models/Order';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const { serviceId } = await request.json();

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'Service not available' }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.walletBalance < service.price) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // Check stock
    if (service.stock !== -1 && service.stock <= 0) {
      return NextResponse.json({ error: 'Service out of stock' }, { status: 400 });
    }

    // Deduct from wallet
    user.walletBalance -= service.price;
    await user.save();

    // Update stock
    if (service.stock !== -1) {
      service.stock -= 1;
      await service.save();
    }

    // Create order
    const orderId = `ORD${Date.now()}`;
    const order = await Order.create({
      orderId,
      userId: user._id,
      serviceId: service._id,
      amount: service.price,
      status: 'processing',
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      deliveryStatus: 'pending',
    });

    // Create transaction
    await Transaction.create({
      userId: user._id,
      type: 'debit',
      amount: service.price,
      status: 'completed',
      description: `Purchased service: ${service.name}`,
      reference: orderId,
    });

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Service purchased successfully! You will receive delivery details soon.' 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
