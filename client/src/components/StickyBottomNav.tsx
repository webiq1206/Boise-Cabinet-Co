import { Grid3X3, FileText, Calendar } from "lucide-react";
import { Link } from "wouter";

export function StickyBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3 h-16">
          <Link 
            href="/services"
            className="flex flex-col items-center justify-center gap-1 w-full h-full hover-elevate active-elevate-2 transition-colors"
            data-testid="nav-bottom-services"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs font-medium">Services</span>
          </Link>
          
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
    </nav>
  );
}
