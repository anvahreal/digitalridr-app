import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Globe } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    support: [
      { label: "Help Center", href: "#" },
      { label: "Safety info", href: "#" }, // Shortened for mobile
      { label: "Cancellations", href: "#" }, // Shortened
    ],
    hosting: [
      { label: "Host your home", href: "/host" },
      { label: "Resource Center", href: "#" },
    ],
    about: [
      { label: "About Us", href: "#" },
      { label: "Contact", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="container max-w-7xl py-8 md:py-12">
        {/* Main Links Grid - Better wrapping on mobile */}
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-4 lg:grid-cols-4 mb-10">
          <div>
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-foreground">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-foreground">Hosting</h3>
            <ul className="space-y-2">
              {footerLinks.hosting.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-foreground">Digital Ridr</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials moved here for mobile visibility */}
          <div className="col-span-1">
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-foreground">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Clean & Compact */}
        <div className="pt-6 border-t border-border flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] font-medium text-muted-foreground">
            <span>© {currentYear} Digital Ridr</span>
            <span className="hidden md:inline">·</span>
            <Link to="/privacy-policy" className="hover:text-foreground">Privacy</Link>
            <Link to="#" className="hover:text-foreground">Terms</Link>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors">
              <Globe className="h-4 w-4 text-primary" />
              English (NG)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}