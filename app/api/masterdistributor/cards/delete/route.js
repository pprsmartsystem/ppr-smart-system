export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function DELETE(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'masterdistributor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { cardId, reason } = await request.json();

    if (!cardId || !reason || !reason.trim()) {
      return NextResponse.json({ error: 'Card ID and reason are required' }, { status: 400 });
    }

    // Find the card
    const card = await Card.findById(cardId).populate('userId', 'name email distributorId walletBalance');
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
        error: 'You do not have permission to delete this card' 
      }, { status: 403 });
    }

    // If card has balance, refund to wallet
    if (card.balance > 0) {
      const user = await User.findById(card.userId._id);
      user.walletBalance += card.balance;
      await user.save();

      // Create transaction for refund
      await Transaction.create({
        userId: card.userId._id,
        type: 'credit',
        amount: card.balance,
        status: 'completed',
        description: `Card deleted by master distributor. Balance refunded. Reason: ${reason.trim()}`,
        reference: `CARD-DEL-${Date.now()}`,
      });
    }

    // Delete the card
    await Card.findByIdAndDelete(cardId);

    return NextResponse.json({
      success: true,
      message: `Card deleted successfully${card.balance > 0 ? `. ₹${card.balance.toFixed(2)} refunded to user wallet` : ''}`
    });

  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
