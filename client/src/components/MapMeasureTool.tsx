import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import "leaflet-geometryutil";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MapPin, Ruler, Info } from "lucide-react";

interface MapMeasureToolProps {
  isOpen: boolean;
  onClose: () => void;
  onMeasurementComplete?: (sqft: number) => void;
  onLinearMeasurementComplete?: (feet: number) => void;
  initialAddress?: string;
  measurementType?: 'area' | 'linear' | 'both'; // Support for collecting both measurements
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
  const [mapReady, setMapReady] = useState(false);
  
  // When 'both' mode is enabled, allow user to toggle between area and linear
  const supportsBothModes = measurementType === 'both';
  const [activeMode, setActiveMode] = useState<'area' | 'linear'>(
    measurementType === 'linear' ? 'linear' : 'area'
  );
  

  // Sync activeMode when measurementType prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveMode(measurementType === 'linear' ? 'linear' : 'area');
    }
  }, [measurementType, isOpen]);

  // Sync search address with initialAddress when dialog opens
  useEffect(() => {
    if (isOpen && initialAddress) {
      setSearchAddress(initialAddress);
    }
  }, [isOpen, initialAddress]);

  // Clear errors when switching modes
  useEffect(() => {
    if (isOpen && supportsBothModes) {
      setError(null);
    }
  }, [activeMode, isOpen, supportsBothModes]);

  // Reset measurements when dialog opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setMeasuredArea(null);
      setMeasuredLinear(null);
      setMapReady(false);
    }
  }, [isOpen]);

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

      // Initialize map (activeMode affects drawing tools configuration)
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

      // Drawing control - configure based on active measurement mode
      // In dual mode, enable all tools; otherwise enable mode-specific tools
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: (supportsBothModes || measurementType === 'area') ? {
            shapeOptions: {
              color: '#2D6B3F',
              fillColor: '#2D6B3F',
              fillOpacity: 0.3,
              weight: 2,
            },
            showArea: true,
            metric: false,
          } : false,
          polyline: (supportsBothModes || measurementType === 'linear') ? {
            shapeOptions: {
              color: '#2D6B3F',
              weight: 3,
            },
            showLength: true,
            metric: false,
          } : false,
          rectangle: (supportsBothModes || measurementType === 'area') ? {
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

      // Handle drawing completion - aggregate all layers
      map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        drawnItems.addLayer(layer);

        // Recalculate all measurements from all layers
        let areaTotal = 0;
        let linearTotal = 0;
        
        drawnItems.eachLayer((layer: any) => {
          const layerType = layer.measurementType;
          
          if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            if (!layerType || layerType === 'area') {
              try {
                const latlngs = layer.getLatLngs() as L.LatLng[] | L.LatLng[][];
                const coords = Array.isArray(latlngs[0]) ? (latlngs[0] as L.LatLng[]) : (latlngs as L.LatLng[]);
                const area = L.GeometryUtil.geodesicArea(coords as L.LatLng[]);
                areaTotal += area;
              } catch (e) {
                console.warn("Error calculating area:", e);
              }
            }
          } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
            if (!layerType || layerType === 'linear') {
              try {
                const latlngs = layer.getLatLngs() as L.LatLng[];
                for (let i = 0; i < latlngs.length - 1; i++) {
                  const p1 = latlngs[i];
                  const p2 = latlngs[i + 1];
                  if (p1 && p2 && typeof (p1 as any).distanceTo === 'function') {
                    linearTotal += (p1 as any).distanceTo(p2);
                  }
                }
              } catch (e) {
                console.warn("Error calculating distance:", e);
              }
            }
          }
        });
        
        // Always set measurements (null if 0) to reflect current map state
        setMeasuredArea(areaTotal > 0 ? Math.round(areaTotal * 10.7639) : null);
        setMeasuredLinear(linearTotal > 0 ? Math.round(linearTotal * 3.28084) : null);
        setError(null);
      });

      // Handle editing - recalculate all measurements
      map.on(L.Draw.Event.EDITED, () => {
        let areaTotal = 0;
        let linearTotal = 0;
        
        drawnItems.eachLayer((layer: any) => {
          const layerType = layer.measurementType;
          
          if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            if (!layerType || layerType === 'area') {
              try {
                const latlngs = layer.getLatLngs() as L.LatLng[] | L.LatLng[][];
                const coords = Array.isArray(latlngs[0]) ? (latlngs[0] as L.LatLng[]) : (latlngs as L.LatLng[]);
                const area = L.GeometryUtil.geodesicArea(coords as L.LatLng[]);
                areaTotal += area;
              } catch (e) {
                console.warn("Error calculating area:", e);
              }
            }
          } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
            if (!layerType || layerType === 'linear') {
              try {
                const latlngs = layer.getLatLngs() as L.LatLng[];
                for (let i = 0; i < latlngs.length - 1; i++) {
                  const p1 = latlngs[i];
                  const p2 = latlngs[i + 1];
                  if (p1 && p2 && typeof (p1 as any).distanceTo === 'function') {
                    linearTotal += (p1 as any).distanceTo(p2);
                  }
                }
              } catch (e) {
                console.warn("Error calculating distance:", e);
              }
            }
          }
        });
        
        // Always set measurements (null if 0) to reflect current map state
        setMeasuredArea(areaTotal > 0 ? Math.round(areaTotal * 10.7639) : null);
        setMeasuredLinear(linearTotal > 0 ? Math.round(linearTotal * 3.28084) : null);
      });

      // Handle deletion - recalculate remaining measurements
      map.on(L.Draw.Event.DELETED, () => {
        let areaTotal = 0;
        let linearTotal = 0;
        
        drawnItems.eachLayer((layer: any) => {
          const layerType = layer.measurementType;
          
          if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            if (!layerType || layerType === 'area') {
              try {
                const latlngs = layer.getLatLngs() as L.LatLng[] | L.LatLng[][];
                const coords = Array.isArray(latlngs[0]) ? (latlngs[0] as L.LatLng[]) : (latlngs as L.LatLng[]);
                const area = L.GeometryUtil.geodesicArea(coords as L.LatLng[]);
                areaTotal += area;
              } catch (e) {
                console.warn("Error calculating area:", e);
              }
            }
          } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
            if (!layerType || layerType === 'linear') {
              try {
                const latlngs = layer.getLatLngs() as L.LatLng[];
                for (let i = 0; i < latlngs.length - 1; i++) {
                  const p1 = latlngs[i];
                  const p2 = latlngs[i + 1];
                  if (p1 && p2 && typeof (p1 as any).distanceTo === 'function') {
                    linearTotal += (p1 as any).distanceTo(p2);
                  }
                }
              } catch (e) {
                console.warn("Error calculating distance:", e);
              }
            }
          }
        });
        
        setMeasuredArea(areaTotal > 0 ? Math.round(areaTotal * 10.7639) : null);
        setMeasuredLinear(linearTotal > 0 ? Math.round(linearTotal * 3.28084) : null);
      });

      mapInstanceRef.current = map;
      
      // Mark map as ready
      setMapReady(true);

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
  }, [isOpen, measurementType, supportsBothModes]); // Re-initialize only when dialog opens or measurement type changes

  const searchForAddress = async (address: string) => {
    console.log('[MapMeasureTool] searchForAddress called with:', address);
    console.log('[MapMeasureTool] mapInstanceRef.current exists:', !!mapInstanceRef.current);
    
    if (!address) {
      console.log('[MapMeasureTool] No address provided');
      setError("Please enter an address");
      return;
    }
    
    if (!mapInstanceRef.current) {
      console.log('[MapMeasureTool] Map not initialized yet');
      setError("Map not ready. Please wait a moment and try again.");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log('[MapMeasureTool] Creating OpenStreetMapProvider...');
      const provider = new OpenStreetMapProvider();
      console.log('[MapMeasureTool] Searching for address...');
      const results = await provider.search({ query: address });
      console.log('[MapMeasureTool] Search results:', results);

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
        
        // Auto-calculate property boundaries to reduce friction
        await autoCalculatePropertyBoundaries(lat, lng);
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
  
  // Auto-calculate property boundaries using OpenStreetMap building/property data
  const autoCalculatePropertyBoundaries = async (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !drawnItemsRef.current) return;
    
    try {
      console.log('[MapMeasureTool] Auto-calculating property boundaries...');
      
      // Clear any existing auto-calculated layers to prevent accumulation
      drawnItemsRef.current.clearLayers();
      setMeasuredArea(null);
      setMeasuredLinear(null);
      
      // Query OpenStreetMap Overpass API for building footprints near this location
      const radius = 30; // Search within 30 meters
      const overpassQuery = `
        [out:json][timeout:5];
        (
          way["building"](around:${radius},${lat},${lng});
        );
        out geom;
      `;
      
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: new URLSearchParams({ data: overpassQuery }),
      });
      
      let buildingFound = false;
      
      if (response.ok) {
        const data = await response.json();
        console.log('[MapMeasureTool] Overpass API results:', data);
        
        if (data.elements && data.elements.length > 0) {
          // Find the closest building to the search point
          let closestBuilding = null;
          let minDistance = Infinity;
          
          for (const element of data.elements) {
            if (element.geometry && element.geometry.length > 0) {
              // Calculate centroid
              const lats = element.geometry.map((g: any) => g.lat);
              const lngs = element.geometry.map((g: any) => g.lon);
              const centLat = lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
              const centLng = lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length;
              
              const distance = Math.sqrt(Math.pow(lat - centLat, 2) + Math.pow(lng - centLng, 2));
              if (distance < minDistance) {
                minDistance = distance;
                closestBuilding = element;
              }
            }
          }
          
          if (closestBuilding && closestBuilding.geometry) {
            console.log('[MapMeasureTool] Found building, auto-drawing polygon...');
            
            // Convert OSM geometry to Leaflet LatLng array
            const latlngs = closestBuilding.geometry.map((node: any) => [node.lat, node.lon] as [number, number]);
            
            // Create polygon for lawn area (always needed)
            const polygon = L.polygon(latlngs, {
              color: '#2D6B3F',
              weight: 2,
              fillColor: '#2D6B3F',
              fillOpacity: 0.2,
            });
            (polygon as any).measurementType = 'area'; // Tag for aggregation logic
            drawnItemsRef.current.addLayer(polygon);
            
            // Calculate area
            const latlngObjects = latlngs.map(ll => L.latLng(ll[0], ll[1]));
            const area = L.GeometryUtil.geodesicArea(latlngObjects);
            const sqft = Math.round(area * 10.7639);
            setMeasuredArea(sqft);
            
            // For dual-mode or linear-only, also create a separate roofline polyline
            let linearFeet = 0;
            if (supportsBothModes || measurementType === 'linear') {
              const rooflinePolyline = L.polyline(latlngs, {
                color: '#E85D04',
                weight: 3,
                dashArray: '10, 5',
              });
              (rooflinePolyline as any).measurementType = 'linear'; // Tag for aggregation logic
              drawnItemsRef.current.addLayer(rooflinePolyline);
              
              // Calculate perimeter
              let perimeterMeters = 0;
              for (let i = 0; i < latlngs.length; i++) {
                const current = L.latLng(latlngs[i][0], latlngs[i][1]);
                const next = L.latLng(latlngs[(i + 1) % latlngs.length][0], latlngs[(i + 1) % latlngs.length][1]);
                perimeterMeters += current.distanceTo(next);
              }
              linearFeet = Math.round(perimeterMeters * 3.28084);
              setMeasuredLinear(linearFeet);
            }
            
            console.log('[MapMeasureTool] Auto-calculated area:', sqft, 'sq ft, perimeter:', linearFeet, 'linear ft');
            
            if (supportsBothModes) {
              setError(`Auto-calculated property: ${sqft.toLocaleString()} sq ft lawn area and ${linearFeet.toLocaleString()} linear ft roofline perimeter. You can edit using the drawing tools.`);
            } else if (measurementType === 'linear') {
              setError(`Auto-calculated roofline: ${linearFeet.toLocaleString()} linear ft. You can edit using the drawing tools.`);
            } else {
              setError(`Auto-calculated property: ${sqft.toLocaleString()} sq ft. You can edit using the drawing tools.`);
            }
            buildingFound = true;
          }
        }
      }
      
      // Create fallback estimate if no building found or API failed
      if (!buildingFound) {
        console.log('[MapMeasureTool] No building data found, creating default estimate...');
        
        // No building data found - create a default rectangular lot estimate
        // Typical lot in Kuna, ID is about 0.25 acres (10,890 sq ft)
        // Approximate as 90ft x 121ft lot
        const lotWidthMeters = 27.4; // 90 feet
        const lotDepthMeters = 36.9; // 121 feet
        
        // Create rectangle centered on the search point
        const bounds = L.latLngBounds(
          [lat - lotDepthMeters / 111320, lng - lotWidthMeters / (111320 * Math.cos(lat * Math.PI / 180))],
          [lat + lotDepthMeters / 111320, lng + lotWidthMeters / (111320 * Math.cos(lat * Math.PI / 180))]
        );
        
        const rectangle = L.rectangle(bounds, {
          color: '#2D6B3F',
          weight: 2,
          fillColor: '#2D6B3F',
          fillOpacity: 0.2,
        });
        (rectangle as any).measurementType = 'area'; // Tag for aggregation logic
        drawnItemsRef.current.addLayer(rectangle);
        
        // Calculate area
        const latlngs = [
          [bounds.getSouth(), bounds.getWest()],
          [bounds.getSouth(), bounds.getEast()],
          [bounds.getNorth(), bounds.getEast()],
          [bounds.getNorth(), bounds.getWest()],
        ].map(ll => L.latLng(ll[0], ll[1]));
        
        const area = L.GeometryUtil.geodesicArea(latlngs);
        const sqft = Math.round(area * 10.7639);
        setMeasuredArea(sqft);
        
        // For dual-mode or linear-only, create separate roofline polyline
        let linearFeet = 0;
        if (supportsBothModes || measurementType === 'linear') {
          const rooflinePolyline = L.polyline([
            [bounds.getSouth(), bounds.getWest()],
            [bounds.getSouth(), bounds.getEast()],
            [bounds.getNorth(), bounds.getEast()],
            [bounds.getNorth(), bounds.getWest()],
            [bounds.getSouth(), bounds.getWest()],  // Close the loop
          ], {
            color: '#E85D04',
            weight: 3,
            dashArray: '10, 5',
          });
          (rooflinePolyline as any).measurementType = 'linear'; // Tag for aggregation logic
          drawnItemsRef.current.addLayer(rooflinePolyline);
          
          // Calculate perimeter
          let perimeterMeters = 0;
          for (let i = 0; i < latlngs.length; i++) {
            const current = latlngs[i];
            const next = latlngs[(i + 1) % latlngs.length];
            perimeterMeters += current.distanceTo(next);
          }
          linearFeet = Math.round(perimeterMeters * 3.28084);
          setMeasuredLinear(linearFeet);
        }
        
        console.log('[MapMeasureTool] Created default estimate:', sqft, 'sq ft,', linearFeet, 'linear ft');
        
        if (supportsBothModes) {
          setError(`Estimated property: ${sqft.toLocaleString()} sq ft lawn area and ${linearFeet.toLocaleString()} linear ft roofline (typical lot size). Please adjust using the drawing tools to match your actual property.`);
        } else if (measurementType === 'linear') {
          setError(`Estimated roofline: ${linearFeet.toLocaleString()} linear ft (typical lot perimeter). Please adjust using the drawing tools to match your actual property.`);
        } else {
          setError(`Estimated property: ${sqft.toLocaleString()} sq ft (typical lot size). Please adjust using the drawing tools to match your actual property.`);
        }
      }
    } catch (err) {
      console.error('[MapMeasureTool] Auto-calculation error:', err);
      // Silently fail - user can still draw manually
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    console.log('[MapMeasureTool] handleSearch called');
    e.preventDefault();
    console.log('[MapMeasureTool] Calling searchForAddress with:', searchAddress);
    searchForAddress(searchAddress);
  };

  const handleUseMeasurement = () => {
    // In dual-mode, require both measurements before applying
    if (supportsBothModes) {
      if (!measuredArea && !measuredLinear) {
        setError("Please measure both lawn area and linear distance before applying.");
        return;
      }
      if (!measuredArea) {
        setError("Please measure the lawn area before applying. Switch to the 'Lawn Area' tab to draw.");
        return;
      }
      if (!measuredLinear) {
        setError("Please measure linear distance before applying. Switch to the 'Roof Lines' tab to draw.");
        return;
      }
      // Apply both measurements
      if (onMeasurementComplete) {
        onMeasurementComplete(measuredArea);
      }
      if (onLinearMeasurementComplete) {
        onLinearMeasurementComplete(measuredLinear);
      }
      onClose();
    } else {
      // Single-mode: apply current mode's measurement
      if (activeMode === 'area') {
        if (!measuredArea) {
          setError("Please draw an area on the map first before applying.");
          return;
        }
        if (onMeasurementComplete) {
          onMeasurementComplete(measuredArea);
          onClose();
        }
      } else if (activeMode === 'linear') {
        if (!measuredLinear) {
          setError("Please draw a line on the map first before applying.");
          return;
        }
        if (onLinearMeasurementComplete) {
          onLinearMeasurementComplete(measuredLinear);
          onClose();
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            {activeMode === 'area' ? 'Measure Your Property' : 'Measure Linear Distance'}
          </DialogTitle>
          <DialogDescription>
            {activeMode === 'area' 
              ? 'Draw around all grass areas that need to be mowed, fertilized, or treated'
              : 'Trace along roof lines, fence lines, or bushes where lights will be installed'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pb-4 flex-1 overflow-y-auto">
          {/* Mode Toggle (when both modes supported) */}
          {supportsBothModes && (
            <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'area' | 'linear')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="area" data-testid="tab-mode-area">
                  Lawn Area (sq ft)
                </TabsTrigger>
                <TabsTrigger value="linear" data-testid="tab-mode-linear">
                  Roof Lines (linear ft)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

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
              disabled={isSearching || !mapReady}
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
              {activeMode === 'area' ? (
                <><strong>How to measure:</strong> Use the polygon tool (preferred) or rectangle tool from the left sidebar to draw around your grass areas. Click to place corner points, double-click to finish. You can draw one complex shape to cover all lawn areas.</>
              ) : (
                <><strong>How to measure:</strong> Use the line tool from the left sidebar to trace along roof lines, fence perimeters, or bushes. Click to place points along the path, double-click to finish. Trace all sections continuously for total linear feet.</>
              )}
            </AlertDescription>
          </Alert>

          {/* Map Container */}
          <div 
            ref={mapRef} 
            className="w-full h-[400px] sm:h-[500px] rounded-lg border overflow-hidden"
            style={{ minHeight: '400px', zIndex: 1 }}
            data-testid="div-map-container"
          />

          {/* Measurement Display */}
          {measuredArea && activeMode === 'area' && (
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

          {measuredLinear && activeMode === 'linear' && (
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

          {/* Dual-Mode Summary */}
          {supportsBothModes && (measuredArea || measuredLinear) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="text-sm font-medium mb-2">Measurements Captured:</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Lawn Area:</p>
                    <p className="font-semibold" data-testid="text-summary-area">
                      {measuredArea ? `${measuredArea.toLocaleString()} sq ft` : 'Not measured'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Linear Distance:</p>
                    <p className="font-semibold" data-testid="text-summary-linear">
                      {measuredLinear ? `${measuredLinear.toLocaleString()} ft` : 'Not measured'}
                    </p>
                  </div>
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
              {supportsBothModes ? 'Apply Both Measurements' : 'Use This Measurement'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
