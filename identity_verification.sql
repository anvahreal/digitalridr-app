-- Identity Verification System (Trust Pass)

-- 1. Create Enum for Verification Status (if not exists)
DO $$ BEGIN
    CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Alter profiles table to add verification columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_status verification_status_enum DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS identity_doc_url text, -- URL to the ID document
ADD COLUMN IF NOT EXISTS selfie_url text,       -- URL to the selfie
ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 3. Create a Secure Storage Bucket for Identity Documents
-- Note: You'll effectively need to create this bucket 'secure-documents' in the Supabase Dashboard
-- manually to ensure it's "Private" (Public Access disabled).

-- 4. RLS Policies for the Storage Bucket (Conceptual - applied in Supabase Storage UI or via SQL if enabled)
-- ALLOW INSERT: Authenticated users can upload to their own folder
-- ALLOW SELECT: Users can see their own files, Admins can see all.

-- 5. Create a View for Admin Dashboard to easily see pending verifications
CREATE OR REPLACE VIEW pending_verifications 
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.full_name,
  au.email, -- Get email from auth.users
  NULL as phone_number, -- Phone not in profiles, placeholder for now
  p.avatar_url,
  p.verification_status,
  p.identity_doc_url,
  p.selfie_url,
  p.verification_submitted_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.verification_status = 'pending'
ORDER BY p.verification_submitted_at ASC;

-- 6. Function to submit verification (updates profile)
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

-- 7. Function for Admin to Approve/Reject
CREATE OR REPLACE FUNCTION review_identity_verification(
  target_user_id uuid,
  new_status verification_status_enum,
  reason text DEFAULT null
) 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  -- Check if executing user is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE profiles
  SET 
    verification_status = new_status,
    rejection_reason = reason
  WHERE id = target_user_id;
END;
$$;
