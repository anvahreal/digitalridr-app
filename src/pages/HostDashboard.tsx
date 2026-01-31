import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  MessageSquare, 
  Wallet, 
  Plus, 
  Star, 
  TrendingUp, 
  Calendar,
  MapPin,
  Settings,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

const HostDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for the overview
  const stats = [
    { label: "Total Revenue", value: formatNaira(2450000), icon: Wallet, color: "text-emerald-600" },
    { label: "Active Stays", value: "12", icon: Calendar, color: "text-blue-600" },
    { label: "Avg Rating", value: "4.9", icon: Star, color: "text-amber-500" },
    { label: "Response Rate", value: "98%", icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      
      <main className="py-8">
        <div className="container max-w-7xl px-4 md:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- LEFT SIDEBAR: THE NAVIGATION HUB --- */}
            <aside className="lg:col-span-3 space-y-6">
              <div className="sticky top-24">
                <Card className="border-none shadow-soft rounded-[2.5rem] p-4 bg-white">
                  <div className="px-4 py-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Host Hub</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">Lagos Luxury Mgmt</p>
                  </div>
                  
                  <nav className="space-y-2">
                    <NavButton 
                      icon={LayoutDashboard} 
                      label="Dashboard" 
                      active={true} 
                      onClick={() => navigate("/host/dashboard")} 
                    />
                    <NavButton 
                      icon={MessageSquare} 
                      label="Messages" 
                      badge="3"
                      onClick={() => navigate("/host/messages")} 
                    />
                    <NavButton 
                      icon={Wallet} 
                      label="Earnings & Wallet" 
                      onClick={() => navigate("/host/wallet")} 
                    />
                    <NavButton 
                      icon={Home} 
                      label="Manage Listings" 
                      onClick={() => setActiveTab("listings")} 
                    />
                    <NavButton 
                      icon={Settings} 
                      label="Profile Settings" 
                      onClick={() => navigate("/profile")} 
                    />
                  </nav>

                  <hr className="my-6 border-slate-100" />

                  <Button 
                    onClick={() => navigate("/host/create-listing")}
                    className="w-full h-14 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all gap-2 font-black"
                  >
                    <Plus className="h-5 w-5" />
                    New Listing
                  </Button>
                </Card>

                {/* Lagos Market Insight Card */}
                <Card className="mt-6 border-none bg-gradient-to-br from-primary to-indigo-700 text-white rounded-[2rem] p-6 shadow-xl shadow-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Market Pulse</p>
                  <h4 className="font-bold text-lg leading-tight mb-4">Demand in Lekki is up 15% this week!</h4>
                  <p className="text-xs text-white/70 italic leading-relaxed">Consider adjusting your weekend rates to maximize profit.</p>
                </Card>
              </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="lg:col-span-9 space-y-8">
              
              {/* Top Welcome Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Welcome back, Host</h1>
                  <p className="font-medium text-slate-500 italic mt-1">You have 3 check-ins scheduled for today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                  <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="pr-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Status</p>
                    <p className="text-sm font-bold text-slate-700">Top Rated</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <Card key={i} className="border-none shadow-soft rounded-[2rem] bg-white group hover:bg-slate-900 transition-all duration-300">
                    <CardContent className="p-6">
                      <s.icon className={`h-5 w-5 ${s.color} mb-3 group-hover:text-white`} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/50">{s.label}</p>
                      <p className="text-xl font-black text-slate-900 group-hover:text-white mt-1">{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tabs Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-transparent h-auto p-0 gap-6 flex-wrap">
                  <TabsTrigger value="overview" className="tab-premium">Overview</TabsTrigger>
                  <TabsTrigger value="listings" className="tab-premium">My Listings</TabsTrigger>
                  <TabsTrigger value="reviews" className="tab-premium">Guest Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Activity Feed */}
                    <Card className="border-none shadow-soft rounded-[2.5rem] p-8 bg-white">
                      <h3 className="text-xl font-black mb-6">Recent Activity</h3>
                      <div className="space-y-6">
                        <ActivityItem 
                          title="New Inquiry" 
                          time="2 mins ago" 
                          desc="Chidi Okoro asked about WiFi speed in Ikoyi Penthouse." 
                          type="message"
                        />
                        <ActivityItem 
                          title="Booking Confirmed" 
                          time="1 hour ago" 
                          desc="Fatima Yusuf booked 'Modern Studio' for 3 nights." 
                          type="booking"
                        />
                        <ActivityItem 
                          title="Payout Sent" 
                          time="5 hours ago" 
                          desc="₦245,000 was transferred to your GTBank wallet." 
                          type="wallet"
                        />
                      </div>
                    </Card>

                    {/* Quick Stats/Tips */}
                    <Card className="border-none shadow-soft rounded-[2.5rem] p-8 bg-white">
                      <h3 className="text-xl font-black mb-6">Upcoming Stays</h3>
                      <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                        <Calendar className="h-12 w-12 opacity-10 mb-2" />
                        <p className="font-bold text-sm">No arrivals today.</p>
                        <p className="text-xs">Next guest arrives on Saturday.</p>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="listings" className="grid gap-6 animate-in fade-in">
                  <ListingItem 
                    title="Luxurious Waterfront Ikoyi" 
                    location="Ikoyi, Lagos" 
                    price="85,000" 
                    img="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400"
                  />
                  <ListingItem 
                    title="Modern Studio Lekki Phase 1" 
                    location="Lekki, Lagos" 
                    price="35,000" 
                    img="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
                  />
                </TabsContent>
              </Tabs>
            </div>

          </div>
        </div>
      </main>
      <Footer />

      {/* Adding custom tab styles globally */}
      <style>{`
        .tab-premium {
          @apply px-6 py-2 font-black text-slate-400 rounded-full transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white;
        }
      `}</style>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const NavButton = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all ${
      active 
      ? "bg-slate-100 text-slate-900" 
      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-slate-400"}`} />
      <span className="text-sm tracking-tight">{label}</span>
    </div>
    {badge && <Badge className="bg-primary text-white border-none text-[10px]">{badge}</Badge>}
  </button>
);

const ActivityItem = ({ title, time, desc, type }: any) => {
  const icons = {
    message: <MessageSquare className="h-4 w-4 text-blue-500" />,
    booking: <Calendar className="h-4 w-4 text-emerald-500" />,
    wallet: <Wallet className="h-4 w-4 text-primary" />,
  };
  return (
    <div className="flex gap-4 group cursor-pointer">
      <div className="h-10 w-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        {icons[type as keyof typeof icons]}
      </div>
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-black text-slate-900">{title}</p>
          <span className="text-[10px] font-bold text-slate-400">{time}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{desc}</p>
      </div>
    </div>
  );
};

const ListingItem = ({ title, location, price, img }: any) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-[2rem] shadow-soft group hover:shadow-lg transition-all">
    <img src={img} className="h-20 w-24 rounded-2xl object-cover" alt="" />
    <div className="flex-1">
      <h4 className="font-black text-slate-900 leading-tight">{title}</h4>
      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
        <MapPin className="h-3 w-3" /> {location}
      </p>
    </div>
    <div className="text-right pr-4">
      <p className="text-lg font-black text-slate-900">₦{price}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase">Per Night</p>
    </div>
    <Button variant="ghost" size="icon" className="rounded-full">
      <ChevronRight className="h-5 w-5" />
    </Button>
  </div>
);

export default HostDashboard;