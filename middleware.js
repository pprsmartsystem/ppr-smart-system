import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/login', '/register', '/', '/test-auth', '/about', '/contact', '/terms', '/privacy', '/products'];
  
  // Allow API routes
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }
  
  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check for token cookie
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check hold status for distributors
  if (pathname.startsWith('/distributor')) {
    try {
      // Decode token (without verification for middleware)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      if (payload.role === 'distributor') {
        const { default: connectDB } = await import('./lib/mongodb');
        const { default: User } = await import('./models/User');
        
        await connectDB();
        const user = await User.findById(payload.userId).select('isOnHold status').lean();
        
        if (user && (user.isOnHold || user.status === 'blocked')) {
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.delete('token');
          return response;
        }
      }
    } catch (error) {
      console.error('Middleware hold check error:', error);
    }
  }
  
  // Token exists and user is not on hold, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
