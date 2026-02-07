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
        "w-full transition-all duration-300",
        isHero ? "max-w-4xl px-2 sm:px-4" : "max-w-3xl",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row items-stretch sm:items-center rounded-[24px] sm:rounded-full border border-border bg-background shadow-card transition-shadow hover:shadow-card-hover overflow-hidden",
          isHero ? "p-1.5 sm:p-2" : "p-1"
        )}
      >
        {/* Location - Full width on mobile */}
        <Popover open={activeTab === "location"} onOpenChange={(open) => setActiveTab(open ? "location" : null)}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex flex-col px-5 py-2 sm:py-3 text-left transition-colors hover:bg-secondary w-full sm:flex-1 rounded-t-[20px] sm:rounded-full",
                activeTab === "location" && "bg-secondary"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Where</span>
              <input
                type="text"
                placeholder="Search destinations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </button>
          </PopoverTrigger>
          {/* ... (PopoverContent stays the same) */}
        </Popover>

        {/* Mobile Divider */}
        <div className="sm:hidden border-t border-border mx-4" />

        {/* Check-in & Check-out: SIDE BY SIDE ON MOBILE */}
        <div className="flex sm:contents border-b sm:border-none border-border">
          <Popover open={activeTab === "checkIn"} onOpenChange={(open) => setActiveTab(open ? "checkIn" : null)}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex flex-col flex-1 px-5 py-2 sm:py-3 text-left transition-colors hover:bg-secondary sm:w-auto",
                  activeTab === "checkIn" && "bg-secondary"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Check-in</span>
                <span className={cn("text-xs font-bold", checkIn ? "text-foreground" : "text-muted-foreground")}>
                  {checkIn ? format(checkIn, "MMM d") : "Add dates"}
                </span>
              </button>
            </PopoverTrigger>
            {/* ... (Calendar content stays same) */}
          </Popover>

          <div className="h-8 w-px bg-border self-center" />

          <Popover open={activeTab === "checkOut"} onOpenChange={(open) => setActiveTab(open ? "checkOut" : null)}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex flex-col flex-1 px-5 py-2 sm:py-3 text-left transition-colors hover:bg-secondary sm:w-auto",
                  activeTab === "checkOut" && "bg-secondary"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Check-out</span>
                <span className={cn("text-xs font-bold", checkOut ? "text-foreground" : "text-muted-foreground")}>
                  {checkOut ? format(checkOut, "MMM d") : "Add dates"}
                </span>
              </button>
            </PopoverTrigger>
            {/* ... (Calendar content stays same) */}
          </Popover>
        </div>

        {/* Desktop Dividers */}
        <div className="hidden sm:block h-8 w-px bg-border" />

        {/* Guests & Search Button Area */}
        <div className="flex items-center justify-between sm:contents p-1 sm:p-0">
          <Popover open={activeTab === "guests"} onOpenChange={(open) => setActiveTab(open ? "guests" : null)}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex flex-col px-5 py-2 sm:py-3 text-left transition-colors hover:bg-secondary flex-1 sm:w-auto sm:rounded-full rounded-bl-[20px]",
                  activeTab === "guests" && "bg-secondary"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Who</span>
                <span className={cn("text-xs font-bold", guests > 1 ? "text-foreground" : "text-muted-foreground")}>
                  {guests > 1 ? `${guests} guests` : "Add guests"}
                </span>
              </button>
            </PopoverTrigger>
            {/* ... (PopoverContent stays same) */}
          </Popover>

          <div className="hidden sm:block h-8 w-px bg-border" />

          <Button
            variant="search"
            size={isHero ? "lg" : "default"}
            className={cn(
              "shrink-0 rounded-full h-12 w-12 sm:w-auto sm:h-12 flex items-center justify-center sm:px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20",
              "sm:ml-2 mr-1 sm:mr-0"
            )}
            onClick={handleSearch}
          >
            <Search className={cn(isHero ? "h-5 w-5" : "h-4 w-4")} />
            <span className="hidden sm:inline font-bold ml-2">Search</span>
          </Button>
        </div>
      </div>
    </div>
  );
}