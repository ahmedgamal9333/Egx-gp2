# EGX market data integration

## Primary configured provider

DataCedar REST API v3 is the first historical OHLCV adapter:
- Base URL: https://api.datacedar.com/v3
- EGX assets: GET /stocks/assets?exchange=egx&limit=1000
- Daily bars: GET /stocks/{sid}/bars?timeframe=1d&adjustment=raw&order=asc
- Authentication: Authorization: Bearer DATACEDAR_KEY
- Explorer/free tier: one year of daily bars, one request per second, up to three symbols per request (check current account plan and EGX venue availability before relying on it).
- The provider describes these observations as source-attributed research data, not a consolidated exchange feed.

## Configuration

Add DATACEDAR_KEY to Vercel Project Settings > Environment Variables for Production and Preview. Keep it server-side; never use NEXT_PUBLIC_DATACEDAR_KEY.

## Data integrity

- No sample prices or synthetic candles are returned by the API routes.
- A missing key returns DATA_PROVIDER_NOT_CONFIGURED.
- Provider errors are returned as unavailable, not replaced by fabricated values.
- Keep the provider name, retrieval timestamp and source timestamp with every displayed price.
- The official EGX listed securities classification remains the authoritative cross-check for universe coverage; provider coverage must be audited against it before claiming complete market coverage.
