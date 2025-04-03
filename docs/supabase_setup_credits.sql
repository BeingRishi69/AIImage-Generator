-- Add credits column to user_preferences table if it doesn't exist
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 10;

-- Create transactions table to record payment history
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for purchases, negative for usage
  description TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus'
  stripe_payment_id TEXT, -- only filled for purchases
  stripe_session_id TEXT, -- only filled for purchases
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_payment_id ON credit_transactions(stripe_payment_id);

-- Function to get user's available credits
CREATE OR REPLACE FUNCTION get_user_credits(user_id_param TEXT)
RETURNS INTEGER AS $$
DECLARE
  total_credits INTEGER;
BEGIN
  -- Get total from all transactions
  SELECT COALESCE(SUM(amount), 0) INTO total_credits
  FROM credit_transactions
  WHERE user_id = user_id_param;
  
  -- If no transactions, return default 10 credits
  IF total_credits IS NULL THEN
    RETURN 10;
  END IF;
  
  RETURN total_credits;
END;
$$ LANGUAGE plpgsql; 