import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Loader2, MapPin } from "lucide-react";
import * as L from "leaflet";
import "leaflet-draw";
import { useToast } from "@/hooks/use-toast";

// Type extensions for leaflet-draw GeometryUtil
declare module "leaflet" {
  namespace GeometryUtil {
    function geodesicArea(latlngs: L.LatLng[]): number;
  }
}

interface AddressResult {
  label: string;
  raw: any;
  x: number;
  y: number;
  bounds?: any;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (result: AddressResult) => void;
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
  const provider = useRef(new OpenStreetMapProvider());
  const { toast } = useToast();

  // Fetch address suggestions
  const fetchSuggestions = async (query: string) => {
    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery || trimmedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Include city in search for better results, but handle empty city gracefully
      const cityPart = (city && city.trim()) ? `${city}, Idaho` : 'Idaho';
      const searchQuery = `${trimmedQuery}, ${cityPart}`;
      console.log('[AddressAutocomplete] Searching for:', searchQuery);
      
      const results = await provider.current.search({ query: searchQuery });
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

  // Calculate property size from bounds
  const calculatePropertySize = async (result: AddressResult): Promise<number | null> => {
    let tempDiv: HTMLDivElement | null = null;
    let tempMap: L.Map | null = null;
    
    try {
      if (!result.bounds) {
        console.log("No bounds available for property size calculation", result);
        return null;
      }

      const bounds = result.bounds;
      
      // Extract bounds coordinates - handle object, array, and 2D array formats
      let south: number, north: number, west: number, east: number;
      
      if (typeof bounds === 'object' && !Array.isArray(bounds)) {
        // Object format: { south, north, west, east }
        south = bounds.south;
        north = bounds.north;
        west = bounds.west;
        east = bounds.east;
      } else if (Array.isArray(bounds) && bounds.length === 2 && Array.isArray(bounds[0]) && Array.isArray(bounds[1])) {
        // 2D array format: [[lat1, lng1], [lat2, lng2]] or [[south, west], [north, east]]
        // This format is common from geocoding APIs like OpenStreetMap
        const point1 = bounds[0];
        const point2 = bounds[1];
        
        const lat1 = typeof point1[0] === 'number' ? point1[0] : parseFloat(point1[0]);
        const lng1 = typeof point1[1] === 'number' ? point1[1] : parseFloat(point1[1]);
        const lat2 = typeof point2[0] === 'number' ? point2[0] : parseFloat(point2[0]);
        const lng2 = typeof point2[1] === 'number' ? point2[1] : parseFloat(point2[1]);
        
        // Determine which is south/north (lower latitude is south)
        south = Math.min(lat1, lat2);
        north = Math.max(lat1, lat2);
        // Determine which is west/east (lower longitude is west)
        west = Math.min(lng1, lng2);
        east = Math.max(lng1, lng2);
      } else if (Array.isArray(bounds) && bounds.length === 4) {
        // Array format: [south, west, north, east]
        south = typeof bounds[0] === 'number' ? bounds[0] : parseFloat(bounds[0]);
        west = typeof bounds[1] === 'number' ? bounds[1] : parseFloat(bounds[1]);
        north = typeof bounds[2] === 'number' ? bounds[2] : parseFloat(bounds[2]);
        east = typeof bounds[3] === 'number' ? bounds[3] : parseFloat(bounds[3]);
      } else {
        console.log("Unrecognized bounds format:", bounds);
        return null;
      }
      
      // Validate bounds data
      if (!isValidNumber(south) || !isValidNumber(west) || !isValidNumber(north) || !isValidNumber(east)) {
        console.log("Invalid bounds data:", { south, west, north, east });
        return null;
      }
      
      // Create a temporary map to calculate area
      tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      tempDiv.style.width = '100px';
      tempDiv.style.height = '100px';
      document.body.appendChild(tempDiv);
      
      tempMap = L.map(tempDiv).setView([result.y, result.x], 18);
      
      // Create a rectangle from bounds
      const leafletBounds = L.latLngBounds([
        [south, west],
        [north, east]
      ]);
      
      const rectangle = L.rectangle(leafletBounds);
      const latLngs = rectangle.getLatLngs()[0] as L.LatLng[];
      
      // Calculate area in square meters using Leaflet's geodesic calculation
      const areaMeters = L.GeometryUtil.geodesicArea(latLngs);
      
      // Convert to square feet (1 sq meter = 10.764 sq ft)
      const areaSqFt = Math.round(areaMeters * 10.764);
      
      // Return reasonable values only (typical residential lots are 4000-20000 sq ft)
      if (areaSqFt > 100 && areaSqFt < 500000) {
        return areaSqFt;
      }
      
      console.log("Calculated area outside reasonable range:", areaSqFt);
      return null;
    } catch (error) {
      console.error("Error calculating property size:", error);
      return null;
    } finally {
      // Always cleanup temp DOM elements and map
      if (tempMap) {
        try {
          tempMap.remove();
        } catch (e) {
          console.error("Error removing temp map:", e);
        }
      }
      if (tempDiv && tempDiv.parentNode) {
        try {
          document.body.removeChild(tempDiv);
        } catch (e) {
          console.error("Error removing temp div:", e);
        }
      }
    }
  };
  
  // Helper function to validate numbers
  const isValidNumber = (val: any): boolean => {
    return typeof val === 'number' && !isNaN(val) && isFinite(val);
  };

  // Handle address selection
  const handleSelectAddress = async (result: AddressResult) => {
    const addressParts = result.label.split(',');
    // Take first 2-3 parts to get street address (e.g., "123, West Kuna Road, Kuna" -> "123 West Kuna Road")
    // or "123 Main St, Kuna" -> "123 Main St"
    let streetAddress = '';
    if (addressParts.length >= 3) {
      // Format: "123, Street Name, City" -> "123 Street Name"
      streetAddress = addressParts.slice(0, 2).map(p => p.trim()).join(' ');
    } else if (addressParts.length === 2) {
      // Format: "123 Street Name, City" -> "123 Street Name"
      streetAddress = addressParts[0]?.trim() || result.label;
    } else {
      streetAddress = result.label;
    }
    
    onChange(streetAddress);
    setSelectedAddress(result);
    setOpen(false);
    
    if (onAddressSelect) {
      onAddressSelect(result);
    }

    // Automatically calculate property size
    if (onPropertySizeCalculated) {
      const size = await calculatePropertySize(result);
      if (size) {
        onPropertySizeCalculated(size);
        toast({
          title: "Property Size Calculated",
          description: `Estimated property size: ${size.toLocaleString()} sq ft`,
        });
      } else {
        // Always show toast when property size cannot be calculated
        toast({
          title: "Manual Entry Required",
          description: "Unable to auto-calculate property size. Please enter manually or use the Measure button to draw your property.",
          variant: "default",
        });
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            className={className}
            data-testid={dataTestId}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </PopoverTrigger>
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
