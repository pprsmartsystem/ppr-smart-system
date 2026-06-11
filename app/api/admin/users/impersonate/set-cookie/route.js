import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    const response = NextResponse.json({ success: true });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
