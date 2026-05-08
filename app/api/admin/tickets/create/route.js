import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { userId, subject, message, category, priority } = await request.json();

    const ticket = await Ticket.create({
      userId,
      subject,
      message,
      category: category || 'other',
      priority: priority || 'medium',
      status: 'replied',
      unreadByUser: true,
      unreadByAdmin: false,
      replies: [{
        message,
        isAdmin: true,
        adminName: 'Support Team',
        adminId: decoded.userId,
        createdAt: new Date(),
      }],
      lastActivityAt: new Date(),
    });

    const populatedTicket = await Ticket.findById(ticket._id).populate('userId', 'name email');

    return NextResponse.json({ success: true, ticket: populatedTicket });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
