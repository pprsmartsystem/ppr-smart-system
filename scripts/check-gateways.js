const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

async function checkGateways() {
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

    const gateways = await PaymentGateway.find();
    
    console.log('\n=== All Payment Gateways ===');
    gateways.forEach((gw, i) => {
      console.log(`\n${i + 1}. ${gw.name}`);
      console.log(`   Type: ${gw.type}`);
      console.log(`   UserType: ${gw.userType || 'NOT SET'}`);
      console.log(`   IsActive: ${gw.isActive}`);
      console.log(`   Payment Link: ${gw.paymentLink || 'N/A'}`);
      console.log(`   QR Code: ${gw.qrCodeUrl || 'N/A'}`);
    });

    console.log('\n=== Gateways for Distributors ===');
    const distGateways = await PaymentGateway.find({
      isActive: true,
      userType: { $in: ['distributor', 'all'] }
    });
    console.log(`Found ${distGateways.length} gateways for distributors`);
    distGateways.forEach(gw => {
      console.log(`- ${gw.name} (${gw.userType})`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkGateways();
