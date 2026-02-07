import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";

interface BankTransferDetailsProps {
    totalAmount: number;
}

export const BankTransferDetails = ({ totalAmount }: BankTransferDetailsProps) => {
    const [copied, setCopied] = useState(false);

    // Mock Bank Details
    const bankDetails = {
        bankName: "Zenith Bank",
        accountNumber: "1229759363",
        accountName: "Digital Ridr App.",
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(bankDetails.accountNumber);
        setCopied(true);
        toast.success("Account number copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300 mt-4 rounded-3xl overflow-hidden border-2 border-[#F48221]/20 bg-orange-50/30 dark:bg-orange-950/10">
            {/* Header / Warning */}
            <div className="bg-orange-100/50 dark:bg-orange-900/20 p-4 flex gap-3 text-orange-800 dark:text-orange-200 text-xs font-medium border-b border-orange-200/50 dark:border-orange-900/30">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>Transfer the exact amount below to complete your booking.</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Amount Display */}
                <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        Total Amount
                    </p>
                    <p className="text-3xl font-black text-foreground mt-1">
                        {formatNaira(totalAmount)}
                    </p>
                </div>

                {/* Account Details Card */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-1">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Bank Name</p>
                            <p className="font-bold text-foreground text-sm">{bankDetails.bankName}</p>
                        </div>
                    </div>

                    <div className="p-4 flex justify-between items-center bg-muted/30">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Account Number</p>
                            <p className="font-mono text-xl font-bold text-foreground tracking-wider">
                                {bankDetails.accountNumber}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            className="h-9 w-9 bg-background shadow-sm border border-border hover:bg-muted"
                        >
                            {copied ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    </div>

                    <div className="p-4 border-t border-border">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Account Name</p>
                            <p className="font-bold text-foreground text-sm">{bankDetails.accountName}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
                        <Shield className="h-3 w-3" />
                        <span>Payments are secure and encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
