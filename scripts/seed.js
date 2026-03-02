const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const dotenv = require("dotenv");
// Load .env.local if present, otherwise fall back to .env
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

// Model placeholders (we import ESM-style model files dynamically inside seedDatabase)
let User;
let Corporate;
let Card;
let Transaction;
let Brand;

// Utility functions
function generateCardNumber() {
  const prefix = "4532";
  let cardNumber = prefix;
  for (let i = 0; i < 12; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

function generateCVV() {
  return Math.floor(100 + Math.random() * 900).toString();
}

function calculateExpiryDate(years = 3) {
  const now = new Date();
  const expiryDate = new Date(now.getFullYear() + years, now.getMonth(), 1);
  const month = (expiryDate.getMonth() + 1).toString().padStart(2, "0");
  const year = expiryDate.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
}

function generateTransactionRef() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
}

async function connectDB() {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = "mongodb://localhost:27017/ppr-dev";

  if (primaryUri) {
    try {
      await mongoose.connect(primaryUri);
      console.log("✅ Connected to MongoDB (primary)");
      return;
    } catch (error) {
      console.warn(
        "⚠️ Primary MongoDB connection failed:",
        error.message || error,
      );
    }
  } else {
    console.warn(
      "⚠️ No primary MONGODB_URI configured; attempting local fallback",
    );
  }

  try {
    await mongoose.connect(fallbackUri);
    console.log("✅ Connected to MongoDB (fallback local)");
  } catch (error) {
    console.error(
      "❌ MongoDB connection error (both primary and fallback):",
      error,
    );
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Corporate.deleteMany({});
    await Card.deleteMany({});
    await Transaction.deleteMany({});
    await Brand.deleteMany({});
    console.log("🗑️  Database cleared");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  }
}

async function seedUsers() {
  try {
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = [
      // Admin
      {
        name: "System Administrator",
        email: "admin@ppr.com",
        password: await bcrypt.hash("admin123", 12),
        role: "admin",
        status: "approved",
        walletBalance: 10000,
      },
      // Corporate Admin
      {
        name: "Corporate Manager",
        email: "corporate@ppr.com",
        password: await bcrypt.hash("corporate123", 12),
        role: "corporate",
        status: "approved",
        walletBalance: 50000,
      },
      // Regular Users
      {
        name: "John Doe",
        email: "user@ppr.com",
        password: await bcrypt.hash("user123", 12),
        role: "user",
        status: "approved",
        walletBalance: 1500,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        role: "user",
        status: "approved",
        walletBalance: 2000,
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        password: hashedPassword,
        role: "user",
        status: "approved",
        walletBalance: 800,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`👥 Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    return [];
  }
}

async function seedEmployees(corporateId) {
  try {
    const hashedPassword = await bcrypt.hash("employee123", 12);

    const employees = [
      {
        name: "Alice Wilson",
        email: "alice@techcorp.com",
        password: hashedPassword,
        role: "employee",
        status: "approved",
        walletBalance: 500,
        corporateId: corporateId,
      },
      {
        name: "Bob Brown",
        email: "bob@techcorp.com",
        password: hashedPassword,
        role: "employee",
        status: "approved",
        walletBalance: 750,
        corporateId: corporateId,
      },
      {
        name: "Carol Davis",
        email: "carol@techcorp.com",
        password: hashedPassword,
        role: "employee",
        status: "approved",
        walletBalance: 300,
        corporateId: corporateId,
      },
      {
        name: "David Miller",
        email: "david@techcorp.com",
        password: hashedPassword,
        role: "employee",
        status: "approved",
        walletBalance: 600,
        corporateId: corporateId,
      },
      {
        name: "Eva Garcia",
        email: "eva@techcorp.com",
        password: hashedPassword,
        role: "employee",
        status: "approved",
        walletBalance: 450,
        corporateId: corporateId,
      },
    ];

    const createdEmployees = await User.insertMany(employees);
    console.log(`👨‍💼 Created ${createdEmployees.length} employees`);
    return createdEmployees;
  } catch (error) {
    console.error("❌ Error seeding employees:", error);
    return [];
  }
}

async function seedCorporate(adminUser) {
  try {
    const corporate = new Corporate({
      companyName: "TechCorp Inc.",
      adminId: adminUser._id,
      walletBalance: 50000,
      industry: "Technology",
      address: {
        street: "123 Tech Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        country: "USA",
      },
      contactInfo: {
        phone: "+1-555-0123",
        email: "info@techcorp.com",
        website: "https://techcorp.com",
      },
      settings: {
        allowanceLimit: 1000,
        autoApproveEmployees: true,
        cardExpiryYears: 3,
      },
    });

    await corporate.save();
    console.log("🏢 Created corporate account");
    return corporate;
  } catch (error) {
    console.error("❌ Error seeding corporate:", error);
    return null;
  }
}

async function seedCards(users) {
  try {
    const cards = [];

    // Create cards for users (excluding admin)
    const nonAdminUsers = users.filter((user) => user.role !== "admin");

    for (const user of nonAdminUsers) {
      const numCards = Math.floor(Math.random() * 3) + 1; // 1-3 cards per user

      for (let i = 0; i < numCards; i++) {
        const card = {
          userId: user._id,
          cardNumber: generateCardNumber(),
          expiryDate: calculateExpiryDate(),
          cvv: generateCVV(),
          spendingLimit: Math.floor(Math.random() * 5000) + 1000, // $1000-$6000
          balance: Math.floor(Math.random() * 1000) + 100, // $100-$1100
          status: Math.random() > 0.1 ? "active" : "frozen", // 90% active
          cardName: `${user.name}'s Card ${i + 1}`,
        };
        cards.push(card);
      }
    }

    const createdCards = await Card.insertMany(cards);
    console.log(`💳 Created ${createdCards.length} virtual cards`);
    return createdCards;
  } catch (error) {
    console.error("❌ Error seeding cards:", error);
    return [];
  }
}

