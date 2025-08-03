import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow this in development or with specific auth
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
    databaseUrl: !!process.env.DATABASE_URL,
    directUrl: !!process.env.DIRECT_URL,
  });
}