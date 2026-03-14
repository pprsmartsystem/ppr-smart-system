import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    return NextResponse.json({ settings });
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
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const data = await request.json();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(data);
    } else {
      Object.assign(settings, data);
      settings.updatedAt = new Date();
      await settings.save();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
