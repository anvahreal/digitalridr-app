-- 1. Add security_deposit to listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS security_deposit numeric DEFAULT 0;

-- 2. Add security_deposit to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS security_deposit numeric DEFAULT 0;

-- 3. Update process_booking_payment to include security_deposit
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
  p_payment_reference text,
  p_security_deposit numeric DEFAULT 0 -- New parameter
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
    security_deposit, -- Insert deposit
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
    p_security_deposit,
    'paid',
    'confirmed'
  )
  RETURNING id INTO v_booking_id;

  -- 2. Update Host Wallet (ONLY THE PAYOUT AMOUNT, NOT DEPOSIT)
  -- The deposit is held by the platform (or added to wallet but marked as held? 
  -- For now, we DO NOT add deposit to wallet balance to prevent withdrawal)
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
