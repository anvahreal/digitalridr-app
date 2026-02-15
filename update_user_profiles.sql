-- ==============================================================================
-- MIGRATION: Add Date of Birth and Phone Number to Profiles
-- ==============================================================================

-- 1. Add new columns to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS phone_number text;

-- 2. Update the handle_new_user trigger function to capture these fields
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username, date_of_birth, phone_number)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    (new.raw_user_meta_data->>'date_of_birth')::date,
    new.raw_user_meta_data->>'phone_number'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
