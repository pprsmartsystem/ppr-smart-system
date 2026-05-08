import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const tickets = await Ticket.find()
      .populate('userId', 'name email')
      .sort({ lastActivityAt: -1, createdAt: -1 });
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { ticketId, reply, status } = await request.json();

    const ticket = await Ticket.findById(ticketId).populate('userId', 'name email');
    
    if (reply) {
      ticket.replies.push({ 
        message: reply, 
        isAdmin: true,
        adminName: 'Support Team',
        adminId: decoded.userId,
        createdAt: new Date()
      });
      ticket.status = 'replied';
      ticket.unreadByUser = true;
      ticket.lastActivityAt = new Date();
    }
    
    if (status) {
      ticket.status = status;
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      }
      if (status === 'closed') {
        ticket.closedAt = new Date();
      }
      ticket.lastActivityAt = new Date();
    }
    
    await ticket.save();

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { ticketId } = await request.json();
    await Ticket.findByIdAndDelete(ticketId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
