-- Fix semi-public profile visibility
-- Remove the current overly broad policy
DROP POLICY IF EXISTS "Public profile info viewable" ON public.profiles;

-- Create a proper semi-public policy that only allows viewing display_name and avatar_url
-- This policy should be combined with application-level field filtering
CREATE POLICY "Semi-public profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id 
  AND (display_name IS NOT NULL OR avatar_url IS NOT NULL)
);

-- Note: Application code should filter to only return display_name and avatar_url 
-- when using this policy for semi-public access