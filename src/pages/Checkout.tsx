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
import { mockListings } from "@/data/mockListings";
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

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Basic Data
  const listingId = searchParams.get("listing");
  const listing = mockListings.find((l) => l.id === listingId);
  const checkIn = new Date(searchParams.get("checkIn") || Date.now());
  const checkOut = new Date(searchParams.get("checkOut") || Date.now());

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

  if (!listing) return null;

  const nights = Math.max(1, differenceInDays(checkOut, checkIn));
  const serviceFee = Math.round(nights * listing.price_per_night * 0.12);
  const total = nights * listing.price_per_night + serviceFee;

  const handlePaymentSubmit = () => {
    if (paymentMethod === "bank") {
      setIsVerifying(true);
      setTimeout(() => setVerificationStep("success"), 4000);
    } else {
      toast.success("Payment Successful!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Confirm and pay
            </h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              {/* Trip Details */}
              <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Dates
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {format(checkIn, "MMM d")} – {format(checkOut, "d")}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Guests
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {guests} Guest{guests > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Payment Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 px-1">
                  Choose how to pay
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {["card", "paystack", "bank"].map((id) => (
                    <button
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all ${paymentMethod === id ? "border-[#F48221] bg-orange-50/30" : "border-white bg-white shadow-sm"}`}
                    >
                      {id === "card" && (
                        <CreditCard
                          className={`h-5 w-5 ${paymentMethod === id ? "text-[#F48221]" : "text-slate-400"}`}
                        />
                      )}
                      {id === "paystack" && (
                        <Wallet
                          className={`h-5 w-5 ${paymentMethod === id ? "text-[#F48221]" : "text-slate-400"}`}
                        />
                      )}
                      {id === "bank" && (
                        <Building2
                          className={`h-5 w-5 ${paymentMethod === id ? "text-[#F48221]" : "text-slate-400"}`}
                        />
                      )}
                      <span className="text-[11px] font-bold capitalize">
                        {id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* REWRITTEN DROPDOWNS (Things to Know) */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 px-1">
                  Things to know
                </h3>

                {/* House Rules Dropdown */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                  <button
                    onClick={() =>
                      setOpenSection(
                        openSection === "house-rules" ? null : "house-rules",
                      )
                    }
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">
                        House Rules
                      </span>
                    </div>
                    {openSection === "house-rules" ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>

                  {openSection === "house-rules" && (
                    <div className="px-5 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-slate-50/50 rounded-xl p-4 mb-4">
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          "Welcome to my home! I only ask that you treat the
                          space with the same love and respect as you would your
                          own. Enjoy your stay!"
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              Check-in / Check-out
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Check-in starts 2:00 PM. Please checkout by 11:00
                              AM.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Ban className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              No Parties or Loud Music
                            </p>
                            <p className="text-[11px] text-slate-500">
                              This is a quiet residential area. Please keep
                              noise to a minimum after 10:00 PM.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Cigarette className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              Smoking Policy
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Strictly no smoking inside the building. Use the
                              balcony if necessary.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Shield className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              General Care
                            </p>
                            <p className="text-[11px] text-slate-500">
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
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() =>
                      setOpenSection(
                        openSection === "cancellation" ? null : "cancellation",
                      )
                    }
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F48221]">
                        <Info className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">
                        Cancellation Policy
                      </span>
                    </div>
                    {openSection === "cancellation" ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  {openSection === "cancellation" && (
                    <div className="px-5 pb-5 pt-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                        Free cancellation for 48 hours. After that, cancel
                        before check-in and get a 50% refund, minus the service
                        fee.
                      </p>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          Full refund until
                        </p>
                        <p className="text-xs font-bold text-slate-700">
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
                <div className="flex items-start gap-3 p-5 bg-orange-50/40 rounded-3xl border border-orange-100/50">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(c) => setAgreedToTerms(c as boolean)}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-[11px] text-slate-500 leading-tight cursor-pointer font-medium"
                  >
                    I agree to the House Rules, Cancellation Policy, and the
                    Refund Policy.
                  </Label>
                </div>
                <Button
                  size="lg"
                  className="w-full h-16 bg-[#F48221] hover:bg-orange-600 text-lg font-bold rounded-2xl shadow-xl shadow-orange-200"
                  disabled={!agreedToTerms}
                  onClick={handlePaymentSubmit}
                >
                  {paymentMethod === "bank"
                    ? "I have made the transfer"
                    : "Confirm and pay"}
                </Button>
              </div>
            </div>

            {/* Price Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white">
                <div className="p-6 bg-slate-900 text-white flex gap-4">
                  <img
                    src={listing.images[0]}
                    className="h-16 w-16 rounded-xl object-cover"
                    alt=""
                  />
                  <div>
                    <h3 className="text-sm font-bold line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-orange-400 text-orange-400" />{" "}
                      {listing.rating}
                    </p>
                  </div>
                </div>
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                      Total Stay
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatNaira(total)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black text-slate-900">
                      Total
                    </span>
                    <span className="text-xl font-black text-slate-900">
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
