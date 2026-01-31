import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Simple scroll detection
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 20);
    });
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-soft"
          : "bg-background"
      }`}
    >
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="assets/digital-ridr-logo.png" 
            alt="Digital Ridr - Travels & Apartments" 
            className="h-10 md:h-12 w-auto"
          />
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex items-center">
          <button className="flex items-center gap-4 rounded-full border border-border bg-background px-4 py-2 shadow-soft hover:shadow-card transition-shadow">
            <span className="font-medium text-sm">Anywhere</span>
            <span className="h-6 w-px bg-border" />
            <span className="font-medium text-sm">Any week</span>
            <span className="h-6 w-px bg-border" />
            <span className="text-muted-foreground text-sm">Add guests</span>
            <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Search className="h-4 w-4" />
            </div>
          </button>
        </div>

        {/* Right Menu */}
        <div className="flex items-center gap-2">
          <Link to="/host">
            <Button variant="ghost" className="hidden md:flex rounded-full font-medium">
              Become a Host
            </Button>
          </Link>
          <Button variant="icon" size="icon" className="hidden md:flex">
            <Globe className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full border-border px-3 py-2 hover:shadow-card"
              >
                <Menu className="h-4 w-4" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
                <Link to="/auth" className="font-medium">Sign up</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/auth">Log in</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/host">Host your home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Help Center</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}