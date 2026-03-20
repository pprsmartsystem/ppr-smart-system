import Transaction from '@/models/Transaction';

/**
 * Credits wallet and auto-deducts any existing negative balance (debt).
 * Returns the actual amount credited after debt settlement.
 */
export async function creditWallet(user, amount, description, referencePrefix = 'CR') {
  const reference = `${referencePrefix}-${Date.now()}`;

  if (user.walletBalance < 0) {
    const debt = Math.abs(user.walletBalance);

    if (amount <= debt) {
      // Entire credit goes to settle debt
      user.walletBalance += amount;
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: 'credit',
        amount,
        status: 'completed',
        description,
        reference,
      });

      await Transaction.create({
        userId: user._id,
        type: 'debit',
        amount,
        status: 'completed',
        description: `Auto debt settlement (pending debt: ₹${(debt - amount).toFixed(2)})`,
        reference: `DEBT-${Date.now()}`,
      });

      return { credited: amount, debtSettled: amount, remainingDebt: debt - amount, newBalance: user.walletBalance };
    } else {
      // Partial debt settlement, rest goes to wallet
      user.walletBalance += amount;
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: 'credit',
        amount,
        status: 'completed',
        description,
        reference,
      });

      await Transaction.create({
        userId: user._id,
        type: 'debit',
        amount: debt,
        status: 'completed',
        description: `Auto debt settlement (fully cleared)`,
        reference: `DEBT-${Date.now()}`,
      });

      return { credited: amount, debtSettled: debt, remainingDebt: 0, newBalance: user.walletBalance };
    }
  }

  // No debt — normal credit
  user.walletBalance += amount;
  await user.save();

  await Transaction.create({
    userId: user._id,
    type: 'credit',
    amount,
    status: 'completed',
    description,
    reference,
  });

  return { credited: amount, debtSettled: 0, remainingDebt: 0, newBalance: user.walletBalance };
}
