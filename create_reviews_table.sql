-- ==============================================================================
-- REVIEWS SYSTEM MIGRATION
-- ==============================================================================

-- 1. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    guest_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Allow everyone to read reviews (public)
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

-- Allow authenticated users to insert reviews (linked to their own ID)
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = guest_id);

-- Allow users to delete their own reviews
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE TO authenticated 
USING (auth.uid() = guest_id);

-- 4. Trigger to Update Listing Rating
CREATE OR REPLACE FUNCTION public.update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.listings
    SET 
        rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id)),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id))
    WHERE id = COALESCE(NEW.listing_id, OLD.listing_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE PROCEDURE public.update_listing_rating();
