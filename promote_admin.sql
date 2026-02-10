-- ==============================================================================
-- PROMOTE TO ADMIN SCRIPT
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to make a user an admin.
-- Replace 'hotmailblvck17@gmail.com' with the user's email if it's different.

UPDATE public.profiles
SET is_admin = true, host_status = 'approved'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'hotmailblvck17@gmail.com'
);

-- Verify the update
SELECT email, is_admin FROM auth.users 
JOIN public.profiles ON auth.users.id = public.profiles.id
WHERE email = 'hotmailblvck17@gmail.com';
