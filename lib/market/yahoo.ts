import 'server-only';

export type YahooDailyBar = {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
};

export type YahooHistory = {
  symbol: string;
  yahooSymbol: string;
  currency: string | null;
  exchangeName: string | null;
  timezone: string | null;
  fetchedAt: string;
  bars: YahooDailyBar[];
};

function normalizeYahooSymbol(symbol: string) {
  const clean = symbol.trim().toUpperCase();
  if (!/^[A-Z0-9.^-]{1,20}(\.CA)?$/.test(clean)) {
    throw new Error('INVALID_EGX_SYMBOL');
  }
  return clean.endsWith('.CA') ? clean : `${clean}.CA`;
}

export async function getYahooDailyHistory(symbol: string, range = '1y'): Promise<YahooHistory> {
  const yahooSymbol = normalizeYahooSymbol(symbol);
  const allowedRanges = new Set(['1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'max']);
  const safeRange = allowedRanges.has(range) ? range : '1y';
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`);
  url.searchParams.set('range', safeRange);
  url.searchParams.set('interval', '1d');
  url.searchParams.set('events', 'div,splits');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 EGX-AI-Analyst/1.0',
    },
    next: { revalidate: 900 },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`YAHOO_HTTP_${response.status}`);
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const providerError = payload?.chart?.error;
  if (providerError) throw new Error(String(providerError.description || 'YAHOO_PROVIDER_ERROR'));
  if (!result?.timestamp?.length || !result?.indicators?.quote?.[0]) {
    throw new Error('YAHOO_NO_HISTORY');
  }

  const quote = result.indicators.quote[0];
  const bars = result.timestamp.map((timestamp: number, index: number) => ({
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
    open: quote.open?.[index] ?? null,
    high: quote.high?.[index] ?? null,
    low: quote.low?.[index] ?? null,
    close: quote.close?.[index] ?? null,
    volume: quote.volume?.[index] ?? null,
  })).filter((bar: YahooDailyBar) => bar.close !== null);

  if (!bars.length) throw new Error('YAHOO_NO_VALID_BARS');

  return {
    symbol: yahooSymbol.replace(/\.CA$/, ''),
    yahooSymbol,
    currency: result.meta?.currency ?? null,
    exchangeName: result.meta?.fullExchangeName ?? result.meta?.exchangeName ?? null,
    timezone: result.meta?.exchangeTimezoneName ?? null,
    fetchedAt: new Date().toISOString(),
    bars,
  };
}
