import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';
import User from '@/models/User';

function generateCardNumber() {
  const prefix = '4532';
  let cardNumber = prefix;
  for (let i = 0; i < 12; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

function generateCVV() {
  return Math.floor(100 + Math.random() * 900).toString();
}

function calculateExpiryDate(years = 3) {
  const now = new Date();
  const expiryDate = new Date(now.getFullYear() + years, now.getMonth(), 1);
  const month = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
  const year = expiryDate.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
}

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { userId, amount, spendingLimit } = await request.json();
    
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const card = await Card.create({
      userId: userId,
      cardNumber: generateCardNumber(),
      expiryDate: calculateExpiryDate(),
      cvv: generateCVV(),
      spendingLimit: spendingLimit || 5000,
      balance: amount || 0,
      status: 'active',
      cardName: `${user.name}'s Card`,
    });

    return NextResponse.json({ message: 'Card issued successfully', card });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
