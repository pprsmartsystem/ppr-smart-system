import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PaymentGateway from '@/models/PaymentGateway';

export async function GET() {
  try {
    await connectDB();
    const gateways = await PaymentGateway.find({ isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({ gateways });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
