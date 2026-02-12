-- ==============================================================================
-- MASTER FIX SCRIPT (Run this to fix ALL issues)
-- ==============================================================================

-- 1. FIX: VERIFICATION SETUP & STORAGE
-- Create the 'secure-documents' Bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('secure-documents', 'secure-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow Users to Upload their OWN documents (Drop first to avoid error)
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK ( bucket_id = 'secure-documents' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Policy: Allow Users to View their OWN documents
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects 
FOR SELECT TO authenticated 
USING ( bucket_id = 'secure-documents' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Ensure the 'submit_identity_verification' RPC exists
CREATE OR REPLACE FUNCTION submit_identity_verification(doc_url text, selfie_url_input text) 
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles
  SET identity_doc_url = doc_url, selfie_url = selfie_url_input, verification_status = 'pending', verification_submitted_at = now()
  WHERE id = auth.uid();
END;
$$;


-- 2. FIX: ADMIN DASHBOARD VIEW
-- Drop first to handle column changes
DROP VIEW IF EXISTS public.pending_verifications;
-- Recreate the view without the 'email' column (which is in auth.users, not profiles)
CREATE OR REPLACE VIEW public.pending_verifications AS
SELECT 
  id,
  full_name,
  avatar_url,
  identity_doc_url,
  selfie_url,
  verification_status,
  verification_submitted_at
FROM public.profiles
WHERE verification_status = 'pending';

GRANT SELECT ON public.pending_verifications TO authenticated;
GRANT SELECT ON public.pending_verifications TO service_role;

-- Ensure Review RPC exists
CREATE OR REPLACE FUNCTION review_identity_verification(user_id_input uuid, status_input text, rejection_reason_input text DEFAULT NULL) 
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles
  SET verification_status = status_input
  WHERE id = user_id_input;
END;
$$;


-- 3. FIX: CALENDAR AVAILABILITY (SECURE RPC)
-- Secure function to get booked dates without exposing user info
CREATE OR REPLACE FUNCTION get_blocked_dates(listing_id_input uuid)
RETURNS TABLE (check_in timestamp with time zone, check_out timestamp with time zone) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT b.check_in, b.check_out
  FROM bookings b
  WHERE b.listing_id = listing_id_input AND (b.status = 'confirmed' OR b.status = 'pending');
END;
$$;

GRANT EXECUTE ON FUNCTION get_blocked_dates TO authenticated;
GRANT EXECUTE ON FUNCTION get_blocked_dates TO anon;
