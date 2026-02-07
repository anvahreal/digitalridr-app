import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';

export interface Booking {
    id: string;
    listing_id: string;
    user_id: string;
    check_in: string; // Database column name might be check_in or start_date, verifying via supbase types or just using standardized names and mapping
    check_out: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    guests: number;
    created_at: string;
    listings: {
        title: string;
        location: string;
        images: string[];
    };
}

export const useUserBookings = () => {
    const { user } = useProfile();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchBookings = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select(`
            *,
            listings (
              title,
              location,
              images
            )
          `)
                    .eq('guest_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setBookings(data || []);
            } catch (err) {
                console.error('Error fetching user bookings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    return { bookings, loading };
};
