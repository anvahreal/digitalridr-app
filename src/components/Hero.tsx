import { SearchBar } from "./SearchBar";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30 py-12 md:py-20 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative z-10 px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Find your perfect getaway
          </div>

          {/* Heading */}
          <h1 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-foreground animate-slide-up leading-tight">
            Discover{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              unique stays
            </span>
            <br />
            around lagos
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-6 md:mb-10 max-w-2xl text-base md:text-lg lg:text-xl text-muted-foreground animate-slide-up px-4" style={{ animationDelay: "0.1s" }}>
            From the mainlands to the islands, find the perfect place to stay for your comfort.
          </p>

          {/* Search Bar */}
          <div className="flex justify-center animate-slide-up px-4" style={{ animationDelay: "0.2s" }}>
            <SearchBar variant="hero" />
          </div>

          {/* Stats */}
          <div className="mt-12 md:mt-16 grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4 animate-fade-in px-4" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "10K+", label: "Unique stays" },
              { value: "150+", label: "Countries" },
              { value: "50M+", label: "Guest arrivals" },
              { value: "4.9", label: "Avg. rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}