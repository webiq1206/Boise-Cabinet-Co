import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import "leaflet-geometryutil";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { apiRequest } from "@/lib/queryClient";

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
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const [searchAddress, setSearchAddress] = useState(initialAddress || "");
  const [isSearching, setIsSearching] = useState(false);
  const [measuredArea, setMeasuredArea] = useState<number | null>(null);
  const [measuredLinear, setMeasuredLinear] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tileWarning, setTileWarning] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // When 'both' mode is enabled, allow user to toggle between area and linear
  const supportsBothModes = measurementType === 'both';
  const [activeMode, setActiveMode] = useState<'area' | 'linear'>(
    measurementType === 'linear' ? 'linear' : 'area'
  );

  // Avoid stale closures in Leaflet event handlers
  const activeModeRef = useRef<'area' | 'linear'>(activeMode);
  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  const recalculateMeasurements = (drawnItems: L.FeatureGroup) => {
    let areaTotal = 0;
    let linearTotal = 0;

    drawnItems.eachLayer((layer: any) => {
      const layerType = layer.measurementType as ('area' | 'linear' | undefined);

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
  };

  const updateDrawControlFor = (map: L.Map, drawnItems: L.FeatureGroup, mode: 'area' | 'linear') => {
    if (drawControlRef.current) {
      try {
        map.removeControl(drawControlRef.current);
      } catch {
        // ignore
      }
      drawControlRef.current = null;
    }

    // In dual-mode, show only the relevant tool for the active tab to reduce confusion.
    // In single-mode, show the tool for the selected measurementType.
    const enableAreaTools = supportsBothModes ? (mode === 'area') : measurementType === 'area';
    const enableLinearTools = supportsBothModes ? (mode === 'linear') : measurementType === 'linear';

    const nextControl = new L.Control.Draw({
      draw: {
        polygon: enableAreaTools ? {
          shapeOptions: {
            color: '#2D8652',
            fillColor: '#2D8652',
            fillOpacity: 0.3,
            weight: 2,
          },
          showArea: true,
          metric: false,
        } : false,
        polyline: enableLinearTools ? {
          shapeOptions: {
            color: '#2D8652',
            weight: 3,
          },
          showLength: true,
          metric: false,
        } : false,
        rectangle: enableAreaTools ? {
          shapeOptions: {
            color: '#2D8652',
            fillColor: '#2D8652',
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

    map.addControl(nextControl);
    drawControlRef.current = nextControl;
  };
  

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
      setTileWarning(null);
      setMeasuredArea(null);
      setMeasuredLinear(null);
      setMapReady(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    
    // Clean up existing map if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Use requestAnimationFrame polling to wait for ref with timeout
    let attempts = 0;
    const maxAttempts = 50; // 50 frames @ 60fps = ~833ms max wait
    let animationFrameId: number;
    
    const tryInitializeMap = () => {
      attempts++;
      
      if (mapRef.current) {
        // Ref is ready, initialize map
        try {
          const map = L.map(mapRef.current, {
            center: [43.4890, -116.5594], // Default to Kuna, ID
            zoom: 18,
            zoomControl: true,
            scrollWheelZoom: true, // Enable mouse wheel zoom
            doubleClickZoom: true, // Enable double-click zoom
            touchZoom: true, // Enable touch zoom on mobile
            zoomAnimation: true,
            minZoom: 10,
            maxZoom: 22,
          });

          /**
           * Tile setup
           *
           * Some providers (including satellite imagery) can return a placeholder tile that says
           * "Map data not yet available" at very high zoom levels for certain areas.
           *
           * Setting `maxNativeZoom` prevents Leaflet from requesting missing tiles and instead
           * scales the highest-available tiles, which avoids that placeholder experience.
           *
           * We also provide a built-in basemap switcher so users can fall back to "Streets"
           * if satellite imagery is unavailable.
           */
          const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 22,
            maxNativeZoom: 19,
          });

          const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 22,
            maxNativeZoom: 19,
          });

          const labels = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            opacity: 0.35,
            maxZoom: 22,
            maxNativeZoom: 19,
          });

          const satelliteHybrid = L.layerGroup([satellite, labels]);
          satelliteHybrid.addTo(map);

          // Basemap picker (top-right)
          L.control.layers(
            {
              "Satellite + Labels": satelliteHybrid,
              "Streets": streets,
            },
            undefined,
            { position: "topright" }
          ).addTo(map);

          // If tiles fail to load (network/adblock/offline), suggest switching basemaps.
          let tileErrorCount = 0;
          const onTileError = () => {
            tileErrorCount += 1;
            if (tileErrorCount === 1) {
              setTileWarning(
                "Map tiles failed to load. If you see gray tiles, try switching to 'Streets' using the map layer control (top-right)."
              );
            }
          };
          satellite.on("tileerror", onTileError);
          labels.on("tileerror", onTileError);
          streets.on("tileerror", onTileError);

          // Initialize drawing layer
          const drawnItems = new L.FeatureGroup();
          map.addLayer(drawnItems);
          drawnItemsRef.current = drawnItems;

          // Draw toolbar (kept in sync with active mode in dual-mode)
          updateDrawControlFor(map, drawnItems, activeModeRef.current);

          // Handle drawing completion - aggregate all layers
          map.on(L.Draw.Event.CREATED, (event: any) => {
            const layer = event.layer;
            const layerType = event.layerType as string | undefined;

            // Tag layers so we can keep "area" and "linear" separated consistently.
            if (layerType === 'polyline') {
              (layer as any).measurementType = 'linear';
            } else if (layerType === 'polygon' || layerType === 'rectangle') {
              (layer as any).measurementType = 'area';
            } else {
              (layer as any).measurementType = activeModeRef.current;
            }

            drawnItems.addLayer(layer);

            recalculateMeasurements(drawnItems);
            setError(null);
          });

          // Handle editing - recalculate all measurements
          map.on(L.Draw.Event.EDITED, () => {
            recalculateMeasurements(drawnItems);
          });

          // Handle deletion - recalculate remaining measurements
          map.on(L.Draw.Event.DELETED, () => {
            recalculateMeasurements(drawnItems);
          });

          mapInstanceRef.current = map;
          
          // Mark map as ready
          setMapReady(true);

          // Leaflet-in-dialog reliability: force size recalculation after open/animation
          setTimeout(() => {
            try {
              map.invalidateSize();
            } catch {
              // ignore
            }
          }, 50);
          setTimeout(() => {
            try {
              map.invalidateSize();
            } catch {
              // ignore
            }
          }, 250);

          // Keep Leaflet sized correctly as the dialog/layout changes
          let resizeObserver: ResizeObserver | null = null;
          try {
            resizeObserver = new ResizeObserver(() => {
              try {
                map.invalidateSize();
              } catch {
                // ignore
              }
            });
            resizeObserver.observe(map.getContainer());
          } catch {
            // ResizeObserver not available — ignore
          }

          // Auto-search initial address if provided
          if (initialAddress) {
            searchForAddress(initialAddress);
          }
        } catch (error) {
          console.error('[MapMeasureTool] Error initializing map:', error);
          setError('Failed to initialize map. Please try again.');
        }
      } else if (attempts < maxAttempts) {
        // Ref not ready yet, try again next frame
        animationFrameId = requestAnimationFrame(tryInitializeMap);
      } else {
        // Max attempts reached
        console.error('[MapMeasureTool] Max attempts reached waiting for map ref');
        setError('Failed to initialize map. Please try again.');
      }
    };
    
    // Start the polling
    tryInitializeMap();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // Ensure draw toolbar doesn't duplicate on re-open
      if (mapInstanceRef.current && drawControlRef.current) {
        try {
          mapInstanceRef.current.removeControl(drawControlRef.current);
        } catch {
          // ignore
        }
        drawControlRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, measurementType, supportsBothModes]); // Re-initialize only when dialog opens or measurement type changes

  // When in dual-mode, keep the drawing toolbar matched to the active tab.
  useEffect(() => {
    if (!isOpen) return;
    if (!supportsBothModes) return;
    const map = mapInstanceRef.current;
    const drawnItems = drawnItemsRef.current;
    if (!map || !drawnItems) return;
    updateDrawControlFor(map, drawnItems, activeMode);
    // updateDrawControlFor captures measurementType/supportsBothModes intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, isOpen, supportsBothModes]);

  const searchForAddress = async (address: string) => {
    if (!address) {
      setError("Please enter an address");
      return;
    }
    
    if (!mapInstanceRef.current) {
      setError("Map not ready. Please wait a moment and try again.");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: address });

      if (results.length > 0 && mapInstanceRef.current) {
        const result = results[0] as any; // Cast to any to access various possible coordinate formats
        
        // Extract coordinates - handle different possible result structures
        let lat: number | undefined;
        let lng: number | undefined;
        
        if (result.y !== undefined && result.x !== undefined) {
          lat = result.y;
          lng = result.x;
        } else if (result.lat !== undefined && result.lon !== undefined) {
          lat = result.lat;
          lng = result.lon;
        } else if (result.latitude !== undefined && result.longitude !== undefined) {
          lat = result.latitude;
          lng = result.longitude;
        }
        
        // Validate coordinates
        if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
          console.error('[MapMeasureTool] Invalid coordinates from geocoder:', { lat, lng, result });
          setError("Invalid location data received. Try a more specific address.");
          setIsSearching(false);
          return;
        }
        
        // Clear any existing markers
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current?.removeLayer(layer);
          }
        });

        // Handle bounds if available
        const bounds = result.bounds as any;
        if (bounds && bounds.south !== undefined && bounds.north !== undefined && 
            bounds.west !== undefined && bounds.east !== undefined) {
          mapInstanceRef.current.fitBounds([
            [bounds.south, bounds.west], // southwest corner
            [bounds.north, bounds.east], // northeast corner
          ]);
        } else {
          // Otherwise just center on the point
          mapInstanceRef.current.setView([lat, lng], 18);
        }

        // Add marker at location
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: #2D8652; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })
        }).addTo(mapInstanceRef.current);
        
        setError(null);
        
        // Auto-calculate property boundaries to reduce friction
        void autoCalculatePropertyBoundaries(lat, lng);
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
      
      // Clear any existing auto-calculated layers to prevent accumulation
      drawnItemsRef.current.clearLayers();
      setMeasuredArea(null);
      setMeasuredLinear(null);
      
      // Query Overpass server-side (proxy) for building footprints near this location
      const radius = 30; // Search within 30 meters
      let buildingFound = false;

      try {
        const res = await apiRequest("POST", "/api/geodata/overpass/buildings", { lat, lng, radius });
        const data = await res.json();

        if (data?.success && data?.found && Array.isArray(data?.latlngs) && data.latlngs.length > 0) {
          // LatLng tuples from server: [lat, lng]
          const latlngs = data.latlngs as [number, number][];

          // Create polygon for lawn area (always needed)
          const polygon = L.polygon(latlngs, {
            color: '#2D8652',
            weight: 2,
            fillColor: '#2D8652',
            fillOpacity: 0.2,
          });
          (polygon as any).measurementType = 'area'; // Tag for aggregation logic
          drawnItemsRef.current.addLayer(polygon);

          // Calculate area
          const latlngObjects = latlngs.map((ll: [number, number]) => L.latLng(ll[0], ll[1]));
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

          if (supportsBothModes) {
            setError(`Auto-calculated property: ${sqft.toLocaleString()} sq ft lawn area and ${linearFeet.toLocaleString()} linear ft roofline perimeter. You can edit using the drawing tools.`);
          } else if (measurementType === 'linear') {
            setError(`Auto-calculated roofline: ${linearFeet.toLocaleString()} linear ft. You can edit using the drawing tools.`);
          } else {
            setError(`Auto-calculated property: ${sqft.toLocaleString()} sq ft. You can edit using the drawing tools.`);
          }

          buildingFound = true;
        } else {
          // Do nothing here; fallback estimate below will kick in
          console.log('[MapMeasureTool] No building footprint returned from proxy');
        }
      } catch (err) {
        console.warn('[MapMeasureTool] Overpass proxy failed:', err);
        // Non-blocking: user can still draw manually; fallback estimate below will kick in
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
          color: '#2D8652',
          weight: 2,
          fillColor: '#2D8652',
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
      <DialogContent className="max-w-6xl w-[98vw] h-[98vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ruler className="h-6 w-6 text-primary" />
            {activeMode === 'area' ? 'Measure Your Lawn Area' : 'Measure Linear Distance'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {activeMode === 'area' 
              ? 'Use the map tools below to outline your grass areas. We\'ll calculate the square footage for you.'
              : 'Use the map tools below to trace your rooflines or fence lines. We\'ll calculate the total linear feet for you.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 px-6 pb-6 overflow-y-auto">
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

          {tileWarning && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{tileWarning}</AlertDescription>
            </Alert>
          )}

          {/* Step-by-Step Instructions */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary flex-shrink-0" />
              <h3 className="font-semibold text-foreground text-base">Quick Start Guide</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                <p className="pt-0.5">
                  <strong>Find your property:</strong> Enter your address above and click "Find" - or use your <strong>mouse wheel to zoom in/out</strong> and drag to pan
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                <p className="pt-0.5">
                  {activeMode === 'area' ? (
                    <><strong>Click the polygon tool</strong> on the left toolbar (box with corners), then <strong>click each corner</strong> of your lawn area and <strong>double-click</strong> to finish</>
                  ) : (
                    <><strong>Click the line tool</strong> on the left toolbar (diagonal line), then <strong>click along</strong> your roofline/fence and <strong>double-click</strong> to finish</>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                <p className="pt-0.5">
                  <strong>Review your measurement</strong> below and click "Use This Measurement" when satisfied
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-primary/20">
              <p className="text-xs text-muted-foreground">
                <strong>Pro tip:</strong> You can draw multiple shapes - they'll be added together. Use the edit/delete tools (pencil & trash icons) to adjust.
              </p>
            </div>
          </div>

          {/* Map Container */}
          <div 
            ref={mapRef} 
            className="w-full h-[500px] rounded-lg border-2 border-primary/20 shadow-lg"
            style={{ minHeight: '500px' }}
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
