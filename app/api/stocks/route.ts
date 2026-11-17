import { NextResponse } from 'next/server';
import { dataCedarConfigured, listEgxAssets } from '@/lib/market/datacedar';

export const revalidate = 3600;

export async function GET() {
  if (!dataCedarConfigured()) {
    return NextResponse.json({
      ok: false,
      code: 'DATA_PROVIDER_NOT_CONFIGURED',
      message: 'لم يتم إعداد مفتاح مزود بيانات السوق بعد.',
      provider: 'DataCedar',
      setup: 'أضف DATACEDAR_KEY2 في متغيرات بيئة Vercel.',
    }, { status: 503 });
  }
  try {
    const assets = await listEgxAssets();
    const stocks = assets.map((asset) => ({
      id: String(asset.sid || ''),
      symbol: String(asset.symbol || ''),
      name: String(asset.name || asset.symbol || ''),
      exchange: String(asset.exchange || 'egx'),
      assetClass: String(asset.asset_class || 'equity'),
      status: String(asset.status || 'unknown'),
      page: typeof asset.page === 'string' ? asset.page : null,
    })).filter((asset) => asset.id && asset.symbol);
    return NextResponse.json({
      ok: true,
      source: 'DataCedar',
      sourceType: 'third-party historical data provider',
      count: stocks.length,
      updatedAt: new Date().toISOString(),
      stocks,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_PROVIDER_ERROR';
    return NextResponse.json({ ok: false, code, message: 'تعذر تحميل دليل الأسهم من مزود البيانات.' }, { status: 502 });
  }
}
