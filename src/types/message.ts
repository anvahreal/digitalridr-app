export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: string;
    listing_id?: string;
    host_id: string;
    guest_id: string;
    status: 'inquiry' | 'confirmed' | 'declined';
    last_message?: string;
    updated_at: string;
    listing?: {
        title: string;
        images: string[];
    };
    // Helper fields for UI (to store profile info joined)
    other_user?: {
        full_name: string;
        avatar_url: string;
    };
}
