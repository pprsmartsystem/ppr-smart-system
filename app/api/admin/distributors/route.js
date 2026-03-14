import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

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

    // Get all distributors
    const distributors = await User.find({ role: 'distributor' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get user count for each distributor
    const distributorsWithCount = await Promise.all(
      distributors.map(async (dist) => {
        const userCount = await User.countDocuments({ 
          distributorId: dist._id,
          role: 'user'
        });
        return {
          ...dist.toObject(),
          userCount
        };
      })
    );

    return NextResponse.json({ distributors: distributorsWithCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
