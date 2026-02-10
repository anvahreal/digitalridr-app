-- ==============================================================================
-- SETUP NEW PROJECT SCRIPT
-- ==============================================================================
-- Run this entire script in the Supabase SQL Editor to set up your new project.
-- It combines the Master Schema, Fixes, and Policies.

-- ==============================================================================
-- PART 0: CLEANUP (Optional - Uncomment if re-running)
-- ==============================================================================
-- ==============================================================================
-- PART 0: CLEANUP (SAFE MODE - No Drop Tables)
-- ==============================================================================
-- The destructive DROP TABLE commands have been removed to prevent data loss.

-- ==============================================================================
-- PART 1: MASTER SCHEMA (Tables)
-- ==============================================================================

-- 1. PROFILES (Extends Auth)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  is_host boolean default false, -- kept for backward compatibility if needed, but status is better
  host_status text check (host_status in ('pending', 'approved', 'rejected', 'none')) default 'none',
  is_admin boolean default false,
  banned boolean default false,
  constraint username_length check (char_length(username) >= 3)
);
alter table public.profiles enable row level security;

-- Admin Policy: Admins can update any profile (to approve hosts)
create policy "Admins can update any profile" on public.profiles 
  for update using ( 
    (select is_admin from public.profiles where id = auth.uid()) = true 
  );

-- User Policy: Users can update their own profile
create policy "Users can update own profile" on public.profiles 
  for update using ( auth.uid() = id );

-- User Policy: Users can see all profiles (for simple social features, or limit to needed)
create policy "Users can view all profiles" on public.profiles
  for select using ( true );

-- User Policy: Users can insert their own profile
create policy "Users can insert own profile" on public.profiles 
  for insert with check ( auth.uid() = id );

-- 2. LISTINGS
create table if not exists public.listings (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  price_per_night numeric not null,
  location text not null,
  images text[] default '{}',
  amenities text[] default '{}',
  bedrooms integer default 1,
  bathrooms numeric default 1,
  max_guests integer default 1,
  city text,
  country text,
  is_superhost boolean default false,
  beds integer default 1,
  latitude numeric,
  longitude numeric,
  video_url text, -- Added for Virtual Tour
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rating numeric default 0,
  review_count integer default 0
);
alter table public.listings enable row level security;

-- 3. BOOKINGS
create table if not exists public.bookings (
    id uuid default gen_random_uuid() primary key,
    listing_id uuid references public.listings(id) not null,
    guest_id uuid references auth.users(id) not null,
    host_id uuid references auth.users(id) not null,
    check_in date not null,
    check_out date not null,
    guests integer default 1,
    total_price numeric not null,
    status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.bookings enable row level security;

-- 4. FAVORITES
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, listing_id)
);
alter table public.favorites enable row level security;

-- 5. PAYOUT METHODS
create table if not exists public.payout_methods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  is_primary boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.payout_methods enable row level security;

-- 6. PAYOUT REQUESTS
create table if not exists public.payout_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null,
  status text check (status in ('pending', 'paid', 'rejected')) default 'pending',
  bank_name text,
  account_number text,
  account_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.payout_requests enable row level security;

-- 7. CONVERSATIONS & MESSAGES
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users(id) not null,
  guest_id uuid references auth.users(id) not null,
  listing_id uuid references public.listings(id),
  last_message text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.conversations enable row level security;

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.messages enable row level security;


-- ==============================================================================
-- PART 2: STORAGE & POLICIES
-- ==============================================================================

-- 0. Ensure the bucket exists and is set to PUBLIC
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update
set public = true;

-- 1. Storage RLS Policies
drop policy if exists "Allow authenticated uploads" on storage.objects;
create policy "Allow authenticated uploads" on storage.objects for insert to authenticated with check ( bucket_id = 'listing-images' );

drop policy if exists "Allow public viewing" on storage.objects;
create policy "Allow public viewing" on storage.objects for select to public using ( bucket_id = 'listing-images' );

