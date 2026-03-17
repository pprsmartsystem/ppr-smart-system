import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';
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
    const services = await Service.find().sort({ createdAt: -1 });

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const data = await request.json();
    const service = await Service.create(data);

    await AuditLog.create({
      userId: decoded.userId,
      action: `Created service: ${service.name}`,
      module: 'service',
      details: `Service ID: ${service._id}`,
    });

    return NextResponse.json({ service });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { id, ...data } = await request.json();
    const service = await Service.findByIdAndUpdate(id, data, { new: true });

    await AuditLog.create({
      userId: decoded.userId,
      action: `Updated service: ${service.name}`,
      module: 'service',
      details: `Service ID: ${service._id}`,
    });

    return NextResponse.json({ service });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await dbConnect();
    const service = await Service.findByIdAndDelete(id);

    await AuditLog.create({
      userId: decoded.userId,
      action: `Deleted service: ${service.name}`,
      module: 'service',
      details: `Service ID: ${service._id}`,
    });

    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
