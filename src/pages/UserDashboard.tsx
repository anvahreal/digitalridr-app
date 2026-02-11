import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  CreditCard,
  Heart,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Clock,
  AlertCircle,
  Bell,
  Shield
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { ManageBookingDialog, BookingReceipt } from "@/components/BookingActions";
import { useUserBookings } from "@/hooks/useUserBookings";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ... imports

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("trips");
  const { user, profile, loading, updateProfile } = useProfile();
  const { bookings, loading: bookingsLoading } = useUserBookings();
  const { favorites, loading: favoritesLoading, toggleFavorite } = useFavorites();

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionType, setActionType] = useState<"manage" | "receipt" | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleProfileUpdate = async () => {
    setUpdatingProfile(true);
    try {
      await updateProfile({ full_name: fullName });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(`Failed to update profile: ${error.message || "Unknown error"}`);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      pending: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    };

    return (
      <Badge
        variant="outline"
        className={`capitalize px-3 py-1 rounded-full font-bold text-[10px] backdrop-blur-sm ${styles[status as keyof typeof styles] || styles.pending}`}
      >
        {status}
      </Badge>
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  }

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <Header />
      <main className="py-10">
        <div className="container max-w-6xl px-4">
          {/* Welcome Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Welcome back, {loading ? "..." : (profile?.full_name?.split(' ')[0] || "Guest")} 👋
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              {bookings.filter(b => b.status === 'confirmed').length > 0
                ? `You have ${bookings.filter(b => b.status === 'confirmed').length} upcoming bookings.`
                : "No upcoming trips."}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* Nav Sidebar */}
            <aside className="hidden lg:block space-y-6 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                {[
                  { id: "trips", label: "My Stays", icon: Calendar },
                  { id: "favorites", label: "Favorites", icon: Heart },
                  { id: "profile", label: "Profile", icon: User },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((nav) => (
                  <button
                    key={nav.id}
                    onClick={() => setActiveTab(nav.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === nav.id
                      ? "bg-card text-[#F48221] shadow-sm shadow-orange-500/10 dark:shadow-none"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                  >
                    <nav.icon
                      className={`h-4 w-4 ${activeTab === nav.id ? "text-[#F48221]" : ""}`}
                    />
                    {nav.label}
                  </button>
                ))}
              </div>

              <Separator className="bg-border" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </aside>

            {/* Main Section */}
            <div className="space-y-6">
              {/* Mobile Nav Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="lg:hidden mb-6"
              >
                <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-xl">
                  <TabsTrigger
                    value="trips"
                    className="rounded-lg font-bold text-[11px] data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
                  >
                    Stays
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    className="rounded-lg font-bold text-[11px] data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
                  >
                    Saved
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="rounded-lg font-bold text-[11px] data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
                  >
                    User
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-lg font-bold text-[11px] data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
                  >
                    Setup
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* TRIPS TAB */}
              {activeTab === "trips" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Tabs defaultValue="upcoming" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black text-foreground">
                        My Bookings
                      </h2>
                      <TabsList className="bg-transparent gap-4 p-0">
                        <TabsTrigger
                          value="upcoming"
                          className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-full px-5 h-9 text-xs font-bold text-muted-foreground"
                        >
                          Upcoming
                        </TabsTrigger>
                        <TabsTrigger
                          value="past"
                          className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-full px-5 h-9 text-xs font-bold text-muted-foreground"
                        >
                          Past
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="upcoming" className="space-y-4">
                      {bookingsLoading ? <div className="text-muted-foreground">Loading...</div> : bookings
                        .filter((b) => b.status === "confirmed" || b.status === "pending")
                        .map((booking) => (
                          <div
                            key={booking.id}
                            onClick={() => { setSelectedBooking(booking); setActionType('manage'); }}
                            className="group flex gap-4 cursor-pointer border-b border-border/40 pb-6 last:border-0 last:pb-0 hover:bg-muted/20 -mx-4 px-4 py-4 sm:mx-0 sm:px-0 sm:py-0 sm:hover:bg-transparent transition-colors"
                          >
                            {/* Image */}
                            <div className="relative h-24 w-24 sm:h-40 sm:w-64 shrink-0 overflow-hidden rounded-xl bg-muted">
                              <img
                                src={booking.listings?.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                alt=""
                              />
                              <div className="absolute top-2 left-2">
                                {getStatusBadge(booking.status)}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 py-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-foreground text-sm sm:text-lg mb-1">
                                      {booking.listings?.location?.split(',')[0] || "Unknown Location"}
                                    </h3>
                                    <p className="text-muted-foreground text-xs sm:text-sm line-clamp-1 mb-1">
                                      {booking.listings?.title}
                                    </p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(booking.check_in), "MMM d")} - {format(new Date(booking.check_out), "MMM d")} • {booking.guests} guests
                                </p>
                              </div>

                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex gap-2">
                                  {booking.status === 'confirmed' && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs rounded-full border-foreground text-foreground hover:bg-foreground hover:text-background font-bold">
                                      Show details
                                    </Button>
                                  )}
                                  {booking.status === 'pending' && (
                                    <Badge variant="secondary" className="font-normal text-xs bg-orange-100 text-orange-700">Pending approval</Badge>
                                  )}
                                </div>
                                <span className="font-bold text-sm sm:text-base text-foreground">
                                  {formatNaira(booking.total_price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {selectedBooking && (
                        <>
                          <ManageBookingDialog
                            open={actionType === 'manage'}
                            onOpenChange={(op: boolean) => !op && setActionType(null)}
                            booking={selectedBooking}
                            profile={profile}
                            onUpdate={() => window.location.reload()}
                          />
                          <BookingReceipt
                            open={actionType === 'receipt'}
                            onOpenChange={(op: boolean) => !op && setActionType(null)}
                            booking={selectedBooking}
                          />
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* FAVORITES TAB */}
              {activeTab === "favorites" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h2 className="text-xl font-black text-foreground mb-6">
                    Saved Places
                  </h2>
                  {favoritesLoading ? (
                    <p className="text-muted-foreground">Loading your favorites...</p>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border">
                      <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No saved places yet.</p>
                      <Button variant="link" onClick={() => navigate('/')} className="text-[#F48221]">Explore listings</Button>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {favorites.map((fav) => (
                        <Card
                          key={fav.id}
                          className="border-none shadow-sm rounded-3xl overflow-hidden bg-card group cursor-pointer"
                          onClick={() => navigate(`/listing/${fav.id}`)}
                        >
                          <div className="relative">
                            <img
                              src={fav.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"}
                              className="h-40 md:h-56 w-full object-cover"
                              alt=""
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(fav.id);
                              }}
                              className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-sm z-10 hover:bg-white transition-colors"
                            >
                              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                            </button>
                          </div>
                          <CardContent className="p-4 md:p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-foreground leading-tight">
                                {fav.title}
                              </h3>
                              <div className="flex items-center gap-1 font-bold text-sm text-foreground">
                                <Star className="h-3 w-3 fill-foreground" />{" "}
                                {fav.rating || "New"}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mb-4">
                              {fav.location}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <p className="font-black text-lg text-foreground">
                                {formatNaira(fav.price_per_night)}{" "}
                                <span className="text-xs text-muted-foreground font-normal">
                                  / night
                                </span>
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#00AEEF] font-bold pointer-events-none"
                              >
                                Book Now <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <Card className="border-none shadow-sm rounded-3xl bg-card p-8 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="h-24 w-24 bg-orange-100 dark:bg-orange-900/20 rounded-3xl flex items-center justify-center overflow-hidden shrink-0">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-[#F48221]" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground">
                        {loading ? "Loading..." : (profile?.full_name || "Guest User")}
                      </h2>
                      <p className="text-muted-foreground font-medium">
                        Member since {user?.created_at ? new Date(user.created_at).getFullYear() : "..."} • Lagos, Nigeria
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                          Full Name
                        </Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-muted/50 border-none h-12 rounded-xl text-foreground"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                          Email Address
                        </Label>
                        <Input
                          value={user?.email || ""}
                          readOnly
                          className="bg-muted/50 border-none h-12 rounded-xl text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={updatingProfile}
                        className="bg-[#F48221] hover:bg-orange-600 font-bold h-12 px-8 rounded-xl text-white"
                      >
                        {updatingProfile ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Card className="border-none shadow-sm rounded-3xl bg-card p-6 md:p-8">
                    <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-[#F48221]" /> Notifications
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">Email Notifications</p>
                          <p className="text-xs text-muted-foreground">Receive emails about your bookings and account activity.</p>
                        </div>
                        <div className="h-6 w-11 bg-emerald-500 rounded-full relative cursor-pointer">
                          <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">SMS Notifications</p>
                          <p className="text-xs text-muted-foreground">Receive text messages for urgent updates.</p>
                        </div>
                        <div className="h-6 w-11 bg-muted rounded-full relative cursor-pointer">
                          <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-none shadow-sm rounded-3xl bg-card p-6 md:p-8">
                    <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#F48221]" /> Security
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">Change Password</p>
                          <p className="text-xs text-muted-foreground">Update your password regularly to keep your account safe.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl border-border font-bold">Update</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-red-500">Delete Account</p>
                          <p className="text-xs text-muted-foreground">Permanently delete your account and data.</p>
                        </div>
                        <Button variant="ghost" className="rounded-xl text-red-500 font-bold hover:bg-red-500/10">Delete</Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main >
      <Footer />
    </div >
  );
};

export default UserDashboard;
