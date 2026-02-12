-- ==============================================================================
-- FIX CALENDAR AVAILABILITY (SECURE RPC)
-- ==============================================================================
-- Problem: Guests cannot see existing bookings to check availability due to RLS privacy.
-- Solution: Create a secure function that returns ONLY the dates, not user details.

CREATE OR REPLACE FUNCTION get_blocked_dates(listing_id_input uuid)
RETURNS TABLE (
  check_in timestamp with time zone,
  check_out timestamp with time zone
) 
LANGUAGE plpgsql 
SECURITY DEFINER -- Runs with admin privileges to bypass RLS
AS $$
BEGIN
  RETURN QUERY
  SELECT b.check_in, b.check_out
  FROM bookings b
  WHERE b.listing_id = listing_id_input
    AND (b.status = 'confirmed' OR b.status = 'pending');
END;
$$;

-- Grant execute permission to everyone (public/authenticated)
GRANT EXECUTE ON FUNCTION get_blocked_dates TO authenticated;
GRANT EXECUTE ON FUNCTION get_blocked_dates TO anon;
