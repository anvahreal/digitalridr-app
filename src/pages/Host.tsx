import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import {
  DollarSign,
  Shield,
  Users,
  Calendar,
  BarChart3,
  Home,
  ArrowRight,
  Check
} from "lucide-react";

const Host = () => {
  const navigate = useNavigate();
  const { user, profile } = useProfile();

  const handleGetStarted = () => {
    if (!user) {
      navigate("/auth");
    } else if (profile?.is_host || profile?.host_status === 'approved') {
      navigate("/host/dashboard");
    } else {
      navigate("/host/create-listing");
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn extra income",
      description: "Turn your space into a revenue stream. Hosts on Digital Ridr earn an average of ₦600,000/month.",
    },

    {
      icon: Calendar,
      title: "Flexible scheduling",
      description: "You decide when to host. Block dates, set minimum stays, and customize your availability.",
    },
    {
      icon: Users,
      title: "24/7 support",
      description: "Our dedicated support team is always available to help you and your guests.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Create your listing",
      description: "Share info about your space, including photos, amenities, and your house rules.",
    },
    {
      number: "2",
      title: "Set your price",
      description: "You choose your nightly rate. We suggest competitive pricing based on similar listings.",
    },
    {
      number: "3",
      title: "Publish and earn",
      description: "Once your listing is live, guests can book instantly or send reservation requests.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-background py-20 text-foreground md:py-32 transition-colors duration-300">
          {/* Mesh Gradients for Premium Look in Light Mode */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[20%] -right-[10%] h-[80%] w-[60%] rounded-full bg-[#F48221]/10 blur-[100px] opacity-70 dark:opacity-10" />
            <div className="absolute -bottom-[20%] -left-[10%] h-[80%] w-[60%] rounded-full bg-orange-100/60 blur-[100px] opacity-80 dark:bg-[#F48221]/5 dark:opacity-10" />
          </div>

          <div className="absolute inset-0 opacity-15 dark:opacity-30 z-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="container relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black md:text-5xl lg:text-6xl tracking-tight">
                Open your door to hosting
              </h1>
              <p className="mt-6 text-xl text-muted-foreground font-medium">
                Join millions of hosts earning extra income by sharing their space with travelers around the world.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  size="xl"
                  onClick={handleGetStarted}
                  className="bg-[#F48221] hover:bg-[#E36D0B] text-white font-bold rounded-2xl h-14 px-8"
                >
                  Get started
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  onClick={() => navigate('/learn-more')}
                  className="rounded-2xl border-border bg-background hover:bg-muted font-bold h-14 px-8"
                >
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                See what you could earn
              </h2>
              <p className="mt-4 text-muted-foreground">
                Based on the average nightly rate and booking frequency in your area
              </p>

              <div className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-card">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Estimated earnings</span>
                  <span className="text-4xl font-bold text-primary md:text-5xl">₦600,000</span>
                  <span className="text-muted-foreground">per month</span>
                </div>
                <div className="mt-8 grid gap-6 text-left md:grid-cols-3">
                  <div className="rounded-lg bg-secondary p-4">
                    <BarChart3 className="mb-2 h-6 w-6 text-primary" />
                    <p className="font-medium">10 nights booked</p>
                    <p className="text-sm text-muted-foreground">Average bookings per month</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <DollarSign className="mb-2 h-6 w-6 text-primary" />
                    <p className="font-medium">₦60,000/night</p>
                    <p className="text-sm text-muted-foreground">Average nightly rate</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <Home className="mb-2 h-6 w-6 text-primary" />
                    <p className="font-medium">Entire home</p>
                    <p className="text-sm text-muted-foreground">2 bedrooms · 1 bath</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-secondary/30 py-16 md:py-24">
          <div className="container">
            <h2 className="text-center text-3xl font-bold md:text-4xl">
              Why host with Digital Ridr?
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-background p-6 shadow-soft transition-shadow hover:shadow-card"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-24">
          <div className="container">
            <h2 className="text-center text-3xl font-bold md:text-4xl">
              How to get started
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute right-0 top-8 hidden h-px w-full bg-border md:block" />
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                      {step.number}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="bg-secondary/30 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold md:text-4xl">
                Everything you need to host
              </h2>
              <div className="mt-12 space-y-4">
                {[
                  "Easy-to-use listing creation tools",
                  "Secure payment processing",
                  "Guest reviews",
                  "Flexible cancellation policies",

                  "Instant booking option",
                  "Host analytics dashboard",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg bg-background p-4 shadow-soft"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                      <Check className="h-5 w-5 text-success" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Ready to become a host?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join our community of hosts and start earning today.
              </p>
              <Button
                size="xl"
                onClick={handleGetStarted}
                className="mt-8 gap-2"
              >
                Start hosting <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Host;
