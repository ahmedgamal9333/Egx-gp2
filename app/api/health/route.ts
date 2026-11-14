import { NextResponse } from 'next/server';
import { dataCedarConfigured, listEgxAssets } from '@/lib/market/datacedar';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!dataCedarConfigured()) {
    return NextResponse.json({
      ok: true,
      service: 'egx-ai-analyst-next',
      marketData: 'not-configured',
      message: 'التطبيق يعمل، لكن مفتاح مزود بيانات السوق غير مُعد.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const assets = await listEgxAssets();
    return NextResponse.json({
      ok: true,
      service: 'egx-ai-analyst-next',
      marketData: 'connected',
      provider: 'DataCedar',
      assetCount: assets.length,
      dataFrequency: 'daily historical',
      message: 'تم الاتصال بمزود البيانات وتحميل دليل أصول البورصة المصرية.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_PROVIDER_ERROR';
    return NextResponse.json({
      ok: true,
      service: 'egx-ai-analyst-next',
      marketData: 'error',
      provider: 'DataCedar',
      code,
      message: 'التطبيق يعمل، لكن تعذر التحقق من اتصال مزود بيانات السوق.',
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}
