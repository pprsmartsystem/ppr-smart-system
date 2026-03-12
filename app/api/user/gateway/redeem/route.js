import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';
import Settlement from '@/models/Settlement';
import UserSettings from '@/models/UserSettings';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const { cardNumber, expiryDate, cvv, pin, amount } = await request.json();

    const card = await Card.findOne({ cardNumber, expiryDate, cvv });
    if (!card || card.status !== 'active') {
      return NextResponse.json({ error: 'Invalid card details' }, { status: 400 });
    }

    if (card.pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    if (card.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct amount from card
    card.balance -= amount;
    await card.save();

    // Create transaction for card spend
    await Transaction.create({
      userId: card.userId,
      cardId: card._id,
      type: 'debit',
      amount: amount,
      status: 'completed',
      description: 'Card redeemed via gateway',
      reference: `REDEEM${Date.now()}`,
    });

    // Check if auto settlement is enabled for user
    const userSettings = await UserSettings.findOne({ userId: card.userId });
    const autoSettlement = userSettings?.autoSettlement !== false; // Default true

    if (autoSettlement) {
      // Calculate settlement: spend amount minus 1.77% deduction
      const settlementRate = 1.77;
      const deductionAmount = (amount * settlementRate) / 100;
      const settlementAmount = amount - deductionAmount;

      // Create settlement record
      await Settlement.create({
        userId: card.userId,
        spendAmount: amount,
        settlementRate: settlementRate,
        settlementAmount: settlementAmount,
        status: 'pending',
        type: 'auto',
        scheduledFor: getNextSettlementTime(), // 9:30 AM next day
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Card redeemed successfully',
      remainingBalance: card.balance 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Redemption failed' }, { status: 500 });
  }
}

function getNextSettlementTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 30, 0, 0); // 9:30 AM
  
  // Skip weekends
  if (tomorrow.getDay() === 0) { // Sunday
    tomorrow.setDate(tomorrow.getDate() + 1); // Monday
  } else if (tomorrow.getDay() === 6) { // Saturday
    tomorrow.setDate(tomorrow.getDate() + 2); // Monday
  }
  
  return tomorrow;
}