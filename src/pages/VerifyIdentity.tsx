import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, Shield, Camera, Upload, CheckCircle2 } from "lucide-react";

const VerifyIdentity = () => {
    const navigate = useNavigate();
    const { profile, loading: profileLoading } = useProfile();
    const [uploading, setUploading] = useState(false);
    const [idFile, setIdFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);

    // Preview URLs
    const [idPreview, setIdPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'selfie') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }

            const previewUrl = URL.createObjectURL(file);

            if (type === 'id') {
                setIdFile(file);
                setIdPreview(previewUrl);
            } else {
                setSelfieFile(file);
                setSelfiePreview(previewUrl);
            }
        }
    };

    const uploadFile = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('secure-documents')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('secure-documents')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        if (!idFile || !selfieFile) {
            toast.error("Please upload both documents");
            return;
        }

        setUploading(true);
        try {
            // 1. Upload ID
            const idUrl = await uploadFile(idFile, `${profile.id}/identity`);

            // 2. Upload Selfie
            const selfieUrl = await uploadFile(selfieFile, `${profile.id}/selfie`);

            // 3. Update Profile via RPC (or direct update if policy allows, but we use RPC/direct for now)
            // We'll try direct update first as per our migration script allowing it (though we didn't explicitly set policies yet)
            // Actually, we created a function `submit_identity_verification` in the SQL script! Let's use that.

            const { error } = await supabase.rpc('submit_identity_verification', {
                doc_url: idUrl,
                selfie_url_input: selfieUrl
            });

            if (error) throw error;

            toast.success("Verification submitted successfully!");
            navigate("/dashboard");

        } catch (error: any) {
            console.error("Verification error:", error);
            toast.error(error.message || "Failed to submit verification");
        } finally {
            setUploading(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (profile?.verification_status === 'verified') {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container max-w-lg py-20 text-center space-y-6">
                    <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold">You are Verified!</h1>
                    <p className="text-muted-foreground">
                        Your identity has been confirmed. You have full access to all Digital Ridr features.
                    </p>
                    <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                </main>
                <Footer />
            </div>
        );
    }

    if (profile?.verification_status === 'pending') {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container max-w-lg py-20 text-center space-y-6">
                    <div className="mx-auto h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Shield className="h-12 w-12 text-yellow-600" />
                    </div>
                    <h1 className="text-3xl font-bold">Verification Pending</h1>
                    <p className="text-muted-foreground">
                        We are reviewing your documents. This usually takes less than 24 hours.
                        We'll notify you once approved.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <main className="container max-w-xl py-12">
                <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-8">

                    <div className="text-center space-y-2">
                        <div className="mx-auto h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Verify Your Identity</h1>
                        <p className="text-muted-foreground text-sm">
                            To ensure safety for everyone on Digital Ridr, we need to verify your identity before you can check in.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Government ID Upload */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">1. Government Issue ID</Label>
                            <p className="text-xs text-muted-foreground -mt-3 mb-2">
                                Passport, Driver's License, or NIN Slip. Clear photo, no glare.
                            </p>

                            <div
                                className={`border-2 border-dashed border-border rounded-2xl p-6 text-center hover:bg-muted/50 transition-colors relative ${idPreview ? 'border-primary/50 bg-primary/5' : ''}`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'id')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />

                                {idPreview ? (
                                    <div className="relative h-48 w-full group">
                                        <img src={idPreview} alt="ID Preview" className="h-full w-full object-contain rounded-lg" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white font-medium flex items-center gap-2"><Upload className="h-4 w-4" /> Change File</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 py-8">
                                        <div className="mx-auto h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium">Click to upload ID</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selfie Upload */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">2. Selfie with your ID</Label>
                            <p className="text-xs text-muted-foreground -mt-3 mb-2">
                                Take a photo holding your ID next to your face. Make sure both are clear.
                            </p>

                            <div
                                className={`border-2 border-dashed border-border rounded-2xl p-6 text-center hover:bg-muted/50 transition-colors relative ${selfiePreview ? 'border-primary/50 bg-primary/5' : ''}`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'selfie')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />

                                {selfiePreview ? (
                                    <div className="relative h-48 w-full group">
                                        <img src={selfiePreview} alt="Selfie Preview" className="h-full w-full object-contain rounded-lg" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white font-medium flex items-center gap-2"><Camera className="h-4 w-4" /> Change Photo</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 py-8">
                                        <div className="mx-auto h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                            <Camera className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium">Click to upload Selfie</p>
                                        <p className="text-xs text-muted-foreground">Make sure face is visible</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold rounded-xl"
                            disabled={uploading || !idFile || !selfieFile}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                </>
                            ) : (
                                "Submit Verification"
                            )}
                        </Button>

                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default VerifyIdentity;
