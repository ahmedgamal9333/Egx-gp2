import 'server-only';

const BASE = 'https://api.datacedar.com/v3';

export type ProviderAsset = {
  sid?: string;
  symbol?: string;
  name?: string;
  exchange?: string;
  asset_class?: string;
  status?: string;
  bars_url?: string;
  page?: string;
  [key: string]: unknown;
};

export function dataCedarConfigured() {
  return Boolean(process.env.DATACEDAR_KEY);
}

async function request(path: string) {
  const key = process.env.DATACEDAR_KEY;
  if (!key) throw new Error('DATACEDAR_KEY_MISSING');
  const response = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('DATACEDAR_AUTH_OR_PLAN');
    if (response.status === 429) throw new Error('DATACEDAR_RATE_LIMIT');
    throw new Error(`DATACEDAR_HTTP_${response.status}`);
  }
  return response.json();
}

export async function listEgxAssets(): Promise<ProviderAsset[]> {
  const all: ProviderAsset[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({ exchange: 'egx', limit: '1000' });
    if (cursor) params.set('cursor', cursor);
    const payload = await request(`/stocks/assets?${params.toString()}`);
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    all.push(...rows);
    cursor = payload?.pagination?.next_cursor || undefined;
    if (!cursor) break;
  }
  return all;
}

export async function getEgxBars(sid: string, from?: string) {
  const params = new URLSearchParams({ timeframe: '1d', order: 'asc', limit: '50000', adjustment: 'raw' });
  if (from) params.set('from', from);
  return request(`/stocks/${encodeURIComponent(sid)}/bars?${params.toString()}`);
}
