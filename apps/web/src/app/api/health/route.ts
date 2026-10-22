import { NextResponse } from 'next/server';

export async function GET() {
  const timestamp = new Date().toISOString();
  return NextResponse.json({
    status: 'healthy',
    tier: 'frontend',
    version: '0.1.0',
    timestamp,
    environment: process.env.NODE_ENV || 'development',
  });
}
