-- RESTORE ADMIN & HOST ACCESS
-- Run this script in the Supabase SQL Editor to make 'marvellouskayode17@gmail.com' an admin.

INSERT INTO public.profiles (id, full_name, avatar_url, host_status, is_host, is_admin, updated_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', email), 
  COALESCE(raw_user_meta_data->>'avatar_url', ''), 
  'approved', -- Automatically approve host status
  true,       -- Set is_host to true
  true,       -- Set is_admin to true
  now()
FROM auth.users
WHERE email = 'marvellouskayode17@gmail.com' -- Target specific email
ON CONFLICT (id) DO UPDATE
SET 
  host_status = 'approved',
  is_host = true,
  is_admin = true,
  updated_at = now();

-- 2. Verify it worked
select id, username, full_name, is_admin, host_status 
from public.profiles 
where id = (select id from auth.users where email = 'marvellouskayode17@gmail.com');
