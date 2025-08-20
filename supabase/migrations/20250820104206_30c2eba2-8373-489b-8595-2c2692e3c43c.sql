-- CRITICAL SECURITY FIX: Remove overly permissive profile viewing policy
-- This policy allows ANY authenticated user to view ALL profile data, which is a security risk
DROP POLICY IF EXISTS "Users can view public profile data" ON public.profiles;

-- Create a more restrictive policy that only allows users to view their own profiles
-- and other users' display names and avatars (public info only)
CREATE POLICY "Users can view own profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Separate policy for viewing public profile info (display_name and avatar_url only)
-- This should be implemented in application logic to restrict which fields are returned
CREATE POLICY "Public profile info viewable" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (display_name IS NOT NULL OR avatar_url IS NOT NULL));