async function seedTransactions(users, cards) {
  try {
    const transactions = [];
    const transactionTypes = ["credit", "debit", "voucher", "transfer"];
    const descriptions = [
      "Wallet top-up",
      "Gift voucher purchase",
      "Card payment",
      "Refund processed",
      "Corporate allowance",
      "Online purchase",
      "ATM withdrawal",
      "Cashback reward",
    ];

    // Create transactions for each user
    for (const user of users) {
      const userCards = cards.filter(
        (card) => card.userId.toString() === user._id.toString(),
      );
      const numTransactions = Math.floor(Math.random() * 10) + 5; // 5-15 transactions per user

      for (let i = 0; i < numTransactions; i++) {
        const type =
          transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const amount = Math.floor(Math.random() * 500) + 10; // $10-$510
        const cardId =
          userCards.length > 0 && Math.random() > 0.3
            ? userCards[Math.floor(Math.random() * userCards.length)]._id
            : null;

        const transaction = {
          userId: user._id,
          cardId: cardId,
          type: type,
          amount: amount,
          status: Math.random() > 0.05 ? "completed" : "pending", // 95% completed
          description:
            descriptions[Math.floor(Math.random() * descriptions.length)],
          reference: generateTransactionRef(),
          fromWallet: type === "debit",
          toWallet: type === "credit",
          balanceBefore: user.walletBalance,
          balanceAfter:
            type === "credit"
              ? user.walletBalance + amount
              : user.walletBalance - amount,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ), // Random date within last 30 days
        };
        transactions.push(transaction);
      }
    }

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`💰 Created ${createdTransactions.length} transactions`);
    return createdTransactions;
  } catch (error) {
    console.error("❌ Error seeding transactions:", error);
    return [];
  }
}

