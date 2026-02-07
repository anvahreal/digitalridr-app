import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";

interface BankTransferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    totalAmount: number;
    onConfirm: () => void;
    isProcessing: boolean;
}

export const BankTransferModal = ({
    open,
    onOpenChange,
    totalAmount,
    onConfirm,
    isProcessing,
}: BankTransferModalProps) => {
    const [copied, setCopied] = useState(false);

    // Mock Bank Details - In a real app, fetch from Env or DB
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Bank Transfer</DialogTitle>
                    <DialogDescription>
                        Please transfer the exact amount to the account below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="rounded-xl bg-orange-50 p-6 text-center">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total to Pay</p>
                        <p className="text-3xl font-black text-[#F48221] mt-2">
                            {formatNaira(totalAmount)}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4 bg-white">
                            <div>
                                <p className="text-xs text-slate-500">Bank Name</p>
                                <p className="font-bold text-slate-900">{bankDetails.bankName}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4 bg-white relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F48221]" />
                            <div>
                                <p className="text-xs text-slate-500">Account Number</p>
                                <p className="font-mono text-xl font-bold text-slate-900 tracking-wider">
                                    {bankDetails.accountNumber}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopy}
                                className="h-8 w-8 shrink-0"
                            >
                                {copied ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4 text-slate-400" />
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4 bg-white">
                            <div>
                                <p className="text-xs text-slate-500">Account Name</p>
                                <p className="font-bold text-slate-900">{bankDetails.accountName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button
                        className="w-full h-12 text-lg font-bold bg-[#F48221] hover:bg-[#E36D0B]"
                        onClick={onConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Verifying..." : "I have sent the money"}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
