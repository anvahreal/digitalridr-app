-- SECURE TABLES SCRIPT (FIXED)
-- Run this in Supabase SQL Editor to apply missing RLS policies

-- 1. PROFILES
-- Enable RLS
alter table public.profiles enable row level security;

-- Allow public read access (needed for listing details, reviews, etc.)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
on public.profiles for select
using ( true );

-- Allow users to update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using ( auth.uid() = id );


-- 2. BOOKINGS
-- Enable RLS
alter table public.bookings enable row level security;

-- Guests can view their own bookings (CORRECTED column: user_id)
drop policy if exists "Guests can view own bookings" on public.bookings;
create policy "Guests can view own bookings"
on public.bookings for select
using ( auth.uid() = user_id );

-- Hosts can view bookings for their listings
drop policy if exists "Hosts can view bookings for their listings" on public.bookings;
create policy "Hosts can view bookings for their listings"
on public.bookings for select
using ( 
  exists (select 1 from public.listings where id = listing_id and host_id = auth.uid())
);

-- Authenticated users can create bookings (CORRECTED column: user_id)
drop policy if exists "Users can create bookings" on public.bookings;
create policy "Users can create bookings"
on public.bookings for insert
with check ( auth.uid() = user_id );

-- 3. FAVORITES
-- Enable RLS
alter table public.favorites enable row level security;

-- Users can view their own favorites
drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
on public.favorites for select
using ( auth.uid() = user_id );

-- Users can add favorites
drop policy if exists "Users can add favorites" on public.favorites;
create policy "Users can add favorites"
on public.favorites for insert
with check ( auth.uid() = user_id );

-- Users can remove favorites
drop policy if exists "Users can remove favorites" on public.favorites;
create policy "Users can remove favorites"
on public.favorites for delete
using ( auth.uid() = user_id );
