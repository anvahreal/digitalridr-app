import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useListing } from "@/hooks/useListings";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { RestrictedPaymentMethod } from "@/components/RestrictedPaymentMethod";
import { formatNaira } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import {
  Star,
  CreditCard,
  Shield,
  ChevronLeft,
  Wallet,
  Building2,
  Plus,
  Minus,
  Copy,
  CheckCircle2,
  Loader2,
  Info,
  Clock,
  Ban,
  Cigarette,
  PawPrint,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

import { BankTransferDetails } from "@/components/BankTransferDetails";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, loading: userLoading } = useProfile();

  // Basic Data
  const listingId = searchParams.get("listing") || undefined;
  const { listing, loading: listingLoading } = useListing(listingId);

  // Combine loading states
  const loading = userLoading || listingLoading;

  const rawCheckIn = searchParams.get("checkIn");
  const rawCheckOut = searchParams.get("checkOut");

  const checkIn = rawCheckIn && !isNaN(new Date(rawCheckIn).getTime())
    ? new Date(rawCheckIn)
    : new Date();

  const checkOut = rawCheckOut && !isNaN(new Date(rawCheckOut).getTime())
    ? new Date(rawCheckOut)
    : new Date(Date.now() + 86400000); // Next day default

  // UI States
  const [guests, setGuests] = useState(
    parseInt(searchParams.get("guests") || "1"),
  );
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isEditingGuests, setIsEditingGuests] = useState(false);
  // Dropdown States (Manual Accordion)
  const [openSection, setOpenSection] = useState<string | null>("house-rules");

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<
    "pending" | "success"
  >("pending");

  // Redirect if not logged in
  if (!userLoading && !user) {
    // Optional: You could render a message or redirect
    // Given the error was crash, let's redirect
    // But we can't redirect during render easily without useEffect, 
    // usually it's better to show a "Please login" state or use useEffect.
    // For now, I'll return a layout that redirects or tells them to login.
    // actually, using navigate in useEffect is better pattern, but here for simplicity:
    // returning null and navigating in useEffect would be best.
    // But let's check header/footer usage.
  }

  // Effect for redirect
  if (!userLoading && !user) {
    // We'll handle this with a visual prompted or effect.
    // However, since this is a straight fix, let's just show a login prompt instead of crashing
    // OR just verify in processBooking.
    // But the user asked for "Continue" implying they want it fixed.
    // The previous error was a crash.
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#F48221]" /></div>;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 inanimate-in zoom-in duration-500 delay-150">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-backwards">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Login Required</h1>
            <p className="text-muted-foreground font-medium">Please sign in or create an account to secure your booking.</p>
          </div>
          <div className="pt-4 animate-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-backwards">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
                navigate(`/auth?returnTo=${returnUrl}`);
              }}
            >
              Log In / Sign Up
            </Button>
            <Button
              variant="ghost"
              className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Listing not found</h1>
        <p className="text-slate-500">The property you are trying to book might have been removed.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const nights = Math.max(1, differenceInDays(checkOut, checkIn));
  const serviceFee = Math.round(nights * listing.price_per_night * 0.12);
  const total = nights * listing.price_per_night + serviceFee;

  const processBooking = async () => {
    setIsVerifying(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        guest_id: user.id,
        host_id: listing.host_id,
        listing_id: listingId,
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        total_price: total,
        guests: guests,
        status: 'pending'
      });

      if (error) throw error;

      // Simulate verification delay
      setTimeout(() => {
        setVerificationStep("success");
        toast.success("Booking request sent! Waiting for confirmation.");
        navigate("/dashboard");
      }, 2000);

    } catch (err: any) {
      console.error("Booking error:", err);
      toast.error(err.message || "Failed to process booking");
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main className="py-8">
        <div className="container max-w-5xl px-4">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Confirm and pay
            </h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              {/* Trip Details */}
              <Card className="border-none shadow-sm overflow-hidden bg-card rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                  <div className="p-5 flex justify-between items-center bg-transparent">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Dates
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {format(checkIn, "MMM d")} – {format(checkOut, "d")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/listing/${listingId}`)}
                      className="text-xs font-bold underline h-auto p-0 hover:bg-transparent text-foreground"
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="p-5 flex justify-between items-center bg-transparent">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Guests
                      </p>
                      {isEditingGuests ? (
                        <div className="flex items-center gap-3 mt-1">
                          <button
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{guests}</span>
                          <button
                            onClick={() => setGuests(Math.min(listing.max_guests, guests + 1))}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-foreground mt-1">
                          {guests} Guest{guests > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingGuests(!isEditingGuests)}
                      className="text-xs font-bold underline h-auto p-0 hover:bg-transparent text-foreground"
                    >
                      {isEditingGuests ? "Done" : "Edit"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Payment Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-foreground px-1">
                  Choose how to pay
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <RestrictedPaymentMethod active={false}>
                    <button
                      disabled
                      className={`w-full flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all border-border bg-muted/50`}
                    >
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[11px] font-bold capitalize text-muted-foreground">Card</span>
                    </button>
                  </RestrictedPaymentMethod>

                  <RestrictedPaymentMethod active={false}>
                    <button
                      disabled
                      className={`w-full flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all border-border bg-muted/50`}
                    >
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[11px] font-bold capitalize text-muted-foreground">Paystack</span>
                    </button>
                  </RestrictedPaymentMethod>

                  <button
                    onClick={() => setPaymentMethod("bank")}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all ${paymentMethod === "bank" ? "border-[#F48221] bg-orange-50/30" : "border-transparent bg-card shadow-sm"}`}
                  >
                    <Building2
                      className={`h-5 w-5 ${paymentMethod === "bank" ? "text-[#F48221]" : "text-muted-foreground"}`}
                    />
                    <span className="text-[11px] font-bold capitalize">
                      Bank
                    </span>
                  </button>
                </div>

                {/* Inline Bank Details */}
                {paymentMethod === "bank" && (
                  <BankTransferDetails totalAmount={total} />
                )}
              </div>

              {/* REWRITTEN DROPDOWNS (Things to Know) */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-foreground px-1">
                  Things to know
                </h3>

                {/* House Rules Dropdown */}
                <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
                  <button
                    onClick={() =>
                      setOpenSection(
                        openSection === "house-rules" ? null : "house-rules",
                      )
                    }
                    className="w-full flex items-center justify-between p-5 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        House Rules
                      </span>
                    </div>
                    {openSection === "house-rules" ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {openSection === "house-rules" && (
                    <div className="px-5 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-muted/50 rounded-xl p-4 mb-4">
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          "Welcome to my home! I only ask that you treat the
                          space with the same love and respect as you would your
                          own. Enjoy your stay!"
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              Check-in / Check-out
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Check-in starts 2:00 PM. Please checkout by 11:00
                              AM.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Ban className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              No Parties or Loud Music
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              This is a quiet residential area. Please keep
                              noise to a minimum after 10:00 PM.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Cigarette className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              Smoking Policy
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Strictly no smoking inside the building. Use the
                              balcony if necessary.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              General Care
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Please turn off the AC and lights when leaving the
                              apartment. Lock all doors.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cancellation Dropdown */}
                <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() =>
                      setOpenSection(
                        openSection === "cancellation" ? null : "cancellation",
                      )
                    }
                    className="w-full flex items-center justify-between p-5 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#F48221]">
                        <Info className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        Cancellation Policy
                      </span>
                    </div>
                    {openSection === "cancellation" ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {openSection === "cancellation" && (
                    <div className="px-5 pb-5 pt-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-4">
                        Free cancellation for 48 hours. After that, cancel
                        before check-in and get a 50% refund, minus the service
                        fee.
                      </p>
                      <div className="p-4 bg-muted/50 rounded-xl border border-border">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">
                          Full refund until
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          {format(
                            new Date(checkIn.getTime() - 48 * 60 * 60 * 1000),
                            "MMMM d, h:mm a",
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Button */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3 p-5 bg-card rounded-3xl border border-border">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(c) => setAgreedToTerms(c as boolean)}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-[11px] text-muted-foreground leading-tight cursor-pointer font-medium"
                  >
                    I agree to the House Rules, Cancellation Policy, and the
                    Refund Policy.
                  </Label>
                </div>
                <Button
                  size="lg"
                  className="w-full h-16 bg-[#F48221] hover:bg-orange-600 text-lg font-bold rounded-2xl shadow-xl text-white"
                  disabled={!agreedToTerms}
                  onClick={processBooking}
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                    </div>
                  ) : paymentMethod === "bank"
                    ? `I have sent ${formatNaira(total)}`
                    : "Confirm and pay"}
                </Button>
              </div>
            </div>

            {/* Price Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-card">
                <div className="p-6 bg-muted text-foreground flex gap-4">
                  <img
                    src={listing.images?.[0] || ""}
                    className="h-16 w-16 rounded-xl object-cover"
                    alt=""
                  />
                  <div>
                    <h3 className="text-sm font-bold line-clamp-2 text-foreground">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-orange-400 text-orange-400" />{" "}
                      {listing.rating}
                    </p>
                  </div>
                </div>
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      Total Stay
                    </span>
                    <span className="font-bold text-foreground">
                      {formatNaira(total)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black text-foreground">
                      Total
                    </span>
                    <span className="text-xl font-black text-foreground">
                      {formatNaira(total)}
                    </span>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                    <Shield className="h-5 w-5" /> Secure Checkout
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />


    </div>
  );
};

export default Checkout;
