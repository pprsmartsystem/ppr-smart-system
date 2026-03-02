import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({ featured: true }).sort({ name: 1 });
    return NextResponse.json({ brands });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
