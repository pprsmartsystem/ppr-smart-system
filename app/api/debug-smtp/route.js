import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = {
    env: {
      SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
      SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
      SMTP_USER: process.env.SMTP_USER || 'MISSING',
      SMTP_PASS: process.env.SMTP_PASS ? `SET (${process.env.SMTP_PASS.length} chars)` : 'MISSING',
      SMTP_FROM: process.env.SMTP_FROM || 'MISSING',
    },
    connected: false,
    error: null,
  };

  try {
    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await new Promise((res, rej) => t.verify((e) => e ? rej(e) : res()));
    result.connected = true;
  } catch (e) {
    result.error = e.message;
  }

  return NextResponse.json(result);
}
