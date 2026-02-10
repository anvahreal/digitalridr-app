-- Add video_url column to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Comment on column
COMMENT ON COLUMN public.listings.video_url IS 'URL for YouTube virtual tour video';
