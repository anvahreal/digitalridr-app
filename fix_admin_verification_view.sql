-- ==============================================================================
-- FIX ADMIN VERIFICATION VIEW
-- ==============================================================================
-- Run this script to ensure the 'pending_verifications' view exists and is accessible.

-- 1. Create the View (if it doesn't exist or to update it)
DROP VIEW IF EXISTS public.pending_verifications;
CREATE OR REPLACE VIEW public.pending_verifications AS
SELECT 
  id,
  full_name,
  -- email, -- Removed as it doesn't exist in profiles table
  avatar_url,
  identity_doc_url,
  selfie_url,
  verification_status,
  verification_submitted_at
FROM public.profiles
WHERE verification_status = 'pending';

-- 2. Grant Permissions
GRANT SELECT ON public.pending_verifications TO authenticated;
GRANT SELECT ON public.pending_verifications TO service_role;

-- 3. Ensure the 'review_identity_verification' RPC exists and is correct
CREATE OR REPLACE FUNCTION review_identity_verification(
  user_id_input uuid,
  status_input text, -- 'verified' or 'rejected'
  rejection_reason_input text DEFAULT NULL
) 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  UPDATE profiles
  SET 
    verification_status = status_input,
    -- If rejected, we might want to plain 'unverified' or keep 'rejected' state?
    -- Let's stick to status_input which should be 'verified' or 'rejected'.
    identity_doc_url = CASE WHEN status_input = 'rejected' THEN NULL ELSE identity_doc_url END,
    selfie_url = CASE WHEN status_input = 'rejected' THEN NULL ELSE selfie_url END
  WHERE id = user_id_input;
  
  -- Log the action (Optional, good for audit)
  -- INSERT INTO admin_logs ...
END;
$$;
