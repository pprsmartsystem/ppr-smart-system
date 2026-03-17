const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

async function seedServicesAndOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define schemas
    const ServiceSchema = new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      category: String,
      isActive: Boolean,
      features: [String],
      deliveryType: String,
      stock: Number,
    }, { timestamps: true });

    const OrderSchema = new mongoose.Schema({
      orderId: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      amount: Number,
      status: String,
      paymentMethod: String,
      paymentStatus: String,
      deliveryStatus: String,
      paymentId: String,
      deliveryProof: String,
      deliveryNotes: String,
      deliveredAt: Date,
      invoiceId: String,
    }, { timestamps: true });

    const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Get a user
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('No user found. Please create a user first.');
      await mongoose.connection.close();
      return;
    }

    console.log('Found user:', user.name);

    // Create services
    const services = [
      {
        name: 'Premium Software Access',
        description: 'Full access to premium software suite with lifetime updates',
        price: 2500,
        category: 'software',
        isActive: true,
        features: ['Lifetime access', 'Free updates', '24/7 support', 'Multi-device'],
        deliveryType: 'email',
        stock: -1,
      },
      {
        name: 'API Service Package',
        description: 'Complete API integration service with documentation',
        price: 1200,
        category: 'api',
        isActive: true,
        features: ['REST API', 'Documentation', 'Code samples', 'Support'],
        deliveryType: 'instant',
        stock: -1,
      },
      {
        name: 'Cloud Hosting - 1 Year',
        description: 'Premium cloud hosting with 99.9% uptime guarantee',
        price: 3500,
        category: 'hosting',
        isActive: true,
        features: ['10GB Storage', 'Unlimited bandwidth', 'SSL certificate', 'Daily backups'],
        deliveryType: 'manual',
        stock: 50,
      },
      {
        name: 'Software License Key',
        description: 'Genuine software license with activation support',
        price: 1800,
        category: 'license',
        isActive: true,
        features: ['Genuine license', 'Instant activation', '1 year validity', 'Email support'],
        deliveryType: 'instant',
        stock: 100,
      },
    ];

    console.log('Creating services...');
    await Service.deleteMany({});
    const createdServices = await Service.insertMany(services);
    console.log(`Created ${createdServices.length} services`);

    // Create sample orders
    const orders = [
      {
        orderId: `ORD${Date.now() - 86400000}`,
        userId: user._id,
        serviceId: createdServices[0]._id,
        amount: 2500,
        status: 'completed',
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        deliveryStatus: 'delivered',
        paymentId: `pay_${Date.now()}`,
        deliveryNotes: 'Service activated. Login credentials sent via email.',
        deliveredAt: new Date(),
      },
      {
        orderId: `ORD${Date.now() - 43200000}`,
        userId: user._id,
        serviceId: createdServices[1]._id,
        amount: 1200,
        status: 'processing',
        paymentMethod: 'wallet',
        paymentStatus: 'paid',
        deliveryStatus: 'pending',
      },
      {
        orderId: `ORD${Date.now()}`,
        userId: user._id,
        serviceId: createdServices[2]._id,
        amount: 3500,
        status: 'pending',
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
      },
    ];

    console.log('Creating orders...');
    await Order.deleteMany({});
    const createdOrders = await Order.insertMany(orders);
    console.log(`Created ${createdOrders.length} orders`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nServices created:');
    createdServices.forEach(s => console.log(`  - ${s.name} (₹${s.price})`));
    console.log('\nOrders created:');
    createdOrders.forEach(o => console.log(`  - ${o.orderId} - ${o.status}`));

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedServicesAndOrders();
