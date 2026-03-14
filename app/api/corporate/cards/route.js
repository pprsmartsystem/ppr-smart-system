import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Card from '@/models/Card';
import User from '@/models/User';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'corporate') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get all employees under this corporate
    const employees = await User.find({ 
      corporateId: decoded.userId,
      role: 'employee'
    });

    const employeeIds = employees.map(e => e._id);

    // Get all cards for these employees
    const cards = await Card.find({ 
      userId: { $in: employeeIds }
    }).populate('userId', 'name email').sort({ createdAt: -1 });

    return NextResponse.json({ cards });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
