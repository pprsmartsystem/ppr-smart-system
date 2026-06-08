# Master Distributor - Card Management System

## ✅ Features Implemented

### 1. Cards Page (New)
Master distributors can now view and manage all virtual cards under their network.

**Location:** Master Distributor → Cards (new sidebar menu)

**Features:**
- View all cards from users under their distributors
- Search by card number, user name, or email
- Real-time statistics (Total, Active, Frozen, Expired)
- Freeze/Unfreeze cards
- Delete cards with reason
- Auto-refund balance to wallet on deletion

---

## 📊 Cards Page Components

### Stats Dashboard
Displays 4 key metrics:
1. **Total Cards** - All cards in the network
2. **Active Cards** - Currently usable cards
3. **Frozen Cards** - Temporarily disabled
4. **Expired Cards** - Past expiry date

### Search Functionality
- Search by card number (supports partial match)
- Search by user name
- Search by user email
- Real-time filtering

### Cards Table Columns
1. **Card Number** - 16-digit formatted (XXXX XXXX XXXX XXXX)
2. **User** - Name and email
3. **Distributor** - Badge with distributor name
4. **Balance** - Current card balance
5. **Limit** - Spending limit
6. **Status** - Active / Frozen / Expired badge
7. **Created** - Date created
8. **Actions** - Freeze/Unfreeze and Delete buttons

---

## 🔧 Card Actions

### 1. Freeze Card
**Purpose:** Temporarily disable a card (e.g., security concern, suspicious activity)

**Process:**
1. Click blue lock icon on active card
2. Confirmation: "Are you sure you want to freeze this card?"
3. Card status changes to 'frozen'
4. User cannot use the card
5. Success toast notification

**API:** `POST /api/masterdistributor/cards/freeze`
```json
{
  "cardId": "...",
  "action": "freeze"
}
```

**Validations:**
- Card must be 'active'
- Master distributor owns the card's user network
- Cannot freeze already frozen cards

---

### 2. Unfreeze Card
**Purpose:** Re-activate a frozen card

**Process:**
1. Click green unlock icon on frozen card
2. Confirmation: "Are you sure you want to unfreeze this card?"
3. Card status changes to 'active'
4. User can use the card again
5. Success toast notification

**API:** `POST /api/masterdistributor/cards/freeze`
```json
{
  "cardId": "...",
  "action": "unfreeze"
}
```

**Validations:**
- Card must be 'frozen'
- Master distributor owns the card's user network
- Cannot unfreeze non-frozen cards

---

### 3. Delete Card
**Purpose:** Permanently remove a card (e.g., PIN forgotten, security breach, user request)

**Process:**
1. Click red trash icon
2. Prompt: "Delete card XXXX XXXX XXXX XXXX? Reason (e.g., PIN forgotten):"
3. Enter deletion reason (required)
4. If card has balance:
   - Balance refunded to user's wallet
   - Transaction created with reason
5. Card deleted from database
6. Success notification with refund amount

**API:** `DELETE /api/masterdistributor/cards/delete`
```json
{
  "cardId": "...",
  "reason": "PIN forgotten by user"
}
```

**Validations:**
- Reason is required and cannot be empty
- Master distributor owns the card's user network
- Balance refunded automatically if > 0

**Balance Refund Logic:**
```javascript
if (card.balance > 0) {
  // Add balance to user wallet
  user.walletBalance += card.balance;
  
  // Create transaction record
  await Transaction.create({
    type: 'credit',
    amount: card.balance,
    description: `Card deleted by master distributor. Balance refunded. Reason: ${reason}`,
    reference: `CARD-DEL-${timestamp}`
  });
}
```

---

## 🔐 Security & Permissions

### Permission Check Flow
```javascript
// 1. Verify master distributor authentication
const decoded = jwt.verify(token, JWT_SECRET);
if (decoded.role !== 'masterdistributor') return 403;

// 2. Find the card
const card = await Card.findById(cardId).populate('userId');

// 3. Verify ownership chain
const distributor = await User.findOne({
  _id: card.userId.distributorId,           // User's distributor
  masterDistributorId: decoded.userId,      // Master distributor's ID
  role: 'distributor'
});

// 4. If no match, deny access
if (!distributor) return 403;
```

