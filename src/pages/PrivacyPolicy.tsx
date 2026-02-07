import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#F48221] selection:text-black">
            <Header />

            <main className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="h-16 w-16 bg-[#F48221]/10 rounded-2xl flex items-center justify-center text-[#F48221] mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium max-w-2xl">
                        We value your trust and are committed to protecting your personal data.
                    </p>
                </div>

                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                    <Section
                        icon={Eye}
                        title="1. Information We Collect"
                        content="We collect information you provide directly to us, such as when you create an account, update your profile, make a booking, or communicate with us. This may include your name, email address, phone number, and payment information."
                    />

                    <Section
                        icon={FileText}
                        title="2. How We Use Your Information"
                        content="We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you related information, and to communicate with you about products, services, offers, and events."
                    />

                    <Section
                        icon={Lock}
                        title="3. Data Security"
                        content="We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage."
                    />

                    <div className="p-6 bg-muted/30 rounded-3xl border border-border mt-8">
                        <h3 className="font-bold text-lg mb-2">Contact Us</h3>
                        <p className="text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@digitalridr.com" className="text-[#F48221] hover:underline">privacy@digitalridr.com</a>.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const Section = ({ icon: Icon, title, content }: { icon: any, title: string, content: string }) => (
    <div className="flex gap-6">
        <div className="shrink-0 mt-1">
            <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-foreground">
                <Icon size={20} />
            </div>
        </div>
        <div>
            <h2 className="text-xl font-bold mb-3 text-foreground">{title}</h2>
            <p className="text-muted-foreground leading-relaxed">
                {content}
            </p>
        </div>
    </div>
);

export default PrivacyPolicy;
