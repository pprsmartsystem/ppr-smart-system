# Master Distributor - Total Cards & User Block/Unblock

## ✅ Features Added

### 1. Total Cards Display
Master distributors can now see the total number of cards each user has created.

**Location:** Master Distributor → Users page

**Display:**
- New "Total Cards" column in users table
- Shows count with badge: "X cards" or "X card"
- Color: Violet badge (bg-violet-50 text-violet-700)

**API Changes:**
- Updated `/api/masterdistributor/users` GET endpoint
- Uses MongoDB aggregation to count cards per user
- Efficient bulk query to fetch all card counts at once

**Implementation:**
```javascript
// Card count aggregation
const cardCounts = await Card.aggregate([
  { $match: { userId: { $in: userIds } } },
  { $group: { _id: '$userId', count: { $sum: 1 } } }
]);

// Map to users
const usersWithCards = users.map(user => ({
  ...user,
  totalCards: cardCountMap[user._id.toString()] || 0
}));
```

---

### 2. User Block/Unblock Functionality
Master distributors can now block or unblock users under their distributors.

**Location:** Master Distributor → Users page

**Features:**
- Block button (red lock icon) for active users
- Unblock button (green unlock icon) for blocked users
- Confirmation dialogs before action
- Toast notifications on success/error
- Auto-refresh user list after action

**Status Display:**
- Blocked users show red "Blocked" badge
- Other statuses show normal status badges

**Security:**
- Validates user belongs to distributor under this master distributor
- Only affects users with role 'user'
- Requires master distributor authentication
- Prevents unauthorized access

**API Endpoint:**
- `POST /api/masterdistributor/users/block`
- Body: `{ userId, action }` where action is 'block' or 'unblock'
- Returns success message on completion

**Status Changes:**
- Block: Sets status to 'blocked'
- Unblock: Changes 'blocked' back to 'approved'

---

## 📊 UI Updates

### Users Table Columns (Updated)
1. Name
2. Email
3. Distributor
4. Wallet Balance
5. **Total Cards** ← NEW
6. Status (with blocked state)
7. Joined Date
8. **Actions** ← NEW (Block/Unblock buttons)

### Action Buttons
- **Block User:**
  - Icon: LockClosedIcon (red)
  - Hover: Red background
  - Confirmation: "Are you sure you want to block this user? They will not be able to access their account."

- **Unblock User:**
  - Icon: LockOpenIcon (green)
  - Hover: Green background
  - Confirmation: "Are you sure you want to unblock this user?"

---

## 🔐 Security & Validation

### Permissions Check
```javascript
// Verify user belongs to distributor under this master distributor
const distributor = await User.findOne({
  _id: user.distributorId,
  masterDistributorId: decoded.userId,
  role: 'distributor'
});

if (!distributor) {
  return NextResponse.json({ 
    error: 'You do not have permission to manage this user' 
  }, { status: 403 });
}
```

### Validations
- ✅ JWT authentication
- ✅ Role check (must be masterdistributor)
- ✅ User exists and is role 'user'
- ✅ User belongs to distributor under master distributor
- ✅ Action is valid ('block' or 'unblock')

---

## 📁 Files Modified/Created

### Modified
1. `/app/(masterdistributor)/masterdistributor/users/page.js`
   - Added Total Cards column
   - Added Block/Unblock actions
   - Added action handlers
   - Added refresh functionality

2. `/app/api/masterdistributor/users/route.js`
   - Added Card aggregation
   - Returns totalCards for each user
   - Optimized query performance

### Created
3. `/app/api/masterdistributor/users/block/route.js`
   - New API endpoint for block/unblock
   - Security validations
   - Status update logic

---

## 🧪 Testing Checklist

### Total Cards Display
- [x] Cards count shows correctly
- [x] Shows "0 cards" for users with no cards
- [x] Shows "1 card" (singular) correctly
- [x] Shows "X cards" (plural) correctly
- [x] Efficient query (no N+1 problem)

### Block/Unblock Functionality
- [x] Can block active user
- [x] Can unblock blocked user
- [x] Confirmation dialog appears
- [x] Success toast on completion
- [x] User list refreshes automatically
- [x] Status badge updates to "Blocked"
- [x] Action button changes to unblock
- [x] Cannot block users from other master distributors
- [x] Error handling works

---

## 🎨 UI Examples

### Total Cards Badge
```jsx
<span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
  {user.totalCards || 0} {user.totalCards === 1 ? 'card' : 'cards'}
</span>
```

### Block Status Badge
```jsx
{user.status === 'blocked' ? (
  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
    Blocked
  </span>
) : (
  <StatusBadge status={user.status} />
)}
```

### Action Buttons
```jsx
{user.status === 'blocked' ? (
  <ActionBtn 
    icon={LockOpenIcon} 
    onClick={() => handleBlockUnblock(user._id, user.status)} 
    color="text-green-600 hover:bg-green-50" 
    title="Unblock User" 
  />
) : (
  <ActionBtn 
    icon={LockClosedIcon} 
    onClick={() => handleBlockUnblock(user._id, user.status)} 
    color="text-red-600 hover:bg-red-50" 
    title="Block User" 
  />
)}
```

---

## 🚀 Performance Optimization

### Card Count Query
Instead of querying cards for each user individually (N+1 problem):
```javascript
// ❌ BAD - N queries
for (const user of users) {
  user.totalCards = await Card.countDocuments({ userId: user._id });
}

// ✅ GOOD - 1 aggregation query
const cardCounts = await Card.aggregate([
  { $match: { userId: { $in: userIds } } },
  { $group: { _id: '$userId', count: { $sum: 1 } } }
]);
```

This reduces database queries from N+1 to just 2 (1 for users, 1 for cards).

---

## 📈 Dashboard Integration

The master distributor dashboard already shows:
- Total Cards (all users combined)
- Total Users
- Total Distributors

The users page now shows:
- Total Cards per individual user
- Block/Unblock actions per user

---

## 🔄 User Experience Flow

### Blocking a User
1. Master distributor goes to Users page
2. Clicks red lock icon on user row
3. Confirmation dialog: "Are you sure...?"
4. Clicks confirm
5. API call to block user
6. Success toast: "User blocked successfully"
7. User list refreshes
8. User row now shows:
   - Red "Blocked" badge
   - Green unlock icon (to unblock)

### Unblocking a User
1. Master distributor sees blocked user
2. Clicks green unlock icon
3. Confirmation dialog: "Are you sure...?"
4. Clicks confirm
5. API call to unblock user
6. Success toast: "User unblocked successfully"
7. User list refreshes
8. User row now shows:
   - "Approved" status badge
   - Red lock icon (to block again)

---

## ✅ Status: Complete

Both features are fully implemented and ready to use:
- ✅ Total Cards display
- ✅ Block/Unblock functionality
- ✅ Security validations
- ✅ Error handling
- ✅ UI/UX polish
- ✅ Performance optimization

Master distributors now have better visibility and control over users under their network! 🎉
