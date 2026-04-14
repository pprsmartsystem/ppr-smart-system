// v4 - force redeploy
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const DEFAULT_MESSAGE = `We would like to inform you that due to an internal system update, our platform is currently under maintenance.

During this period, certain services may be temporarily unavailable. We request you to kindly hold your transactions until the maintenance is completed.

Our team is actively working to restore all services at the earliest.`;

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ maintenanceMode: false, maintenanceMessage: '' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ maintenanceMode: false, maintenanceMessage: '' });
    }

    await connectDB();
    const col = mongoose.connection.db.collection('usersettings');
    const userObjectId = new mongoose.Types.ObjectId(decoded.userId);
    const settings = await col.findOne({ userId: userObjectId });

    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode === true,
      maintenanceMessage: settings?.maintenanceMessage || DEFAULT_MESSAGE,
    });
  } catch (err) {
    console.error('[user/maintenance]', err.message);
    return NextResponse.json({ maintenanceMode: false, maintenanceMessage: '' });
  }
}
