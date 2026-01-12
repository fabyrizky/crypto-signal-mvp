const axios = require('axios');

class CryptoSignalGenerator {
  constructor(config) {
    this.coingeckoAPI = config.COINGECKO_API;
    this.binanceAPI = config.BINANCE_API;
  }

  /**
   * Simple rule-based signal generation (NO ML complexity)
   * Rules:
   * - BUY: if price_change_24h > 5% AND volume_increase
   * - SELL: if price_change_24h < -3% OR resistance_hit
   */
  async generateSignal(cryptoId = 'bitcoin', currency = 'usd') {
    try {
      // Fetch price data dari CoinGecko (free, no auth)
      const priceData = await axios.get(`${this.coingeckoAPI}/simple/price`, {
        params: {
          ids: cryptoId,
          vs_currencies: currency,
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true
        }
      });

      const crypto = priceData.data[cryptoId];
      const price = crypto[currency];
      const change24h = crypto[`${currency}_24h_change`];
      const marketCap = crypto[`${currency}_market_cap`];
      const volume = crypto[`${currency}_24h_vol`];

      // Rule-based logic
      let signal = 'NEUTRAL';
      let confidence = 0;
      let reasoning = [];

      if (change24h > 5) {
        signal = 'BUY';
        confidence += 40;
        reasoning.push(`+5% change dalam 24h (${change24h.toFixed(2)}%)`);
      } else if (change24h < -3) {
        signal = 'SELL';
        confidence += 30;
        reasoning.push(`-3% change dalam 24h (${change24h.toFixed(2)}%)`);
      }

      // Volume analysis
      const volumeToMarketCap = (volume / marketCap) * 100;
      if (volumeToMarketCap > 50) {
        confidence += 20;
        reasoning.push(`High volume activity (${volumeToMarketCap.toFixed(1)}% of market cap)`);
      }

      // Risk assessment
      let riskLevel = 'LOW';
      if (confidence > 60) riskLevel = 'MEDIUM';
      if (confidence > 80) riskLevel = 'HIGH';

      return {
        timestamp: new Date().toISOString(),
        cryptoId,
        currentPrice: price,
        change24h: change24h.toFixed(2),
        signal,
        confidence: Math.min(confidence, 100),
        riskLevel,
        reasoning,
        status: 'SUCCESS'
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        cryptoId,
        signal: 'ERROR',
        error: error.message,
        status: 'FAILED'
      };
    }
  }

  /**
   * Batch analyze multiple cryptos
   */
  async analyzePortfolio(cryptoIds = ['bitcoin', 'ethereum', 'solana']) {
    const results = await Promise.all(
      cryptoIds.map(id => this.generateSignal(id, 'usd'))
    );
    return {
      portfolio: results,
      generated_at: new Date().toISOString(),
      total_buy_signals: results.filter(r => r.signal === 'BUY').length,
      total_sell_signals: results.filter(r => r.signal === 'SELL').length
    };
  }
}

module.exports = CryptoSignalGenerator;
