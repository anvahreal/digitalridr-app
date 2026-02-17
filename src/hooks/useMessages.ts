import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Conversation, Message } from '@/types/message';
import { useProfile } from './useProfile';

export function useMessages() {
    const { user } = useProfile();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Conversations
    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    listing:listings(title, images)
                `)
                .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
                .order('updated_at', { ascending: false });

            if (data && !error) {
                // Fetch profiles for the "other" user in each chat
                const enriched = await Promise.all(data.map(async (conv) => {
                    const otherUserId = conv.host_id === user.id ? conv.guest_id : conv.host_id;
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('id', otherUserId)
                        .maybeSingle();

                    return {
                        ...conv,
                        other_user: {
                            full_name: profile?.full_name || 'Unknown User',
                            avatar_url: profile?.avatar_url || ''
                        }
                    };
                }));
                setConversations(enriched as Conversation[]);
            }
            setLoading(false);
        };

        fetchConversations();

        // Subscribe to new conversations (e.g. new inquiry)
        const sub = supabase
            .channel('conversations_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations', filter: `host_id=eq.${user.id}` },
                () => fetchConversations() // excessive but simple for now
            )
            .subscribe();

        return () => { supabase.removeChannel(sub); };

    }, [user]);

    // Fetch Messages for Selected Chat
    useEffect(() => {
        if (!selectedChatId) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', selectedChatId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        // Realtime Messages Subscription
        const sub = supabase
            .channel(`chat_${selectedChatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedChatId}` },
                (payload) => {
                    setMessages(curr => [...curr, payload.new as Message]);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [selectedChatId]);

    const sendMessage = async (content: string) => {
        if (!selectedChatId || !user) return;

        await supabase.from('messages').insert({
            conversation_id: selectedChatId,
            sender_id: user.id,
            content
        });

        // Update conversation timestamp locally and on server
        await supabase.from('conversations').update({
            last_message: content,
            updated_at: new Date().toISOString()
        }).eq('id', selectedChatId);
    };

    const startConversation = async (otherUserId: string, listingId: string) => {
        if (!user) throw new Error("User not authenticated");

        // 1. Check if conversation already exists
        const { data: existingConvs } = await supabase
            .from('conversations')
            .select('*')
            .or(`and(host_id.eq.${user.id},guest_id.eq.${otherUserId}),and(host_id.eq.${otherUserId},guest_id.eq.${user.id})`)
            .eq('listing_id', listingId) // Open specific chat for this listing if possible
            .limit(1);

        if (existingConvs && existingConvs.length > 0) {
            return existingConvs[0].id;
        }

        // 2. Create new conversation
        const { data: newConv, error } = await supabase
            .from('conversations')
            .insert({
                host_id: otherUserId, // Assuming user is guest contacting host
                guest_id: user.id,
                listing_id: listingId,
                status: 'inquiry'
            })
            .select()
            .single();

        if (error) throw error;
        return newConv.id;
    };

    return {
        conversations,
        messages,
        selectedChatId,
        setSelectedChatId,
        loading,
        sendMessage,
        startConversation,
        currentUserId: user?.id
    };
}
