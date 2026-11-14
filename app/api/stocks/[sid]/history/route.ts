import { NextRequest, NextResponse } from 'next/server';
import { dataCedarConfigured, getEgxBars } from '@/lib/market/datacedar';

export async function GET(request: NextRequest, context: { params: Promise<{ sid: string }> }) {
  if (!dataCedarConfigured()) {
    return NextResponse.json({ ok: false, code: 'DATA_PROVIDER_NOT_CONFIGURED' }, { status: 503 });
  }
  const { sid } = await context.params;
  if (!/^egx:[A-Za-z0-9._-]+$/i.test(decodeURIComponent(sid))) {
    return NextResponse.json({ ok: false, code: 'INVALID_SYMBOL_ID' }, { status: 400 });
  }
  const from = request.nextUrl.searchParams.get('from') || undefined;
  try {
    const payload = await getEgxBars(decodeURIComponent(sid), from);
    return NextResponse.json({
      ok: true,
      source: 'DataCedar',
      retrievedAt: new Date().toISOString(),
      data: payload?.data ?? [],
      pagination: payload?.pagination ?? null,
      meta: payload?.meta ?? null,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_PROVIDER_ERROR';
    return NextResponse.json({ ok: false, code, message: 'تعذر تحميل السجل السعري لهذا السهم.' }, { status: 502 });
  }
}
