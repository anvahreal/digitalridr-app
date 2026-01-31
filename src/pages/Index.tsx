import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ListingCard } from "@/components/ListingCard";
import { Footer } from "@/components/Footer";
import { mockListings } from "@/data/mockListings";
import { ArrowRight, ShieldCheck, Headphones, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  // Mock neighborhoods for the new section
  const neighborhoods = [
    { name: "Ikoyi", count: "120+ stays", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400" },
    { name: "Lekki Phase 1", count: "340+ stays", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400" },
    { name: "Victoria Island", count: "80+ stays", img: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400" },
    { name: "Surulere", count: "45+ stays", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main>
        <Hero />

        {/* New: Trust Bar - Essential for User UI */}
        <section className="bg-white border-y border-slate-100 py-6">
          <div className="container px-4 flex flex-wrap justify-between gap-6 md:gap-0">
            {[
              { icon: ShieldCheck, text: "Verified Listings", sub: "Hand-picked for quality" },
              { icon: CreditCard, text: "Secure Payments", sub: "Safe transactions via Paystack" },
              { icon: Headphones, text: "24/7 Support", sub: "We're here to help anytime" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-[#F48221]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.text}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Neighborhood Explorer */}
        <section className="py-16">
          <div className="container px-4">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight mb-8">
              Explore Lagos neighborhoods
            </h2>
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 snap-x sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
              {neighborhoods.map((n) => (
                <div key={n.name} className="flex-shrink-0 w-40 sm:w-auto group cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-3">
                    <img src={n.img} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{n.name}</h4>
                  <p className="text-xs text-slate-400">{n.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Stays */}
        <section className="pb-16 md:pb-24">
          <div className="container px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight">Featured stays</h2>
                <p className="mt-2 text-slate-500 font-medium">Top rated homes in Lagos this week</p>
              </div>
              <Link to="/search">
                <Button variant="outline" className="rounded-full border-slate-200 font-bold text-xs gap-2">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {mockListings.slice(0, 8).map((listing, index) => (
                <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Become a Host CTA - Updated colors for better UI contrast */}
        <section className="py-10">
          <div className="container px-4">
            <div className="relative overflow-hidden rounded-[40px] bg-slate-900 p-8 text-white md:p-16">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#F48221]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-xl">
                <h2 className="text-3xl font-black md:text-5xl tracking-tighter leading-tight">
                  Share your space, <br /> earn extra income.
                </h2>
                <p className="mt-6 text-lg text-slate-400 font-medium">
                  Join thousands of hosts in Lagos earning monthly by renting out their apartments and studios.
                </p>
                <Link to="/host">
                  <Button size="lg" className="mt-8 bg-[#F48221] hover:bg-orange-600 text-white font-bold h-14 px-10 rounded-2xl">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Unique Stays (Keep your existing side-scroll logic) */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight">Beyond the ordinary</h2>
              <p className="mt-2 text-slate-500 font-medium">Discover unique architecture and hidden gems</p>
            </div>
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 snap-x sm:grid sm:grid-cols-3 sm:overflow-visible">
              {[
                { name: "Treehouses", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600" },
                { name: "Tiny homes", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600" },
                { name: "Luxury Domes", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600" },
              ].map((category, index) => (
                <Link key={category.name} to={`/search?type=${category.name.toLowerCase()}`} className="group relative aspect-[3/4] w-[80%] flex-shrink-0 snap-start overflow-hidden rounded-3xl sm:w-auto">
                  <img src={category.image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-2xl font-black text-white">{category.name}</h3>
                    <p className="text-xs text-white/70 font-bold mt-1 uppercase tracking-widest">Explore now</p>
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