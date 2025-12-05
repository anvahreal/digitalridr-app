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
          <div className="flex items-center">
            <svg viewBox="0 0 32 32" className="h-8 w-8 text-primary" fill="currentColor">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.212l-.257.26c-2.153 2.128-4.485 3.386-6.709 3.386C5.377 31 2.5 28.584 2.5 24.522l.005-.469c.026-.928.23-1.768.83-3.244l.216-.524c.996-2.298 5.146-10.992 7.098-14.819l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-.427 1.071-.573 1.655-.605 2.24l-.009.33v.206c0 2.926 2.001 4.478 4.357 4.478 1.583 0 3.312-.859 5.078-2.493l.61-.58.574-.548h2.762l.574.548.61.58c1.766 1.634 3.495 2.493 5.078 2.493 2.356 0 4.357-1.552 4.357-4.478l-.001-.206-.009-.33c-.032-.585-.178-1.169-.605-2.24l-.345-.836c-.97-2.262-5.105-10.916-7.031-14.692l-.523-1.008C18.053 3.539 17.239 3 16 3z" />
            </svg>
            <span className="ml-2 text-xl font-bold text-primary">staybnb</span>
          </div>
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
