import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { format } from "date-fns";
import { Printer, AlertTriangle, Ban, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

// --- MANAGE BOOKING DIALOG ---
export const ManageBookingDialog = ({ booking, open, onOpenChange, onUpdate }: any) => {
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', booking.id);

            if (error) throw error;
            toast.success("Booking cancelled successfully.");
            onUpdate();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Booking</DialogTitle>
                    <DialogDescription>
                        {booking.listings?.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3 text-sm text-slate-600">
                        <div>
                            <p><span className="font-bold">Check-in:</span> {format(new Date(booking.check_in), "MMM d, yyyy")}</p>
                            <p><span className="font-bold">Check-out:</span> {format(new Date(booking.check_out), "MMM d, yyyy")}</p>
                        </div>
                    </div>

                    {booking.status === 'cancelled' ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                            <Ban className="h-5 w-5" />
                            <span className="font-bold">This booking is cancelled.</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm">Need to change plans?</h4>
                            <p className="text-xs text-slate-500">Cancelling this booking may be subject to fees depending on the host's policy.</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    {booking.status !== 'cancelled' && (
                        <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                            {loading ? "Processing..." : "Cancel Booking"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- RECEIPT COMPONENT ---
export const BookingReceipt = ({ booking, open, onOpenChange }: any) => {
    const handlePrint = () => {
        window.print();
    };

    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <div className="print:fixed print:inset-0 print:bg-white print:z-[99999] print:p-8" id="printable-receipt">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-[#00AEEF]">Digital<span className="text-[#F48221]">Ridr</span></h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Booking Receipt</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">Receipt #{booking.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-slate-500">{format(new Date(), "MMM d, yyyy")}</p>
                        </div>
                    </div>

                    <div className="border-t border-b border-slate-100 py-8 my-8 space-y-6">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Billed To</p>
                                <p className="font-bold text-slate-900 text-lg mt-1">{booking.profiles?.full_name || "Guest"}</p>
                                <p className="text-sm text-slate-500">{booking.profiles?.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Property</p>
                                <p className="font-bold text-slate-900 text-lg mt-1">{booking.listings?.title}</p>
                                <p className="text-sm text-slate-500">{booking.listings?.location}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Check In</p>
                                <p className="font-bold text-slate-900">{format(new Date(booking.check_in), "MMM d")}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Check Out</p>
                                <p className="font-bold text-slate-900">{format(new Date(booking.check_out), "MMM d")}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Guests</p>
                                <p className="font-bold text-slate-900">{booking.guests}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                                <p className="font-bold text-emerald-600 uppercase">{booking.status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl">
                        <span className="font-bold">Total Amount Paid</span>
                        <span className="font-black text-2xl">{formatNaira(booking.total_price)}</span>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">Thank you for choosing Digital Ridr. Safe travels!</p>
                    </div>
                </div>

                <DialogFooter className="print:hidden">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={handlePrint} className="gap-2 bg-slate-900 hover:bg-slate-800">
                        <Printer className="h-4 w-4" /> Print Receipt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
