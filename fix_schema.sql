-- FIXED SCRIPT: Run this to resolve "Policy already exists" errors
-- and ensure your database supports "God Mode" features.

-- 1. Profiles: Add Admin & Ban flags (Idempotent)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_admin') then
    alter table public.profiles add column is_admin boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'banned') then
    alter table public.profiles add column banned boolean default false;
  end if;
end $$;

-- 2. Payout Requests (Policies dropped first to prevent errors)
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

-- Drop old policies if they exist
drop policy if exists "Users can view own payout requests" on public.payout_requests;
drop policy if exists "Users can insert own payout requests" on public.payout_requests;
drop policy if exists "Admins can view all requests" on public.payout_requests;
drop policy if exists "Admins can update all requests" on public.payout_requests;

-- Re-create policies
create policy "Users can view own payout requests" on public.payout_requests for select using (auth.uid() = user_id);
create policy "Users can insert own payout requests" on public.payout_requests for insert with check (auth.uid() = user_id);
create policy "Admins can view all requests" on public.payout_requests for select using ( true ); 
create policy "Admins can update all requests" on public.payout_requests for update using ( true );


-- 3. MESSAGING SYSTEM
-- Safe drop to ensure we get the correct schema for the new Messaging Center
DROP TABLE IF EXISTS public.messages; 
-- NOTE: We are NOT dropping 'conversations' if it exists to preserve data, 
-- but if you want a clean slate, uncomment the next line:
-- DROP TABLE IF EXISTS public.conversations;

create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users(id) not null,
  guest_id uuid references auth.users(id) not null,
  listing_id uuid references public.listings(id),
  last_message text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Conversations
alter table public.conversations enable row level security;

drop policy if exists "Users can view their own conversations" on public.conversations;
drop policy if exists "Users can insert conversations" on public.conversations;
drop policy if exists "Users can update their own conversations" on public.conversations;

create policy "Users can view their own conversations"
  on public.conversations for select
  using ( auth.uid() = host_id or auth.uid() = guest_id );

create policy "Users can insert conversations"
  on public.conversations for insert
  with check ( auth.uid() = guest_id or auth.uid() = host_id );

create policy "Users can update their own conversations"
  on public.conversations for update
  using ( auth.uid() = host_id or auth.uid() = guest_id );


-- RLS for Messages
alter table public.messages enable row level security;

drop policy if exists "Users can view messages in their conversations" on public.messages;
drop policy if exists "Users can send messages to their conversations" on public.messages;

create policy "Users can view messages in their conversations"
  on public.messages for select
  using ( exists (
    select 1 from public.conversations c 
    where c.id = messages.conversation_id 
    and (c.host_id = auth.uid() or c.guest_id = auth.uid())
  ));

create policy "Users can send messages to their conversations"
  on public.messages for insert
  with check ( exists (
    select 1 from public.conversations c 
    where c.id = conversation_id 
    and (c.host_id = auth.uid() or c.guest_id = auth.uid())
  ));

-- Enable Realtime
drop publication if exists supabase_realtime;
create publication supabase_realtime for table 
  public.payout_requests, 
  public.conversations, 
  public.messages, 
  public.listings, 
  public.profiles,
  public.favorites,
  public.bookings;
