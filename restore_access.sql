-- RESTORE ADMIN & HOST ACCESS
-- Run this script in the Supabase SQL Editor if you get logged out or your profile is missing.

-- 1. Create or Update your Profile
insert into public.profiles (id, full_name, avatar_url, host_status, is_host, is_admin, updated_at)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', email), 
  coalesce(raw_user_meta_data->>'avatar_url', ''), 
  'approved', -- Automatically approve host status
  true,       -- Set is_host to true
  true,       -- Restore Admin status
  now()
from auth.users
where id = auth.uid() -- Only for the current logged-in user running this script
on conflict (id) do update
set 
  host_status = 'approved',
  is_host = true,
  is_admin = true,
  updated_at = now();

-- 2. Verify it worked (Optional)
select id, email, is_admin, host_status from public.profiles where id = auth.uid();
