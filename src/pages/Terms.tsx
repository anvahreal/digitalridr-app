import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Scale, FileText, AlertCircle, HelpCircle } from "lucide-react";

const Terms = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#F48221] selection:text-black">
            <Header />

            <main className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="h-16 w-16 bg-[#F48221]/10 rounded-2xl flex items-center justify-center text-[#F48221] mb-6">
                        <Scale size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium max-w-2xl">
                        Please read these terms carefully before using our services.
                    </p>
                </div>

                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                    <Section
                        icon={FileText}
                        title="1. Acceptance of Terms"
                        content="By accessing or using the Digital Ridr platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
                    />

                    <Section
                        icon={AlertCircle}
                        title="2. User Responsibilities"
                        content="You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password."
                    />

                     <Section
                        icon={HelpCircle}
                        title="3. Questions & Contact"
                        content="If you have any questions about these Terms, please contact us at support@digitalridr.com."
                    />
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

export default Terms;
