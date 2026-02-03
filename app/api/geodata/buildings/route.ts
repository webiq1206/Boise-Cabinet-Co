import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for building footprint request
const buildingsSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().optional().default(50),
});

// Overpass API endpoint
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

/**
 * Query Overpass API for building footprints near a coordinate
 */
async function getClosestBuildingFootprint(
  lat: number,
  lng: number,
  radius: number = 50
): Promise<[number, number][]> {
  // Build Overpass query to find buildings within radius
  const query = `
    [out:json][timeout:10];
    (
      way["building"](around:${radius},${lat},${lng});
    );
    out geom;
  `;

  try {
    const response = await fetch(OVERPASS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      console.error("[Overpass] API error:", response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      console.log("[Overpass] No buildings found within radius");
      return [];
    }

    // Find the closest building (first element in response)
    const building = data.elements[0];
    
    if (!building.geometry || !Array.isArray(building.geometry)) {
      console.log("[Overpass] Building has no geometry");
      return [];
    }

    // Convert to array of [lat, lng] pairs
    const footprint: [number, number][] = building.geometry.map((point: any) => [
      point.lat,
      point.lon,
    ]);

    return footprint;
  } catch (error) {
    console.error("[Overpass] Error fetching building footprint:", error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request
    const { lat, lng, radius } = buildingsSchema.parse(body);
    
    // Get building footprint from Overpass
    const footprint = await getClosestBuildingFootprint(lat, lng, radius);
    
    return NextResponse.json({
      success: true,
      found: footprint.length > 0,
      latlngs: footprint,
      lat,
      lng,
      radius,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid coordinates",
          details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }
    
    console.error("Error fetching building footprint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch building data" },
      { status: 500 }
    );
  }
}
