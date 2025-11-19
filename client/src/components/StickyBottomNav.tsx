import { useState, useEffect } from "react";
import { Grid3X3, FileText, Calendar } from "lucide-react";
import { useLocation, Link } from "wouter";

export function StickyBottomNav() {
  const [location, setLocation] = useLocation();
  const [pendingScroll, setPendingScroll] = useState<{ path: string; id: string; key: number } | null>(null);

  // Watch for location changes and scroll when navigation completes
  useEffect(() => {
    if (pendingScroll && location === pendingScroll.path) {
      // Wait for DOM to be ready using requestAnimationFrame
      requestAnimationFrame(() => {
        const element = document.getElementById(pendingScroll.id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          setPendingScroll(null); // Clear to avoid loops
        }
      });
    }
  }, [location, pendingScroll]);

  const scrollToServices = () => {
    if (location !== "/") {
      // Navigate to home first, then scroll after mount
      setPendingScroll({ path: "/", id: "services", key: Date.now() });
      setLocation("/");
    } else {
      // Already on home, refresh key to trigger effect
      setPendingScroll({ path: "/", id: "services", key: Date.now() });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
      <div className="container px-0">
        <div className="grid grid-cols-3 h-16">
          <button 
            onClick={scrollToServices}
            className="flex flex-col items-center justify-center gap-1 w-full h-full hover-elevate active-elevate-2 transition-colors"
            data-testid="nav-bottom-services"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs font-medium">Services</span>
          </button>
          
          <Link 
            href="/get-quote" 
            className="flex flex-col items-center justify-center gap-1 w-full h-full hover-elevate active-elevate-2 transition-colors"
            data-testid="nav-bottom-quote"
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Get Quote</span>
          </Link>
          
          <Link 
            href="/contact"
            className="flex flex-col items-center justify-center gap-1 w-full h-full hover-elevate active-elevate-2 transition-colors"
            data-testid="nav-bottom-schedule"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">Schedule</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
