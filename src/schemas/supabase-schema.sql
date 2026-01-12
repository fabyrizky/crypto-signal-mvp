-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Signals table
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crypto_id VARCHAR(50) NOT NULL,
  price DECIMAL(20, 2) NOT NULL,
  signal VARCHAR(20) NOT NULL, -- BUY, SELL, NEUTRAL
  confidence INT NOT NULL,
  reasoning JSONB,
  risk_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User trades table
CREATE TABLE user_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(100) NOT NULL,
  crypto_id VARCHAR(50) NOT NULL,
  action VARCHAR(10) NOT NULL, -- BUY, SELL
  amount DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 2) NOT NULL,
  signal_id UUID REFERENCES signals(id),
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, EXECUTED, FAILED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk performa
CREATE INDEX idx_signals_crypto ON signals(crypto_id);
CREATE INDEX idx_signals_created ON signals(created_at DESC);
CREATE INDEX idx_trades_user ON user_trades(user_id);
CREATE INDEX idx_trades_status ON user_trades(status);
