import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SearchBarProps {
  variant?: "hero" | "compact";
  className?: string;
}

export function SearchBar({ variant = "hero", className }: SearchBarProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn.toISOString());
    if (checkOut) params.set("checkOut", checkOut.toISOString());
    if (guests > 1) params.set("guests", guests.toString());
    
    navigate(`/search?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "w-full",
        isHero ? "max-w-4xl" : "max-w-3xl",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center rounded-full border border-border bg-background shadow-card transition-shadow hover:shadow-card-hover",
          isHero ? "p-2" : "p-1"
        )}
      >
        {/* Location */}
        <Popover open={activeTab === "location"} onOpenChange={(open) => setActiveTab(open ? "location" : null)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex flex-1 flex-col rounded-full px-6 py-3 text-left transition-colors hover:bg-secondary",
                activeTab === "location" && "bg-secondary"
              )}
            >
              <span className="text-xs font-semibold">Where</span>
              <input
                type="text"
                placeholder="Search destinations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-3">
              <h4 className="font-semibold">Popular destinations</h4>
              {["New York", "Malibu", "Aspen", "Tulum", "Lake Tahoe"].map((place) => (
                <button
                  key={place}
                  onClick={() => {
                    setLocation(place);
                    setActiveTab(null);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-secondary transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium">{place}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border" />

        {/* Check In */}
        <Popover open={activeTab === "checkIn"} onOpenChange={(open) => setActiveTab(open ? "checkIn" : null)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex flex-col rounded-full px-6 py-3 text-left transition-colors hover:bg-secondary",
                activeTab === "checkIn" && "bg-secondary"
              )}
            >
              <span className="text-xs font-semibold">Check in</span>
              <span className={cn("text-sm", checkIn ? "text-foreground" : "text-muted-foreground")}>
                {checkIn ? format(checkIn, "MMM d") : "Add dates"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={checkIn}
              onSelect={(date) => {
                setCheckIn(date);
                setActiveTab("checkOut");
              }}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border" />

        {/* Check Out */}
        <Popover open={activeTab === "checkOut"} onOpenChange={(open) => setActiveTab(open ? "checkOut" : null)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex flex-col rounded-full px-6 py-3 text-left transition-colors hover:bg-secondary",
                activeTab === "checkOut" && "bg-secondary"
              )}
            >
              <span className="text-xs font-semibold">Check out</span>
              <span className={cn("text-sm", checkOut ? "text-foreground" : "text-muted-foreground")}>
                {checkOut ? format(checkOut, "MMM d") : "Add dates"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={checkOut}
              onSelect={(date) => {
                setCheckOut(date);
                setActiveTab("guests");
              }}
              disabled={(date) => date < (checkIn || new Date())}
            />
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border" />

        {/* Guests */}
        <Popover open={activeTab === "guests"} onOpenChange={(open) => setActiveTab(open ? "guests" : null)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex flex-col rounded-full px-6 py-3 text-left transition-colors hover:bg-secondary",
                activeTab === "guests" && "bg-secondary"
              )}
            >
              <span className="text-xs font-semibold">Who</span>
              <span className={cn("text-sm", guests > 1 ? "text-foreground" : "text-muted-foreground")}>
                {guests > 1 ? `${guests} guests` : "Add guests"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="end">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Guests</p>
                <p className="text-sm text-muted-foreground">How many guests?</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{guests}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setGuests(guests + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <Button
          variant="search"
          size={isHero ? "lg" : "default"}
          className={cn(
            "shrink-0",
            isHero ? "h-12 gap-2 px-6" : "h-10 px-4"
          )}
          onClick={handleSearch}
        >
          <Search className={cn(isHero ? "h-5 w-5" : "h-4 w-4")} />
          {isHero && <span className="font-semibold">Search</span>}
        </Button>
      </div>
    </div>
  );
}
