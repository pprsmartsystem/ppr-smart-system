# PPR SMART SYSTEM — MASTER BUILD PROMPT

Use this prompt to recreate the entire PPR Smart System from scratch.

---

## TECH STACK

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB Atlas + Mongoose ODM
- **Auth:** JWT with HTTP-only cookies (`jsonwebtoken`, `bcryptjs`)
- **UI:** Tailwind CSS + Framer Motion + Heroicons v2
- **Email:** Nodemailer + Google Workspace SMTP
- **File Upload:** Cloudinary
- **Charts:** Recharts
- **Notifications:** react-hot-toast
- **OTP:** Fast2SMS
- **Deployment:** Vercel Pro
- **Cron:** Vercel Cron Jobs
- **Analytics:** Vercel Analytics + Speed Insights

---

## PROJECT STRUCTURE

```
app/
├── (admin)/admin/           # Admin dashboard pages
├── (auth)/                  # Login, Register
├── (corporate)/corporate/   # Corporate dashboard
├── (distributor)/           # Distributor dashboard
├── (employee)/employee/     # Employee dashboard
├── (masterdistributor)/     # Master Distributor dashboard
├── (user)/user/             # User dashboard
├── api/                     # All API routes
│   ├── admin/
│   ├── auth/
│   ├── corporate/
│   ├── distributor/
│   ├── masterdistributor/
│   ├── user/
│   └── cron/settle/
├── layout.js
└── page.js                  # Landing page

components/
├── layout/Sidebar.js        # Unified sidebar for all roles
├── ui/AdminComponents.js    # PageHeader, StatusBadge, AdminModal, ActionBtn
├── cards/VirtualCard.js
├── BroadcastBar.js
└── MaintenancePopup.js

lib/
├── auth.js                  # verifyToken, generateToken
├── mongodb.js               # connectDB (singleton)
├── mailer.js                # sendMail via nodemailer
└── emails/
    ├── walletLoading.js
    ├── settlementInitiated.js
    └── settlementProcessed.js

models/
├── User.js
├── Card.js
├── Transaction.js
├── Settlement.js
├── KYC.js
├── UserSettings.js
├── AuditLog.js
├── Brand.js
├── Broadcast.js
├── Cashback.js
├── Corporate.js
├── Invoice.js
├── Order.js
├── Page.js
├── PaymentGateway.js
├── Service.js
├── Settings.js
└── Ticket.js

utils/
├── bankingDays.js           # Indian banking day calculator
├── cardUtils.js
├── walletUtils.js
├── kycUtils.js
└── settlementUtils.js
```

---

## USER ROLES (6 roles)

1. **admin** — Full platform control
2. **masterdistributor** — Manages distributors under them
3. **distributor** — Manages users, recharges wallet
4. **corporate** — Manages employees, bulk allowances
5. **employee** — Corporate benefits, allowances
6. **user** — Personal wallet, virtual cards, gateway, settlement

---

## DATABASE MODELS

### User.js
```js
{
  name, email, password, role, status,
  walletBalance, corporateId, distributorId, masterDistributorId,
  avatar, phone, lastLogin,
  isOnHold, holdReason, heldAt,
  settlementBlocked, settlementBlockReason, settlementRate,
  settlementActivated, settlementActivatedAt,
  timestamps: true
}
// status enum: pending | approved | rejected | blocked
// role enum: admin | masterdistributor | distributor | corporate | employee | user
// IMPORTANT: export default mongoose.models.User || mongoose.model('User', userSchema)
```

### Card.js
```js
{
  userId, cardNumber (unique 16-digit), expiryDate, cvv, pin,
  spendingLimit, balance, status, cardType, cardName, lastUsed,
  timestamps: true
}
// status enum: active | frozen | expired
```

### Transaction.js
```js
{
  userId, cardId, type, amount, status, description,
  reference (sparse unique), metadata, fromWallet, toWallet,
  balanceBefore, balanceAfter, timestamps: true
}
// type enum: credit | debit | voucher | transfer | refund | payment_request
// IMPORTANT: reference field must be sparse index (allows multiple null)
```

