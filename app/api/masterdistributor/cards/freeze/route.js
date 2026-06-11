export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { cardId, action } = await request.json();

    if (!cardId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['freeze', 'unfreeze'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the card
    const card = await Card.findById(cardId).populate('userId', 'distributorId');
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Verify card belongs to user under distributor under this master distributor
    const distributor = await User.findOne({
      _id: card.userId.distributorId,
      masterDistributorId: decoded.userId,
      role: 'distributor'
    });

    if (!distributor) {
      return NextResponse.json({ 
        error: 'You do not have permission to manage this card' 
      }, { status: 403 });
    }

    // Update card status
    if (action === 'freeze') {
      if (card.status === 'frozen') {
        return NextResponse.json({ error: 'Card is already frozen' }, { status: 400 });
      }
      card.status = 'frozen';
    } else {
      if (card.status !== 'frozen') {
        return NextResponse.json({ error: 'Card is not frozen' }, { status: 400 });
      }
      card.status = 'active';
    }

    await card.save();

    return NextResponse.json({
      success: true,
      message: `Card ${action === 'freeze' ? 'frozen' : 'unfrozen'} successfully`
    });

  } catch (error) {
    console.error('Freeze/Unfreeze error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
