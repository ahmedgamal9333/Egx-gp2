# EGX market data integration

## Primary configured provider

DataCedar REST API v3 is the historical OHLCV adapter:
- Base URL: https://api.datacedar.com/v3
- EGX assets: GET /stocks/assets?exchange=egx&limit=1000
- Multi-symbol daily bars: GET /stocks/bars?symbols=egx:TICKER,...&timeframe=1d&adjustment=raw&order=asc
- Authentication: Authorization: Bearer DATACEDAR_KEY2 (or X-API-Key).
- Explorer/free tier: one year of daily bars, one request per second, up to three symbols per request. Confirm current account plan and EGX venue availability before relying on it.
- These are source-attributed historical bars, not a consolidated real-time exchange feed. Daily data is updated after the session; it is not a live quote feed.

## Configuration

Add DATACEDAR_KEY2 to Vercel Project Settings > Environment Variables for Production (and Preview if needed). Keep it server-side; never use NEXT_PUBLIC_* variables for this key.

## Data integrity

- No sample prices or synthetic candles are returned by the API routes.
- A missing key returns a provider configuration error.
- Provider errors are returned as unavailable, not replaced with fabricated values.
- Keep the provider name and retrieval timestamp with every displayed dataset.
- Provider coverage must be audited against the EGX listed securities master before claiming complete market coverage.
