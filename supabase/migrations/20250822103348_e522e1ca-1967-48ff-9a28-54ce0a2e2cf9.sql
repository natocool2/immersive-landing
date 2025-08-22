-- Fix security issue: Restrict coupon code access to authenticated users only
-- Remove the current public read policy
DROP POLICY IF EXISTS "Allow read active coupons" ON public.coupon_codes;

-- Create new policy that requires authentication for reading coupon codes
CREATE POLICY "Authenticated users can read active coupons" ON public.coupon_codes
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND active = true);

-- Create a secure function for validating coupon codes without exposing all codes
CREATE OR REPLACE FUNCTION public.validate_coupon_code(coupon_code_input TEXT)
RETURNS TABLE(
    code TEXT,
    discount_percent INTEGER,
    description TEXT,
    active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
    -- Only return the specific coupon if it exists and is active
    RETURN QUERY
    SELECT 
        c.code,
        c.discount_percent,
        c.description,
        c.active
    FROM public.coupon_codes c
    WHERE UPPER(c.code) = UPPER(coupon_code_input) 
    AND c.active = true
    LIMIT 1;
END;
$$;

-- Allow anyone to execute the validation function (but not read the table directly)
GRANT EXECUTE ON FUNCTION public.validate_coupon_code(TEXT) TO anon, authenticated;