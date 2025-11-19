import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Loader2, MapPin } from "lucide-react";
import * as L from "leaflet";

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

  // Fetch address suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Include city in search for better results
      const searchQuery = city ? `${query}, ${city}, Idaho` : query;
      const results = await provider.current.search({ query: searchQuery });
      
      const formattedResults = results.slice(0, 5).map((result: any) => ({
        label: result.label,
        raw: result.raw,
        x: result.x,
        y: result.y,
        bounds: result.bounds,
      }));
      
      setSuggestions(formattedResults);
      setOpen(formattedResults.length > 0);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
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
    try {
      if (!result.bounds) {
        return null;
      }

      const { south, west, north, east } = result.bounds;
      
      // Create a temporary map to calculate area
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
      
      const tempMap = L.map(tempDiv).setView([result.y, result.x], 18);
      
      // Create a rectangle from bounds
      const bounds = L.latLngBounds([
        [south, west],
        [north, east]
      ]);
      
      const rectangle = L.rectangle(bounds);
      const latLngs = rectangle.getLatLngs()[0] as L.LatLng[];
      
      // Calculate area in square meters using Leaflet's geodesic calculation
      const areaMeters = L.GeometryUtil.geodesicArea(latLngs);
      
      // Convert to square feet (1 sq meter = 10.764 sq ft)
      const areaSqFt = Math.round(areaMeters * 10.764);
      
      // Cleanup
      tempMap.remove();
      document.body.removeChild(tempDiv);
      
      return areaSqFt;
    } catch (error) {
      console.error("Error calculating property size:", error);
      return null;
    }
  };

  // Handle address selection
  const handleSelectAddress = async (result: AddressResult) => {
    const addressParts = result.label.split(',');
    const streetAddress = addressParts[0]?.trim() || result.label;
    
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
            {suggestions.length === 0 && !isLoading && value.length >= 3 && (
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
