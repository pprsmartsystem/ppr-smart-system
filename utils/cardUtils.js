import crypto from 'crypto';

// Generate unique 16-digit card number
export function generateCardNumber() {
  const prefix = '4532'; // Visa-like prefix
  let cardNumber = prefix;
  
  for (let i = 0; i < 12; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  
  return cardNumber;
}

// Generate 3-digit CVV
export function generateCVV() {
  return Math.floor(100 + Math.random() * 900).toString();
}

// Calculate expiry date (3 years from now)
export function calculateExpiryDate(years = 3) {
  const now = new Date();
  const expiryDate = new Date(now.getFullYear() + years, now.getMonth(), 1);
  const month = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
  const year = expiryDate.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
}

// Generate unique transaction reference
export function generateTransactionRef() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN${timestamp}${random}`;
}

// Mask card number for display
export function maskCardNumber(cardNumber) {
  if (!cardNumber || cardNumber.length !== 16) return '****';
  return `**** **** **** ${cardNumber.slice(-4)}`;
}

// Format currency
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Validate card expiry
export function isCardExpired(expiryDate) {
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
  return expiry < new Date();
}

// Generate random color for cards
export function generateCardColor() {
  const colors = [
    'from-blue-500 via-blue-600 to-indigo-700',
    'from-purple-500 via-purple-600 to-pink-700',
    'from-green-500 via-emerald-600 to-teal-700',
    'from-orange-500 via-red-600 to-rose-700',
    'from-indigo-500 via-violet-600 to-purple-700',
    'from-pink-500 via-fuchsia-600 to-purple-700',
    'from-cyan-500 via-blue-600 to-indigo-700',
    'from-amber-500 via-orange-600 to-red-700',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}