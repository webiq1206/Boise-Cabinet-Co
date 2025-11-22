import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Wrench, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { PRIORITY_SERVICES, CITIES } from "@shared/contentData";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: 'service' | 'city' | 'page';
  title: string;
  description?: string;
  href: string;
  icon: typeof Search;
}

const PAGES: SearchResult[] = [
  { type: 'page', title: 'Home', href: '/', icon: FileText },
  { type: 'page', title: 'About', href: '/about', icon: FileText },
  { type: 'page', title: 'Contact', href: '/contact', icon: FileText },
  { type: 'page', title: 'Pricing', href: '/pricing', icon: FileText },
  { type: 'page', title: 'Services Directory', href: '/services', icon: Wrench },
  { type: 'page', title: 'Blog', href: '/blog', icon: FileText },
  { type: 'page', title: 'Get Quote', href: '/get-quote', icon: FileText },
];

export function SearchBar({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build search index
  const searchIndex: SearchResult[] = [
    // Services
    ...PRIORITY_SERVICES.map(service => ({
      type: 'service' as const,
      title: service.name,
      description: service.shortDescription,
      href: `/services/${service.slug}`,
      icon: Wrench
    })),
    // Cities
    ...CITIES.map(city => ({
      type: 'city' as const,
      title: `${city.name} Lawn Care`,
      description: `Professional lawn care services in ${city.name}, Idaho`,
      href: `/areas/${city.slug}`,
      icon: MapPin
    })),
    // Pages
    ...PAGES
  ];

  // Search function
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = searchIndex.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchQuery);
      const descriptionMatch = item.description?.toLowerCase().includes(searchQuery);
      return titleMatch || descriptionMatch;
    });

    setResults(filtered.slice(0, 8)); // Limit to 8 results
    setIsOpen(filtered.length > 0);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (href: string) => {
    setQuery("");
    setIsOpen(false);
    setLocation(href);
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search services, cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="pl-10 pr-4"
          data-testid="input-search"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          <div className="py-2">
            {results.map((result, index) => {
              const Icon = result.icon;
              return (
                <button
                  key={`${result.type}-${result.href}-${index}`}
                  onClick={() => handleResultClick(result.href)}
                  className="w-full px-4 py-3 flex items-start gap-3 hover-elevate active-elevate-2 transition-colors text-left"
                  data-testid={`search-result-${index}`}
                  aria-label={`Navigate to ${result.title}`}
                >
                  <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">
                      {result.title}
                    </div>
                    {result.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {result.description}
                      </div>
                    )}
                    <div className={cn(
                      "text-xs mt-1",
                      result.type === 'service' && "text-primary/80",
                      result.type === 'city' && "text-blue-600/80",
                      result.type === 'page' && "text-muted-foreground"
                    )}>
                      {result.type === 'service' && '• Service'}
                      {result.type === 'city' && '• Service Area'}
                      {result.type === 'page' && '• Page'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
