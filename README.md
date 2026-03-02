# PPR Smart System

A comprehensive **Digital Gifting, Corporate Rewards & Virtual Card Management Platform** built with Next.js 14, MongoDB, and modern web technologies.

![PPR Smart System](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 🚀 Features

### 🔐 Multi-Role Authentication System
- **Admin**: Full system management and analytics
- **Corporate**: Employee management and bulk operations
- **Employee**: Allowance management and corporate benefits
- **User**: Personal wallet and gift voucher management

### 💳 Virtual Card Management
- Generate unique 16-digit virtual cards
- Real-time freeze/unfreeze functionality
- Spending limits and balance management
- Auto-expiry with 3-year validity
- Apple Wallet-style card design

### 🎁 Digital Gifting Platform
- Brand marketplace with popular retailers
- Scheduled voucher delivery
- Personalized greeting messages
- Corporate bulk gifting

### 📊 Advanced Analytics
- Real-time dashboard metrics
- Transaction monitoring
- Revenue tracking
- User behavior insights
- Exportable reports (CSV)

### 🏢 Corporate Features
- Employee onboarding and management
- Bulk wallet credit distribution
- Allowance management system
- Corporate reporting and analytics

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Security**: bcrypt password hashing, input validation
- **UI/UX**: Framer Motion animations, Heroicons
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel-ready configuration

## 📁 Project Structure

```
PPR SMART SYSTEM/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (admin)/                  # Admin dashboard
│   ├── (corporate)/              # Corporate dashboard
│   ├── (employee)/               # Employee dashboard
│   ├── (user)/                   # User dashboard
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── admin/                # Admin API routes
│   │   ├── user/                 # User API routes
│   │   └── corporate/            # Corporate API routes
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Landing page
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   ├── layout/                   # Layout components
│   ├── cards/                    # Card components
│   └── charts/                   # Chart components
├── lib/                          # Utility libraries
│   ├── mongodb.js                # Database connection
│   └── auth.js                   # Authentication utilities
├── models/                       # Mongoose models
│   ├── User.js
│   ├── Card.js
│   ├── Transaction.js
│   ├── Corporate.js
│   └── Brand.js
├── utils/                        # Utility functions
│   └── cardUtils.js              # Card-related utilities
├── middleware.js                 # Next.js middleware
├── scripts/                      # Database scripts
│   └── seed.js                   # Database seeding
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git installed

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "PPR SMART SYSTEM"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ppr-smart-system
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NEXT_PUBLIC_APP_NAME=PPR SMART SYSTEM
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Seed the database with test data:

```bash
npm run seed
```

This creates:
- 1 Admin account
- 1 Corporate account with 5 employees
- 3 Regular users
- Sample virtual cards and transactions
- Brand marketplace data

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 👥 Test Accounts

After running the seed script, use these accounts to test different roles:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@ppr.com | admin123 | Full system access |
| **Corporate** | corporate@ppr.com | corporate123 | Company management |
| **User** | user@ppr.com | user123 | Personal account |
| **Employee** | alice@techcorp.com | employee123 | Corporate employee |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-jwt-secret-key
   NEXT_PUBLIC_APP_NAME=PPR SMART SYSTEM
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get your connection string
6. Replace `<username>`, `<password>`, and `<cluster>` in the connection string

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with test data
```

### Adding New Features

1. **API Routes**: Add new endpoints in `app/api/`
2. **Database Models**: Create new models in `models/`
3. **Components**: Add reusable components in `components/`
4. **Pages**: Create new pages in appropriate role directories
5. **Utilities**: Add helper functions in `utils/`

## 🎨 UI/UX Features

### Design System
- **Premium fintech aesthetic** inspired by Stripe, Notion, and Apple
- **Glassmorphism effects** with backdrop blur
- **Smooth animations** using Framer Motion
- **Responsive design** for all screen sizes
- **Dark mode support** (optional)

### Virtual Card Design
- **3D gradient backgrounds** with realistic card appearance
- **Animated flip effects** to show CVV
- **Hover glow animations**
- **Masked card numbers** for security
- **Status indicators** (active, frozen, expired)

### Interactive Elements
- **Smooth page transitions**
- **Loading skeletons**
- **Toast notifications**
- **Animated statistics**
- **Hover effects** and micro-interactions

## 🔒 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password hashing** using bcrypt with salt rounds
- **Role-based access control** (RBAC)
- **Input validation** and sanitization
- **MongoDB injection prevention**
- **Secure middleware** for route protection
- **CORS configuration** for API security

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['admin', 'corporate', 'employee', 'user'],
  status: Enum ['pending', 'approved', 'rejected'],
  walletBalance: Number,
  corporateId: ObjectId (optional),
  createdAt: Date
}
```

### Card Model
```javascript
{
  userId: ObjectId,
  cardNumber: String (16 digits),
  expiryDate: String,
  cvv: String (3 digits),
  spendingLimit: Number,
  balance: Number,
  status: Enum ['active', 'frozen', 'expired'],
  createdAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId,
  cardId: ObjectId (optional),
  type: Enum ['credit', 'debit', 'voucher', 'transfer'],
  amount: Number,
  status: Enum ['pending', 'completed', 'failed'],
  description: String,
  reference: String (unique),
  createdAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@ppr.com
- 📖 Documentation: [docs.ppr.com](https://docs.ppr.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Vercel** for seamless deployment
- **MongoDB** for the flexible database
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations

---

**Built with ❤️ for modern businesses**

*PPR Smart System - The future of digital gifting and corporate rewards.*