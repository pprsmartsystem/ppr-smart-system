import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Card from '@/models/Card';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    await dbConnect();

    const { cardNumber, expiryDate, cvv, pin, amount } = await request.json();

    if (!cardNumber || !expiryDate || !cvv || !pin || !amount) {
      return NextResponse.json({ error: 'Card declined - All fields required' }, { status: 400 });
    }

    if (cardNumber.length !== 16 || cvv.length !== 3 || pin.length !== 4) {
      return NextResponse.json({ error: 'Card declined - Invalid format' }, { status: 400 });
    }

    const card = await Card.findOne({ 
      cardNumber, 
      userId: decoded.userId 
    });

    console.log('Card found:', card ? 'Yes' : 'No');
    if (card) {
      console.log('Card CVV:', card.cvv, 'Input CVV:', cvv);
      console.log('Card Expiry:', card.expiryDate, 'Input Expiry:', expiryDate);
      console.log('Card PIN:', card.pin, 'Input PIN:', pin);
      console.log('Card Status:', card.status);
      console.log('Card Balance:', card.balance);
    }

    if (!card) {
      return NextResponse.json({ error: 'Card declined - Card not found or not yours' }, { status: 404 });
    }

    if (card.cvv !== cvv) {
      return NextResponse.json({ error: 'Card declined - Invalid CVV' }, { status: 401 });
    }

    if (card.expiryDate !== expiryDate) {
      return NextResponse.json({ error: 'Card declined - Invalid expiry date' }, { status: 401 });
    }

    if (!card.pin) {
      return NextResponse.json({ error: 'Card declined - This card has no PIN. Please create a new card.' }, { status: 400 });
    }

    if (card.pin !== pin) {
      return NextResponse.json({ error: 'Card declined - Invalid PIN' }, { status: 401 });
    }

    if (card.status !== 'active') {
      return NextResponse.json({ error: 'Card declined - Card is not active' }, { status: 400 });
    }

    if (card.balance <= 0) {
      return NextResponse.json({ error: 'Card declined - No balance available' }, { status: 400 });
    }

    if (card.balance !== amount) {
      return NextResponse.json({ error: `Card declined - Amount must be exactly ₹${card.balance.toFixed(2)}` }, { status: 400 });
    }

    const cardAmount = card.balance;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'Card declined - User not found' }, { status: 404 });
    }

    card.balance = 0;
    card.status = 'expired';
    await card.save();

    const transaction = new Transaction({
      userId: decoded.userId,
      cardId: card._id,
      type: 'debit',
      amount: cardAmount,
      status: 'completed',
      description: `Card redeemed - ${cardNumber.slice(-4)}`,
      reference: `REDEEM-${Date.now()}`,
    });
    await transaction.save();

    return NextResponse.json({
      success: true,
      message: `₹${cardAmount.toFixed(2)} redeemed from card`,
      amount: cardAmount,
    });
  } catch (error) {
    console.error('Redeem error:', error);
    return NextResponse.json({ error: 'Card declined - Redemption failed' }, { status: 500 });
  }
}
