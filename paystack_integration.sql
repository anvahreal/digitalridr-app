-- ==============================================================================
-- PAYSTACK INTEGRATION & WALLET SYSTEM
-- ==============================================================================

-- 1. Update Bookings Table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS host_payout_amount numeric DEFAULT 0;

-- 2. Update Profiles Table (Host Wallet)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

-- 3. Atomic Function to Process Payment & Booking
-- This ensures the booking is created AND the wallet is updated in one go.
CREATE OR REPLACE FUNCTION public.process_booking_payment(
  p_listing_id uuid,
  p_guest_id uuid,
  p_host_id uuid,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_total_price numeric,
  p_platform_fee numeric,
  p_host_payout_amount numeric,
  p_payment_reference text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id uuid;
BEGIN
  -- 1. Insert Booking
  INSERT INTO public.bookings (
    listing_id,
    guest_id,
    host_id,
    check_in,
    check_out,
    guests,
    total_price,
    platform_fee,
    host_payout_amount,
    payment_reference,
    payment_status,
    status
  ) VALUES (
    p_listing_id,
    p_guest_id,
    p_host_id,
    p_check_in,
    p_check_out,
    p_guests,
    p_total_price,
    p_platform_fee,
    p_host_payout_amount,
    p_payment_reference,
    'paid',     -- Assumes this is called after successful payment
    'confirmed' -- Auto-confirm since it's paid (or keep 'pending' if host must approve)
  )
  RETURNING id INTO v_booking_id;

  -- 2. Update Host Wallet
  UPDATE public.profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + p_host_payout_amount
  WHERE id = p_host_id;

  -- 3. Return Result
  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
