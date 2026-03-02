import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';

export async function DELETE(request, { params }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await connectDB();
    const card = await Card.findOneAndDelete({ 
      _id: params.cardId, 
      userId: decoded.userId 
    });

    if (!card) {
      return NextResponse.json({ message: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Card deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
