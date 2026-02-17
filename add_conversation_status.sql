-- Add status column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('inquiry', 'confirmed', 'declined')) DEFAULT 'inquiry';

-- Optional: Update existing rows if any
UPDATE public.conversations SET status = 'inquiry' WHERE status IS NULL;
