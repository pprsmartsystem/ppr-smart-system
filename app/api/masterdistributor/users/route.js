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
    if (decoded.role !== 'masterdistributor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    // Get all distributors under this master distributor
    const distributors = await User.find({ masterDistributorId: decoded.userId, role: 'distributor' });
    const distributorIds = distributors.map(d => d._id);

    // Get all users under these distributors
    const users = await User.find({ distributorId: { $in: distributorIds }, role: 'user' })
      .select('-password')
      .populate('distributorId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Get card counts for each user
    const userIds = users.map(u => u._id);
    const cardCounts = await Card.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    // Map card counts to users
    const cardCountMap = {};
    cardCounts.forEach(({ _id, count }) => {
      cardCountMap[_id.toString()] = count;
    });

    // Add totalCards to each user
    const usersWithCards = users.map(user => ({
      ...user,
      totalCards: cardCountMap[user._id.toString()] || 0
    }));

    return NextResponse.json({ users: usersWithCards });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
