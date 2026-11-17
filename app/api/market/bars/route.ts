import { NextResponse } from 'next/server';
import { getEgxBarsBatch } from '@/lib/market/datacedar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbols = Array.isArray(body?.symbols) ? body.symbols.filter((x: unknown) => typeof x === 'string') : [];
    if (!symbols.length || symbols.length > 3) {
      return NextResponse.json({ ok: false, code: 'INVALID_BATCH', message: 'يُسمح بطلب من سهم إلى 3 أسهم في الدفعة.' }, { status: 400 });
    }
    const from = typeof body.from === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.from) ? body.from : undefined;
    const payload = await getEgxBarsBatch(symbols, from);
    const data = payload?.data && typeof payload.data === 'object' ? payload.data : {};
    const rows = Object.entries(data).flatMap(([sid, bars]) => {
      if (!Array.isArray(bars)) return [];
      return bars.flatMap((bar: any) => {
        const timestamp = Number(bar.ts_ms);
        if (!Number.isFinite(timestamp)) return [];
        const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp));
        const values = [bar.open, bar.high, bar.low, bar.close, bar.volume].map(Number);
        if (!values.every(Number.isFinite)) return [];
        return [{ symbol: String(bar.symbol || sid.split(':').pop() || '').toUpperCase(), date, open: values[0], high: values[1], low: values[2], close: values[3], volume: values[4] }];
      });
    });
    return NextResponse.json({ ok: true, source: 'DataCedar', retrievedAt: new Date().toISOString(), symbolsRequested: symbols.length, rows });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_PROVIDER_ERROR';
    const status = code === 'DATACEDAR_KEY2_MISSING' ? 503 : code === 'DATACEDAR_RATE_LIMIT' ? 429 : 502;
    return NextResponse.json({ ok: false, code, message: code === 'DATACEDAR_AUTH_OR_PLAN' ? 'مفتاح DataCedar غير صالح أو الخطة لا تسمح بهذا الطلب.' : 'تعذر جلب بيانات الأسهم من DataCedar.' }, { status });
  }
}
