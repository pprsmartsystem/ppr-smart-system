import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const tickets = await Ticket.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    if (body.ticketId && body.reply) {
      const ticket = await Ticket.findById(body.ticketId);
      if (!ticket || ticket.userId.toString() !== decoded.userId) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      ticket.replies.push({
        message: body.reply,
        isAdmin: false,
        createdAt: new Date(),
      });
      ticket.status = 'replied';
      await ticket.save();

      return NextResponse.json({ ticket });
    }

    const ticket = await Ticket.create({
      userId: decoded.userId,
      subject: body.subject,
      message: body.message,
      status: 'open',
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
