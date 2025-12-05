import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mockListings } from "@/data/mockListings";
import {
  Star,
  Heart,
  Share,
  MapPin,
  Users,
  BedDouble,
  Bath,
  Wifi,
  Car,
  Waves,
  Flame,
  Wind,
  ChefHat,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const amenityIcons: Record<string, any> = {
  WiFi: Wifi,
  Parking: Car,
  Pool: Waves,
  "Hot Tub": Waves,
  "Beach Access": Waves,
  Fireplace: Flame,
  "Air Conditioning": Wind,
  Kitchen: ChefHat,
};

const ListingDetail = () => {
  const { id } = useParams();
  const listing = mockListings.find((l) => l.id === id);

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold">Listing not found</h1>
          <Link to="/">
            <Button>Back to home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * listing.price_per_night;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    toast.success("Reservation request sent! Redirecting to checkout...");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container max-w-6xl">
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {listing.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                <span className="font-medium">{listing.rating}</span>
                <span className="text-muted-foreground">
                  · {listing.review_count} reviews
                </span>
              </div>
              {listing.is_superhost && (
                <span className="text-muted-foreground">· Superhost</span>
              )}
              <span className="flex items-center gap-1 text-muted-foreground underline">
                <MapPin className="h-4 w-4" />
                {listing.location}
              </span>
              <div className="ml-auto flex items-center gap-3">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isLiked && "fill-primary text-primary"
                    )}
                  />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="relative mb-8 overflow-hidden rounded-2xl">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="relative aspect-[4/3] md:aspect-square">
                <img
                  src={listing.images[currentImage]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden gap-2 md:grid md:grid-cols-2">
                {listing.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden">
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 2}`}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile carousel controls */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:hidden">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev === 0 ? listing.images.length - 1 : prev - 1
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setCurrentImage((prev) => (prev + 1) % listing.images.length)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
            {/* Main Content */}
            <div>
              {/* Host Info */}
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Hosted by {listing.host_name}
                  </h2>
                  <p className="text-muted-foreground">
                    {listing.max_guests} guests · {listing.bedrooms} bedroom
                    {listing.bedrooms > 1 ? "s" : ""} · {listing.beds} bed
                    {listing.beds > 1 ? "s" : ""} · {listing.bathrooms} bath
                    {listing.bathrooms > 1 ? "s" : ""}
                  </p>
                </div>
                <img
                  src={listing.host_avatar}
                  alt={listing.host_name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>

              {/* Quick Info */}
              <div className="grid gap-6 border-b border-border py-6">
                <div className="flex gap-4">
                  <Users className="h-6 w-6 text-foreground" />
                  <div>
                    <p className="font-medium">Self check-in</p>
                    <p className="text-sm text-muted-foreground">
                      Check yourself in with the keypad.
                    </p>
                  </div>
                </div>
                {listing.is_superhost && (
                  <div className="flex gap-4">
                    <Star className="h-6 w-6 text-foreground" />
                    <div>
                      <p className="font-medium">{listing.host_name} is a Superhost</p>
                      <p className="text-sm text-muted-foreground">
                        Superhosts are experienced, highly rated hosts.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-b border-border py-6">
                <p className="leading-relaxed text-foreground">{listing.description}</p>
              </div>

              {/* Amenities */}
              <div className="border-b border-border py-6">
                <h3 className="mb-4 text-xl font-semibold">What this place offers</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {listing.amenities.slice(0, 8).map((amenity) => {
                    const Icon = amenityIcons[amenity] || Wifi;
                    return (
                      <div key={amenity} className="flex items-center gap-4">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews Preview */}
              <div className="py-6">
                <h3 className="mb-4 text-xl font-semibold">
                  <Star className="mr-2 inline-block h-5 w-5 fill-foreground text-foreground" />
                  {listing.rating} · {listing.review_count} reviews
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-xl border border-border p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted" />
                        <div>
                          <p className="font-medium">Guest {i}</p>
                          <p className="text-sm text-muted-foreground">November 2024</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Amazing stay! The property was exactly as described and the host was
                        incredibly responsive. Would definitely recommend.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-6 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold">${listing.price_per_night}</span>
                    <span className="text-muted-foreground"> night</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-foreground text-foreground" />
                    <span className="font-medium">{listing.rating}</span>
                    <span className="text-muted-foreground">
                      · {listing.review_count} reviews
                    </span>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-4 rounded-lg border border-border">
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-3 text-left hover:bg-secondary/50 transition-colors">
                          <p className="text-xs font-semibold uppercase">Check-in</p>
                          <p className={cn("text-sm", !checkIn && "text-muted-foreground")}>
                            {checkIn ? format(checkIn, "MMM d, yyyy") : "Add date"}
                          </p>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-3 text-left hover:bg-secondary/50 transition-colors">
                          <p className="text-xs font-semibold uppercase">Checkout</p>
                          <p className={cn("text-sm", !checkOut && "text-muted-foreground")}>
                            {checkOut ? format(checkOut, "MMM d, yyyy") : "Add date"}
                          </p>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => date < (checkIn || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="border-t border-border p-3">
                    <p className="text-xs font-semibold uppercase">Guests</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {guests} guest{guests > 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          disabled={guests <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setGuests(Math.min(listing.max_guests, guests + 1))}
                          disabled={guests >= listing.max_guests}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleReserve}>
                  Reserve
                </Button>

                <p className="mt-3 text-center text-sm text-muted-foreground">
                  You won't be charged yet
                </p>

                {nights > 0 && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="underline">
                        ${listing.price_per_night} × {nights} nights
                      </span>
                      <span>${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="underline">Service fee</span>
                      <span>${serviceFee}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 font-semibold">
                      <span>Total</span>
                      <span>${total}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetail;