### Settlement.js
```js
{
  userId, spendAmount, settlementRate, settlementAmount,
  status, type, source, bankDetails{accountHolder, accountNumber, ifscCode, bankName},
  rejectionReason, processedAt, scheduledFor, timestamps: true
}
// status enum: pending | processed | paused | rejected
// source enum: admin | user | masterdistributor
```

### KYC.js
```js
{
  userId, contactNumber, panNumber, bankName, accountNumber, ifscCode,
  bankDocument, aadhaarFront, aadhaarBack, panCard,
  gstCertificate, msmeCertificate, otherDocument, otherDocumentRemark,
  status, rejectionReason, rekycReason, submittedAt, reviewedAt
}
// status enum: pending | approved | rejected | rekyc
```

---

## AUTHENTICATION

- JWT stored in HTTP-only cookie named `token`
- `lib/auth.js` exports `verifyToken(token)` and `generateToken(payload)`
- Middleware checks token on all non-public routes
- Public routes: `/login`, `/register`, `/`, `/about`, `/contact`, `/terms`, `/privacy`, `/products`

---

## SIDEBAR (components/layout/Sidebar.js)

Single unified Sidebar component used by all roles:
- **Desktop:** Collapsible sidebar (260px → 72px) with collapse button
- **Mobile:** Fixed top bar (h-14) + Fixed bottom navigation + Drawer
- Roles with bottom nav: `user`, `masterdistributor`, `distributor`
- **Footer card:** User avatar (first letter), name, email, role badge, green active dot

### Navigation per role:

**admin:**
Dashboard, Users, Distributors, Master Distributors, Wallet, Corporates, Cards, KYC, Spend/Redeem Settlement, Initiate/T+1 Settlement, Cashback, Support, Broadcast, Notifications, Transactions, Analytics, Pages, Settings, [divider: IT Services], IT Services, Orders, Invoices, Delivery Proof, Payment Logs, Service Reports, Audit Logs

**masterdistributor:**
Dashboard, Distributors, Users, Cards, Wallet, Transactions, Settlement, Reports, Settings

**distributor:**
Dashboard, Users, Wallet, Recharge, Reports, Support, Settings

**corporate:**
Dashboard, Employees, Cards, Wallet, Reports, Settings

**employee:**
Dashboard, My Cards, Allowance, Vouchers, Transactions

**user:**
Dashboard, Wallet, My Cards, Gateway, Settlement, KYC, Gift Vouchers, Transactions, Support, Settings

### Bottom nav:
- **user:** Home, Wallet, Cards, Settle, More
- **masterdistributor:** Home, Distrib, Users, Settle, More
- **distributor:** Home, Users, Wallet, Reports, More

---

## LAYOUTS

All role layouts follow this pattern:
```jsx
<div className="flex h-screen bg-gray-50 overflow-hidden">
  <Sidebar userRole={role} userName={name} userEmail={email} />
  <main className="flex-1 overflow-y-auto">
    <div className="p-4 lg:p-8 pt-16 lg:pt-4 pb-20 lg:pb-8">
      {children}
    </div>
  </main>
</div>
```
**Critical:** `pt-16` (mobile top bar) + `pb-20` (mobile bottom nav) on content area.
**masterdistributor layout** also includes `BroadcastBar` and `MaintenancePopup`.

---

## VIRTUAL CARD SYSTEM

- 16-digit unique card number generated with collision check
- 4-digit PIN (bcrypt hashed), 3-digit CVV
- 3-year expiry auto-set
- Status: active / frozen / expired
- Admin can view all user cards
- Master Distributor can freeze/unfreeze/delete cards
- Card number display: mask first 12, show last 4 (`•••• •••• •••• 1234`)

---

## SETTLEMENT SYSTEM

### 1. Spend/Redeem Settlement (admin/settlement)
- Auto-generated when user spends via gateway
- Rate: 1.77% deduction (configurable per user)
- Admin processes manually or auto at 10:30 AM IST
- Vercel Cron: `0 5 * * *` at `/api/cron/settle`
- Skips: Sundays, 2nd & 4th Saturdays, Indian bank holidays

