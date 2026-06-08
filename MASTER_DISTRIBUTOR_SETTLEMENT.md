# Master Distributor On-Demand Settlement Feature

## Overview
Master distributors can now request on-demand bank settlements with a flat fee structure and daily limit.

## Key Features

### 1. Flat Fee Structure
- **Deduction Rate:** ₹300 per ₹1,00,000 (₹100,000)
- **Example Calculation:**
  - Settlement of ₹1,00,000 → Fee: ₹300 → You receive: ₹99,700
  - Settlement of ₹2,00,000 → Fee: ₹600 → You receive: ₹1,99,400
  - Settlement of ₹50,000 → Fee: ₹150 → You receive: ₹49,850

### 2. Daily Limit
- **One settlement request per day** (resets at midnight IST)
- Prevents multiple withdrawals in a single day
- Applies to both pending and processed settlements

### 3. Minimum Amount
- Minimum settlement amount: ₹10,000
- Wallet balance must be sufficient

### 4. Workflow
1. Master distributor initiates settlement from their panel
2. Amount is immediately deducted from wallet
3. Settlement goes to "pending" status
4. Admin reviews and approves/rejects
5. On approval: Amount credited to bank
6. On rejection: Amount refunded to wallet with reason

## Technical Implementation

### Files Modified

#### 1. `/app/api/masterdistributor/settlement/route.js`
- Added daily limit check (one settlement per day)
- Changed from percentage-based to flat fee calculation
- Formula: `(amount / 100000) * 300`
- Stores as `settlementRate: 0.3` for reference

#### 2. `/app/(masterdistributor)/masterdistributor/settlement/page.js`
- Updated UI to show "₹300 per ₹1,00,000" instead of percentage
- Added "1 request/day" indicator
- Updated settlement history to show flat fee
- Real-time calculation preview

#### 3. `/app/(admin)/admin/user-settlements/page.js`
- Added conditional display for master distributor settlements
- Shows "Fee (₹300/₹1L)" for master distributors
- Shows "Deduction (X%)" for other users
- Master Distributor badge in settlement list

### Database Schema
Uses existing `Settlement` model with:
- `source: 'masterdistributor'`
- `settlementRate: 0.3` (stored as 0.3% for reference)
- `spendAmount`: Original amount requested
- `settlementAmount`: Amount after deduction

## User Experience

### Master Distributor Panel
```
Settlement Fee: ₹300 per ₹1,00,000 · Min. ₹10,000 · 1 request/day

[If already initiated today]
❌ "You can only initiate one settlement per day"

[If pending settlement exists]
⏳ "You have a pending settlement awaiting admin approval"
```

### Admin Panel
```
Master Distributor Settlement:
📋 Name · 🟣 Master Distributor Badge
💰 Spend: ₹1,00,000 · Fee (₹300/₹1L): ₹300 · To Credit: ₹99,700
🏦 Bank: HDFC Bank · A/C ••••1234 · IFSC: HDFC0001234
```

## Security & Validation
- ✅ Role check: Only master distributors can access
- ✅ Wallet balance validation
- ✅ Account hold/block status check
- ✅ Daily limit enforcement
- ✅ Pending settlement check
- ✅ Bank details validation
- ✅ Immediate wallet deduction (prevents double-spend)

## Error Messages
- "Minimum settlement amount is ₹10,000"
- "Insufficient wallet balance"
- "You already have a pending settlement request"
- "You can only initiate one settlement per day"
- "Your account is on hold"
- "Bank details are required"

## Admin Actions
1. **Approve:** Credits amount to bank, marks as processed
2. **Reject:** Refunds amount to wallet, requires reason

## Testing Checklist
- [ ] Master distributor can create settlement
- [ ] Flat fee calculated correctly (₹300/₹1L)
- [ ] Daily limit enforced (one per day)
- [ ] Wallet deducted immediately
- [ ] Admin sees settlement with correct fee display
- [ ] Admin can approve/reject
- [ ] Amount refunded on rejection
- [ ] Email notifications sent (if configured)

## API Endpoints

### GET `/api/masterdistributor/settlement`
Returns wallet balance and settlement history

### POST `/api/masterdistributor/settlement`
Creates new settlement request
```json
{
  "amount": 100000,
  "bankDetails": {
    "accountHolder": "John Doe",
    "accountNumber": "1234567890",
    "ifscCode": "HDFC0001234",
    "bankName": "HDFC Bank"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Settlement request of ₹99,700.00 submitted. Awaiting admin approval.",
  "deduction": 300,
  "settlementAmount": 99700
}
```

## Notes
- Flat fee is more favorable than percentage for large settlements
- Daily limit prevents abuse and excessive withdrawals
- Admin approval ensures fraud prevention
- Amount is held (deducted from wallet) until approval/rejection
