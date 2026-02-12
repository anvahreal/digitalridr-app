-- ==============================================================================
-- MASTER SCHEMA COMBINED (v3.0 - Consolidated)
-- ==============================================================================
-- This script contains the COMPLETE database setup for the DigitalRidr application.
-- It integrates all fixes for:
-- 1. Identity Verification (Enums, Avatars, Admin Review)
-- 2. Booking Visibility (Foreign Keys to Profiles)
-- 3. Check-in Instructions (Wifi, Access Codes)
-- 4. RLS Policies & Storage Buckets

-- ==============================================================================
-- PART 0: TYPES & ENUMS
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status_enum') THEN
        CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
    END IF;
END
$$;

-- ==============================================================================
-- PART 1: TABLES
-- ==============================================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  is_host boolean default false,
  host_status text check (host_status in ('pending', 'approved', 'rejected', 'none')) default 'none',
  is_admin boolean default false,
  banned boolean default false,
  -- Verification Fields
  verification_status verification_status_enum default 'unverified',
  identity_doc_url text,
  selfie_url text,
  rejection_reason text, -- Added for admin feedback
  verification_submitted_at timestamp with time zone,
  -- Wallet
  wallet_balance numeric default 0,
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
  amenities text[] default '{}',
  house_rules text[] default '{}',
  bedrooms integer default 1,
  bathrooms numeric default 1,
  max_guests integer default 1,
  city text,
  country text,
  is_superhost boolean default false,
  beds integer default 1,
  latitude numeric,
  longitude numeric,
  video_url text,
  address text,
  security_deposit numeric default 0,
  -- Check-in Instructions (Host Only / Confirmed Guest)
  wifi_name text,
  wifi_password text,
  access_code text,
  check_in_instructions text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rating numeric default 0,
  review_count integer default 0
);
alter table public.listings enable row level security;

-- 3. BOOKINGS
-- NOTE: Foreign Keys reference PUBLIC.PROFILES to allow easy Joining/UI access
create table if not exists public.bookings (
    id uuid default gen_random_uuid() primary key,
    listing_id uuid references public.listings(id) not null,
    guest_id uuid references auth.users(id) on delete cascade not null, -- Fixed: Ref auth.users to avoid profile dependency
    host_id uuid references auth.users(id) on delete cascade not null,  -- Fixed: Ref auth.users to avoid profile dependency
    check_in date not null,
    check_out date not null,
    guests integer default 1,
    total_price numeric not null,
    status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
    payment_reference text,
    payment_status text default 'pending',
    platform_fee numeric default 0,
    host_payout_amount numeric default 0,
    security_deposit numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.bookings enable row level security;

-- 4. PAYOUT METHODS
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

-- 5. PAYOUT REQUESTS
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

-- 6. CONVERSATIONS & MESSAGES
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

-- 7. FAVORITES
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, listing_id)
);
alter table public.favorites enable row level security;

-- ==============================================================================
-- PART 2: STORAGE BUCKETS
-- ==============================================================================

-- 1. Listing Images (Public)
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true) ON CONFLICT (id) DO NOTHING;

-- 2. Avatars (Public - for Profile Pictures & Verified Selfies)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- 3. Secure Documents (Private - for Verification)
INSERT INTO storage.buckets (id, name, public) VALUES ('secure-documents', 'secure-documents', false) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- PART 3: RLS POLICIES
-- ==============================================================================

-- --- PROFILES ---
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- --- LISTINGS ---
DROP POLICY IF EXISTS "Public listings are viewable by everyone" ON listings;
CREATE POLICY "Public listings are viewable by everyone" ON listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
CREATE POLICY "Users can insert their own listings" ON listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Users can update own listings" ON listings;
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE TO authenticated USING (auth.uid() = host_id);

-- --- BOOKINGS ---
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" ON bookings 
FOR SELECT USING (
    auth.uid() = guest_id OR auth.uid() = host_id
);

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can view own bookings via host_id" ON bookings;

DROP POLICY IF EXISTS "Hosts can update bookings" ON bookings;
CREATE POLICY "Hosts can update bookings" ON bookings FOR UPDATE USING (
    host_id = auth.uid()
);

-- --- STORAGE POLICIES ---

-- Listing Images
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images');
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
CREATE POLICY "Allow public viewing" ON storage.objects FOR SELECT TO public USING (bucket_id = 'listing-images');

-- Avatars
DROP POLICY IF EXISTS "Avatars images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
CREATE POLICY "Anyone can upload an avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() = owner);

