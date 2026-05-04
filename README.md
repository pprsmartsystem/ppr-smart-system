# PPR Smart System

A comprehensive **Digital Gifting, Corporate Rewards, Virtual Card Management & Settlement Platform** built with Next.js 14, MongoDB, and modern web technologies.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Live:** [www.pprsmart.com](https://www.pprsmart.com)

---

## 🚀 Features

### 🔐 Multi-Role Authentication
- **Admin** — Full platform control, analytics, KYC, settlements, user management
- **Distributor** — User management, wallet recharge, reports (with hold/unhold support)
- **Corporate** — Employee management, bulk allowances, corporate rewards
- **Employee** — Corporate benefits, allowances, vouchers
- **User** — Personal wallet, virtual cards, T+1 bank settlements

### 💳 Virtual Card Management
- Generate unique 16-digit virtual cards with PIN protection
- Real-time freeze/unfreeze functionality
- Spending limits and balance management
- 3-year auto-expiry
- Animated card creation experience (30s generation flow)
- Admin can view all user cards

### 🏦 T+1 Settlement System
- User-initiated bank settlements (minimum ₹10,000)
- Next working day credit to registered bank account
- Excludes Sundays, 2nd & 4th Saturdays, and Indian bank holidays
- Admin approval workflow with pending/processed tracking
- Auto-settlement cron job at 10:30 AM IST daily (Vercel Cron)

### 💰 Spend/Redeem Settlement
- Auto-generated settlements when users spend via gateway
- 1.77% settlement rate deduction
- Admin bulk process with one click
- Full settlement history and analytics

### 📧 SMTP Email Notifications
- **Wallet Loading** — email to distributor when admin credits wallet
- **Settlement Initiated** — email to user on T+1 bank settlement request
- **Settlement Credited** — email to user when admin processes settlement
- Banking-style HTML email templates
- Google Workspace SMTP (support@pprsmartsystem.com)

### 🔧 Maintenance Mode
- Admin can enable per-user maintenance popup
- Non-closable full-screen overlay with custom message
- Auto-polls every 15 seconds — disappears when admin disables
- Scheduled update announcements support

### 🏢 Distributor Management
- Create and manage distributor accounts
- Add/deduct wallet balance
- Temporary hold/unhold accounts
- Distributor stats with date filtering
- Top users by spend report

### 📊 Analytics & Reports
- Date-wise Redeem & Settlement reports
- Total Redeem (date-filtered)
- Settlement Initiated — T+1 bank settlements
- Pending Settlement — Spend/Redeem pending credits
- CSV export

### 🔍 KYC Verification
- Document upload via Cloudinary (Aadhaar, PAN, Bank docs)
- Admin inline document viewer with image thumbnails
- Full-screen document preview for images and PDFs
- Approve / Reject / Re-KYC workflow

### 👁 Admin Impersonation
- Admin can view any user's dashboard via eye icon
- 1-hour temporary session token
- Opens in new tab without affecting admin session

### 🔔 Advanced Notifications
- Real-time payment request approval/rejection
- Auto-refresh every 15 seconds
- Stats: Total, Pending, Approved, Rejected
- Pending amount banner

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Animations** | Framer Motion |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | JWT with HTTP-only cookies |
| **Security** | bcrypt, RBAC, KYC verification |
| **Email** | Nodemailer + Google Workspace SMTP |
| **File Upload** | Cloudinary |
| **Charts** | Recharts |
| **Deployment** | Vercel Pro |
| **Analytics** | Vercel Analytics + Speed Insights |
| **Cron Jobs** | Vercel Cron (T+1 auto-settlement) |

---

## 📁 Project Structure

```
PPR SMART SYSTEM/
├── app/
│   ├── (admin)/admin/          # Admin dashboard & all admin pages
│   ├── (corporate)/corporate/  # Corporate dashboard
│   ├── (distributor)/          # Distributor dashboard
│   ├── (employee)/employee/    # Employee dashboard
│   ├── (user)/user/            # User dashboard
│   ├── (auth)/                 # Login & Register
│   ├── api/                    # All API routes
│   │   ├── admin/              # Admin APIs
│   │   ├── user/               # User APIs
│   │   ├── corporate/          # Corporate APIs
│   │   ├── distributor/        # Distributor APIs
│   │   ├── auth/               # Auth APIs
│   │   └── cron/settle/        # Auto-settlement cron
│   └── page.js                 # Landing page
├── components/
│   ├── layout/Sidebar.js       # Responsive sidebar + mobile bottom nav
│   ├── ui/AdminComponents.js   # Shared admin UI components
│   ├── MaintenancePopup.js     # Per-user maintenance overlay
│   └── BroadcastBar.js         # Site-wide broadcast banner
├── lib/
│   ├── mongodb.js              # DB connection
│   ├── auth.js                 # JWT utilities
│   ├── mailer.js               # SMTP mailer
│   └── emails/                 # Email templates
│       ├── walletLoading.js
│       ├── settlementInitiated.js
│       └── settlementProcessed.js
├── models/                     # Mongoose models
│   ├── User.js
│   ├── Card.js
│   ├── Transaction.js
│   ├── Settlement.js
│   ├── KYC.js
│   ├── UserSettings.js
│   └── ...
├── utils/
│   ├── cardUtils.js
│   ├── walletUtils.js
│   └── bankingDays.js          # Indian banking day calculator
├── vercel.json                 # Cron + function config
└── .env.local                  # Environment variables
```

---

## ⚙️ Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
JWT_SECRET=your-jwt-secret-32-chars-min

# App
NEXT_PUBLIC_APP_NAME=PPR SMART SYSTEM
NEXT_PUBLIC_APP_URL=https://www.pprsmart.com

# Cloudinary (file uploads)
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

# Cron (Vercel auto-settlement)
CRON_SECRET=your-cron-secret
```

---

## 🚀 Quick Start

```bash
# Clone
git clone <repository-url>
cd "PPR SMART SYSTEM"

# Install
npm install

# Setup env
cp .env.example .env.local
# Fill in your values

# Run
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🕐 Cron Jobs

Auto-settlement runs daily at **10:30 AM IST** (05:00 UTC):

```json
{
  "crons": [
    { "path": "/api/cron/settle", "schedule": "0 5 * * *" }
  ]
}
```

Skips: Sundays · 2nd & 4th Saturdays · Indian bank holidays

---

## 🔒 Security

- JWT HTTP-only cookies
- bcrypt password hashing
- Role-based access control (RBAC)
- KYC document verification
- Admin impersonation with 1-hour expiry
- Distributor hold/unhold system
- Per-user maintenance mode

---

## 📬 Support

- **Email:** support@pprsmartsystem.com
- **Phone:** +91 9403893296
- **Website:** [www.pprsmart.com](https://www.pprsmart.com)

---

*PPR Smart System — Digital Gifting, Corporate Rewards & Settlement Platform*
