#!/bin/bash
set -e

echo "🚀 CryptoSignal MVP - Auto Setup"
echo "================================"

# 1. Init Node.js
npm init -y
npm install --save axios dotenv @supabase/supabase-js groq-sdk express cors

# 2. Create env template
cat > .env.example << 'EOF'
# Free API Keys - Get from:
# CoinGecko: https://www.coingecko.com/en/api (no key needed, just use free tier)
# Groq: https://console.groq.com (free $5/month)
# Supabase: https://supabase.com (free tier, 500MB DB)
# Binance: https://binance-docs.github.io/apidocs (no key needed untuk public data)

GROQ_API_KEY="your-groq-key-here"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-key-here"
COINGECKO_API="https://api.coingecko.com/api/v3"
BINANCE_API="https://api.binance.com/api/v3"
PORT=3000
N8N_WEBHOOK_URL="http://localhost:5678/webhook/crypto-signal"
EOF

cp .env.example .env
echo "✅ .env created. Fill it dengan API keys Anda"

# 3. Create main app structure
mkdir -p src/{handlers,services,schemas,tests}

echo "✅ Setup complete! Next: Dapatkan API keys kemudian run 'npm run dev'"
