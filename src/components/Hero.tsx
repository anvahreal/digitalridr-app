import { SearchBar } from "./SearchBar";
import { Star, ShieldCheck, MapPin } from "lucide-react";

export function Hero() {
  // We duplicate the array to ensure the marquee loop is seamless
  const stats = [
    { icon: Star, value: "4.9", label: "Avg Rating" },
    { icon: ShieldCheck, value: "Verified", label: "Host Profiles" },
    { icon: MapPin, value: "Lagos", label: "Mainland & Island" },
    { icon: Star, value: "4.9", label: "Avg Rating" },
    { icon: ShieldCheck, value: "Verified", label: "Host Profiles" },
    { icon: MapPin, value: "Lagos", label: "Mainland & Island" },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24 lg:py-32">
      
      {/* MATURE MESH GRADIENT BACKDROP */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] h-[70%] w-[50%] rounded-full bg-gradient-to-br from-primary/20 to-orange-200/40 blur-[120px] rotate-12 animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[80%] w-[60%] rounded-full bg-orange-50/50 blur-[100px] -rotate-12" />
      </div>

      <div className="container relative z-10 px-4">
        <div className="mx-auto max-w-5xl text-center">
          
          {/* Animated Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-orange-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary shadow-sm shadow-orange-100 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Premium Short-lets in Lagos
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 animate-slide-up leading-[1.05]">
            Discover unique stays <br /> 
            <span className="bg-gradient-to-r from-primary via-orange-500 to-orange-400 bg-clip-text text-transparent">
              all around Lagos.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base md:text-xl text-slate-600/90 font-medium animate-slide-up" style={{ animationDelay: "0.1s" }}>
            From the bustling streets of the Mainland to the serene shores of the Island. 
            Find your perfect getaway.
          </p>

          {/* Floating Glass Search Bar */}
          <div className="flex justify-center animate-slide-up w-full" style={{ animationDelay: "0.2s" }}>
            <div className="w-full max-w-4xl p-2 rounded-[32px] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_32px_64px_-16px_rgba(244,130,33,0.15)]">
              <SearchBar variant="hero" />
            </div>
          </div>

          {/* INFINITE MARQUEE STATS */}
          <div className="relative mt-20 w-full overflow-hidden py-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {/* Edge Fades for a premium look */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white via-white/50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white via-white/50 to-transparent" />

            {/* The Actual Moving Track */}
            <div className="flex w-max animate-marquee gap-16 md:gap-24 items-center hover:[animation-play-state:paused] cursor-pointer">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4 whitespace-nowrap">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-orange-50 flex items-center justify-center text-primary">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-black text-slate-900 leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}