-- ==============================================================================
-- FIX GUEST CANCELLATION POLICY
-- ==============================================================================
-- Problem: Guests could not cancel their own bookings because there was no UPDATE policy for guests.
-- Solution: Add a policy allowing guests to update bookings where they are the guest_id.

DROP POLICY IF EXISTS "Guests can update own bookings" ON public.bookings;

CREATE POLICY "Guests can update own bookings" ON public.bookings 
FOR UPDATE 
USING (
  auth.uid() = guest_id
);

-- Note: This allows guests to update their own bookings (e.g. to set status = 'cancelled').
