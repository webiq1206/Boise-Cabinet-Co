// Service-specific hero background images
// Maps service slugs to their custom background images

export interface ServiceBackgroundConfig {
  [key: string]: string;
}

// Default background for service pages (Unsplash placeholder — replace with real project photos)
const DEFAULT_BACKGROUND = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200";

// Service slug to background image mapping
export const SERVICE_BACKGROUNDS: ServiceBackgroundConfig = {
  "kitchen-remodel": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200",
  "bathroom-remodel": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200",
  "whole-home-remodel": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  "room-addition": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200",
  "basement-finish": "https://images.unsplash.com/photo-1600607687644-c7171b62ccd4?w=1200",
  "outdoor-living": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
};

// Default background for services without custom images
export const DEFAULT_SERVICE_BACKGROUND = DEFAULT_BACKGROUND;

/**
 * Get the appropriate background image for a service
 * @param serviceSlug - The service slug (e.g., 'kitchen-remodel', 'bathroom-remodel')
 * @returns The background image URL
 */
export function getServiceBackground(serviceSlug: string): string {
  return SERVICE_BACKGROUNDS[serviceSlug] || DEFAULT_SERVICE_BACKGROUND;
}
