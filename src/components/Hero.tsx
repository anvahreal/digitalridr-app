import { SearchBar } from "./SearchBar";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30 py-20 md:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Find your perfect getaway
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-slide-up">
            Discover{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              unique stays
            </span>
            <br />
            around the world
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
            From cozy cabins to beachfront villas, find the perfect place to stay for your next adventure.
          </p>

          {/* Search Bar */}
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <SearchBar variant="hero" />
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "10K+", label: "Unique stays" },
              { value: "150+", label: "Countries" },
              { value: "50M+", label: "Guest arrivals" },
              { value: "4.9", label: "Avg. rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
