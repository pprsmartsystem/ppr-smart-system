import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { sendMail } from '@/lib/mailer';
import { walletLoadingEmail } from '@/lib/emails/walletLoading';

export async function POST(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const { distributorId, amount, action, remark } = await request.json();

    const distributor = await User.findById(distributorId);
    if (!distributor || distributor.role !== 'distributor') {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    if (action === 'deduct') {
      distributor.walletBalance -= amount;
      await distributor.save();

      await Transaction.create({
        userId: distributorId,
        type: 'debit',
        amount,
        status: 'completed',
        description: remark || 'Balance deducted by admin',
        reference: `DEDUCT${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Balance deducted successfully',
        newBalance: distributor.walletBalance,
      });

    } else {
      // Add balance
      distributor.walletBalance += amount;
      await distributor.save();

      const reference = `LOAD${Date.now()}`;

      await Transaction.create({
        userId: distributorId,
        type: 'credit',
        amount,
        status: 'completed',
        description: 'Wallet recharged by admin',
        reference,
      });

      // Send email ONLY if distributor is approved
      if (distributor.status === 'approved' && distributor.email) {
        try {
          await sendMail({
            to: distributor.email,
            subject: 'Wallet Loading Initiated — PPR Smart System',
            html: walletLoadingEmail({
              name: distributor.name,
              amount,
              newBalance: distributor.walletBalance,
              reference,
              date: new Date(),
            }),
          });
        } catch (mailErr) {
          // Log but don't fail the request if email fails
          console.error('[wallet-load-mail]', mailErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Balance added successfully',
        newBalance: distributor.walletBalance,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
