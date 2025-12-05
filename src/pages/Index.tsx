import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ListingCard } from "@/components/ListingCard";
import { Footer } from "@/components/Footer";
import { mockListings, featuredLocations } from "@/data/mockListings";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />

        {/* Featured Listings */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                  Featured stays
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Handpicked properties loved by guests
                </p>
              </div>
              <Link to="/search">
                <Button variant="ghost" className="gap-2">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {mockListings.slice(0, 8).map((listing, index) => (
                <div
                  key={listing.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Explore by Location */}
        <section className="bg-secondary/30 py-16 md:py-24">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Explore nearby
              </h2>
              <p className="mt-2 text-muted-foreground">
                Popular destinations to inspire your next trip
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredLocations.map((location, index) => (
                <Link
                  key={location.name}
                  to={`/search?location=${location.name}`}
                  className="group flex items-center gap-4 rounded-xl bg-background p-4 shadow-soft transition-all hover:shadow-card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={location.image}
                    alt={location.name}
                    className="h-16 w-16 rounded-lg object-cover transition-transform group-hover:scale-105"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {location.listings} stays
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Become a Host CTA */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/80 p-8 text-background md:p-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              
              <div className="relative z-10 max-w-xl">
                <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                  Open your door to hosting
                </h2>
                <p className="mt-4 text-lg text-background/80">
                  Earn extra income and unlock new opportunities by sharing your space.
                </p>
                <Link to="/host">
                  <Button
                    size="xl"
                    className="mt-8 bg-background text-foreground hover:bg-background/90"
                  >
                    Learn more
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Unique Stays */}
        <section className="pb-16 md:pb-24">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Unique stays
              </h2>
              <p className="mt-2 text-muted-foreground">
                Spaces that are more than just a place to sleep
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Treehouses", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600" },
                { name: "Tiny homes", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600" },
                { name: "Domes", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600" },
              ].map((category, index) => (
                <Link
                  key={category.name}
                  to={`/search?type=${category.name.toLowerCase()}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
