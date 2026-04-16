// v5 - force-dynamic to prevent Vercel caching
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_MESSAGE = `We would like to inform you that due to an internal system update, our platform is currently under maintenance.

During this period, certain services may be temporarily unavailable. We request you to kindly hold your transactions until the maintenance is completed.

Our team is actively working to restore all services at the earliest.

We would like to inform you that our platform will undergo a scheduled internal system update on 21st April 2026.`;

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { maintenanceMode: false, maintenanceMessage: '' },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { maintenanceMode: false, maintenanceMessage: '' },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }

    await connectDB();
    const col = mongoose.connection.db.collection('usersettings');
    const userObjectId = new mongoose.Types.ObjectId(decoded.userId);
    const settings = await col.findOne({ userId: userObjectId });

    console.log('[maintenance] userId:', decoded.userId, 'maintenanceMode:', settings?.maintenanceMode);

    return NextResponse.json(
      {
        maintenanceMode: settings?.maintenanceMode === true,
        maintenanceMessage: settings?.maintenanceMessage || DEFAULT_MESSAGE,
      },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err) {
    console.error('[user/maintenance]', err.message);
    return NextResponse.json(
      { maintenanceMode: false, maintenanceMessage: '' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  }
}
