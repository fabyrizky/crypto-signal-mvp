const CryptoSignalGenerator = require('../services/signalGenerator');

describe('CryptoSignalGenerator', () => {
  let generator;

  beforeAll(() => {
    generator = new CryptoSignalGenerator({
      COINGECKO_API: 'https://api.coingecko.com/api/v3',
      BINANCE_API: 'https://api.binance.com/api/v3'
    });
  });

  test('Should generate valid signal', async () => {
    const signal = await generator.generateSignal('bitcoin');
    expect(signal).toHaveProperty('signal');
    expect(['BUY', 'SELL', 'NEUTRAL']).toContain(signal.signal);
    expect(signal.confidence).toBeGreaterThanOrEqual(0);
    expect(signal.confidence).toBeLessThanOrEqual(100);
  });

  test('Should analyze portfolio', async () => {
    const portfolio = await generator.analyzePortfolio(['bitcoin', 'ethereum']);
    expect(portfolio).toHaveProperty('portfolio');
    expect(portfolio.portfolio.length).toBe(2);
  });

  test('Should handle errors gracefully', async () => {
    const signal = await generator.generateSignal('invalid-crypto-xyz');
    expect(signal.status).toBe('FAILED');
    expect(signal.error).toBeDefined();
  });
});
