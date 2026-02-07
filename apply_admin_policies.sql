-- ==============================================================================
-- ADMIN PERMISSIONS FIX
-- ==============================================================================
-- This script explicitly grants administrative access to all key tables.
-- Run this in the SQL Editor to fix empty dashboards.

-- 1. PROFILES (Admins can view and edit everyone)
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select using ( true );

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles for update using ( 
  (select is_admin from public.profiles where id = auth.uid()) = true 
);

-- 2. LISTINGS (Admins can delete any listing)
drop policy if exists "Admins can delete any listing" on public.listings;
create policy "Admins can delete any listing" on public.listings for delete using ( 
  (select is_admin from public.profiles where id = auth.uid()) = true 
);

-- 3. BOOKINGS (Admins can view all bookings for revenue stats)
drop policy if exists "Admins can view all bookings" on public.bookings;
create policy "Admins can view all bookings" on public.bookings for select using ( 
  (select is_admin from public.profiles where id = auth.uid()) = true 
);

-- 4. PAYOUT REQUESTS (Admins can view and update all requests)
drop policy if exists "Admins can view all requests" on public.payout_requests;
create policy "Admins can view all requests" on public.payout_requests for select using ( 
  (select is_admin from public.profiles where id = auth.uid()) = true 
);

drop policy if exists "Admins can update all requests" on public.payout_requests;
create policy "Admins can update all requests" on public.payout_requests for update using ( 
  (select is_admin from public.profiles where id = auth.uid()) = true 
);

-- 5. HOST STATUS FIX (Ensure user is actually an admin)
update public.profiles 
set is_admin = true, host_status = 'approved' 
where id = auth.uid();
