import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { OpenStreetMapProvider } from "leaflet-geosearch";

// Type extensions for leaflet-draw
declare module "leaflet" {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: any);
    }
  }
  namespace Draw {
    class Event {
      static CREATED: string;
      static EDITED: string;
      static DELETED: string;
    }
  }
  namespace GeometryUtil {
    function geodesicArea(latlngs: L.LatLng[]): number;
  }
}
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, Ruler, Info } from "lucide-react";

interface MapMeasureToolProps {
  isOpen: boolean;
  onClose: () => void;
  onMeasurementComplete: (sqft: number) => void;
  initialAddress?: string;
}

export function MapMeasureTool({ isOpen, onClose, onMeasurementComplete, initialAddress }: MapMeasureToolProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [searchAddress, setSearchAddress] = useState(initialAddress || "");
  const [isSearching, setIsSearching] = useState(false);
  const [measuredArea, setMeasuredArea] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync search address with initialAddress when dialog opens
  useEffect(() => {
    if (isOpen && initialAddress) {
      setSearchAddress(initialAddress);
    }
  }, [isOpen, initialAddress]);

  useEffect(() => {
    if (!isOpen || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [43.4890, -116.5594], // Default to Kuna, ID
      zoom: 18,
      zoomControl: true,
    });

    // Add satellite/hybrid layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 20,
    }).addTo(map);

    // Add street overlay for reference
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      opacity: 0.3,
      maxZoom: 20,
    }).addTo(map);

    // Initialize drawing layer
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Drawing control
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          shapeOptions: {
            color: '#2D6B3F',
            fillColor: '#2D6B3F',
            fillOpacity: 0.3,
            weight: 2,
          },
          showArea: true,
          metric: false,
        },
        polyline: false,
        rectangle: {
          shapeOptions: {
            color: '#2D6B3F',
            fillColor: '#2D6B3F',
            fillOpacity: 0.3,
          },
          showArea: true,
          metric: false,
        },
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });

    map.addControl(drawControl);

    // Handle drawing completion
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);

      // Calculate area
      const area = L.GeometryUtil.geodesicArea((layer as any).getLatLngs()[0]);
      const sqft = Math.round(area * 10.7639); // m² to sqft
      setMeasuredArea(sqft);
      setError(null);
    });

    // Handle editing
    map.on(L.Draw.Event.EDITED, () => {
      drawnItems.eachLayer((layer: any) => {
        const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        const sqft = Math.round(area * 10.7639);
        setMeasuredArea(sqft);
      });
    });

    // Handle deletion
    map.on(L.Draw.Event.DELETED, () => {
      setMeasuredArea(null);
    });

    mapInstanceRef.current = map;

    // Auto-search initial address if provided
    if (initialAddress) {
      searchForAddress(initialAddress);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isOpen]);

  const searchForAddress = async (address: string) => {
    if (!address || !mapInstanceRef.current) return;

    setIsSearching(true);
    setError(null);

    try {
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: address });

      if (results.length > 0 && mapInstanceRef.current) {
        const result = results[0];
        const { y: lat, x: lng, bounds } = result;
        
        // Clear any existing markers
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current?.removeLayer(layer);
          }
        });

        if (bounds) {
          // bounds is an object: { xmin, ymin, xmax, ymax }
          const { xmin, ymin, xmax, ymax } = bounds;
          mapInstanceRef.current.fitBounds([
            [ymin, xmin], // southwest corner
            [ymax, xmax], // northeast corner
          ]);
        } else {
          // Otherwise just center on the point
          mapInstanceRef.current.setView([lat, lng], 18);
        }

        // Add marker at location
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: #2D6B3F; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })
        }).addTo(mapInstanceRef.current);
        
        setError(null);
      } else {
        setError("Address not found. Try adjusting the map manually.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Could not locate address. Try adjusting the map manually.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchForAddress(searchAddress);
  };

  const handleUseMeasurement = () => {
    if (measuredArea) {
      onMeasurementComplete(measuredArea);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Measure Your Property
          </DialogTitle>
          <DialogDescription>
            Draw around your lawn area to get an accurate measurement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Address Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter your address to center map..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                data-testid="input-map-search"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSearching}
              data-testid="button-search-address"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="ml-2">Find</span>
            </Button>
          </form>

          {error && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>How to measure:</strong> Use the polygon or rectangle tool from the left sidebar to draw around your lawn area. Click to place points, double-click to finish.
            </AlertDescription>
          </Alert>

          {/* Map Container */}
          <div 
            ref={mapRef} 
            className="w-full h-[400px] rounded-lg border overflow-hidden"
            style={{ zIndex: 1 }}
          />

          {/* Measurement Display */}
          {measuredArea && (
            <Alert className="bg-primary/10 border-primary">
              <Ruler className="h-5 w-5 text-primary" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Measured Area:</p>
                  <p className="text-2xl font-bold text-primary">
                    {measuredArea.toLocaleString()} sq ft
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({(measuredArea / 43560).toFixed(3)} acres)
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
              data-testid="button-cancel-measurement"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUseMeasurement}
              disabled={!measuredArea}
              data-testid="button-use-measurement"
            >
              Use This Measurement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
