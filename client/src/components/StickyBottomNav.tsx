import { Grid3X3, FileText, Calendar } from "lucide-react";
import { Link } from "wouter";

export function StickyBottomNav() {
  return (
    <nav 
      className="lg:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'hsl(var(--background))',
        borderTop: '1px solid hsl(var(--border))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="grid grid-cols-3 h-16">
          <Link 
            href="/services"
            className="flex flex-col items-center justify-center gap-1 w-full h-full hover:bg-muted/50 active:bg-muted transition-colors"
            data-testid="nav-bottom-services"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs font-medium">Services</span>
          </Link>
          
          <Link 
            href="/get-quote" 
            className="flex flex-col items-center justify-center gap-1 w-full h-full hover:bg-muted/50 active:bg-muted transition-colors"
            data-testid="nav-bottom-quote"
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Get Quote</span>
          </Link>
          
          <Link 
            href="/contact"
            className="flex flex-col items-center justify-center gap-1 w-full h-full hover:bg-muted/50 active:bg-muted transition-colors"
            data-testid="nav-bottom-schedule"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">Schedule</span>
          </Link>
        </div>
    </nav>
  );
}