### 2. T+1 Settlement (admin/user-settlements)
- User-initiated from their panel (minimum ₹10,000)
- Amount deducted from wallet immediately on request
- Admin approves → credited to bank; Rejects → refunded to wallet
- **Hold/Unhold:** Admin can pause T+1 settlements per user with reason
- Default hold reason: "Due to bank internal server issues"
- Source: `user` or `masterdistributor`

### 3. Master Distributor On-Demand Settlement
- Flat fee: ₹300 per ₹1,00,000
- Formula: `(amount / 100000) * 300`
- Daily limit: 1 settlement per day (resets at midnight)
- 72-hour new account limit: max ₹25,000 until admin activates
- Admin activates via button on masterdistributors page
- Email notification on initiate, approve, reject

---

## MASTER DISTRIBUTOR FEATURES

### Settlement
- Flat fee ₹300/₹1L (not percentage)
- 1 request per day
- 72-hour ₹25,000 cap → admin activates to remove
- `settlementActivated` field on User model

### Cards Management (`/masterdistributor/cards`)
- View all cards under network
- Search by card number / user / email
- Stats: Total, Active, Frozen, Expired
- Freeze/Unfreeze (blue lock / green unlock)
- Delete with required reason → auto-refunds balance to user wallet

### Users Management (`/masterdistributor/users`)
- View all users under distributors
- Total Cards column (per user)
- Block/Unblock users (permission verified via distributor chain)

### Wallet & Transactions
- Wallet page: balance card + total credited/debited + search + filter
- Transactions page: full table with UTR, amount, balance after, date/time
- UTR format: `UTR{timestamp}{random6digits}` auto-generated on every credit/debit

### Dashboard Stats
- Wallet balance, Total distributors, Active/Held distributors
- Total users, Total cards, Total transactions
- Settlement stats: total, approved, pending, rejected, total amount settled
- `canSettleToday` flag

---

## ADMIN MASTERDISTRIBUTORS PAGE

Table columns: Name, Email, Phone, Wallet, Distributors, Settlement, Status, Joined, Actions

Settlement column shows:
- `✓ Activated` (green) if `settlementActivated: true`
- `₹25K Limit` (amber) if not activated

Actions: Add Balance, Deduct Balance, Activate Settlement (purple, hidden after activated), Hold/Unhold, Delete

---

## EMAIL TEMPLATES (lib/emails/)

All templates are banking-style HTML emails:

1. **walletLoading.js** — Sent to master distributor when admin credits wallet
   - Props: `{ name, amount, newBalance, reference, date }`

2. **settlementInitiated.js** — Sent when settlement request submitted
   - Props: `{ name, amount, deduction, requestedAmount, reference, bankDetails, date }`

3. **settlementProcessed.js** — Sent on approval or rejection
   - Props: `{ name, amount, reference, bankDetails, date, status, reason }`

---

## API PATTERNS

All API routes follow this pattern:
```js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

export async function GET/POST/DELETE(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    // ... logic
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
```

---

## ADMIN PANEL FEATURES

### Users
- Create, approve, reject, block, unblock, delete
- Add/deduct wallet balance
- Reset password, KYC re-submission
- Admin impersonation (1-hour temp session, opens in new tab)
- Maintenance mode per user (non-closable overlay, polls every 15s)
- Set custom settlement rate per user
- Transfer to different distributor

### KYC
- Document upload via Cloudinary (Aadhaar front/back, PAN, Bank docs)
- Inline image/PDF viewer
- Approve / Reject / Re-KYC workflow

### Wallet / Payment Requests
- Admin sees all pending payment requests
- Approve credits user wallet
- Reject with reason

### Broadcast
- Site-wide banner message
- Auto-dismiss after set duration

### Notifications
- Real-time payment request tracking
- Auto-refresh every 15 seconds

### Audit Logs
- All admin actions logged

