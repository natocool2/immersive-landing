-- First, let's check if we have any existing Stripe products/prices and clean them up
-- We'll insert the new products and prices for the CitIntel platform

-- Create a function to help with price calculations
CREATE OR REPLACE FUNCTION calculate_tiered_token_price(token_amount INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_price DECIMAL(10,2) := 0;
    remaining_tokens INTEGER := token_amount;
    tier_tokens INTEGER;
    tier_price DECIMAL(10,2);
BEGIN
    -- Tier 1: 1-10M tokens: $3.00 per 1M tokens
    IF remaining_tokens > 0 THEN
        tier_tokens := LEAST(remaining_tokens, 10);
        total_price := total_price + (tier_tokens * 3.00);
        remaining_tokens := remaining_tokens - tier_tokens;
    END IF;
    
    -- Tier 2: 11-25M tokens: $2.80 per 1M tokens
    IF remaining_tokens > 0 THEN
        tier_tokens := LEAST(remaining_tokens, 15);
        total_price := total_price + (tier_tokens * 2.80);
        remaining_tokens := remaining_tokens - tier_tokens;
    END IF;
    
    -- Tier 3: 26-50M tokens: $2.60 per 1M tokens
    IF remaining_tokens > 0 THEN
        tier_tokens := LEAST(remaining_tokens, 25);
        total_price := total_price + (tier_tokens * 2.60);
        remaining_tokens := remaining_tokens - tier_tokens;
    END IF;
    
    -- Tier 4: 51-100M tokens: $2.40 per 1M tokens
    IF remaining_tokens > 0 THEN
        tier_tokens := LEAST(remaining_tokens, 50);
        total_price := total_price + (tier_tokens * 2.40);
        remaining_tokens := remaining_tokens - tier_tokens;
    END IF;
    
    -- Tier 5: 101-200M tokens: $2.20 per 1M tokens
    IF remaining_tokens > 0 THEN
        tier_tokens := LEAST(remaining_tokens, 100);
        total_price := total_price + (tier_tokens * 2.20);
        remaining_tokens := remaining_tokens - tier_tokens;
    END IF;
    
    -- Tier 6: 201M+ tokens: $2.00 per 1M tokens
    IF remaining_tokens > 0 THEN
        total_price := total_price + (remaining_tokens * 2.00);
    END IF;
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate consultation hours pricing
CREATE OR REPLACE FUNCTION calculate_consultation_price(hours INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_price DECIMAL(10,2) := 0;
    remaining_hours INTEGER := hours;
    tier_hours INTEGER;
BEGIN
    -- Tier 1: 1-5 hours: $60.00 per hour
    IF remaining_hours > 0 THEN
        tier_hours := LEAST(remaining_hours, 5);
        total_price := total_price + (tier_hours * 60.00);
        remaining_hours := remaining_hours - tier_hours;
    END IF;
    
    -- Tier 2: 6-10 hours: $55.00 per hour
    IF remaining_hours > 0 THEN
        tier_hours := LEAST(remaining_hours, 5);
        total_price := total_price + (tier_hours * 55.00);
        remaining_hours := remaining_hours - tier_hours;
    END IF;
    
    -- Tier 3: 11-20 hours: $50.00 per hour
    IF remaining_hours > 0 THEN
        tier_hours := LEAST(remaining_hours, 10);
        total_price := total_price + (tier_hours * 50.00);
        remaining_hours := remaining_hours - tier_hours;
    END IF;
    
    -- Tier 4: 21-40 hours: $45.00 per hour
    IF remaining_hours > 0 THEN
        tier_hours := LEAST(remaining_hours, 20);
        total_price := total_price + (tier_hours * 45.00);
        remaining_hours := remaining_hours - tier_hours;
    END IF;
    
    -- Tier 5: 41+ hours: $40.00 per hour
    IF remaining_hours > 0 THEN
        total_price := total_price + (remaining_hours * 40.00);
    END IF;
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate development hours pricing
CREATE OR REPLACE FUNCTION calculate_development_price(hours INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_price DECIMAL(10,2) := 0;
    remaining_hours INTEGER := hours;
    tier_hours INTEGER;
BEGIN
    -- Tier 1: 1-8 hours: $90.00 per hour
    IF remaining_hours > 0 THEN
        tier_hours := LEAST(remaining_hours, 8);
        total_price := total_price + (tier_hours * 90.00);
        remaining_hours := remaining_hours - tier_hours;
    END IF;
    
    -- Tier 2: 9-20 hours: $85.00 per hour
    IF remaining_hours > 0 THEN
        tier_hours := LEAST(remaining_hours, 12);
        total_price := total_price + (tier_hours * 85.00);
        remaining_hours := remaining_hours - tier_hours;
    END IF;
    
    -- Tier 3: 21-40 hours: $80.00 per hour
    IF remaining_hours > 0 THEN
        tier_hours := LEAST(remaining_hours, 20);
        total_price := total_price + (tier_hours * 80.00);
        remaining_hours := remaining_hours - tier_hours;
    END IF;
    
    -- Tier 4: 41-80 hours: $75.00 per hour
    IF remaining_hours > 0 THEN
        tier_hours := LEAST(remaining_hours, 40);
        total_price := total_price + (tier_hours * 75.00);
        remaining_hours := remaining_hours - tier_hours;
    END IF;
    
    -- Tier 5: 81+ hours: $70.00 per hour
    IF remaining_hours > 0 THEN
        total_price := total_price + (remaining_hours * 70.00);
    END IF;
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql;

-- Create a table to store coupon codes
CREATE TABLE IF NOT EXISTS public.coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on coupon codes
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active coupon codes
CREATE POLICY "Allow read active coupons" ON public.coupon_codes
    FOR SELECT USING (active = true);

-- Insert the predefined coupon codes
INSERT INTO public.coupon_codes (code, discount_percent, description) VALUES
    ('WELCOME10', 10, '10% off first month'),
    ('ANNUAL20', 20, '20% off annual plans'),
    ('STARTUP50', 50, '50% off for startups'),
    ('STUDENT30', 30, '30% off for students'),
    ('REFERRAL15', 15, '15% off for referrals')
ON CONFLICT (code) DO NOTHING;