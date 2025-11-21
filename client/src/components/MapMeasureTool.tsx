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
  onMeasurementComplete?: (sqft: number) => void;
  onLinearMeasurementComplete?: (feet: number) => void;
  initialAddress?: string;
  measurementType?: 'area' | 'linear'; // 'area' for property size, 'linear' for fence/roof lines
}

export function MapMeasureTool({ 
  isOpen, 
  onClose, 
  onMeasurementComplete, 
  onLinearMeasurementComplete,
  initialAddress,
  measurementType = 'area'
}: MapMeasureToolProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [searchAddress, setSearchAddress] = useState(initialAddress || "");
  const [isSearching, setIsSearching] = useState(false);
  const [measuredArea, setMeasuredArea] = useState<number | null>(null);
  const [measuredLinear, setMeasuredLinear] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync search address with initialAddress when dialog opens
  useEffect(() => {
    if (isOpen && initialAddress) {
      setSearchAddress(initialAddress);
    }
  }, [isOpen, initialAddress]);

  // Reset measurements when dialog opens or measurement type changes
  useEffect(() => {
    if (isOpen) {
      setMeasuredArea(null);
      setMeasuredLinear(null);
      setError(null);
    }
  }, [isOpen, measurementType]);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;
    
    // Clean up existing map if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Small delay to ensure dialog content is fully rendered
    const timer = setTimeout(() => {
      if (!mapRef.current) return;

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

      // Drawing control - configure based on measurement type
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: measurementType === 'area' ? {
            shapeOptions: {
              color: '#2D6B3F',
              fillColor: '#2D6B3F',
              fillOpacity: 0.3,
              weight: 2,
            },
            showArea: true,
            metric: false,
          } : false,
          polyline: measurementType === 'linear' ? {
            shapeOptions: {
              color: '#2D6B3F',
              weight: 3,
            },
            showLength: true,
            metric: false,
          } : false,
          rectangle: measurementType === 'area' ? {
            shapeOptions: {
              color: '#2D6B3F',
              fillColor: '#2D6B3F',
              fillOpacity: 0.3,
            },
            showArea: true,
            metric: false,
          } : false,
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

        if (measurementType === 'area') {
          // Calculate area for polygons/rectangles
          const area = L.GeometryUtil.geodesicArea((layer as any).getLatLngs()[0]);
          const sqft = Math.round(area * 10.7639); // m² to sqft
          setMeasuredArea(sqft);
          setMeasuredLinear(null);
        } else {
          // Calculate linear distance for polylines
          const latlngs = (layer as any).getLatLngs();
          let totalDistance = 0;
          for (let i = 0; i < latlngs.length - 1; i++) {
            totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
          }
          const feet = Math.round(totalDistance * 3.28084); // meters to feet
          setMeasuredLinear(feet);
          setMeasuredArea(null);
        }
        setError(null);
      });

      // Handle editing
      map.on(L.Draw.Event.EDITED, () => {
        drawnItems.eachLayer((layer: any) => {
          if (measurementType === 'area') {
            const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            const sqft = Math.round(area * 10.7639);
            setMeasuredArea(sqft);
            setMeasuredLinear(null);
          } else {
            const latlngs = layer.getLatLngs();
            let totalDistance = 0;
            for (let i = 0; i < latlngs.length - 1; i++) {
              totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
            }
            const feet = Math.round(totalDistance * 3.28084);
            setMeasuredLinear(feet);
            setMeasuredArea(null);
          }
        });
      });

      // Handle deletion
      map.on(L.Draw.Event.DELETED, () => {
        setMeasuredArea(null);
        setMeasuredLinear(null);
      });

      mapInstanceRef.current = map;

      // Auto-search initial address if provided
      if (initialAddress) {
        searchForAddress(initialAddress);
      }
    }, 100); // 100ms delay for dialog rendering

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, measurementType]);

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
          // bounds from OpenStreetMapProvider has: { south, west, north, east }
          const { south, west, north, east } = bounds as any;
          mapInstanceRef.current.fitBounds([
            [south, west], // southwest corner
            [north, east], // northeast corner
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
    if (measurementType === 'area' && measuredArea && onMeasurementComplete) {
      onMeasurementComplete(measuredArea);
      onClose();
    } else if (measurementType === 'linear' && measuredLinear && onLinearMeasurementComplete) {
      onLinearMeasurementComplete(measuredLinear);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            {measurementType === 'area' ? 'Measure Your Property' : 'Measure Linear Distance'}
          </DialogTitle>
          <DialogDescription>
            {measurementType === 'area' 
              ? 'Draw around all grass areas that need to be mowed, fertilized, or treated'
              : 'Trace along roof lines, fence lines, or bushes where lights will be installed'
            }
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
              {measurementType === 'area' ? (
                <><strong>How to measure:</strong> Use the polygon tool (preferred) or rectangle tool from the left sidebar to draw around your grass areas. Click to place corner points, double-click to finish. You can draw one complex shape to cover all lawn areas.</>
              ) : (
                <><strong>How to measure:</strong> Use the line tool from the left sidebar to trace along roof lines, fence perimeters, or bushes. Click to place points along the path, double-click to finish. Trace all sections continuously for total linear feet.</>
              )}
            </AlertDescription>
          </Alert>

          {/* Map Container */}
          <div 
            ref={mapRef} 
            className="w-full h-[400px] rounded-lg border overflow-hidden"
            style={{ zIndex: 1 }}
            data-testid="div-map-container"
          />

          {/* Measurement Display */}
          {measuredArea && measurementType === 'area' && (
            <Alert className="bg-primary/10 border-primary">
              <Ruler className="h-5 w-5 text-primary" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Measured Area:</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-measured-area">
                    {measuredArea.toLocaleString()} sq ft
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({(measuredArea / 43560).toFixed(3)} acres)
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {measuredLinear && measurementType === 'linear' && (
            <Alert className="bg-primary/10 border-primary">
              <Ruler className="h-5 w-5 text-primary" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Measured Distance:</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-measured-linear">
                    {measuredLinear.toLocaleString()} feet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({(measuredLinear / 5280).toFixed(2)} miles)
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
              disabled={!measuredArea && !measuredLinear}
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
