import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import KYC from '@/models/KYC';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { kycId } = await request.json();
    
    await connectDB();
    const kyc = await KYC.findById(kycId);
    if (!kyc) return NextResponse.json({ message: 'KYC not found' }, { status: 404 });

    kyc.status = 'approved';
    kyc.reviewedAt = new Date();
    await kyc.save();

    return NextResponse.json({ message: 'KYC approved successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
