import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
