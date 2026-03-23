import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Broadcast from '@/models/Broadcast';

export async function GET() {
  try {
    await dbConnect();
    const broadcast = await Broadcast.findOne({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ broadcast }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
