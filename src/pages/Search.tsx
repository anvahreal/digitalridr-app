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
      // Location filter
      if (locationParam) {
        const searchLower = locationParam.toLowerCase();
        const matchesLocation =
          listing.location.toLowerCase().includes(searchLower) ||
          listing.city.toLowerCase().includes(searchLower) ||
          listing.country.toLowerCase().includes(searchLower);
        if (!matchesLocation) return false;
      }

      // Price filter
      if (listing.price_per_night < priceRange[0] || listing.price_per_night > priceRange[1]) {
        return false;
      }

      // Bedrooms filter
      if (bedrooms > 0 && listing.bedrooms < bedrooms) {
        return false;
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every((amenity) =>
          listing.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }, [locationParam, priceRange, bedrooms, selectedAmenities]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
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
        <h3 className="mb-4 font-semibold">Price range</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          ${priceRange[0]} - ${priceRange[1]}+ per night
        </p>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={1000}
          step={25}
          className="w-full"
        />
      </div>

      {/* Bedrooms */}
      <div>
        <h3 className="mb-4 font-semibold">Bedrooms</h3>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              variant={bedrooms === num ? "default" : "outline"}
              size="sm"
              onClick={() => setBedrooms(num)}
              className="min-w-[48px]"
            >
              {num === 0 ? "Any" : num === 5 ? "5+" : num}
            </Button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="mb-4 font-semibold">Amenities</h3>
        <div className="grid grid-cols-2 gap-3">
          {amenitiesFilter.map((amenity) => (
            <label
              key={amenity}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
            >
              <Checkbox
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                {locationParam ? (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    Stays in {locationParam}
                  </span>
                ) : (
                  "All stays"
                )}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {filteredListings.length} {filteredListings.length === 1 ? "place" : "places"} found
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear filters
                </Button>
              )}

              {/* Mobile Filters */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {(priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0) +
                          (bedrooms > 0 ? 1 : 0) +
                          selectedAmenities.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto">
                    <FiltersContent />
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={clearFilters}>
                      Clear all
                    </Button>
                    <Button className="flex-1" onClick={() => setIsFiltersOpen(false)}>
                      Show {filteredListings.length} places
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden w-72 shrink-0 lg:block">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-semibold">Filters</h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>
                <FiltersContent />
              </div>
            </aside>

            {/* Listings Grid */}
            <div className="flex-1">
              {filteredListings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredListings.map((listing, index) => (
                    <div
                      key={listing.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 text-6xl">🏠</div>
                  <h3 className="mb-2 text-xl font-semibold">No exact matches</h3>
                  <p className="mb-6 text-muted-foreground">
                    Try changing or removing some filters to see more results.
                  </p>
                  <Button onClick={clearFilters}>Clear all filters</Button>
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
