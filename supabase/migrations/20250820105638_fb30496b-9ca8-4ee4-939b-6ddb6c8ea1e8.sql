-- Remove duplicate RLS policy to avoid confusion
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;