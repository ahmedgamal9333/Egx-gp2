export type MarketQuote = {
  symbol: string;
  nameAr: string;
  nameEn?: string;
  price: number;
  changePercent?: number;
  asOf: string;
  source: string;
};

export type MarketDataStatus = 'connected' | 'delayed' | 'unavailable';
