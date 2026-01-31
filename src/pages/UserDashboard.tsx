import { useState } from "react";
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
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const mockBookings = [
  {
    id: "1",
    listing: {
      title: "Luxurious Waterfront Apartment in Ikoyi",
      location: "Ikoyi, Lagos",
      image:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
    },
    checkIn: "2024-12-20",
    checkOut: "2024-12-27",
    guests: 2,
    totalPrice: 595000,
    status: "confirmed" as const,
  },
  {
    id: "2",
    listing: {
      title: "Modern Studio in Lekki Phase 1",
      location: "Lekki, Lagos",
      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    },
    checkIn: "2024-11-15",
    checkOut: "2024-11-18",
    guests: 1,
    totalPrice: 105000,
    status: "completed" as const,
  },
];

const mockFavorites = [
  {
    id: "1",
    title: "Beachside Apartment in Victoria Island",
    location: "Victoria Island, Lagos",
    price: 95000,
    rating: 4.85,
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400",
  },
  {
    id: "2",
    title: "Cozy Apartment in Yaba",
    location: "Yaba, Lagos",
    price: 25000,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400",
  },
];

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("trips");

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      completed: "bg-blue-50 text-blue-700 border-blue-100",
      cancelled: "bg-red-50 text-red-700 border-red-100",
      pending: "bg-orange-50 text-orange-700 border-orange-100",
    };

    return (
      <Badge
        variant="outline"
        className={`capitalize px-3 py-1 rounded-full font-bold text-[10px] ${styles[status as keyof typeof styles]}`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <Header />
      <main className="py-10">
        <div className="container max-w-6xl px-4">
          {/* Welcome Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, John! 👋
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              You have 1 upcoming trip this month.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* Nav Sidebar */}
            <aside className="hidden lg:block space-y-6">
              <div className="space-y-1">
                {[
                  { id: "trips", label: "My Trips", icon: Calendar },
                  { id: "favorites", label: "Favorites", icon: Heart },
                  { id: "profile", label: "Profile", icon: User },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((nav) => (
                  <button
                    key={nav.id}
                    onClick={() => setActiveTab(nav.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      activeTab === nav.id
                        ? "bg-white text-[#F48221] shadow-sm shadow-orange-100"
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                    }`}
                  >
                    <nav.icon
                      className={`h-4 w-4 ${activeTab === nav.id ? "text-[#F48221]" : ""}`}
                    />
                    {nav.label}
                  </button>
                ))}
              </div>

              <Separator className="bg-slate-200/60" />

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-colors">
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
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger
                    value="trips"
                    className="rounded-lg font-bold text-[11px]"
                  >
                    Trips
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    className="rounded-lg font-bold text-[11px]"
                  >
                    Saved
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="rounded-lg font-bold text-[11px]"
                  >
                    User
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-lg font-bold text-[11px]"
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
                      <h2 className="text-xl font-black text-slate-900">
                        My Bookings
                      </h2>
                      <TabsList className="bg-transparent gap-4">
                        <TabsTrigger
                          value="upcoming"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full px-4 text-xs font-bold"
                        >
                          Upcoming
                        </TabsTrigger>
                        <TabsTrigger
                          value="past"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full px-4 text-xs font-bold"
                        >
                          Past
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="upcoming" className="space-y-4">
                      {mockBookings
                        .filter((b) => b.status === "confirmed")
                        .map((booking) => (
                          <Card
                            key={booking.id}
                            className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white group"
                          >
                            <CardContent className="p-0 flex flex-col md:flex-row">
                              <div className="relative w-full md:w-56 h-48 md:h-auto overflow-hidden">
                                <img
                                  src={booking.listing.image}
                                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  alt=""
                                />
                                <div className="absolute top-3 left-3">
                                  {getStatusBadge(booking.status)}
                                </div>
                              </div>

                              <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-900 group-hover:text-[#F48221] transition-colors">
                                      {booking.listing.title}
                                    </h3>
                                    <p className="text-lg font-black text-slate-900">
                                      {formatNaira(booking.totalPrice)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-400 mt-1 mb-4">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      {booking.listing.location}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 py-3 px-4 bg-slate-50 rounded-xl">
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Check-in
                                      </p>
                                      <p className="text-xs font-bold text-slate-700">
                                        {format(
                                          new Date(booking.checkIn),
                                          "MMM d, yyyy",
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Check-out
                                      </p>
                                      <p className="text-xs font-bold text-slate-700">
                                        {format(
                                          new Date(booking.checkOut),
                                          "MMM d, yyyy",
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Guests
                                      </p>
                                      <p className="text-xs font-bold text-slate-700">
                                        {booking.guests} People
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                  <Button className="flex-1 bg-[#F48221] hover:bg-orange-600 font-bold rounded-xl h-11">
                                    Manage Booking
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-slate-200 font-bold rounded-xl h-11"
                                  >
                                    Get Receipt
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* FAVORITES TAB */}
              {activeTab === "favorites" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h2 className="text-xl font-black text-slate-900 mb-6">
                    Saved Places
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {mockFavorites.map((fav) => (
                      <Card
                        key={fav.id}
                        className="border-none shadow-sm rounded-3xl overflow-hidden bg-white group cursor-pointer"
                      >
                        <div className="relative">
                          <img
                            src={fav.image}
                            className="h-56 w-full object-cover"
                            alt=""
                          />
                          <button className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-sm">
                            <Heart className="h-5 w-5 fill-current" />
                          </button>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900 leading-tight">
                              {fav.title}
                            </h3>
                            <div className="flex items-center gap-1 font-bold text-sm">
                              <Star className="h-3 w-3 fill-slate-900" />{" "}
                              {fav.rating}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 font-medium mb-4">
                            {fav.location}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <p className="font-black text-lg text-slate-900">
                              {formatNaira(fav.price)}{" "}
                              <span className="text-xs text-slate-400 font-normal">
                                / night
                              </span>
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#00AEEF] font-bold"
                            >
                              Book Now <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* PROFILE TAB (Simplified) */}
              {activeTab === "profile" && (
                <Card className="border-none shadow-sm rounded-3xl bg-white p-8 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="h-24 w-24 bg-orange-100 rounded-3xl flex items-center justify-center text-[#F48221]">
                      <User className="h-12 w-12" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">
                        John Doe
                      </h2>
                      <p className="text-slate-400 font-medium">
                        Member since 2023 • Lagos, Nigeria
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                          Full Name
                        </Label>
                        <Input
                          defaultValue="John Doe"
                          className="bg-slate-50 border-none h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                          Email Address
                        </Label>
                        <Input
                          defaultValue="john.doe@example.com"
                          className="bg-slate-50 border-none h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button className="bg-[#F48221] font-bold h-12 px-8 rounded-xl mt-4">
                      Save Changes
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
