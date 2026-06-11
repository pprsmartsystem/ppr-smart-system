export const dynamic = 'force-dynamic';
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

    const tickets = await Ticket.find({ userId: decoded.userId })
      .sort({ lastActivityAt: -1, createdAt: -1 });
    
    // Mark all as read by user
    await Ticket.updateMany(
      { userId: decoded.userId, unreadByUser: true },
      { unreadByUser: false }
    );
    
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

    const { subject, message, category, priority, ticketId, reply } = await request.json();

    if (ticketId && reply) {
      const ticket = await Ticket.findById(ticketId);
      ticket.replies.push({ message: reply, isAdmin: false });
      ticket.status = 'open';
      ticket.unreadByAdmin = true;
      ticket.unreadByUser = false;
      ticket.lastActivityAt = new Date();
      await ticket.save();
      return NextResponse.json({ success: true, ticket });
    }

    const ticket = await Ticket.create({
      userId: decoded.userId,
      subject,
      message,
      category: category || 'other',
      priority: priority || 'medium',
      unreadByAdmin: true,
      unreadByUser: false,
      lastActivityAt: new Date(),
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Ticket error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
