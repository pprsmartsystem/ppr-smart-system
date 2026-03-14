import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request) {
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
    const { employeeId, amount } = await request.json();

    // Verify employee belongs to this corporate
    const employee = await User.findOne({
      _id: employeeId,
      corporateId: decoded.userId,
      role: 'employee'
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Add balance to employee wallet
    employee.walletBalance += amount;
    await employee.save();

    // Create transaction record
    await Transaction.create({
      userId: employeeId,
      type: 'credit',
      amount: amount,
      status: 'completed',
      description: 'Balance added by corporate',
      reference: `CORP${Date.now()}`
    });

    return NextResponse.json({ 
      success: true,
      newBalance: employee.walletBalance 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
