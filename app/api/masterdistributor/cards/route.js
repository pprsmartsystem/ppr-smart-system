import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get all distributors under this master distributor
    const distributors = await User.find({ 
      masterDistributorId: decoded.userId, 
      role: 'distributor' 
    }).select('_id name');

    const distributorIds = distributors.map(d => d._id);

    // Get all users under these distributors
    const users = await User.find({ 
      distributorId: { $in: distributorIds }, 
      role: 'user' 
    }).select('_id distributorId');

    const userIds = users.map(u => u._id);

    // Create distributor name map
    const distributorMap = {};
    distributors.forEach(d => {
      distributorMap[d._id.toString()] = d.name;
    });

    // Get all cards for these users
    const cards = await Card.find({ userId: { $in: userIds } })
      .populate('userId', 'name email distributorId')
      .sort({ createdAt: -1 })
      .lean();

    // Add distributor name to each card
    const cardsWithDistributor = cards.map(card => ({
      ...card,
      distributorName: distributorMap[card.userId?.distributorId?.toString()] || 'Unknown'
    }));

    return NextResponse.json({ cards: cardsWithDistributor });

  } catch (error) {
    console.error('Cards fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
