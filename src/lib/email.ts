
import { supabase } from "./supabase";

/**
 * Invokes the 'send-email' Supabase Edge Function.
 * @param to Array of email addresses or single email string
 * @param subject Email subject
 * @param html Email HTML content
 * @returns { success: boolean, data?: any, error?: any }
 */
export const sendNotificationEmail = async (
    to: string | string[],
    subject: string,
    html: string
) => {
    try {
        const toArray = Array.isArray(to) ? to : [to];

        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                to: toArray,
                subject,
                html,
            },
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
