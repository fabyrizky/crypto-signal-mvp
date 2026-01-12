const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const CryptoSignalGenerator = require('./services/signalGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Init clients (graceful if not configured)
const supabaseConfigured = process.env.SUPABASE_URL &&
  !process.env.SUPABASE_URL.includes('your-project');
const supabase = supabaseConfigured ? createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
) : null;

const signalGen = new CryptoSignalGenerator({
  COINGECKO_API: process.env.COINGECKO_API,
  BINANCE_API: process.env.BINANCE_API
});

// Middleware
app.use(express.json());
app.use(cors());

// 1. Generate signal & save to DB
app.post('/api/signal/generate', async (req, res) => {
  try {
    const { cryptoId = 'bitcoin' } = req.body;

    const signal = await signalGen.generateSignal(cryptoId);
    let dbId = null;

    // Save ke Supabase (if configured)
    if (supabase) {
      const { data, error } = await supabase
        .from('signals')
        .insert([{
          crypto_id: cryptoId,
          price: signal.currentPrice,
          signal: signal.signal,
          confidence: signal.confidence,
          reasoning: signal.reasoning,
          risk_level: signal.riskLevel
        }])
        .select();

      if (!error && data) {
        dbId = data[0]?.id;
        // Trigger n8n workflow
        await triggerN8nWorkflow({ signal, dbRecordId: dbId });
      }
    }

    res.json({ success: true, signal, dbId, supabaseConnected: !!supabase });
  } catch (error) {
    console.error('Signal generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get portfolio analysis
app.post('/api/portfolio/analyze', async (req, res) => {
  try {
    const { cryptoIds = ['bitcoin', 'ethereum', 'solana'] } = req.body;
    const portfolio = await signalGen.analyzePortfolio(cryptoIds);
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Webhook receiver dari n8n
app.post('/webhook/signal-update', (req, res) => {
  console.log('n8n update received:', req.body);
  // Log ke audit (if configured)
  if (supabase) {
    supabase.from('audit_logs').insert([{
      action: 'N8N_SIGNAL_UPDATE',
      details: req.body
    }]).catch(err => console.error('Audit log error:', err));
  }

  res.json({ received: true });
});

// 4. Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Helper: Trigger n8n workflow via webhook
async function triggerN8nWorkflow(payload) {
  try {
    await axios.post(process.env.N8N_WEBHOOK_URL, payload);
  } catch (error) {
    console.error('n8n trigger error:', error.message);
  }
}

// Local dev server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Signal endpoint: POST /api/signal/generate`);
    console.log(`Portfolio endpoint: POST /api/portfolio/analyze`);
  });
}

// Export for Vercel
module.exports = app;