### Validations Applied
- ✅ JWT authentication
- ✅ Role check (must be masterdistributor)
- ✅ Card exists validation
- ✅ Ownership verification (3-level hierarchy)
- ✅ Status validation (can't freeze frozen card)
- ✅ Reason required for deletion
- ✅ Balance refund on deletion

---

## 📁 Files Created

### Frontend
1. `/app/(masterdistributor)/masterdistributor/cards/page.js`
   - Cards listing page
   - Search functionality
   - Stats display
   - Freeze/Unfreeze/Delete actions
   - Responsive design

### API Endpoints
2. `/app/api/masterdistributor/cards/route.js`
   - GET all cards under network
   - Includes distributor name mapping
   - Optimized queries

3. `/app/api/masterdistributor/cards/freeze/route.js`
   - POST freeze/unfreeze card
   - Status validation
   - Permission checks

4. `/app/api/masterdistributor/cards/delete/route.js`
   - DELETE card permanently
   - Balance refund logic
   - Transaction creation
   - Reason tracking

### Sidebar Update
5. `/components/layout/Sidebar.js`
   - Added "Cards" menu item
   - Positioned between Users and Wallet

---

## 🎨 UI/UX Details

### Card Status Badges
```jsx
// Active
<span className="bg-green-100 text-green-700">Active</span>

// Frozen
<span className="bg-blue-100 text-blue-700">Frozen</span>

// Expired
<span className="bg-gray-100 text-gray-600">Expired</span>
```

### Action Buttons
```jsx
// Freeze (Blue)
<ActionBtn icon={LockClosedIcon} color="text-blue-600 hover:bg-blue-50" />

// Unfreeze (Green)
<ActionBtn icon={LockOpenIcon} color="text-green-600 hover:bg-green-50" />

// Delete (Red)
<ActionBtn icon={TrashIcon} color="text-red-600 hover:bg-red-50" />
```

### Card Number Display
```jsx
// Formatted: XXXX XXXX XXXX XXXX
{card.cardNumber?.replace(/(\d{4})(?=\d)/g, '$1 ')}
```

---

## 📊 API Response Examples

### GET /api/masterdistributor/cards
```json
{
  "cards": [
    {
      "_id": "...",
      "cardNumber": "1234567890123456",
      "expiryDate": "12/27",
      "balance": 5000,
      "spendingLimit": 50000,
      "status": "active",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com",
        "distributorId": "..."
      },
      "distributorName": "ABC Distributors",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/masterdistributor/cards/freeze
```json
{
  "success": true,
  "message": "Card frozen successfully"
}
```

### DELETE /api/masterdistributor/cards/delete
```json
{
  "success": true,
  "message": "Card deleted successfully. ₹5000.00 refunded to user wallet"
}
```

---

## 🧪 Testing Checklist

### Cards Listing
- [x] Shows all cards from network
- [x] Correct distributor names
- [x] Search works correctly
- [x] Stats calculate properly
- [x] Responsive design

### Freeze/Unfreeze
- [x] Can freeze active card
- [x] Can unfreeze frozen card
- [x] Cannot freeze frozen card
- [x] Cannot unfreeze active card
- [x] Confirmation dialogs work
- [x] Success notifications
- [x] List refreshes automatically

### Delete Card
- [x] Reason prompt appears
- [x] Cannot delete without reason
- [x] Balance refunded if > 0
- [x] Transaction created for refund
- [x] Card removed from database
- [x] Success message shows refund amount
- [x] Cannot delete cards from other networks

---

## 🔄 Use Cases

### Use Case 1: User Forgot PIN
**Problem:** User cannot remember card PIN
**Solution:** 
1. Master distributor deletes card with reason "PIN forgotten"
2. Card balance refunded to user wallet
3. User can create new card with new PIN

### Use Case 2: Suspicious Activity
**Problem:** Unusual transactions detected
**Solution:**
1. Master distributor freezes card immediately
2. Investigate the issue
3. Either unfreeze or delete based on findings

### Use Case 3: Security Breach
**Problem:** Card details may be compromised
**Solution:**
1. Master distributor deletes card with reason "Security concern"
2. Balance refunded automatically
3. User notified to create new card

### Use Case 4: Temporary Suspension
**Problem:** User account under review
**Solution:**
1. Master distributor freezes all user's cards
2. Review completed
3. Unfreeze cards to restore access

---

## 📈 Performance Optimization

### Efficient Queries
```javascript
// Single query for all cards with user data
const cards = await Card.find({ userId: { $in: userIds } })
  .populate('userId', 'name email distributorId')
  .sort({ createdAt: -1 })
  .lean();  // Returns plain objects (faster)
```

### Distributor Name Mapping
```javascript
// Pre-build map to avoid N queries
const distributorMap = {};
distributors.forEach(d => {
  distributorMap[d._id.toString()] = d.name;
});

// Add to cards in one pass
cardsWithDistributor = cards.map(card => ({
  ...card,
  distributorName: distributorMap[card.userId?.distributorId?.toString()]
}));
```

---

## 🎯 Benefits

### For Master Distributors
- ✅ Complete visibility of all cards
- ✅ Quick action on security issues
- ✅ Help users with forgotten PINs
- ✅ Manage network efficiently
- ✅ Reduce support burden

### For Users
- ✅ Fast resolution for PIN issues
- ✅ Balance never lost (auto-refund)
- ✅ Enhanced security
- ✅ Professional support from master distributor

### For System
- ✅ Proper audit trail
- ✅ Balance integrity maintained
- ✅ Transaction records for compliance
- ✅ Hierarchical permission model

---

## 🚀 Future Enhancements (Potential)

1. **Bulk Operations** - Freeze/Unfreeze multiple cards
2. **Card Analytics** - Usage patterns, transaction counts
3. **Export to CSV** - Download card list
4. **Email Notifications** - Notify users when card frozen/deleted
5. **Reason History** - Track all deletion reasons
6. **Card Replacement** - Auto-create new card on deletion
7. **Spending Analytics** - Per-card transaction reports
8. **Limit Management** - Change spending limits

---

## ✅ Status: Complete

All card management features are fully implemented:
- ✅ Cards listing page
- ✅ Freeze/Unfreeze functionality
- ✅ Delete with balance refund
- ✅ Security validations
- ✅ Reason tracking
- ✅ Transaction records
- ✅ UI/UX polish

Master distributors now have complete control over virtual cards in their network! 🎉
