import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import KYC from '@/models/KYC';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { kycId, reason } = await request.json();
    if (!reason) return NextResponse.json({ error: 'Reason is required' }, { status: 400 });

    await connectDB();
    const kyc = await KYC.findById(kycId);
    if (!kyc) return NextResponse.json({ error: 'KYC not found' }, { status: 404 });

    kyc.status = 'rekyc';
    kyc.rekycReason = reason;
    kyc.reviewedAt = new Date();
    await kyc.save();

    return NextResponse.json({ message: 'Re-KYC requested successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