### IT Services / Orders
- Service catalog management
- Order processing
- Invoice generation
- Delivery proof uploads

---

## FRONTEND COMPONENT PATTERNS

### PageHeader (AdminComponents.js)
```jsx
<PageHeader
  icon={SomeIcon}
  title="Page Title"
  subtitle="Description"
  color="from-blue-500 to-indigo-600"
  action={<button>Action</button>}
/>
```

### StatusBadge
```jsx
<StatusBadge status="approved" />
// Renders colored pill: approved=green, pending=yellow, rejected=red, blocked=red
```

### AdminModal
```jsx
<AdminModal title="Title" subtitle="Sub" onClose={() => setShow(false)}>
  <form>...</form>
</AdminModal>
```

### ActionBtn
```jsx
<ActionBtn
  icon={TrashIcon}
  onClick={handleDelete}
  color="text-red-600 hover:bg-red-50"
  title="Delete"
/>
```

---

## CSS CONVENTIONS

### globals.css must include:
```css
.input-field {
  @apply w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors bg-white;
}
.btn-primary {
  @apply px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors;
}
.btn-secondary {
  @apply px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors;
}
.stats-card {
  @apply bg-white rounded-2xl border border-gray-100 p-5;
}
```

---

## ENVIRONMENT VARIABLES

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=min-32-chars-secret
NEXT_PUBLIC_APP_NAME=PPR SMART SYSTEM
NEXT_PUBLIC_APP_URL=https://www.pprsmart.com
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@pprsmartsystem.com
SMTP_PASS=16-char-app-password
SMTP_FROM=PPR Smart System <support@pprsmartsystem.com>
CRON_SECRET=random-secret
FAST2SMS_API_KEY=
```

---

## VERCEL CONFIG (vercel.json)

```json
{
  "crons": [{ "path": "/api/cron/settle", "schedule": "0 5 * * *" }],
  "functions": {
    "app/api/**": { "maxDuration": 60 },
    "app/api/cron/**": { "maxDuration": 300 }
  }
}
```

---

## CRITICAL BUGS FIXED (reference for future)

1. **User model:** Always use `mongoose.models.User || mongoose.model('User', schema)` — NEVER `delete mongoose.models.User`
2. **Transaction reference index:** Must be `sparse: true` to allow multiple null values
3. **Mobile navbar:** Content area needs `pt-16 pb-20 lg:pt-4 lg:pb-8` and `overflow-y-auto` on main, `overflow-hidden` on wrapper
4. **Duplicate imports/exports:** Always check for duplicates before saving API routes
5. **Build cache:** On chunk 404 errors, run `rm -rf .next && npm run dev`

---

## BANKING DAY RULES (utils/bankingDays.js)

Auto-settlement skips:
- All Sundays
- 2nd and 4th Saturdays of every month
- Indian national/bank holidays (hardcoded list)
- Next valid banking day calculated for T+1 settlement

---

## SECURITY

- JWT in HTTP-only cookies (no localStorage)
- bcrypt for passwords
- Role-based access control (RBAC) on every API
- KYC verification gate
- Admin impersonation token expires in 1 hour
- Distributor hold/unhold system
- Per-user maintenance mode
- Settlement block per user
- Master distributor 72h new account limit

---

## MASTER DISTRIBUTOR HIERARCHY

```
Admin
  └── Master Distributor (settlementActivated, 72h limit)
        └── Distributor (can be held/unheld)
              └── User (can be blocked, KYC required)
