"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractLeadingHouseNumber } from "@/shared/addressValidation";

interface AddressResult {
  label: string;
  raw: any;
  x: number;
  y: number;
  bounds?: any;
}

const NON_STREET_SEGMENT = /^(United States|USA|U\.S\.A\.|Idaho|ID|Ada County|Canyon County|Boise County|Gem County|Owyhee County|Elmore County|Payette County|Washington County|Twin Falls County|\d{5}(?:-\d{4})?)$/i;

/**
 * Build the saved street-address string from a Nominatim result.
 *
 * Goal: always preserve the user's typed house number. Nominatim has poor
 * house-number coverage for many newer Treasure Valley subdivisions, so when
 * the geocoder returns no `house_number` we fall back to whatever leading
 * digits the user typed (e.g., "4521 W Cherry" -> "4521").
 *
 * The result is a clean "<number> <street>" string. The county / state / zip /
 * country segments from the Nominatim label are dropped because they are
 * stored separately or are constants.
 */
function buildStreetAddress(result: AddressResult, typedValue: string): string {
  const addr = (result.raw && result.raw.address) || {};
  const houseNumberFromGeocoder = String(addr.house_number || "").trim();
  const typedHouseNumber = extractLeadingHouseNumber(typedValue);
  const houseNumber = houseNumberFromGeocoder || typedHouseNumber;

  const road: string = String(
    addr.road || addr.pedestrian || addr.path || addr.footway || addr.cycleway || ""
  ).trim();

  if (road) {
    return houseNumber ? `${houseNumber} ${road}`.trim() : road;
  }

  // Fallback: the geocoder didn't expose a `road` field. Parse the label and
  // strip the noise segments (county / state / zip / country) so we don't end
  // up storing "Ada County, Idaho, 83634, United States". We also drop a
  // trailing city token (single word, no digits, longer than 3 chars) since
  // city is stored separately. Unit/sub-premise hints are preserved.
  const rawParts = result.label.split(",").map(p => p.trim()).filter(Boolean);
  const parts = rawParts.filter(p => !NON_STREET_SEGMENT.test(p));

  if (parts.length === 0) {
    return houseNumber || result.label;
  }

  // Nominatim sometimes returns the house number as its own leading segment:
  // "497, North Shady Grove Way" - merge those into a single token.
  if (/^\d+[A-Za-z]?$/.test(parts[0]) && parts.length >= 2) {
    parts[0] = `${parts[0]} ${parts[1]}`;
    parts.splice(1, 1);
  }

  // Drop a trailing token that looks like a city / subdivision label (single
  // word, no digits, longer than 3 chars). Keep anything that looks like unit
  // info such as "Apt 4B", "Suite 200", "Unit 5", or a numeric token.
  while (parts.length >= 2) {
    const last = parts[parts.length - 1];
    const looksLikeCity = !/\s/.test(last) && !/\d/.test(last) && last.length > 3;
    if (!looksLikeCity) break;
    parts.pop();
  }

  let street = parts.join(", ");
  if (typedHouseNumber && !/^\d/.test(street)) {
    street = `${typedHouseNumber} ${street}`;
  }
  return street;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  /**
   * Fired when the user selects a suggestion. `streetAddress` is the cleaned
   * "<number> <street>" string that was just written via `onChange`. Consumers
   * MUST persist `streetAddress` (not `result.label`) so the saved address
   * never reverts to the verbose Nominatim display name.
   */
  onAddressSelect?: (result: AddressResult, streetAddress: string) => void;
  onPropertySizeCalculated?: (sqft: number) => void;
  placeholder?: string;
  city?: string;
  className?: string;
  id?: string;
  "data-testid"?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  onPropertySizeCalculated,
  placeholder = "123 Main St",
  city = "Kuna",
  className,
  id,
  "data-testid": dataTestId,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const justSelectedRef = useRef(false);
  const providerRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize OpenStreetMapProvider on mount (client-side only)
  useEffect(() => {
    const initProvider = async () => {
      try {
        const { OpenStreetMapProvider } = await import("leaflet-geosearch");
        providerRef.current = new OpenStreetMapProvider();
      } catch (error) {
        console.error("[AddressAutocomplete] Failed to initialize provider:", error);
      }
    };
    initProvider();
  }, []);

  // Fetch address suggestions
  const fetchSuggestions = async (query: string) => {
    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery || trimmedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!providerRef.current) {
      console.log("[AddressAutocomplete] Provider not initialized yet");
      return;
    }

    setIsLoading(true);
    try {
      // Include city in search for better results, but handle empty city gracefully
      const cityPart = (city && city.trim()) ? `${city}, Idaho` : 'Idaho';
      const searchQuery = `${trimmedQuery}, ${cityPart}`;
      console.log('[AddressAutocomplete] Searching for:', searchQuery);
      
      const results = await providerRef.current.search({ query: searchQuery });
      console.log('[AddressAutocomplete] Found results:', results.length);
      
      const formattedResults = results.slice(0, 5).map((result: any) => {
        // Extract bounds from raw.boundingbox if available
        // Nominatim returns boundingbox as [south, north, west, east] (strings)
        let bounds = result.bounds;
        if (!bounds && result.raw?.boundingbox) {
          const bbox = result.raw.boundingbox;
          if (Array.isArray(bbox) && bbox.length === 4) {
            bounds = {
              south: parseFloat(bbox[0]),
              north: parseFloat(bbox[1]),
              west: parseFloat(bbox[2]),
              east: parseFloat(bbox[3]),
            };
          }
        }
        
        return {
          label: result.label,
          raw: result.raw,
          x: result.x,
          y: result.y,
          bounds: bounds,
        };
      });
      
      setSuggestions(formattedResults);
      setOpen(formattedResults.length > 0);
    } catch (error) {
      console.error("[AddressAutocomplete] Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    // Skip search if we just selected an address
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, city]);

  // Calculate property size from bounds (simplified without Leaflet dependency)
  const calculatePropertySize = async (result: AddressResult): Promise<number | null> => {
    try {
      if (!result.bounds) {
        console.log("No bounds available for property size calculation", result);
        return null;
      }

      const bounds = result.bounds;
      
      // Extract bounds coordinates
      let south: number, north: number, west: number, east: number;
      
      if (typeof bounds === 'object' && !Array.isArray(bounds)) {
        south = bounds.south;
        north = bounds.north;
        west = bounds.west;
        east = bounds.east;
      } else if (Array.isArray(bounds) && bounds.length === 4) {
        south = typeof bounds[0] === 'number' ? bounds[0] : parseFloat(bounds[0]);
        west = typeof bounds[1] === 'number' ? bounds[1] : parseFloat(bounds[1]);
        north = typeof bounds[2] === 'number' ? bounds[2] : parseFloat(bounds[2]);
        east = typeof bounds[3] === 'number' ? bounds[3] : parseFloat(bounds[3]);
      } else {
        console.log("Unrecognized bounds format:", bounds);
        return null;
      }
      
      // Calculate area using Haversine formula approximation
      const latDiff = Math.abs(north - south);
      const lonDiff = Math.abs(east - west);
      const avgLat = (north + south) / 2;
      
      // Convert degrees to meters (approximate)
      const latMeters = latDiff * 111320;
      const lonMeters = lonDiff * 111320 * Math.cos(avgLat * Math.PI / 180);
      
      const areaMeters = latMeters * lonMeters;
      const areaSqFt = Math.round(areaMeters * 10.764);
      
      // Return reasonable values only
      if (areaSqFt > 100 && areaSqFt < 500000) {
        return areaSqFt;
      }
      
      console.log("Calculated area outside reasonable range:", areaSqFt);
      return null;
    } catch (error) {
      console.error("Error calculating property size:", error);
      return null;
    }
  };

  // Handle address selection
  const handleSelectAddress = async (result: AddressResult) => {
    const streetAddress = buildStreetAddress(result, value);

    justSelectedRef.current = true;
    
    onChange(streetAddress);
    setSelectedAddress(result);
    setSuggestions([]);
    setOpen(false);
    
    if (onAddressSelect) {
      onAddressSelect(result, streetAddress);
    }

    // Automatically calculate property size
    if (onPropertySizeCalculated) {
      const size = await calculatePropertySize(result);
      if (size) {
        onPropertySizeCalculated(size);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Input
            id={id}
            value={value}
            onChange={(e) => {
              justSelectedRef.current = false;
              onChange(e.target.value);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            className={className}
            autoComplete="street-address"
            name="street-address"
            data-testid={dataTestId}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent 
        className="w-[400px] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {suggestions.length === 0 && !isLoading && (value || '').length >= 3 && (
              <CommandEmpty>No addresses found. Try a different search.</CommandEmpty>
            )}
            {suggestions.length > 0 && (
              <CommandGroup heading="Suggested Addresses">
                {suggestions.map((result, index) => (
                  <CommandItem
                    key={index}
                    value={result.label}
                    onSelect={() => handleSelectAddress(result)}
                    className="cursor-pointer"
                    data-testid={`address-suggestion-${index}`}
                  >
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">{result.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
