const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

async function updateGateways() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const PaymentGateway = mongoose.model('PaymentGateway', new mongoose.Schema({
      name: String,
      type: String,
      qrCodeUrl: String,
      paymentLink: String,
      isActive: Boolean,
      userType: String,
    }, { timestamps: true }));

    // Update all gateways without userType to have userType: 'all'
    const result = await PaymentGateway.updateMany(
      { userType: { $exists: false } },
      { $set: { userType: 'all' } }
    );

    console.log(`Updated ${result.modifiedCount} gateways`);

    // Show updated gateways
    const gateways = await PaymentGateway.find();
    console.log('\n=== Updated Gateways ===');
    gateways.forEach(gw => {
      console.log(`${gw.name} - UserType: ${gw.userType}`);
    });

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateGateways();
