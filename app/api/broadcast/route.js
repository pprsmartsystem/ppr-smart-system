import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Broadcast from '@/models/Broadcast';

export async function GET() {
  try {
    await dbConnect();
    const broadcast = await Broadcast.findOne({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ broadcast });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