```

Permission check pattern for MD operations:
```js
// Verify resource belongs to MD's network
const distributor = await User.findOne({
  _id: resource.userId.distributorId,
  masterDistributorId: decoded.userId,
  role: 'distributor'
});
if (!distributor) return 403;
```

---

## KEY BUSINESS RULES

1. **Virtual Cards:** 16-digit unique, 3-year expiry, PIN protected, can be frozen by admin/MD
2. **Settlement T+1:** Amount deducted immediately on request; refunded on rejection
3. **MD Settlement:** ₹300 flat per ₹1L, 1/day limit, 72h cap for new accounts
4. **Wallet Loading:** UTR auto-generated (`UTR{timestamp}{6-random}`), email sent
5. **KYC:** Required before wallet/card operations; admin approve/reject/re-kyc
6. **Maintenance Mode:** Admin sets per-user; non-closable overlay; polls every 15s
7. **Broadcast:** Site-wide banner from admin
8. **Hold Settlement:** Only on T+1/user settlements, NOT on Spend/Redeem
9. **Card deletion:** Auto-refunds remaining balance to user wallet

---

## PAGE PATTERNS

Every dashboard page follows:
```jsx
'use client';
import { useState, useEffect } from 'react';
// imports...

export default function PageName() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/...');
      if (res.ok) setData(await res.json());
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-5 max-w-Xkl mx-auto">
      <PageHeader ... />
      {/* content */}
    </div>
  );
}
```

---

## COMPLETE FEATURE LIST

### Admin
- [x] Dashboard with charts (Recharts AreaChart + PieChart)
- [x] User management (CRUD, approve, block, impersonate, maintenance)
- [x] Distributor management (CRUD, wallet, hold/unhold, stats)
- [x] Master Distributor management (CRUD, wallet, activate settlement, hold)
- [x] Corporate management
- [x] Card management (view all, issue, delete)
- [x] KYC management (approve/reject/re-kyc, inline doc viewer)
- [x] Spend/Redeem Settlement (auto + manual, bulk process, cron)
- [x] T+1 Settlement (approve/reject, hold/unhold per user)
- [x] Cashback management
- [x] Support tickets
- [x] Broadcast management
- [x] Notifications (payment requests)
- [x] Transaction management
- [x] Analytics
- [x] Settings
- [x] IT Services, Orders, Invoices, Delivery, Payment Logs, Service Reports, Audit Logs
- [x] Pending settlement alert banner on dashboard
- [x] Admin impersonation (eye icon, 1h token)

### Master Distributor
- [x] Dashboard (wallet, distributors, users, cards, settlement stats)
- [x] Distributor management (create, wallet, hold/unhold)
- [x] User management (view, block/unblock, total cards column)
- [x] Cards management (view all, freeze/unfreeze, delete with refund)
- [x] Wallet (balance card, total credited/debited, search, filter)
- [x] Transactions (full table with UTR, balance after, date/time)
- [x] On-demand settlement (₹300/₹1L flat fee, 1/day, 72h limit)
- [x] Reports
- [x] Settings

### Distributor
- [x] Dashboard
- [x] User management (create, view)
- [x] Wallet management
- [x] Recharge
- [x] Reports
- [x] Support tickets
- [x] Settings

### Corporate
- [x] Dashboard
- [x] Employee management
- [x] Cards
- [x] Wallet + allowances
- [x] Reports
- [x] Settings

### Employee
- [x] Dashboard
- [x] Cards
- [x] Allowance
- [x] Vouchers
- [x] Transactions

### User
- [x] Dashboard
- [x] Wallet (payment requests, history)
- [x] Virtual Cards (create with 30s animation, freeze/unfreeze, PIN)
- [x] Payment Gateway (redeem)
- [x] T+1 Settlement (initiate, history)
- [x] KYC (submit documents)
- [x] Gift Vouchers
- [x] Transactions
- [x] Support tickets
- [x] Settings (change password, profile)

---

## LIVE DETAILS

- **URL:** https://www.pprsmart.com
- **Support Email:** support@pprsmartsystem.com
- **Support Phone:** +91 9403893296
- **GitHub:** https://github.com/pprsmartsystem/ppr-smart-system
- **Branch:** main

---

## QUICK START

```bash
git clone https://github.com/pprsmartsystem/ppr-smart-system.git
cd "PPR SMART SYSTEM"
npm install
cp .env.example .env.local
# Fill all env vars
npm run dev
```

---

*This prompt documents the complete PPR Smart System as of the latest build.*
*Use this to recreate, extend, or onboard new developers to the project.*
