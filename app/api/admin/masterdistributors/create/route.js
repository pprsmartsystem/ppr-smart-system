export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, hashPassword } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await connectDB();

    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

    const hashedPassword = await hashPassword(password);

    const masterDistributor = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'masterdistributor',
      status: 'approved',
      walletBalance: 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Master Distributor created successfully',
      masterDistributor: {
        _id: masterDistributor._id,
        name: masterDistributor.name,
        email: masterDistributor.email,
      },
    });
  } catch (err) {
    console.error('[create-masterdistributor]', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
