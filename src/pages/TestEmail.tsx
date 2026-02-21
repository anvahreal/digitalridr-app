
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendNotificationEmail } from "@/lib/email";
import { toast } from "sonner";

const TestEmail = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSend = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await sendNotificationEmail(
                email,
                "Test Email from DigitalRidr 🧪",
                "<p>If you are reading this, the <b>DigitalRidr Email System</b> is working perfectly! 🚀</p>"
            );
            setResult(response);
            if (response.success && !response.data?.error) {
                toast.success("Email sent!");
            } else {
                toast.error("Failed to send email");
            }
        } catch (error: any) {
            setResult({ error: error.message || error });
            toast.error("Error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
            <div className="w-full max-w-md bg-background p-8 rounded-2xl shadow-xl border border-border">
                <h1 className="text-2xl font-black mb-4">Email System Check 🧪</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Enter an email address to verify connections to Supabase Edge Functions and Resend.
                    <br /><br />
                    <span className="font-bold text-orange-500">Note:</span> If you are on Resend Free Tier, you can ONLY send to the email you signed up with.
                </p>

                <div className="space-y-4">
                    <Input
                        placeholder="Enter destination email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        className="w-full font-bold"
                        onClick={handleSend}
                        disabled={loading || !email}
                    >
                        {loading ? "Sending..." : "Send Test Email"}
                    </Button>
                </div>

                {result && (
                    <div className="mt-8 p-4 bg-slate-950 text-slate-50 text-xs font-mono rounded-lg overflow-auto max-h-60">
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestEmail;
