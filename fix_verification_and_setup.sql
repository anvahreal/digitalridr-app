-- ==============================================================================
-- FIX VERIFICATION & SETUP SCRIPT
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to ensure the Identity Verification
-- system works correctly.

-- 1. Create the 'secure-documents' Bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('secure-documents', 'secure-documents', false) -- Private bucket
ON CONFLICT (id) DO NOTHING;

-- 2. Skip enabling RLS (already enabled and managed by system)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow Users to Upload their OWN documents
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'secure-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Allow Users to View their OWN documents (for previews if needed)
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects 
FOR SELECT TO authenticated 
USING (
  bucket_id = 'secure-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow Admins to View ALL documents (for verification)
-- Note: Requires an 'is_admin' check on the profile or similar mechanism.
-- For now, we'll assume the 'review_identity_verification' function bypasses RLS via security definer,
-- but for direct access:
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents" ON storage.objects 
FOR SELECT TO authenticated 
USING (
  bucket_id = 'secure-documents' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 6. Ensure the 'submit_identity_verification' RPC exists
CREATE OR REPLACE FUNCTION submit_identity_verification(
  doc_url text,
  selfie_url_input text
) 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  UPDATE profiles
  SET 
    identity_doc_url = doc_url,
    selfie_url = selfie_url_input,
    verification_status = 'pending',
    verification_submitted_at = now()
  WHERE id = auth.uid();
END;
$$;
