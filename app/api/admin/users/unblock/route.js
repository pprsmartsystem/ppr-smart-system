import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { userId } = await request.json();
    
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    user.status = 'approved';
    await user.save();

    return NextResponse.json({ 
      message: 'User unblocked successfully',
      user: { id: user._id, name: user.name, status: user.status }
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
