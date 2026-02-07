import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useHostBookings } from "@/hooks/useHostBookings";
import { formatNaira } from "@/lib/utils";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const HostWallet = () => {
  const { bookings, loading, refetch } = useHostBookings();

  const handleAction = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking ${status}`);
      refetch(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  // Fetch payouts to deduct from balance
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('payout_requests').select('*').eq('user_id', supabase.auth.getUser().then(({ data }) => data.user?.id)).then(({ data }) => {
      if (data) setPayouts(data);
    });
  }, []);

  // Calculate Stats
  const totalEarned = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const pendingBookings = bookings
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const totalWithdrawn = payouts
    .filter(p => p.status === 'paid' || p.status === 'pending') // Deduct both paid and pending requests
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Available Balance: (90% of Earnings) - (Withdrawals)
  const availableBalance = (totalEarned * 0.9) - totalWithdrawn;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance */}
        <Card className="bg-[#FF7A00] text-white border-none shadow-xl rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <Wallet size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-[10px] font-black opacity-80 uppercase tracking-widest text-white">
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin" /> : (
              <div className="text-3xl font-black mb-1">{formatNaira(Math.max(0, availableBalance))}</div>
            )}
            <p className="text-[10px] text-white/70 font-bold uppercase">Ready for withdrawal</p>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pending (Escrow/Payouts)</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin text-muted-foreground" /> : (
              <div className="text-2xl font-black text-foreground">{formatNaira(pendingBookings + totalWithdrawn)}</div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">Includes processing payouts</p>
          </CardContent>
        </Card>

        {/* Total Earned Card */}
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Earned</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin text-muted-foreground" /> : (
              <div className="text-2xl font-black text-foreground">{formatNaira(totalEarned)}</div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">Gross earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* TRANSACTION LIST */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="font-black text-lg text-foreground">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={2} className="p-6 text-center text-muted-foreground">Loading transactions...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={2} className="p-6 text-center text-muted-foreground">No transactions yet.</td></tr>
              ) : bookings.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.status === "confirmed" || tx.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {tx.status === "confirmed" || tx.status === "completed" ? <ArrowDownLeft size={14} /> : <Clock size={14} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Booking: {tx.listing?.title || "Unknown Listing"}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-2">
                      <p className={`font-black text-sm ${tx.status === "confirmed" || tx.status === "completed" ? "text-emerald-600" : "text-foreground"}`}>
                        +{formatNaira(tx.total_price)}
                      </p>
                      <Badge variant="outline" className={`rounded-full border-none text-[8px] font-black uppercase ${tx.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-700' :
                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-700' :
                          'bg-muted text-muted-foreground'
                        }`}>
                        {tx.status}
                      </Badge>
                    </div>
                    {tx.status === 'pending' && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleAction(tx.id, 'confirmed')}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-full transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(tx.id, 'cancelled')}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-full transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HostWallet;