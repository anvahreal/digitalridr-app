-- ==========================================
-- STAY BNB VIBE / DIGITAL RIDR - MASTER SCHEMA
-- ==========================================
-- Use this script to understand the full database structure.
-- Be careful running this on an existing DB as it may resort to default values if tables are re-created,
-- though 'IF NOT EXISTS' is used where possible.

-- 1. PROFILES (Extends Auth)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  is_host boolean default false,
  is_admin boolean default false,  -- God Mode
  banned boolean default false,    -- Ban Hammer
  
  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

-- 2. LISTINGS
create table if not exists public.listings (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  price_per_night numeric not null,
  location text not null,
  images text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Logic fields
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

-- 5. PAYOUT METHODS (Bank Details)
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

-- 6. PAYOUT REQUESTS (Withdrawals)
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

-- ==========================================
-- POLICIES (Simplified for Overview)
-- ==========================================
-- Note: actual RLS policies are complex (view own data, etc). 
-- This section is a placeholder to remind you that RLS must be enabled.
-- (Refer to fix_schema.sql for the specific RLS definitions used recently)

-- ==========================================
-- REALTIME
-- ==========================================
drop publication if exists supabase_realtime;
create publication supabase_realtime for table 
  public.listings, 
  public.bookings, 
  public.conversations, 
  public.messages, 
  public.payout_requests;