-- Secure Documents
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'secure-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'secure-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'secure-documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- --- PAYOUTS & METHODS ---
DROP POLICY IF EXISTS "Users can manage own payout methods" ON payout_methods;
CREATE POLICY "Users can manage own payout methods" ON payout_methods FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own payout requests" ON payout_requests;
CREATE POLICY "Users can view own payout requests" ON payout_requests FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create payout requests" ON payout_requests;
CREATE POLICY "Users can create payout requests" ON payout_requests FOR INSERT WITH CHECK (user_id = auth.uid());

-- --- CONVERSATIONS & MESSAGES ---
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
CREATE POLICY "Users can insert conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.host_id = auth.uid() OR c.guest_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
CREATE POLICY "Users can send messages to their conversations" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.host_id = auth.uid() OR c.guest_id = auth.uid())
  )
);

-- --- FAVORITES ---
DROP POLICY IF EXISTS "Users can manage their favorites" ON favorites;
CREATE POLICY "Users can manage their favorites" ON favorites FOR ALL USING (user_id = auth.uid());

-- ==============================================================================
-- PART 4: VIEWS & TRIGGERS
-- ==============================================================================

-- 1. Pending Verifications View
DROP VIEW IF EXISTS public.pending_verifications;
CREATE OR REPLACE VIEW public.pending_verifications AS
SELECT id, full_name, avatar_url, identity_doc_url, selfie_url, verification_status, verification_submitted_at
FROM public.profiles
WHERE verification_status = 'pending';

GRANT SELECT ON public.pending_verifications TO authenticated;
GRANT SELECT ON public.pending_verifications TO service_role;

-- 2. New User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- PART 5: RPC FUNCTIONS
-- ==============================================================================

-- 1. Get Blocked Dates
CREATE OR REPLACE FUNCTION get_blocked_dates(listing_id_input uuid)
RETURNS TABLE (check_in timestamp with time zone, check_out timestamp with time zone) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT b.check_in, b.check_out FROM bookings b
  WHERE b.listing_id = listing_id_input AND (b.status = 'confirmed' OR b.status = 'pending');
END;
$$;
GRANT EXECUTE ON FUNCTION get_blocked_dates TO authenticated;
GRANT EXECUTE ON FUNCTION get_blocked_dates TO anon;

-- 2. Submit Verification
CREATE OR REPLACE FUNCTION submit_identity_verification(doc_url text, selfie_url_input text) 
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET identity_doc_url = doc_url, selfie_url = selfie_url_input, verification_status = 'pending', verification_submitted_at = now()
  WHERE id = auth.uid();
END;
$$;

-- 3. Review Verification (Improved)
CREATE OR REPLACE FUNCTION review_identity_verification(
    user_id_input uuid, 
    status_input text, 
    rejection_reason_input text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF status_input NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be "verified" or "rejected".';
  END IF;

  UPDATE public.profiles
  SET 
    verification_status = status_input::verification_status_enum,
    identity_doc_url = CASE WHEN status_input = 'rejected' THEN NULL ELSE identity_doc_url END,
    selfie_url = CASE WHEN status_input = 'rejected' THEN NULL ELSE selfie_url END,
    rejection_reason = rejection_reason_input,
    verification_submitted_at = CASE WHEN status_input = 'rejected' THEN NULL ELSE verification_submitted_at END
  WHERE id = user_id_input;
END;
$$;

-- 4. Process Booking Payment
CREATE OR REPLACE FUNCTION public.process_booking_payment(
  p_listing_id uuid, p_guest_id uuid, p_host_id uuid,
  p_check_in date, p_check_out date, p_guests integer,
  p_total_price numeric, p_platform_fee numeric, p_host_payout_amount numeric,
  p_payment_reference text, p_security_deposit numeric DEFAULT 0
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_booking_id uuid;
BEGIN
  INSERT INTO public.bookings (
    listing_id, guest_id, host_id, check_in, check_out, guests, total_price, platform_fee, host_payout_amount, payment_reference, security_deposit, payment_status, status
  ) VALUES (
    p_listing_id, p_guest_id, p_host_id, p_check_in, p_check_out, p_guests, p_total_price, p_platform_fee, p_host_payout_amount, p_payment_reference, p_security_deposit, 'paid', 'confirmed'
  ) RETURNING id INTO v_booking_id;

  UPDATE public.profiles SET wallet_balance = COALESCE(wallet_balance, 0) + p_host_payout_amount WHERE id = p_host_id;

  RETURN json_build_object('success', true, 'booking_id', v_booking_id);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
