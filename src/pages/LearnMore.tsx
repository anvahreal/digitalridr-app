import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, CreditCard, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LearnMore = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />

            {/* Hero Section */}
            <section className="py-20 px-4 text-center space-y-6 bg-muted/30">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                    Transparency at <span className="text-primary">Digital Ridr</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
                    We believe in clear pricing and honest relationships with our hosts and guests.
                    Here is exactly how our platform works.
                </p>
            </section>

            {/* Main Content */}
            <main className="container max-w-4xl px-4 py-16 space-y-16">

                {/* The 10% Fee Section */}
                <section className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
                    <div className="space-y-6">
                        <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-[#F48221]" />
                        </div>
                        <h2 className="text-3xl font-black text-foreground">Our 10% Service Fee</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            To keep Digital Ridr running smoothly, secure, and constantly improving, we charge a
                            <strong className="text-foreground"> 10% service fee</strong> on every booking.
                        </p>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-foreground">What does this cover?</h3>
                            <ul className="space-y-3">
                                {[
                                    "Secure payment processing via Paystack",
                                    "24/7 Customer Support for hosts and guests",
                                    "Marketing to bring more guests to your listings",
                                    "Platform maintenance and new feature development"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-soft">
                        <h4 className="font-bold text-sm mb-4">Example Breakdown</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Guest Pays</span>
                                <span className="font-bold">₦100,000</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Platform Fee (10%)</span>
                                <span>- ₦10,000</span>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="flex justify-between text-emerald-600 font-bold text-base">
                                <span>Host Receives</span>
                                <span>₦90,000</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust & Safety */}
                <section className="space-y-6">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground">Trust & Safety</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Your safety is our priority. We verify hosts and provide secure payment channels to ensure
                        that your money is safe until you check in.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                        <div className="p-6 bg-muted rounded-3xl space-y-3">
                            <h3 className="font-bold text-foreground">For Guests</h3>
                            <p className="text-sm text-muted-foreground">
                                Book with confidence knowing that our support team is here to help if anything goes wrong
                                during your stay.
                            </p>
                        </div>
                        <div className="p-6 bg-muted rounded-3xl space-y-3">
                            <h3 className="font-bold text-foreground">For Hosts</h3>
                            <p className="text-sm text-muted-foreground">
                                We protect your property by vetting guests and handling payments securely before arrival.
                            </p>
                        </div>
                    </div>
                </section>

                {/* About Company */}
                <section className="space-y-6">
                    <div className="h-12 w-12 rounded-2xl bg-pink-100 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-pink-600" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground">About Digital Ridr</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Digital Ridr is Nigeria's premier short-let apartment booking platform. We connect travelers
                        with unique, verified homes across the country, providing a seamless and secure alternative
                        to traditional hotels.
                    </p>
                </section>

                <div className="pt-8 text-center">
                    <Button onClick={() => navigate('/')} size="lg" className="rounded-2xl font-bold px-8 h-14 text-base">
                        Start Exploring
                    </Button>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default LearnMore;