drop policy if exists "Allow individual update" on storage.objects;
create policy "Allow individual update" on storage.objects for update to authenticated using ( bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 2. Listings Policies
drop policy if exists "Public listings are viewable by everyone" on listings;
create policy "Public listings are viewable by everyone" on listings for select using ( true );

drop policy if exists "Users can insert their own listings" on listings;
create policy "Users can insert their own listings" on listings for insert to authenticated with check ( 
  auth.uid() = host_id AND
  exists (select 1 from public.profiles where id = auth.uid() and host_status = 'approved')
);

drop policy if exists "Users can update own listings" on listings;
create policy "Users can update own listings" on listings for update to authenticated using ( 
  auth.uid() = host_id AND
  exists (select 1 from public.profiles where id = auth.uid() and host_status = 'approved')
);

-- 3. Bookings Policies
drop policy if exists "Users can create bookings" on public.bookings;
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);

drop policy if exists "Users can view own bookings" on public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = guest_id);

drop policy if exists "Hosts can view bookings for their listings" on public.bookings;
CREATE POLICY "Hosts can view bookings for their listings" ON public.bookings FOR SELECT USING (
    EXISTS ( SELECT 1 FROM public.listings WHERE listings.id = bookings.listing_id AND listings.host_id = auth.uid() )
);

drop policy if exists "Hosts can update bookings" on public.bookings;
CREATE POLICY "Hosts can update bookings" ON public.bookings FOR UPDATE USING (
    EXISTS ( SELECT 1 FROM public.listings WHERE listings.id = bookings.listing_id AND listings.host_id = auth.uid() )
);

-- 4. Payout Requests Policies
drop policy if exists "Users can view own payout requests" on public.payout_requests;
create policy "Users can view own payout requests" on public.payout_requests for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own payout requests" on public.payout_requests;
create policy "Users can insert own payout requests" on public.payout_requests for insert with check (auth.uid() = user_id);

drop policy if exists "Admins can view all requests" on public.payout_requests;
create policy "Admins can view all requests" on public.payout_requests for select using ( true );

drop policy if exists "Admins can update all requests" on public.payout_requests;
create policy "Admins can update all requests" on public.payout_requests for update using ( true );

-- 5. Payout Methods Policies
drop policy if exists "Users can view own payout methods" on public.payout_methods;
create policy "Users can view own payout methods" on public.payout_methods for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own payout methods" on public.payout_methods;
create policy "Users can insert own payout methods" on public.payout_methods for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own payout methods" on public.payout_methods;
create policy "Users can update own payout methods" on public.payout_methods for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own payout methods" on public.payout_methods;
create policy "Users can delete own payout methods" on public.payout_methods for delete using (auth.uid() = user_id);

-- 5. Conversations Policies
drop policy if exists "Users can view their own conversations" on public.conversations;
create policy "Users can view their own conversations" on public.conversations for select using ( auth.uid() = host_id or auth.uid() = guest_id );

drop policy if exists "Users can insert conversations" on public.conversations;
create policy "Users can insert conversations" on public.conversations for insert with check ( auth.uid() = guest_id or auth.uid() = host_id );

drop policy if exists "Users can update their own conversations" on public.conversations;
create policy "Users can update their own conversations" on public.conversations for update using ( auth.uid() = host_id or auth.uid() = guest_id );

-- 6. Messages Policies
drop policy if exists "Users can view messages in their conversations" on public.messages;
create policy "Users can view messages in their conversations" on public.messages for select using ( exists (
    select 1 from public.conversations c 
    where c.id = messages.conversation_id 
    and (c.host_id = auth.uid() or c.guest_id = auth.uid())
));

drop policy if exists "Users can send messages to their conversations" on public.messages;
create policy "Users can send messages to their conversations" on public.messages for insert with check ( exists (
    select 1 from public.conversations c 
    where c.id = conversation_id 
    and (c.host_id = auth.uid() or c.guest_id = auth.uid())
));

-- ==============================================================================
-- PART 3: REALTIME
-- ==============================================================================
drop publication if exists supabase_realtime;
create publication supabase_realtime for table 
  public.listings, 
  public.bookings, 
  public.conversations, 
  public.messages, 
  public.payout_requests,
  public.profiles,
  public.favorites;

-- ==============================================================================
-- PART 4: TRIGGERS (Auto-create Profile)
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
