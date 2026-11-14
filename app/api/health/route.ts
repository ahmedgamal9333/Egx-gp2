import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'egx-ai-analyst-next',
    marketData: 'not-connected',
    message: 'التطبيق يعمل، ولم يتم ربط مصدر أسعار السوق بعد.',
    timestamp: new Date().toISOString(),
  });
}
