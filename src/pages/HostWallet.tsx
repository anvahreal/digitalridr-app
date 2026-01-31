import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
} from "lucide-react";

// Mock Data for Transactions
const transactions = [
  {
    id: "TX1024",
    type: "credit",
    amount: 145000,
    description: "Booking: Chidi Okoro (3 Nights)",
    status: "available",
    date: "Jan 28, 2024",
  },
  {
    id: "TX1025",
    type: "credit",
    amount: 88000,
    description: "Booking: Fatima Yusuf (2 Nights)",
    status: "pending",
    date: "Jan 30, 2024",
  },
  {
    id: "TX1026",
    type: "debit",
    amount: 200000,
    description: "Withdrawal to GTBank (****4421)",
    status: "completed",
    date: "Jan 25, 2024",
  },
];

const HostWallet = () => {
    
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="container max-w-6xl py-10">

        {/* BACK BUTTON */}
        <Button
          variant="ghost"
          onClick={() => navigate("/host/dashboard")}
          className="mb-6 hover:bg-white rounded-xl font-black text-slate-400 hover:text-primary transition-all gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Earnings</h1>
            <p className="text-slate-500">
              Track your income and manage payouts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-2">
              <Download className="mr-2 h-4 w-4" /> Download Statement
            </Button>
            <Button
              className="rounded-xl bg-slate-900 shadow-xl shadow-slate-200"
              onClick={() => setIsWithdrawing(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Request Payout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Main Balance Card */}
          <Card className="bg-primary text-white border-none shadow-2xl shadow-primary/20 rounded-[2rem] overflow-hidden relative">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <Wallet size={150} />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-widest text-white">
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-2">₦450,500.00</div>
              <p className="text-xs text-white/70 font-medium">
                Ready for withdrawal to your linked bank
              </p>
            </CardContent>
          </Card>

          {/* Pending Balance Card */}
          <Card className="rounded-[2rem] border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Pending (Escrow)
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">₦88,000</div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">
                To be released after check-in
              </p>
            </CardContent>
          </Card>

          {/* Total Earned Card */}
          <Card className="rounded-[2rem] border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Total Earned (YTD)
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">
                ₦2,450,000
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">
                After platform fees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
          <div className="p-6 border-b">
            <h3 className="font-black text-lg text-slate-900">
              Recent Transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5 text-xs font-bold text-slate-400">
                      {tx.id}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                        >
                          {tx.type === "credit" ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {tx.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        variant="outline"
                        className={`rounded-md border-none px-2 py-0.5 font-bold text-[10px] uppercase ${
                          tx.status === "available"
                            ? "bg-blue-50 text-blue-600"
                            : tx.status === "pending"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                      {tx.date}
                    </td>
                    <td
                      className={`px-6 py-5 text-right font-black text-sm ${tx.type === "credit" ? "text-emerald-600" : "text-slate-900"}`}
                    >
                      {tx.type === "credit" ? "+" : "-"}₦
                      {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Security Tip */}
        <div className="mt-8 p-6 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex gap-4 items-start">
          <AlertCircle className="text-indigo-600 h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-indigo-900 text-sm">Payout Policy</h4>
            <p className="text-indigo-700 text-xs leading-relaxed mt-1">
              Funds from confirmed bookings are released to your "Available
              Balance" 24 hours after a guest successfully checks in. Payout
              requests are processed within 1-2 business days to your registered
              bank account.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HostWallet;
