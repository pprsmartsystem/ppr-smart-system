import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const tickets = await Ticket.find({ userId: decoded.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const { subject, message, ticketId, reply } = await request.json();

    if (ticketId && reply) {
      const ticket = await Ticket.findById(ticketId);
      ticket.replies.push({ message: reply, isAdmin: false });
      ticket.status = 'open';
      await ticket.save();
      return NextResponse.json({ success: true, ticket });
    }

    const ticket = await Ticket.create({
      userId: decoded.userId,
      subject,
      message,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
