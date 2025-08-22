-- Remove the current policy that allows all authenticated users to see coupons
DROP POLICY IF EXISTS "Authenticated users can read active coupons" ON public.coupon_codes;

-- Create a more restrictive policy - only allow access through functions
CREATE POLICY "No direct access to coupon codes" ON public.coupon_codes
FOR ALL
USING (false);

-- Create a secure function to validate coupon codes without exposing all codes
CREATE OR REPLACE FUNCTION public.validate_coupon_secure(coupon_code_input text)
RETURNS TABLE(valid boolean, discount_percent integer, description text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only return validation result, not the actual code
    RETURN QUERY
    SELECT 
        CASE WHEN c.code IS NOT NULL THEN true ELSE false END as valid,
        COALESCE(c.discount_percent, 0) as discount_percent,
        COALESCE(c.description, '') as description
    FROM (
        SELECT 
            discount_percent,
            description
        FROM public.coupon_codes c
        WHERE UPPER(c.code) = UPPER(coupon_code_input) 
        AND c.active = true
        LIMIT 1
    ) c;
    
    -- If no coupon found, return invalid result
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, ''::text;
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_coupon_secure(text) TO authenticated;