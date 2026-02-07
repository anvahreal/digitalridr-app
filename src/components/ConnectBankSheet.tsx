import { useState } from "react";
import { Landmark, CheckCircle, Building2, ChevronDown, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

interface ConnectBankSheetProps {
  onAccountConnected?: () => void;
}

export function ConnectBankSheet({ onAccountConnected }: ConnectBankSheetProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bankName, setBankName] = useState("GTBank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();

  const handleVerify = async () => {
    if (accountNumber.length !== 10) {
      toast.error("Account number must be 10 digits");
      return;
    }
    setLoading(true);
    // Simulate API verification delay
    setTimeout(() => {
      setAccountName((profile?.full_name || "GUEST USER").toUpperCase());
      setStep(2);
      setLoading(false);
    }, 1500);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('payout_methods').insert({
        user_id: user.id,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        is_primary: true
      });

      if (error) throw error;

      toast.success("Bank account connected successfully!");
      setOpen(false);
      if (onAccountConnected) onAccountConnected();

      // Reset state after close
      setTimeout(() => {
        setStep(1);
        setAccountNumber("");
        setAccountName("");
      }, 500);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save bank account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-2xl border-2 font-black">Add Bank Account</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[3rem] p-8 max-w-2xl mx-auto border-none bg-card">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="h-16 w-16 bg-muted rounded-[1.5rem] flex items-center justify-center text-foreground">
              <Landmark size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground leading-tight">Where should we send your earnings?</h2>
              <p className="text-muted-foreground font-medium">Add a Nigerian bank account for direct payouts.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase ml-2">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-muted/50 border-none px-4 font-bold text-foreground focus:ring-2 ring-primary transition-all appearance-none"
                >
                  <option>GTBank</option>
                  <option>Zenith Bank</option>
                  <option>Access Bank</option>
                  <option>Kuda MFB</option>
                  <option>UBA</option>
                  <option>First Bank</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase ml-2">Account Number</label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="0123456789"
                  className="h-14 rounded-2xl bg-muted/50 border-none px-4 font-bold text-lg text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading || accountNumber.length < 10}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl hover:bg-primary/90"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Verify Account"}
            </Button>
          </div>
        ) : (
          <div className="py-10 text-center space-y-6">
            <div className="h-20 w-20 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">Account Verified!</h2>
              <p className="font-bold text-muted-foreground mt-2">{accountName} - {bankName}</p>
              <p className="text-sm text-muted-foreground font-medium">****{accountNumber.slice(-4)}</p>
            </div>
            <Button
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black hover:bg-primary/90"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Confirm & Save"}
            </Button>
            <Button variant="ghost" className="font-bold text-muted-foreground hover:bg-muted" onClick={() => setStep(1)} disabled={loading}>
              Back
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}