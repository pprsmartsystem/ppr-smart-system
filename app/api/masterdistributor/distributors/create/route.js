export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const masterDistributor = await User.findById(decoded.userId);
    if (masterDistributor.isOnHold || masterDistributor.status === 'blocked') {
      return NextResponse.json({ error: 'Your account is on hold' }, { status: 403 });
    }

    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const distributor = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'distributor',
      status: 'approved',
      walletBalance: 0,
      masterDistributorId: decoded.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Distributor created successfully',
      distributor: { _id: distributor._id, name: distributor.name, email: distributor.email },
    });
  } catch (error) {
    console.error('[md-create-distributor]', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
