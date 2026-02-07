-- SEED DATA SCRIPT (EXPANDED FOR ANALYTICS)
-- Run this in your Supabase SQL Editor.

-- Ensure pgcrypto is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id uuid;
  new_listing_id uuid;
  check_user_id uuid;
  i integer;
  j integer;
  k integer;
  locations text[] := ARRAY['Ikoyi', 'Victoria Island', 'Lekki Phase 1', 'Banana Island', 'Ikeja GRA', 'Maitama', 'Asokoro', 'Wuse II', 'Gwarinpa', 'Trans Amadi'];
  titles text[] := ARRAY['Luxury Penthouse', 'Cozy Studio', 'Modern Apartment', 'Spacious Villa', 'Executive Suite', 'Beach House', 'Garden Loft', 'City Center Flat'];
  images text[] := ARRAY[
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1502005229762-cf1afd3da504?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1600596542815-2a43302e1319?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60'
  ];
  booking_status text;
  payout_status text;
  
BEGIN
  -- 1. CLEANUP (Optional - comment out if you want to keep data)
  -- DELETE FROM public.bookings;
  -- DELETE FROM public.listings;
  -- DELETE FROM public.profiles;
  -- Note: We generally can't delete auth.users easily from here due to constraints.

  -- 2. CREATE 50 USERS
  FOR i IN 1..50 LOOP
    -- Check if user already exists
    SELECT id INTO check_user_id FROM auth.users WHERE email = 'host' || i || '@test.com';

    IF check_user_id IS NULL THEN
        new_user_id := gen_random_uuid();

        -- Insert into auth.users
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 'host' || i || '@test.com',
          crypt('password123', gen_salt('bf')), now(), jsonb_build_object('full_name', 'Host User ' || i), now(), now()
        );

        -- Insert Profile
        INSERT INTO public.profiles (
          id, updated_at, full_name, avatar_url, is_admin, banned
        ) VALUES (
          new_user_id, now(), 'Host User ' || i, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || i, false, (i % 20 = 0) -- 5% banned
        );

        -- Insert 2-3 Listings per Host
        FOR j IN 1..(2 + (i % 2)) LOOP
            new_listing_id := gen_random_uuid();
            
            INSERT INTO public.listings (
              id, host_id, title, description, location, city, country, price_per_night, max_guests, bedrooms, beds, bathrooms, amenities, images, created_at, rating, review_count, is_superhost
            ) VALUES (
              new_listing_id,
              new_user_id,
              titles[1 + (j % 8)] || ' in ' || locations[1 + (i % 10)],
              'Experience the best of ' || locations[1 + (i % 10)] || ' in this stunning property. Fully furnished with modern amenities.',
              locations[1 + (i % 10)], 'Lagos', 'Nigeria',
              50000 + (j * 15000) + (i * 1000), 
              2 + (j % 6), 1 + (j % 3), 1 + (j % 4), 1 + (j % 3),
              ARRAY['WiFi', 'Pool', '24/7 Power', 'Air Conditioning', 'Kitchen', 'Security'],
              ARRAY[images[1 + (j % 8)], images[1 + ((j+1) % 8)]],
              now() - (i || ' days')::interval, 
              3.5 + (j * 0.5), 
              5 + (i * 2), 
              (i % 3 = 0)
            );

            -- Insert Bookings for this listing (Revenue Data)
            FOR k IN 1..(3 + (i % 3)) LOOP
                booking_status := CASE WHEN (k + i) % 3 = 0 THEN 'pending' WHEN (k + i) % 3 = 1 THEN 'confirmed' ELSE 'completed' END;
                
                INSERT INTO public.bookings (
                    listing_id, user_id, check_in, check_out, total_price, status, created_at, guests
                ) VALUES (
                    new_listing_id,
                    new_user_id, -- Self booking for simplicity in seed (or use random guest if possible)
                    now() - ((k * 5) || ' days')::interval,
                    now() - ((k * 5 - 3) || ' days')::interval,
                    (50000 + (j * 15000) + (i * 1000)) * 3, -- 3 nights price
                    booking_status,
                    now() - ((k * 5 + 2) || ' days')::interval,
                    2
                );
            END LOOP;
        END LOOP;

        -- Insert Withdrawal Requests (Payouts Data)
        IF i % 3 = 0 THEN
            payout_status := CASE WHEN i % 2 = 0 THEN 'paid' WHEN i % 5 = 0 THEN 'rejected' ELSE 'pending' END;
            
            INSERT INTO public.payout_requests (
                user_id, amount, status, bank_name, account_number, account_name, created_at
            ) VALUES (
                new_user_id,
                150000 + (i * 5000),
                payout_status,
                'Access Bank',
                '00' || i || '123456',
                'Host User ' || i,
                now() - (i || ' hours')::interval
            );
        END IF;

    END IF;
  END LOOP;

  -- 3. MARVELLOUS PROPERTIES (Explicitly Requested)
  -- Check if Marvellous exists
  SELECT id INTO check_user_id FROM auth.users WHERE email = 'marvellous@properties.com';
  
  IF check_user_id IS NULL THEN
      new_user_id := gen_random_uuid();
      
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 'marvellous@properties.com',
        crypt('marvellous123', gen_salt('bf')), now(), jsonb_build_object('full_name', 'Marvellous Properties'), now(), now()
      );

      INSERT INTO public.profiles (
        id, updated_at, full_name, avatar_url, is_admin, banned
      ) VALUES (
        new_user_id, now(), 'Marvellous Properties', 'https://api.dicebear.com/7.x/initials/svg?seed=MP', true, false
      );

      -- Marvellous Listings
      INSERT INTO public.listings (
         host_id, title, description, location, city, country, price_per_night, max_guests, bedrooms, beds, bathrooms, amenities, images, created_at, rating, review_count, is_superhost
      ) VALUES 
      (
         new_user_id, 
         'Marvellous Properties - Royal Suite', 
         'The most exquisite stay in Lagos.', 
         'Eko Atlantic', 'Lagos', 'Nigeria', 500000, 4, 2, 2, 2, 
         ARRAY['WiFi', 'Pool', 'Jacuzzi', 'Helipad', 'Private Chef'], 
         ARRAY[images[1], images[2]], now(), 5.0, 100, true
      ),
      (
         new_user_id, 
         'Marvellous Properties - Ocean View', 
         'Breathtaking views of the Atlantic.', 
         'Victoria Island', 'Lagos', 'Nigeria', 350000, 2, 1, 1, 1, 
         ARRAY['WiFi', 'Gym', 'Ocean View', 'Smart Home'], 
         ARRAY[images[3], images[4]], now(), 4.9, 85, true
      );
  END IF;

END $$;
