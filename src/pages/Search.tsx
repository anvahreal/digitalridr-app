import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { mockListings } from "@/data/mockListings";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, MapPin, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const amenitiesFilter = [
  "WiFi",
  "Kitchen",
  "Pool",
  "Hot Tub",
  "Beach Access",
  "Fireplace",
  "Air Conditioning",
  "Parking",
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const locationParam = searchParams.get("location") || "";
  
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [bedrooms, setBedrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredListings = useMemo(() => {
    return mockListings.filter((listing) => {
      if (locationParam) {
        const searchLower = locationParam.toLowerCase();
        const matchesLocation =
          listing.location.toLowerCase().includes(searchLower) ||
          listing.city.toLowerCase().includes(searchLower) ||
          listing.country.toLowerCase().includes(searchLower);
        if (!matchesLocation) return false;
      }
      if (listing.price_per_night < priceRange[0] || listing.price_per_night > priceRange[1]) return false;
      if (bedrooms > 0 && listing.bedrooms < bedrooms) return false;
      if (selectedAmenities.length > 0) {
        return selectedAmenities.every((amenity) => listing.amenities.includes(amenity));
      }
      return true;
    });
  }, [locationParam, priceRange, bedrooms, selectedAmenities]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setBedrooms(0);
    setSelectedAmenities([]);
  };

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 1000 || bedrooms > 0 || selectedAmenities.length > 0;

  const FiltersContent = () => (
    <div className="space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="mb-4 font-semibold text-foreground">Price range</h3>
        <p className="mb-4 text-sm text-muted-foreground">${priceRange[0]} - ${priceRange[1]}+ per night</p>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={1000}
          step={25}
          className="w-full [&_.bg-primary]:bg-[#F48221]"
        />
      </div>

      {/* Bedrooms */}
      <div>
        <h3 className="mb-4 font-semibold text-foreground">Bedrooms</h3>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              variant={bedrooms === num ? "default" : "outline"}
              size="sm"
              onClick={() => setBedrooms(num)}
              className={`min-w-[48px] rounded-full ${bedrooms === num ? 'bg-[#F48221] hover:bg-[#E36D0B]' : ''}`}
            >
              {num === 0 ? "Any" : num === 5 ? "5+" : num}
            </Button>
          ))}
        </div>
      </div>

      {/* Amenities - Fixed Padding and Layout */}
      <div>
        <h3 className="mb-4 font-semibold text-foreground">Amenities</h3>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
          {amenitiesFilter.map((amenity) => (
            <label
              key={amenity}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-slate-50 min-h-[56px]"
            >
              <Checkbox
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
                className="data-[state=checked]:bg-[#F48221] data-[state=checked]:border-[#F48221] shrink-0"
              />
              <span className="text-sm font-medium leading-tight">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="py-6 md:py-10">
        <div className="container px-4">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground md:text-3xl flex items-center gap-2">
                {locationParam && <MapPin className="h-5 w-5 text-[#00AEEF]" />}
                {locationParam ? `Stays in ${locationParam}` : "All stays"}
              </h1>
              <p className="text-sm text-muted-foreground">{filteredListings.length} places found</p>
            </div>

            <div className="flex items-center gap-2">
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-2 rounded-full lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters {hasActiveFilters && `(${selectedAmenities.length + (bedrooms > 0 ? 1 : 0)})`}
                  </Button>
                </SheetTrigger>
                {/* Scroll Fix: flex-col and overflow-hidden here */}
                <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 flex flex-col overflow-hidden">
                  <SheetHeader className="p-6 border-b shrink-0">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  
                  {/* The actual scrollable area */}
                  <div className="flex-1 overflow-y-auto p-6 pb-32">
                    <FiltersContent />
                  </div>

                  {/* Fixed Footer */}
                  <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4 pb-8 flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={clearFilters}>Clear all</Button>
                    <Button className="flex-1 rounded-xl bg-[#F48221] hover:bg-[#E36D0B]" onClick={() => setIsFiltersOpen(false)}>
                      Show {filteredListings.length} places
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-10">
            <aside className="hidden w-72 shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b pb-4">
                  <h2 className="font-bold text-lg">Filters</h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#00AEEF]">Clear all</Button>
                  )}
                </div>
                <FiltersContent />
              </div>
            </aside>

            <div className="flex-1">
              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredListings.map((listing, index) => (
                    <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 text-5xl">🏠</div>
                  <h3 className="text-xl font-bold">No exact matches</h3>
                  <p className="text-muted-foreground mb-6">Try changing or removing filters.</p>
                  <Button onClick={clearFilters} className="bg-[#F48221] rounded-full">Clear all filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;