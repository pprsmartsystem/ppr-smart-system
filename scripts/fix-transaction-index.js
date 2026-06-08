const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('transactions');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the problematic unique index on reference
    try {
      await collection.dropIndex('reference_1');
      console.log('✓ Dropped old reference_1 index');
    } catch (err) {
      console.log('Index may not exist or already dropped');
    }

    // Create the correct sparse index
    await collection.createIndex({ reference: 1 }, { sparse: true });
    console.log('✓ Created new sparse index on reference');

    console.log('\n✅ Transaction indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixIndex();
