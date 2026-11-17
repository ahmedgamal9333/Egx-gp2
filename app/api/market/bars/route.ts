import { NextResponse } from 'next/server';
import { getEgxBarsBatch } from '@/lib/market/datacedar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function providerError(code: string) {
  if (code === 'DATACEDAR_KEY2_MISSING') return { status: 503, message: 'مفتاح DataCedar غير مضبوط في بيئة Vercel Production.' };
  if (code === 'DATACEDAR_AUTH_INVALID') return { status: 401, message: 'DataCedar رفض المفتاح. راجع قيمته وحالة تفعيله في لوحة DataCedar.' };
  if (code === 'DATACEDAR_HISTORY_LIMIT') return { status: 403, message: 'البيانات المطلوبة أقدم من الحد المسموح به في خطتك.' };
  if (code === 'DATACEDAR_BATCH_TOO_LARGE' || code === 'DATACEDAR_PLAN_PAYMENT_REQUIRED') return { status: 402, message: 'حجم الطلب يتجاوز حدود خطة DataCedar.' };
  if (code === 'DATACEDAR_FORBIDDEN') return { status: 403, message: 'DataCedar منع الطلب. يلزم التحقق من صلاحية الخطة وتغطية EGX.' };
  if (code === 'DATACEDAR_RATE_LIMIT') return { status: 429, message: 'تم تجاوز معدل الطلبات المسموح. انتظر قليلًا ثم أعد المحاولة.' };
  return { status: 502, message: 'تعذر جلب بيانات الأسهم من DataCedar.' };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbols = Array.isArray(body?.symbols) ? body.symbols.filter((x: unknown) => typeof x === 'string') : [];
    if (!symbols.length || symbols.length > 3) {
      return NextResponse.json({ ok: false, code: 'INVALID_BATCH', message: 'يُسمح بطلب من سهم إلى 3 أسهم في الدفعة.' }, { status: 400 });
    }
    const from = typeof body.from === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(body.from) ? body.from : undefined;
    const payload = await getEgxBarsBatch(symbols, from);
    const data = payload?.data && typeof payload.data === 'object' ? payload.data : {};
    const rows = Object.entries(data).flatMap(([sid, bars]) => {
      if (!Array.isArray(bars)) return [];
      return bars.flatMap((bar: any) => {
        const timestamp = Number(bar.ts_ms);
        if (!Number.isFinite(timestamp)) return [];
        const exchangeDate = typeof bar.exchange_date === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(bar.exchange_date) ? bar.exchange_date : null;
        const date = exchangeDate || new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp));
        const values = [bar.open, bar.high, bar.low, bar.close, bar.volume].map(Number);
        if (!values.every(Number.isFinite)) return [];
        return [{ symbol: String(bar.symbol || sid.split(':').pop() || '').toUpperCase(), date, open: values[0], high: values[1], low: values[2], close: values[3], volume: values[4] }];
      });
    });
    return NextResponse.json({ ok: true, source: 'DataCedar', retrievedAt: new Date().toISOString(), symbolsRequested: symbols.length, rows });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_PROVIDER_ERROR';
    const mapped = providerError(code);
    return NextResponse.json({ ok: false, code, message: mapped.message }, { status: mapped.status });
  }
}
