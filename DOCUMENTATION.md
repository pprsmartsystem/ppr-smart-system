# PPR Smart System — Documentation

**Version:** 1.0.0  
**Live:** [www.pprsmart.com](https://www.pprsmart.com)  
**Support:** support@pprsmartsystem.com | +91 9403893296

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Admin Panel](#admin-panel)
4. [Distributor Panel](#distributor-panel)
5. [User Panel](#user-panel)
6. [Corporate Panel](#corporate-panel)
7. [KYC Verification](#kyc-verification)
8. [Virtual Cards](#virtual-cards)
9. [Settlement System](#settlement-system)
10. [Email Notifications](#email-notifications)
11. [Maintenance Mode](#maintenance-mode)
12. [Cron Jobs](#cron-jobs)
13. [API Reference](#api-reference)
14. [Environment Variables](#environment-variables)
15. [Deployment](#deployment)

---

## Overview

PPR Smart System is a full-stack fintech platform for managing digital gifting, corporate rewards, virtual cards, and bank settlements. It supports multiple user roles with dedicated dashboards, real-time notifications, automated settlements, and banking-style email alerts.

---

## User Roles

| Role | Access | Description |
|---|---|---|
| `admin` | Full platform | Manages all users, settlements, KYC, analytics |
| `distributor` | Own users | Manages assigned users, wallet recharge |
| `corporate` | Own employees | Manages employees, bulk credits |
| `employee` | Benefits only | Views allowances, vouchers |
| `user` | Personal | Wallet, cards, settlements |

---

## Admin Panel

### Dashboard
- Live stats: total users, cards, transactions, revenue
- Monthly transaction chart (area chart)
- User distribution pie chart
- Quick access links
- Pending actions panel

### User Management (`/admin/users`)
- View all users with search and status filter
- **Approve / Reject** pending registrations
- **Block / Unblock** accounts
- **Add / Deduct** wallet balance
- **Reset password** with auto-generate option
- **View cards** — see all cards with CVV and PIN
- **Transfer** user to a different distributor
- **Maintenance mode** — enable per-user popup
- **Impersonate** — view user's dashboard via eye icon (1-hour session)

### Distributor Management (`/admin/distributors`)
- Create distributor accounts with auto-generated passwords
- Add / Deduct wallet balance (email sent on credit)
- **Hold / Unhold** — temporarily suspend distributor login
- View stats: users, redemptions, spend amounts
- Date-filtered reports per distributor

### Wallet Management (`/admin/wallet`)
- Add balance to any user wallet
- Select reason: Card Loading, Settlement, Commission, Bonus, Refund, etc.

### KYC Management (`/admin/kyc`)
- Review submitted KYC documents
- View Aadhaar, PAN, bank documents inline (image preview + PDF viewer)
- **Approve / Reject / Re-KYC** with reason
- Masked account numbers in table view

### Settlement — Spend/Redeem (`/admin/settlement`)
- Auto-generated when users spend via gateway (1.77% deduction)
- Process single or bulk settlements
- Email sent to user on processing
- Delete settlements

### Settlement — T+1 Initiate (`/admin/user-settlements`)
- User-initiated bank settlements
- Approve or reject requests
- Email sent to user on approval

### Notifications (`/admin/notifications`)
- Payment requests from users (UTR submissions)
- Approve → wallet credited instantly
- Reject → request marked failed
- Auto-refresh every 15 seconds
- Stats: Total, Pending, Approved, Rejected

### Analytics (`/admin/analytics`)
- Date-filtered reports per user
- **Total Redeem** — card spending via gateway (date-filtered)
- **Settlement Initiated** — T+1 bank settlements (date-filtered)
- **Pending Settlement** — auto settlements awaiting credit (date-filtered)
- CSV export

### Cards (`/admin/cards`)
- Issue cards to users
- Set initial balance and spending limit
- Delete cards

### KYC (`/admin/kyc`)
- Full document review workflow

### Broadcast (`/admin/broadcast`)
- Create site-wide announcement banners
- Active/Inactive toggle

### Settings (`/admin/settings`)
- Currency settings
- Card expiry years
- Spending limits
- User registration toggle
- Payment gateways (QR code / payment link)
- Reset user history

---

## Distributor Panel

### Dashboard
- Wallet balance overview
- User count, card count, transaction stats
- Quick actions: Add User, Wallet, Reports, Support

### Users (`/distributor/users`)
- Create users under distributor account
- View user list with wallet balances
- Add balance to user wallets

### Wallet (`/distributor/wallet`)
- View own wallet balance
- Submit payment proof (UTR) for recharge
- Transaction history

### Reports (`/distributor/reports`)
- Date-filtered redemption reports
- Top users by spend

### Hold Status
- If admin places distributor on hold, login is blocked
- Error message shows hold reason

---

## User Panel

### Dashboard
- Wallet balance with hide/show toggle
- Active cards summary
- Pending settlement amount
- Quick actions: Wallet, Cards, Settle, Vouchers
- Recent transactions
- Security banner

### Wallet (`/user/wallet`)
- View balance with eye toggle
- Add money via QR code or payment link
- Submit UTR for verification
- Transaction history with tabs (All / In / Out)

### Cards (`/user/cards`)
- Create virtual cards (30-second animated generation)
- View card with flip animation (CVV on back)
- Freeze / Unfreeze cards
- Delete cards

### Gateway (`/user/gateway`)
- Payment gateway interface
- Card-based payment with 3D Secure PIN
- Processing animation

### Settlement (`/user/settlement`)
- Initiate T+1 bank settlement
- Minimum ₹10,000
- Shows linked bank account from KYC
- Progress bar showing minimum threshold
- Pending settlement status

### KYC (`/user/kyc`)
- Submit identity documents
- Upload Aadhaar (front/back), PAN, bank document
- Optional: GST, MSME, other documents
- View status: Pending / Approved / Rejected / Re-KYC

### Transactions (`/user/transactions`)
- Full history with date grouping
- Filter by type and status
- Search by description or reference

### Support (`/user/support`)
- Create support tickets
- Chat-style ticket view
- FAQ section

---

## Corporate Panel

### Dashboard
- Employee count, wallet balance, active cards
- Quick actions: Add Employee, Bulk Credit, Issue Cards, Reports

### Employees (`/corporate/employees`)
- Add and manage employees
- Assign allowances

### Cards (`/corporate/cards`)
- Issue cards to employees

### Wallet (`/corporate/wallet`)
- Corporate wallet management
- Add funds, distribute allowances

---

## KYC Verification

### User Submission
1. User fills personal info (contact, PAN)
2. Uploads bank details (bank name, account, IFSC)
3. Uploads documents: Aadhaar front/back, PAN card, bank document
4. Optional: GST, MSME, other documents
5. Documents uploaded to Cloudinary via `/api/upload`

### Admin Review
1. Admin opens KYC modal — sees document thumbnails
2. Click any document → full-screen viewer (image or PDF)
3. Actions: **Approve**, **Reject** (with reason), **Re-KYC** (request resubmission)

### Status Flow
```
pending → approved
pending → rejected → rekyc → pending (resubmit)
approved → rekyc → pending (re-verify)
```

### Settlement Requirement
- KYC must be `approved` before user can initiate T+1 settlement

---

## Virtual Cards

### Creation Flow
1. User enters amount and 4-digit PIN
2. 30-second animated creation screen (6 steps)
3. Success screen shows card with reveal toggle

### Card Fields
- 16-digit card number
- CVV (3 digits)
- Expiry date (3 years from creation)
- 4-digit PIN
- Balance

### Card States
- `active` — normal use
- `frozen` — temporarily disabled
- `expired` — past expiry date

---

## Settlement System

### T+1 Bank Settlement (User-Initiated)
- User initiates from `/user/settlement`
- Minimum ₹10,000 required
- KYC must be approved
- Amount deducted from wallet immediately
- Settlement record created (`type: manual, source: user`)
- Admin approves → money goes to user's bank account
- Email sent to user on initiation and on approval

### Spend/Redeem Settlement (Auto)
- Created when user spends via gateway
- 1.77% deduction applied
- Settlement record created (`type: auto, source: admin`)
- Admin processes from `/admin/settlement`
- Amount credited back to user wallet
- Email sent to user on processing

### Auto-Settlement Cron
- Runs daily at **10:30 AM IST** (05:00 UTC)
- Processes all pending auto settlements
- Skips: Sundays, 2nd & 4th Saturdays, Indian bank holidays
- Can be manually triggered from admin panel
- Force run option available for non-banking days

### Indian Banking Day Rules (`utils/bankingDays.js`)
- Excludes Sundays
- Excludes 2nd and 4th Saturdays (RBI rule)
- Excludes declared bank holidays for 2025–2026

---

## Email Notifications

All emails sent from `support@pprsmartsystem.com` via Google Workspace SMTP.

### 1. Wallet Loading (`lib/emails/walletLoading.js`)
- **Trigger:** Admin adds balance to distributor wallet
- **Recipient:** Distributor (only if status = `approved`)
- **Subject:** `Wallet Loading Initiated — PPR Smart System`
- **Content:** Amount credited, reference ID, new balance, date/time

### 2. Settlement Initiated (`lib/emails/settlementInitiated.js`)
- **Trigger:** User initiates T+1 bank settlement
- **Recipient:** User
- **Subject:** `Settlement Initiated — PPR Smart System`
- **Content:** Amount, settlement date, reference, remaining balance

### 3. Settlement Credited (`lib/emails/settlementProcessed.js`)
- **Trigger:** Admin processes spend/redeem settlement
- **Recipient:** User
- **Subject:** `Settlement Credited — PPR Smart System`
- **Content:** Amount credited, reference, updated wallet balance

### Email Design
- Banking-style HTML templates
- Dark indigo gradient header
- Transaction details table
- Security notice
- Auto-generated disclaimer
- Footer with website and support links

---

## Maintenance Mode

### Admin Enables
1. Go to **Admin → Users**
2. Click the 🔧 wrench icon on any user row
3. Maintenance mode enabled immediately

### User Experience
- Full-screen non-closable overlay appears within 15 seconds
- Shows maintenance message
- Lists disabled services
- Sign Out button available
- Auto-disappears when admin disables

### Default Message
> We would like to inform you that due to an internal system update, our platform is currently under maintenance. During this period, certain services may be temporarily unavailable...

### Technical
- Polls `/api/user/maintenance` every 15 seconds
- Uses `force-dynamic` to prevent Vercel caching
- Stored in `usersettings` MongoDB collection

---

## Cron Jobs

### Auto-Settlement (`/api/cron/settle`)
- **Schedule:** `0 5 * * *` (05:00 UTC = 10:30 AM IST)
- **Auth:** `Authorization: Bearer <CRON_SECRET>`
- **Action:** Processes all pending auto settlements
- **Skip logic:** Checks Indian banking day rules before processing

### Vercel Cron Setup (`vercel.json`)
```json
{
  "crons": [
    { "path": "/api/cron/settle", "schedule": "0 5 * * *" }
  ]
}
```

Monitor runs at: **Vercel Dashboard → Settings → Cron Jobs**

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### User
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user/cards` | Get user cards |
| POST | `/api/user/cards/create` | Create card |
| GET | `/api/user/kyc/status` | KYC status |
| POST | `/api/user/kyc/submit` | Submit KYC |
| POST | `/api/user/settlement/initiate` | Initiate T+1 settlement |
| GET | `/api/user/settlement` | Get settlements |
| GET | `/api/user/transactions` | Get transactions |
| POST | `/api/user/payment-request` | Submit UTR |
| GET | `/api/user/maintenance` | Check maintenance status |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Get all users |
| POST | `/api/admin/users/approve` | Approve user |
| POST | `/api/admin/users/add-balance` | Add wallet balance |
| POST | `/api/admin/users/maintenance` | Toggle maintenance mode |
| GET | `/api/admin/users/impersonate` | Impersonate user |
| GET | `/api/admin/kyc` | Get KYC submissions |
| POST | `/api/admin/kyc/approve` | Approve KYC |
| GET | `/api/admin/settlement` | Get settlements |
| POST | `/api/admin/settlement` | Process settlement |
| GET | `/api/admin/notifications` | Get payment requests |
| POST | `/api/admin/payment-request` | Approve/reject payment |
| GET | `/api/admin/reports` | Analytics reports |
| POST | `/api/admin/distributors/hold` | Hold distributor |
| POST | `/api/admin/settlement/auto` | Manual auto-settle trigger |

### Cron
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cron/settle` | Auto-settlement (cron) |

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
JWT_SECRET=your-jwt-secret-32-chars-min

# App
NEXT_PUBLIC_APP_NAME=PPR SMART SYSTEM
NEXT_PUBLIC_APP_URL=https://www.pprsmart.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# SMTP (Google Workspace)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@pprsmartsystem.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=PPR Smart System <support@pprsmartsystem.com>

# Cron
CRON_SECRET=your-cron-secret
```

---

## Deployment

### Vercel (Production)

1. Push to GitHub
2. Connect repo to Vercel
3. Add all environment variables in **Vercel → Settings → Environment Variables**
4. Redeploy after adding env vars

### Function Timeouts (`vercel.json`)
```json
{
  "functions": {
    "app/api/**": { "maxDuration": 60 },
    "app/api/cron/**": { "maxDuration": 300 }
  }
}
```

### Vercel Pro Features Used
- Extended function timeouts (up to 300s)
- Cron Jobs (auto-settlement)
- Vercel Analytics
- Vercel Speed Insights

---

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Emails not sending | SMTP env vars missing on Vercel | Add vars + redeploy |
| Maintenance popup not showing | Vercel caching old response | `force-dynamic` export added |
| Settlement showing ₹0 | Wrong settlement type query | Fixed — uses `type/source` fields |
| KYC docs not uploading | Wrong Cloudinary upload preset | Fixed — uses `/api/upload` server route |
| Auto-settlement not running | CRON_SECRET missing | Add to Vercel env vars |

---

*PPR Smart System — Digital Gifting, Corporate Rewards & Settlement Platform*  
*support@pprsmartsystem.com | www.pprsmart.com*
