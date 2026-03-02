#!/usr/bin/env node

/**
 * PPR Smart System - Setup Verification Script
 * Run this to verify your installation is complete
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 PPR Smart System - Setup Verification\n');

const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  '.env.example',
  'README.md',
  'app/layout.js',
  'app/page.js',
  'app/globals.css',
  'lib/mongodb.js',
  'lib/auth.js',
  'models/User.js',
  'models/Card.js',
  'models/Transaction.js',
  'models/Corporate.js',
  'models/Brand.js',
  'utils/cardUtils.js',
  'middleware.js',
  'scripts/seed.js',
];

const requiredDirs = [
  'app',
  'components',
  'lib',
  'models',
  'utils',
  'scripts',
];

let allGood = true;

// Check directories
console.log('📁 Checking directories...');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/ - MISSING`);
    allGood = false;
  }
});

// Check files
console.log('\n📄 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check environment
console.log('\n🔐 Checking environment setup...');
if (fs.existsSync('.env.local')) {
  console.log('  ✅ .env.local exists');
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (envContent.includes('MONGODB_URI')) {
    console.log('  ✅ MONGODB_URI configured');
  } else {
    console.log('  ⚠️  MONGODB_URI not found in .env.local');
  }
  if (envContent.includes('JWT_SECRET')) {
    console.log('  ✅ JWT_SECRET configured');
  } else {
    console.log('  ⚠️  JWT_SECRET not found in .env.local');
  }
} else {
  console.log('  ⚠️  .env.local not found - Copy from .env.example');
}

// Check node_modules
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('  ✅ node_modules exists');
} else {
  console.log('  ❌ node_modules missing - Run: npm install');
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All checks passed! Your setup is complete.');
  console.log('\n🚀 Next steps:');
  console.log('  1. Configure .env.local with your MongoDB URI');
  console.log('  2. Run: npm run seed');
  console.log('  3. Run: npm run dev');
  console.log('  4. Open: http://localhost:3000');
} else {
  console.log('❌ Some checks failed. Please review the errors above.');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);