async function seedBrands() {
  try {
    const brands = [
      {
        name: "Amazon",
        logo: "https://logo.clearbit.com/amazon.com",
        description: "Shop millions of products online",
        category: "shopping",
        denominations: [
          { value: 25, currency: "USD" },
          { value: 50, currency: "USD" },
          { value: 100, currency: "USD" },
          { value: 200, currency: "USD" },
        ],
        terms:
          "Valid for 12 months from purchase date. Cannot be redeemed for cash.",
        validityDays: 365,
        featured: true,
        discount: 5,
      },
      {
        name: "Starbucks",
        logo: "https://logo.clearbit.com/starbucks.com",
        description: "Coffee, tea, and delicious treats",
        category: "food",
        denominations: [
          { value: 10, currency: "USD" },
          { value: 25, currency: "USD" },
          { value: 50, currency: "USD" },
        ],
        terms:
          "Valid at participating Starbucks locations. Cannot be redeemed for cash.",
        validityDays: 365,
        featured: true,
        discount: 3,
      },
      {
        name: "Netflix",
        logo: "https://logo.clearbit.com/netflix.com",
        description: "Stream movies and TV shows",
        category: "entertainment",
        denominations: [
          { value: 15, currency: "USD" },
          { value: 30, currency: "USD" },
          { value: 60, currency: "USD" },
        ],
        terms: "Valid for Netflix subscription. Auto-renewal may apply.",
        validityDays: 365,
        featured: false,
        discount: 0,
      },
      {
        name: "Uber",
        logo: "https://logo.clearbit.com/uber.com",
        description: "Rides and food delivery",
        category: "travel",
        denominations: [
          { value: 20, currency: "USD" },
          { value: 50, currency: "USD" },
          { value: 100, currency: "USD" },
        ],
        terms:
          "Valid for Uber rides and Uber Eats orders. Subject to availability.",
        validityDays: 365,
        featured: true,
        discount: 2,
      },
      {
        name: "Apple",
        logo: "https://logo.clearbit.com/apple.com",
        description: "Apps, games, music, and more",
        category: "technology",
        denominations: [
          { value: 25, currency: "USD" },
          { value: 50, currency: "USD" },
          { value: 100, currency: "USD" },
        ],
        terms:
          "Valid for App Store, iTunes, and Apple services. Cannot be redeemed for cash.",
        validityDays: 365,
        featured: true,
        discount: 0,
      },
      {
        name: "Spotify",
        logo: "https://logo.clearbit.com/spotify.com",
        description: "Music streaming service",
        category: "entertainment",
        denominations: [
          { value: 10, currency: "USD" },
          { value: 30, currency: "USD" },
          { value: 60, currency: "USD" },
        ],
        terms:
          "Valid for Spotify Premium subscription. Auto-renewal may apply.",
        validityDays: 365,
        featured: false,
        discount: 5,
      },
    ];

    const createdBrands = await Brand.insertMany(brands);
    console.log(`🏷️  Created ${createdBrands.length} brands`);
    return createdBrands;
  } catch (error) {
    console.error("❌ Error seeding brands:", error);
    return [];
  }
}

async function updateCorporateEmployees(corporate, employees) {
  try {
    corporate.employees = employees.map((emp) => emp._id);
    await corporate.save();
    console.log("🔗 Updated corporate with employee references");
  } catch (error) {
    console.error("❌ Error updating corporate employees:", error);
  }
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");
  await connectDB();
  // Dynamically import ESM model modules so this CommonJS script can use them
  try {
    User = (await import("../models/User.js")).default;
    Corporate = (await import("../models/Corporate.js")).default;
    Card = (await import("../models/Card.js")).default;
    Transaction = (await import("../models/Transaction.js")).default;
    Brand = (await import("../models/Brand.js")).default;
  } catch (err) {
    console.error("❌ Error importing models:", err);
    process.exit(1);
  }
  await clearDatabase();

  // Seed users
  const users = await seedUsers();
  if (users.length === 0) return;

  // Find corporate admin
  const corporateAdmin = users.find((user) => user.role === "corporate");
  if (!corporateAdmin) {
    console.error("❌ Corporate admin not found");
    return;
  }

  // Seed corporate
  const corporate = await seedCorporate(corporateAdmin);
  if (!corporate) return;

  // Seed employees
  const employees = await seedEmployees(corporate._id);

  // Update corporate with employee references
  await updateCorporateEmployees(corporate, employees);

  // Combine all users (original + employees)
  const allUsers = [...users, ...employees];

  // Seed cards
  const cards = await seedCards(allUsers);

  // Seed transactions
  await seedTransactions(allUsers, cards);

  // Seed brands
  await seedBrands();

  console.log("\n✅ Database seeding completed successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("Admin: admin@ppr.com / admin123");
  console.log("Corporate: corporate@ppr.com / corporate123");
  console.log("User: user@ppr.com / user123");
  console.log("Employee: alice@techcorp.com / employee123");

  process.exit(0);
}

// Handle errors
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Run seeding
seedDatabase().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
