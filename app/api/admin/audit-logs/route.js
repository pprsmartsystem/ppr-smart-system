import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const logs = await AuditLog.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
