import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    LayoutDashboard,
    Users,
    Building2,
    Wallet,
    MessageSquare,
    Search,
    CheckCircle2,
    Check,
    X,
    LogOut,
    Ban,
    Menu,
    Copy,
    Mail,
    MapPin,
    ShieldCheck,
    FileText,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { formatNaira } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ModeToggle } from "@/components/ModeToggle";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data States
    const { user, loading: profileLoading } = useProfile();
    const [stats, setStats] = useState({ revenue: 0, hosts: 0, bookings: 0 });
    const [selectedHost, setSelectedHost] = useState<any>(null);

    const [hosts, setHosts] = useState<any[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);

    const [bookings, setBookings] = useState<any[]>([]);
    const [verifications, setVerifications] = useState<any[]>([]);

    useEffect(() => {
        if (!profileLoading) {
            // Failsafe: Allow specific email or DB admin flag
            const isHardcodedAdmin = user?.email === "hotmailblvck17@gmail.com";

            if (user?.is_admin || isHardcodedAdmin) {
                setIsAdmin(true);
                fetchData();
            } else {
                toast.error("Unauthorized access: Admin only.");
                navigate("/");
            }
        }
    }, [user, profileLoading]);

    const fetchData = async () => {
        try {
            const [
                { data: profiles },
                { data: properties },
                { data: bookingsData },
                { data: payout_requests },
                { data: verificationsData }
            ] = await Promise.all([
                supabase.from('profiles').select('*').order('updated_at', { ascending: false }),
                supabase.from('listings').select('*').order('created_at', { ascending: false }),
                supabase.from('bookings').select('*').order('created_at', { ascending: false }),
                supabase.from('payout_requests').select('*').order('created_at', { ascending: false }),
                supabase.from('pending_verifications').select('*')
            ]);

            if (profiles) setHosts(profiles);
            if (properties) setListings(properties);
            if (bookingsData) setBookings(bookingsData);
            if (payout_requests) setPayouts(payout_requests);
            if (verificationsData) setVerifications(verificationsData);

            const totalRevenue = bookingsData?.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0) || 0;

            setStats({
                revenue: totalRevenue,
                hosts: profiles?.length || 0,
                bookings: bookingsData?.length || 0
            });

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleBanHost = async (hostId: string, currentStatus: boolean) => {
        const { error } = await supabase.from('profiles').update({ banned: !currentStatus }).eq('id', hostId);
        if (error) {
            toast.error("Failed to update host status");
        } else {
            toast.success(currentStatus ? "Host unbanned" : "Host banned");
            fetchData();
        }
    };

    const handleUpdateHostStatus = async (hostId: string, status: 'approved' | 'rejected' | 'pending') => {
        const { error } = await supabase.from('profiles').update({ host_status: status }).eq('id', hostId);
        if (error) {
            toast.error("Failed to update host status");
        } else {
            toast.success(`Host status updated to ${status}`);
            fetchData();
        }
    };

    const handlePayoutAction = async (id: string, status: string) => {
        // Optimistic Update
        const originalPayouts = [...payouts];
        setPayouts(prev => prev.map(p => p.id === id ? { ...p, status } : p));

        const { error } = await supabase.from('payout_requests').update({ status }).eq('id', id);
        if (error) {
            console.error("Payout Update Error:", error);
            toast.error("Failed to update payout");
            setPayouts(originalPayouts); // Revert on error
        } else {
            toast.success(`Payout marked as ${status}`);
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
        const { error } = await supabase.from('listings').delete().eq('id', id);
        if (error) toast.error("Failed to delete listing");
        else {
            toast.success("Listing deleted successfully");
            fetchData();
        }
    };



    const handleMessageHost = async (hostId: string) => {
        try {
            if (!user) return;

            // Check if conversation exists
            const { data: existingConvs } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(host_id.eq.${user.id},guest_id.eq.${hostId}),and(host_id.eq.${hostId},guest_id.eq.${user.id})`)
                .limit(1)
                .maybeSingle(); // Changed to maybeSingle to avoid error if not found

            let conversationId = existingConvs?.id;

            if (!conversationId) {
                // Create new conversation
                const { data: newConv, error } = await supabase
                    .from('conversations')
                    .insert({
                        host_id: hostId,
                        guest_id: user.id
                    })
                    .select()
                    .single();

                if (error) throw error;
                conversationId = newConv.id;
            }

            navigate('/host/messages', { state: { selectedChatId: conversationId } });

        } catch (error: any) {
            console.error("Error starting conversation:", error);
            toast.error(`Failed to start conversation: ${error.message || "Unknown error"}`);
        }
    };

    const handleVerificationReview = async (userId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
        try {
            const { error } = await supabase.rpc('review_identity_verification', {
                user_id_input: userId,
                status_input: action === 'approve' ? 'verified' : 'rejected',
                rejection_reason_input: rejectionReason || null
            });

            if (error) throw error;

            toast.success(`Verification ${action}d successfully`);
            fetchData();
        } catch (err: any) {
            console.error("Review Error:", err);
            toast.error(`Failed to ${action} verification`);
        }
    };

    if (loading || profileLoading) return <div className="flex h-screen items-center justify-center">Loading God Mode...</div>;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2 text-[#F48221]">
                        <LayoutDashboard className="h-6 w-6" />
                        <span className="font-exhibit font-black text-xl tracking-tighter">GOD MODE</span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <MenuButton icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <MenuButton icon={Users} label="Hosts & Users" active={activeTab === 'hosts'} onClick={() => setActiveTab('hosts')} />
                    <MenuButton icon={Wallet} label="Payouts" active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} />
                    <MenuButton icon={ShieldCheck} label="Verifications" active={activeTab === 'verifications'} onClick={() => setActiveTab('verifications')} />
                    <MenuButton icon={MessageSquare} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                    <MenuButton icon={Building2} label="Properties" active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} />
                </nav>
                <div className="p-4 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-3" onClick={() => navigate('/')}>
                        <LogOut size={18} />
                        Exit God Mode
                    </Button>
                </div>
            </aside>

            {/* Host Properties Sheet */}
            <Sheet open={!!selectedHost} onOpenChange={(open) => !open && setSelectedHost(null)}>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-hidden p-0 border-l border-border bg-background shadow-2xl">
                    <div className="sr-only">
                        <DialogTitle>Host Properties</DialogTitle>
                        <DialogDescription>
                            View and manage properties listed by this host
                        </DialogDescription>
                    </div>
                    {selectedHost && (
                        <div className="flex flex-col h-full bg-background">
                            <div className="p-8 border-b border-border bg-muted/10">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20 rounded-[1.5rem] border-4 border-background shadow-lg">
                                        <AvatarImage src={selectedHost.avatar_url} className="object-cover" />
                                        <AvatarFallback className="font-black text-2xl bg-muted text-muted-foreground">{selectedHost.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground tracking-tight">{selectedHost.full_name}</h2>
                                        <p className="text-sm text-muted-foreground font-bold">{selectedHost.email}</p>
                                        <div className="flex items-center gap-3 mt-3">
                                            <Badge variant="outline" className={`rounded-lg border-opacity-50 px-3 py-1 font-bold uppercase text-[10px] tracking-wider ${selectedHost.banned ? "border-red-500 text-red-500 bg-red-500/10" : "border-emerald-500 text-emerald-500 bg-emerald-500/10"}`}>
                                                {selectedHost.banned ? "Banned User" : "Active Host"}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-muted rounded-md px-2 py-1">ID: {selectedHost.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                                        Properties Owned ({listings.filter(l => l.host_id === selectedHost.id).length})
                                    </h3>
                                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-black uppercase rounded-lg">View All</Button>
                                </div>

                                <div className="space-y-4">
                                    {listings.filter(l => l.host_id === selectedHost.id).length > 0 ? (
                                        listings.filter(l => l.host_id === selectedHost.id).map(l => (
                                            <div key={l.id} className="flex gap-5 p-4 rounded-[1.5rem] border border-border/50 bg-card hover:bg-muted/30 transition-all group shadow-sm hover:shadow-md">
                                                <div className="h-24 w-32 bg-muted rounded-2xl bg-center bg-cover shrink-0 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                                    <img src={l.images?.[0]} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                    <div>
                                                        <h4 className="font-exhibit font-bold text-foreground truncate text-lg leading-tight">{l.title}</h4>
                                                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
                                                            <MapPin className="h-3 w-3" /> {l.location}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <p className="font-black text-foreground">{formatNaira(l.price_per_night)}<span className="text-[10px] font-normal text-muted-foreground">/night</span></p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300"
                                                            onClick={() => handleDeleteListing(l.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border border-dashed border-border/60">
                                            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                            <p className="font-bold text-muted-foreground">No properties listed.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-background/50 backdrop-blur sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu size={20} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0 bg-card border-r border-border">
                                <nav className="flex-1 p-4 space-y-2 mt-10">
                                    <MenuButton icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                                    <MenuButton icon={Users} label="Hosts & Users" active={activeTab === 'hosts'} onClick={() => setActiveTab('hosts')} />
                                    <MenuButton icon={Wallet} label="Payouts" active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} />
                                    <MenuButton icon={MessageSquare} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
                                    <MenuButton icon={Building2} label="Properties" active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} />
                                </nav>
                            </SheetContent>
                        </Sheet>
                        <h1 className="font-bold text-lg capitalize">{activeTab}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search everything..." className="pl-9 w-64 bg-muted/50 border-none h-9 rounded-xl focus:ring-1 focus:ring-[#F48221]" />
                        </div>
                        <ModeToggle />
                        <Button size="icon" variant="ghost" className="rounded-full">
                            <Users size={20} />
                        </Button>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-6 animate-in fade-in">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Performance Overview</h2>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <AnalyticsStatsCard
                                    title="Total Revenue"
                                    value={formatNaira(stats.revenue)}
                                    icon={Wallet}
                                    trend="+12.5%"
                                    trendUp={true}
                                    color="bg-emerald-500/10 text-emerald-500"
                                />
                                <AnalyticsStatsCard
                                    title="Active Hosts"
                                    value={stats.hosts}
                                    icon={Users}
                                    trend="+4"
                                    trendUp={true}
                                    color="bg-blue-500/10 text-blue-500"
                                />
                                <AnalyticsStatsCard
                                    title="Total Bookings"
                                    value={stats.bookings}
                                    icon={CheckCircle2}
                                    trend="+2.4%"
                                    trendUp={true}
                                    color="bg-orange-500/10 text-orange-500"
                                />
                                <AnalyticsStatsCard
                                    title="Active Listings"
                                    value={listings.length}
                                    icon={Building2}
                                    trend="+5"
                                    trendUp={true}
                                    color="bg-purple-500/10 text-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 bg-card border-border shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold">Revenue Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={bookings.slice(0, 10).map((b, i) => ({ name: `Booking ${i + 1}`, amount: b.total_price || 0 }))}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value / 1000}k`} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card border-border shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold">Properties by Location</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[300px] flex items-center justify-center relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={listings.reduce((acc: any[], curr) => {
                                                        const existing = acc.find((item: any) => item.name === curr.location);
                                                        if (existing) existing.value++;
                                                        else acc.push({ name: curr.location, value: 1 });
                                                        return acc;
                                                    }, [])}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {listings.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f97316', '#a855f7', '#ec4899'][index % 5]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">Recent Host Activity</h3>
                                <HostTable hosts={hosts} onBan={handleBanHost} onUpdateStatus={handleUpdateHostStatus} limit={5} onViewProperties={setSelectedHost} />
                            </div>
                        </TabsContent>

                        {/* HOSTS TAB */}
                        <TabsContent value="hosts" className="animate-in fade-in">
                            <Card className="bg-card border-border text-foreground">
                                <CardHeader>
                                    <CardTitle>All Hosts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <HostTable hosts={hosts} onBan={handleBanHost} onUpdateStatus={handleUpdateHostStatus} onViewProperties={setSelectedHost} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* VERIFICATIONS TAB */}
                        <TabsContent value="verifications" className="animate-in fade-in">
                            <Card className="bg-card border-border text-foreground">
                                <CardHeader>
                                    <CardTitle>Pending Identity Verifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4">
                                        {verifications.length === 0 ? (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                                                <p>No pending verifications.</p>
                                            </div>
                                        ) : verifications.map((v) => (
                                            <div key={v.id} className="flex flex-col md:flex-row gap-6 p-6 border border-border rounded-2xl bg-muted/20">
                                                <div className="flex items-center gap-4 min-w-[200px]">
                                                    <Avatar className="h-16 w-16 rounded-xl border-2 border-border">
                                                        <AvatarImage src={v.avatar_url} className="object-cover" />
                                                        <AvatarFallback>{v.full_name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-bold text-foreground text-lg">{v.full_name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">{v.email}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(v.verification_submitted_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">ID Document</p>
                                                        <div className="h-32 bg-background rounded-lg border border-border overflow-hidden relative group">
                                                            <img src={v.identity_doc_url} className="w-full h-full object-cover" />
                                                            <a href={v.identity_doc_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ExternalLink className="text-white h-6 w-6" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Selfie with ID</p>
                                                        <div className="h-32 bg-background rounded-lg border border-border overflow-hidden relative group">
                                                            <img src={v.selfie_url} className="w-full h-full object-cover" />
                                                            <a href={v.selfie_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ExternalLink className="text-white h-6 w-6" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col justify-center gap-2 min-w-[120px]">
                                                    <Button
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                                                        onClick={() => handleVerificationReview(v.id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="font-bold"
                                                        onClick={() => {
                                                            const reason = prompt("Enter rejection reason:");
                                                            if (reason) handleVerificationReview(v.id, 'reject', reason);
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* PAYOUTS TAB */}
                        <TabsContent value="payouts" className="animate-in fade-in">
                            <Card className="bg-card border-border text-foreground">
                                <CardHeader>
                                    <CardTitle>Withdrawal Requests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                                                <tr>
                                                    <th className="pb-3 pl-4">Host</th>
                                                    <th className="pb-3">Amount</th>
                                                    <th className="pb-3">Bank Details</th>
                                                    <th className="pb-3">Status</th>
                                                    <th className="pb-3 text-right pr-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {payouts.length === 0 ? (
                                                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No pending payouts.</td></tr>
                                                ) : payouts.map((p) => {
                                                    const requestUser = hosts.find(h => h.id === p.user_id);
                                                    return (
                                                        <tr key={p.id} className="hover:bg-muted/50">
                                                            <td className="py-4 pl-4 font-medium">{requestUser?.full_name || "Unknown"}</td>
                                                            <td className="py-4 font-bold text-emerald-400">{formatNaira(p.amount)}</td>
                                                            <td className="py-4 text-sm text-muted-foreground">
                                                                {p.bank_name} <br /> {p.account_number}
                                                            </td>
                                                            <td className="py-4">
                                                                <Badge variant="outline" className={`
                                                        ${p.status === 'paid' ? 'border-emerald-500 text-emerald-500' :
                                                                        p.status === 'rejected' ? 'border-red-500 text-red-500' :
                                                                            'border-amber-500 text-amber-500'}
                                                      `}>
                                                                    {p.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-4 text-right pr-4 space-x-2">
                                                                {p.status === 'pending' && (
                                                                    <>
                                                                        <Button size="sm" variant="outline" className="h-7 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white" onClick={() => handlePayoutAction(p.id, 'paid')}>Pay</Button>
                                                                        <Button size="sm" variant="outline" className="h-7 border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => handlePayoutAction(p.id, 'rejected')}>Reject</Button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* MESSAGES TAB */}
                        <TabsContent value="messages" className="animate-in fade-in">
                            <Card className="bg-card border-border text-foreground h-[600px] flex items-center justify-center">
                                <div className="text-center">
                                    <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-bold">Admin Inbox</h3>
                                    <p className="text-muted-foreground mt-2">Manage all communications.</p>
                                    <Button className="mt-6 bg-[#F48221] text-black font-bold" onClick={() => navigate("/host/messages")}>
                                        Open Messaging Center
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>

                        {/* PROPERTIES TAB (Grouped by Host) */}
                        <TabsContent value="properties" className="animate-in fade-in">
                            <div className="space-y-8">
                                {hosts.filter(h => listings.some(l => l.host_id === h.id)).map((host) => {
                                    const hostListings = listings.filter(l => l.host_id === host.id);
                                    return (
                                        <Card key={host.id} className="bg-card border-border overflow-hidden">
                                            <CardHeader className="bg-muted/20 border-b border-border pb-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 rounded-xl border-2 border-background shadow-sm">
                                                        <AvatarImage src={host.avatar_url} className="object-cover" />
                                                        <AvatarFallback className="font-bold bg-muted text-muted-foreground rounded-xl">
                                                            {host.full_name?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-lg font-bold">{host.full_name}</CardTitle>
                                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">
                                                            {hostListings.length} {hostListings.length === 1 ? 'Property' : 'Properties'} Listed
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {hostListings.map((l) => (
                                                        <div key={l.id} className="flex gap-4 p-3 rounded-2xl border border-border/50 bg-background hover:bg-muted/30 transition-all group/card">
                                                            <div className="h-20 w-24 bg-muted rounded-xl bg-center bg-cover shrink-0 relative overflow-hidden">
                                                                <img src={l.images?.[0]} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-foreground truncate">{l.title}</h4>
                                                                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5 mb-2">
                                                                        <MapPin className="h-3 w-3" /> {l.location}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-mono text-xs text-[#F48221] font-bold">{formatNaira(l.price_per_night)}</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 px-2 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg"
                                                                        onClick={() => handleDeleteListing(l.id)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}

                                {listings.length === 0 && (
                                    <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border border-dashed border-border/60">
                                        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                        <p className="font-bold text-muted-foreground">No properties listed.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                    </Tabs>
                </div>
            </main>
        </div>
    );
};

// Sub-components
const MenuButton = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
      ${active ? "bg-[#F48221] text-black font-bold" : "text-muted-foreground hover:bg-accent hover:text-foreground"}
    `}
    >
        <Icon size={18} />
        {label}
    </button>
);

const AnalyticsStatsCard = ({ title, value, icon: Icon, trend, trendUp, color }: any) => (
    <Card className="bg-card border-border overflow-hidden relative group hover:shadow-lg transition-all">
        <CardContent className="p-6 flex items-start justify-between relative z-10">
            <div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">{value}</h3>
                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        <span>{trendUp ? '↑' : '↓'}</span>
                        <span>{trend}</span>
                        <span className="text-muted-foreground font-medium ml-1">vs last month</span>
                    </div>
                )}
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
            </div>
        </CardContent>
        <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-5 blur-2xl transition-all group-hover:opacity-10 ${color.split(' ')[0]}`} />
    </Card>
);

const HostTable = ({ hosts, onBan, onUpdateStatus, limit, onViewProperties }: any) => {
    const displayHosts = limit ? hosts.slice(0, limit) : hosts;

    return (
        <div className="rounded-[1.5rem] border border-border/40 overflow-x-auto bg-muted/20">
            <table className="w-full text-left">
                <thead className="text-[11px] font-black uppercase text-muted-foreground bg-muted/30">
                    <tr>
                        <th className="p-5 font-black tracking-widest pl-6">Host / User</th>
                        <th className="p-5 font-black tracking-widest">Contact</th>
                        <th className="p-5 font-black tracking-widest">Status</th>
                        <th className="p-5 font-black tracking-widest">Host Status</th>
                        <th className="p-5 font-black tracking-widest text-right pr-6">Joined Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                    {displayHosts.map((h: any) => (
                        <tr key={h.id} className={`group hover:bg-muted/30 transition-all duration-200 ${h.banned ? 'opacity-60 bg-red-500/5' : ''}`}>
                            <td className="p-4 pl-6">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="flex items-center gap-4 cursor-pointer select-none">
                                            <Avatar className="h-11 w-11 rounded-2xl border-2 border-transparent group-hover:border-[#F48221] transition-all shadow-sm">
                                                <AvatarImage src={h.avatar_url} className="object-cover" />
                                                <AvatarFallback className="font-black bg-muted text-muted-foreground rounded-2xl">
                                                    {h.full_name?.[0]?.toUpperCase() || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-foreground text-sm group-hover:text-[#F48221] transition-colors">{h.full_name || "Unknown User"}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold font-mono mt-0.5">#{h.id.slice(0, 6)}</p>
                                            </div>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-60 rounded-2xl p-2 bg-card border-border shadow-2xl z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-3 py-2">
                                            Manage {h.full_name?.split(' ')[0]}
                                        </DropdownMenuLabel>
                                        <div className="px-2 pb-2">
                                            <div className="bg-muted/50 rounded-xl p-2 mb-2">
                                                <p className="text-[10px] font-medium text-muted-foreground">User ID</p>
                                                <p className="text-xs font-mono font-bold text-foreground truncate">{h.id}</p>
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator className="bg-border/50 mx-2" />

                                        {/* HOST APPROVAL ACTIONS */}
                                        {h.host_status === 'pending' && (
                                            <>
                                                <DropdownMenuItem
                                                    className="rounded-xl font-bold cursor-pointer py-2.5 px-3 focus:bg-emerald-500/10 focus:text-emerald-500 transition-colors group/item"
                                                    onClick={() => onUpdateStatus(h.id, 'approved')}
                                                >
                                                    <Check className="mr-3 h-4 w-4 text-emerald-500" />
                                                    Approve Application
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="rounded-xl font-bold cursor-pointer py-2.5 px-3 focus:bg-red-500/10 focus:text-red-500 transition-colors group/item"
                                                    onClick={() => onUpdateStatus(h.id, 'rejected')}
                                                >
                                                    <X className="mr-3 h-4 w-4 text-red-500" />
                                                    Reject Application
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-border/50 mx-2" />
                                            </>
                                        )}

                                        {h.host_status === 'approved' && !h.is_admin && (
                                            <DropdownMenuItem
                                                className="rounded-xl font-bold cursor-pointer py-2.5 px-3 focus:bg-amber-500/10 focus:text-amber-500 transition-colors group/item"
                                                onClick={() => onUpdateStatus(h.id, 'rejected')}
                                            >
                                                <Ban className="mr-3 h-4 w-4 text-amber-500" />
                                                Revoke Host Access
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem className="rounded-xl font-bold cursor-pointer py-2.5 px-3 focus:bg-accent focus:text-accent-foreground transition-colors group/item" onClick={() => onViewProperties(h)}>
                                            <Building2 className="mr-3 h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                            View Properties
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl font-bold cursor-pointer py-2.5 px-3 focus:bg-accent focus:text-accent-foreground transition-colors group/item" onClick={() => {
                                            if (h.email) {
                                                navigator.clipboard.writeText(h.email);
                                                toast.success("Email copied");
                                            }
                                        }}>
                                            <Copy className="mr-3 h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                            Copy Email
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl font-bold cursor-pointer py-2.5 px-3 focus:bg-accent focus:text-accent-foreground transition-colors group/item" onClick={() => window.location.href = `mailto:${h.email}`}>
                                            <Mail className="mr-3 h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                            Send Email
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl font-bold cursor-pointer py-2.5 px-3 focus:bg-accent focus:text-accent-foreground transition-colors group/item" onClick={() => handleMessageHost(h.id)}>
                                            <MessageSquare className="mr-3 h-4 w-4 text-muted-foreground group-hover/item:text-foreground" />
                                            Message User
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-border/50 mx-2" />
                                        <DropdownMenuItem
                                            className={`rounded-xl font-black cursor-pointer py-2.5 px-3 mt-1 transition-colors ${h.banned ? 'text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10' : 'text-red-500 focus:text-red-500 focus:bg-red-500/10'}`}
                                            onClick={() => onBan(h.id, h.banned)}
                                        >
                                            {h.banned ? <><CheckCircle2 className="mr-3 h-4 w-4" /> Unban User</> : <><Ban className="mr-3 h-4 w-4" /> Ban Access</>}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                            <td className="p-4 align-middle">
                                <span className="font-bold text-sm text-foreground">{h.email || "N/A"}</span>
                            </td>
                            <td className="p-4 align-middle">
                                <Badge className={`
                                    rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide border-none shadow-none
                                    ${h.banned
                                        ? 'bg-red-500/10 text-red-500'
                                        : 'bg-emerald-500/10 text-emerald-500'}
                                `}>
                                    {h.banned ? 'Banned' : 'Active'}
                                </Badge>
                            </td>
                            <td className="p-4 align-middle">
                                <Badge variant="outline" className={`
                                    rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                    ${h.host_status === 'approved' ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5' :
                                        h.host_status === 'pending' ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' :
                                            h.host_status === 'rejected' ? 'border-red-500/50 text-red-500 bg-red-500/5' :
                                                'border-muted text-muted-foreground'
                                    }
                                `}>
                                    {h.host_status || 'None'}
                                </Badge>
                            </td>
                            <td className="p-4 pr-6 text-right align-middle">
                                <span className="text-xs font-bold text-muted-foreground">
                                    {h.created_at ? new Date(h.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminDashboard;
