-- Enable RLS on listings if not already enabled (it should be)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to delete any listing
CREATE POLICY "Admins can delete any listing"
ON listings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
