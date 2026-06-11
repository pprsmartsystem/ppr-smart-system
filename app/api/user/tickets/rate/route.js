export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    await dbConnect();

    const { ticketId, score, feedback } = await request.json();

    const ticket = await Ticket.findOne({ _id: ticketId, userId: decoded.userId });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.rating) {
      return NextResponse.json({ error: 'Ticket already rated' }, { status: 400 });
    }

    ticket.rating = {
      score,
      feedback: feedback || '',
      ratedAt: new Date(),
    };
    ticket.status = 'closed';
    ticket.closedAt = new Date();

    await ticket.save();

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Rate ticket error:', error);
    return NextResponse.json({ error: 'Failed to rate ticket' }, { status: 500 });
  }
}
