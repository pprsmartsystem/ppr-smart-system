import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Corporate from '@/models/Corporate';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { name, email, password, role, companyName } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'corporate', 'employee', 'user'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with appropriate status
    // Admin registrations require approval, others are pending by default
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      status: 'pending', // All registrations require approval
    };

    const user = new User(userData);
    await user.save();

    // If corporate role, create corporate record
    if (role === 'corporate' && companyName) {
      const corporate = new Corporate({
        companyName: companyName.trim(),
        adminId: user._id,
      });
      await corporate.save();
    }

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}