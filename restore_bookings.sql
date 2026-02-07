-- Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE NOT NULL,
    guests INTEGER DEFAULT 1,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can create bookings
CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Hosts can view bookings for their listings
CREATE POLICY "Hosts can view bookings for their listings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = bookings.listing_id
            AND listings.host_id = auth.uid()
        )
    );

-- 4. Hosts can update bookings for their listings (Accept/Reject)
CREATE POLICY "Hosts can update bookings" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = bookings.listing_id
            AND listings.host_id = auth.uid()
        )
    );
