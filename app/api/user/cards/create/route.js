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
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const { amount, pin } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ message: 'Amount must be at least ₹1' }, { status: 400 });
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ message: 'PIN must be 4 digits' }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    
    if (user.walletBalance < amount) {
      return NextResponse.json({ message: `Insufficient wallet balance. You have ₹${user.walletBalance.toFixed(2)}` }, { status: 400 });
    }

    const card = await Card.create({
      userId: decoded.userId,
      cardNumber: generateCardNumber(),
      expiryDate: calculateExpiryDate(),
      cvv: generateCVV(),
      pin: pin,
      spendingLimit: amount,
      balance: amount,
      status: 'active',
      cardName: 'PPR Smart Card',
    });

    // Deduct amount from wallet
    user.walletBalance -= amount;
    await user.save();

    // Create transaction record
    const Transaction = (await import('@/models/Transaction')).default;
    await Transaction.create({
      userId: decoded.userId,
      cardId: card._id,
      type: 'debit',
      amount: amount,
      status: 'completed',
      description: `Card created - ₹${amount} transferred to card`,
      reference: `CARD-${Date.now()}`,
      fromWallet: true,
      balanceBefore: user.walletBalance + amount,
      balanceAfter: user.walletBalance,
    });

    return NextResponse.json({ message: 'Card created successfully', card });
  } catch (error) {
    console.error('Card creation error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
