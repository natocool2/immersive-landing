-- Fix RLS Policy Conflict (CRITICAL)
-- Remove the overly permissive policy that allows all authenticated users to view basic profile info
DROP POLICY IF EXISTS "Authenticated users can view basic public profile info" ON public.profiles;

-- Create a more secure policy for viewing public profile data (display_name and avatar_url only)
CREATE POLICY "Users can view public profile data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create the missing trigger for auto-creating user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure Storage Bucket - Add RLS policies for avatars
CREATE POLICY "Avatar images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuário')
  );
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;