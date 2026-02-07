-- Run these commands in your Supabase SQL Editor

-- 0. Ensure the bucket exists and is set to PUBLIC
-- This is critical for getPublicUrl to work
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update
set public = true;


-- 1. Enable Storage RLS Policies for 'listing-images' bucket

-- Allow uploads (INSERT) for authenticated users
drop policy if exists "Allow authenticated uploads" on storage.objects;
create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check ( bucket_id = 'listing-images' );

-- Allow viewing (SELECT) for everyone (public)
drop policy if exists "Allow public viewing" on storage.objects;
create policy "Allow public viewing"
on storage.objects
for select
to public
using ( bucket_id = 'listing-images' );

-- Allow updates for users who own the file (optional, for editing)
drop policy if exists "Allow individual update" on storage.objects;
create policy "Allow individual update"
on storage.objects
for update
to authenticated
using ( bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1] );


-- 2. Enable Listings Table Policies

-- Enable RLS on listings table
alter table listings enable row level security;

-- Allow anyone to view listings
drop policy if exists "Public listings are viewable by everyone" on listings;
create policy "Public listings are viewable by everyone"
on listings for select
using ( true );

-- Allow authenticated users to insert their own listings
drop policy if exists "Users can insert their own listings" on listings;
create policy "Users can insert their own listings"
on listings for insert
to authenticated
with check ( auth.uid() = host_id );

-- Allow users to update their own listings
drop policy if exists "Users can update own listings" on listings;
create policy "Users can update own listings"
on listings for update
to authenticated
using ( auth.uid() = host_id );
