import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { userId, subject, message } = await request.json();

    const ticket = await Ticket.create({
      userId,
      subject,
      message,
      status: 'replied',
      replies: [{ message, isAdmin: true, createdAt: new Date() }],
    });

    const populated = await ticket.populate('userId', 'name email');
    return NextResponse.json({ ticket: populated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
