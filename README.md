# CryptoSignal MVP

AI-powered crypto trading signal tool for beginners. Rule-based signals with n8n integration.

## Quick Start

```bash
git clone <your-repo> && cd crypto-signal-mvp
chmod +x setup.sh && ./setup.sh
```

## Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure API keys** (edit `.env`)
```env
GROQ_API_KEY="your-groq-key"           # https://console.groq.com (free)
SUPABASE_URL="https://xxx.supabase.co" # https://supabase.com (free)
SUPABASE_ANON_KEY="your-key"
```

3. **Run the server**
```bash
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/signal/generate` | POST | Generate signal for crypto |
| `/api/portfolio/analyze` | POST | Batch analyze multiple cryptos |
| `/webhook/signal-update` | POST | n8n callback receiver |

### Examples

```bash
# Generate Bitcoin signal
curl -X POST http://localhost:3000/api/signal/generate \
  -H "Content-Type: application/json" \
  -d '{"cryptoId": "bitcoin"}'

# Analyze portfolio
curl -X POST http://localhost:3000/api/portfolio/analyze \
  -H "Content-Type: application/json" \
  -d '{"cryptoIds": ["bitcoin", "ethereum", "solana"]}'
```

## Signal Logic

| Signal | Condition |
|--------|-----------|
| BUY | 24h change > +5% |
| SELL | 24h change < -3% |
| NEUTRAL | Otherwise |

Confidence boosted by high volume (>50% of market cap).

## Tech Stack

- Node.js + Express
- CoinGecko API (free, no key)
- Supabase (free tier)
- n8n (self-hosted)

## n8n Integration

```bash
# Import workflow to n8n
npm run n8n:import
```

## Scripts

```bash
npm start      # Production
npm run dev    # Development (auto-reload)
npm test       # Run tests
npm run n8n:import  # Import workflow to n8n
```

## Project Structure

```
crypto-signal-mvp/
├── src/
│   ├── services/signalGenerator.js  # Core signal logic
│   ├── schemas/supabase-schema.sql  # Database schema
│   ├── tests/signal.test.js         # Jest tests
│   └── server.js                    # Express server
├── n8n-workflow.json
├── .env.example
└── package.json
```

## License

MIT
