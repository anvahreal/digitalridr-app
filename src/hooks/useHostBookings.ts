import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';

export interface Booking {
    id: string;
    listing_id: string;
    user_id: string;
    check_in: string;
    check_out: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    guests: number;
    created_at: string;
    listing?: {
        title: string;
        location: string;
        images: string[];
    };
    start_date: string; // Legacy support if needed
    end_date: string;
}

export function useHostBookings() {
    const { user } = useProfile();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        if (!user) return;
        try {
            setLoading(true);

            const { data: listings, error: listingsError } = await supabase
                .from('listings')
                .select('id')
                .eq('host_id', user.id);

            if (listingsError) throw listingsError;

            const listingIds = listings.map(l => l.id);

            if (listingIds.length === 0) {
                setBookings([]);
                return;
            }

            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select('*, listing:listings(title)')
                .in('listing_id', listingIds)
                .order('created_at', { ascending: false });

            if (bookingsError) throw bookingsError;

            if (bookingsData) {
                setBookings(bookingsData as any);
            }
        } catch (err: any) {
            console.error("Error fetching bookings:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user]);

    return { bookings, loading, error, refetch: fetchBookings };
}
