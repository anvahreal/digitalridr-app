import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';
import { toast } from 'sonner';

export function useFavorites() {
    const [favorites, setFavorites] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setFavorites([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('favorites')
                .select(`
          *,
          listing:listings(*)
        `)
                .eq('user_id', user.id);

            if (error) throw error;

            // Transform data to match Listing type if needed, or just extract the listing object
            // data is [{ id:..., listing: {...} }]
            const formattedFavorites = data.map((item: any) => item.listing).filter(Boolean);
            setFavorites(formattedFavorites);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const toggleFavorite = async (listingId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in to save favorites");
                return false;
            }

            // Check if already favorited
            const { data: existing } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('listing_id', listingId)
                .single();

            if (existing) {
                // Remove
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('id', existing.id);

                if (error) throw error;
                setFavorites(prev => prev.filter(f => f.id !== listingId));
                toast.success("Removed from favorites");
                return false;
            } else {
                // Add
                const { error } = await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, listing_id: listingId });

                if (error) throw error;

                // Fetch the full listing to add to local state immediately
                const { data: listing } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', listingId)
                    .single();

                if (listing) {
                    setFavorites(prev => [...prev, listing]);
                }

                toast.success("Added to favorites");
                return true;
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error("Failed to update favorites");
            return false;
        }
    };

    const isFavorite = (listingId: string) => {
        return favorites.some(f => f.id === listingId);
    };

    return { favorites, loading, toggleFavorite, isFavorite, refreshFavorites: fetchFavorites };
}
