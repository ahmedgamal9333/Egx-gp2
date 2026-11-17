import { NextResponse } from 'next/server';
import { dataCedarConfigured } from '@/lib/market/datacedar';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connected = dataCedarConfigured();
  return NextResponse.json({
    ok: true,
    service: 'egx-ai-analyst-next',
    marketData: connected ? 'configured' : 'not-connected',
    provider: 'DataCedar',
    message: connected
      ? 'تم إعداد اتصال مزود بيانات السوق.'
      : 'أضف DATACEDAR_KEY2 في متغيرات بيئة Vercel.',
    timestamp: new Date().toISOString(),
  });
}
