-- Users table for storing player information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(255),
    balance DECIMAL(15,2) DEFAULT 1000.0,
    avatar_url TEXT,
    referral_code VARCHAR(8) UNIQUE,
    referred_by VARCHAR(8),
    total_wagered DECIMAL(15,2) DEFAULT 0.0,
    total_won DECIMAL(15,2) DEFAULT 0.0,
    games_played INTEGER DEFAULT 0,
    biggest_win DECIMAL(15,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES users(referral_code)
);

-- Game sessions table for tracking active games
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    bet_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
    game_data JSONB, -- JSON data for game state
    server_seed VARCHAR(64),
    client_seed VARCHAR(64),
    nonce INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Game results table for completed games
CREATE TABLE IF NOT EXISTS game_results (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    bet_amount DECIMAL(15,2) NOT NULL,
    payout DECIMAL(15,2) DEFAULT 0.0,
    multiplier DECIMAL(10,4) DEFAULT 0.0,
    won BOOLEAN DEFAULT FALSE,
    game_data JSONB, -- JSON data for game outcome
    server_seed VARCHAR(64),
    client_seed VARCHAR(64),
    nonce INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    username VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Referral earnings table
CREATE TABLE IF NOT EXISTS referral_earnings (
    id UUID PRIMARY KEY,
    referrer_id UUID NOT NULL,
    referred_id UUID NOT NULL,
    game_result_id UUID NOT NULL,
    earning_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referred_id) REFERENCES users(id),
    FOREIGN KEY (game_result_id) REFERENCES game_results(id)
);

-- Server seeds table for provably fair system
CREATE TABLE IF NOT EXISTS server_seeds (
    id SERIAL PRIMARY KEY,
    seed_hash VARCHAR(64) NOT NULL,
    seed_value VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revealed_at TIMESTAMP
);

-- User fairness data table
CREATE TABLE IF NOT EXISTS user_fairness (
    user_id UUID PRIMARY KEY,
    client_seed VARCHAR(64) NOT NULL,
    nonce INTEGER DEFAULT 0,
    current_server_seed_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (current_server_seed_id) REFERENCES server_seeds(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_game_type ON game_results(game_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer_id ON referral_earnings(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_fairness_user_id ON user_fairness(user_id);
CREATE INDEX IF NOT EXISTS idx_users_biggest_win ON users(biggest_win DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_payout ON game_results(payout DESC) WHERE won = TRUE;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_fairness_updated_at BEFORE UPDATE ON user_fairness
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();