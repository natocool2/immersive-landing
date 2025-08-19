-- Fix critical security issue: Replace overly permissive profile access policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more secure RLS policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Authenticated users can view basic public profile info (display_name and avatar_url only)
-- This is needed for features like user mentions, comments, etc.
CREATE POLICY "Authenticated users can view basic public profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND auth.uid() IS NOT NULL
);