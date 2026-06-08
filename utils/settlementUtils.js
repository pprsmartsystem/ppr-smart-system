/**
 * Settlement Fee Calculator
 * Utility functions for calculating settlement fees across different user roles
 */

/**
 * Calculate settlement fee for Master Distributor
 * Flat fee: ₹300 per ₹1,00,000
 * @param {number} amount - Settlement amount
 * @returns {object} { deduction, netAmount, feeRate }
 */
export function calculateMasterDistributorFee(amount) {
  const deduction = parseFloat(((amount / 100000) * 300).toFixed(2));
  const netAmount = parseFloat((amount - deduction).toFixed(2));
  const feeRate = 0.3; // 0.3% effective rate
  
  return {
    deduction,
    netAmount,
    feeRate,
    formula: '₹300 per ₹1,00,000',
  };
}

/**
 * Calculate settlement fee for Regular User (T+1 Settlement)
 * Percentage-based: Default 1.77%
 * @param {number} amount - Settlement amount
 * @param {number} [customRate] - Custom settlement rate (optional)
 * @returns {object} { deduction, netAmount, feeRate }
 */
export function calculateUserSettlementFee(amount, customRate = null) {
  const feeRate = customRate !== null ? customRate : 1.77;
  const deduction = parseFloat(((amount * feeRate) / 100).toFixed(2));
  const netAmount = parseFloat((amount - deduction).toFixed(2));
  
  return {
    deduction,
    netAmount,
    feeRate,
    formula: `${feeRate}% of amount`,
  };
}

/**
 * Calculate settlement fee for Spend/Redeem Settlement
 * Fixed rate: 1.77%
 * @param {number} amount - Settlement amount
 * @returns {object} { deduction, netAmount, feeRate }
 */
export function calculateSpendRedeemFee(amount) {
  const feeRate = 1.77;
  const deduction = parseFloat(((amount * feeRate) / 100).toFixed(2));
  const netAmount = parseFloat((amount - deduction).toFixed(2));
  
  return {
    deduction,
    netAmount,
    feeRate,
    formula: '1.77% of spend amount',
  };
}

/**
 * Validate settlement request
 * @param {object} params - Validation parameters
 * @returns {object} { valid, error }
 */
export function validateSettlement({ amount, minAmount = 10000, maxAmount = null, walletBalance, role }) {
  if (!amount || isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (amount < minAmount) {
    return { valid: false, error: `Minimum settlement amount is ₹${minAmount.toLocaleString('en-IN')}` };
  }

  if (maxAmount && amount > maxAmount) {
    return { valid: false, error: `Maximum settlement amount is ₹${maxAmount.toLocaleString('en-IN')}` };
  }

  if (walletBalance !== undefined && amount > walletBalance) {
    return { valid: false, error: 'Insufficient wallet balance' };
  }

  return { valid: true, error: null };
}

/**
 * Format currency for Indian locale
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get settlement fee based on role
 * @param {string} role - User role
 * @param {number} amount - Settlement amount
 * @param {number} [customRate] - Custom rate for user settlements
 * @returns {object}
 */
export function getSettlementFee(role, amount, customRate = null) {
  switch (role) {
    case 'masterdistributor':
      return calculateMasterDistributorFee(amount);
    case 'user':
      return calculateUserSettlementFee(amount, customRate);
    default:
      return calculateUserSettlementFee(amount, customRate);
  }
}

/**
 * Check if settlement is allowed today
 * @param {Array} settlements - Array of previous settlements
 * @param {string} role - User role
 * @returns {object} { allowed, reason }
 */
export function canSettleToday(settlements, role) {
  if (role !== 'masterdistributor') {
    return { allowed: true, reason: null };
  }

  // Master distributors: only 1 per day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySettlement = settlements.find(s => {
    const settlementDate = new Date(s.createdAt);
    settlementDate.setHours(0, 0, 0, 0);
    return settlementDate.getTime() === today.getTime();
  });

  if (todaySettlement) {
    return { 
      allowed: false, 
      reason: 'You can only initiate one settlement per day. Next available tomorrow.' 
    };
  }

  return { allowed: true, reason: null };
}

/**
 * Calculate settlement success rate
 * @param {Array} settlements - Array of settlements
 * @returns {object} { total, approved, rejected, pending, successRate }
 */
export function calculateSettlementStats(settlements) {
  const total = settlements.length;
  const approved = settlements.filter(s => s.status === 'processed').length;
  const rejected = settlements.filter(s => s.status === 'rejected').length;
  const pending = settlements.filter(s => s.status === 'pending').length;
  const successRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;

  return {
    total,
    approved,
    rejected,
    pending,
    successRate: parseFloat(successRate),
  };
}

/**
 * Get settlement fee description by role
 * @param {string} role
 * @returns {string}
 */
export function getSettlementFeeDescription(role) {
  switch (role) {
    case 'masterdistributor':
      return 'Flat fee: ₹300 per ₹1,00,000 · Min. ₹10,000 · 1 request/day';
    case 'user':
      return 'Fee: 1.77% · Min. ₹10,000 · T+1 bank settlement';
    default:
      return 'Settlement fee applies as per terms';
  }
}
