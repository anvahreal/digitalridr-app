import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Globe } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    support: [
      { label: "Help Center", href: "#" },
      { label: "Safety information", href: "#" },
      { label: "Cancellation options", href: "#" },
      { label: "Our COVID-19 Response", href: "#" },
    ],
    community: [
      { label: "Combating discrimination", href: "#" },
      { label: "Accessibility", href: "#" },
      { label: "Referrals", href: "#" },
      { label: "Gift cards", href: "#" },
    ],
    hosting: [
      { label: "Host your home", href: "/host" },
      { label: "Host an experience", href: "#" },
      { label: "Responsible hosting", href: "#" },
      { label: "Resource Center", href: "#" },
    ],
    about: [
      { label: "Newsroom", href: "#" },
      { label: "Learn about new features", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Investors", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Hosting</h3>
            <ul className="space-y-3">
              {footerLinks.hosting.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Staybnb</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} Staybnb, Inc.</span>
            <span>·</span>
            <Link to="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link to="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link to="#" className="hover:text-foreground transition-colors">
              Sitemap
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:underline">
              <Globe className="h-4 w-4" />
              English (US)
            </button>
            <div className="flex items-center gap-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
