// Service-specific hero background images
// Maps service slugs to their custom background images

export interface ServiceBackgroundConfig {
  [key: string]: string;
}

// Import all custom service backgrounds
import christmasLightsBackground from "@assets/Christmas Light Installation Services in Kuna_1763675561175.png";
import hedgeTrimmingBackground from "@assets/Professional Hedge Trimming Services - Professional Bush Trimming Services - Lawn Care Kuna_1763675561175.png";
import aerationBackground from "@assets/Professional Lawn Aeration Services - Lawn Care Kuna_1763675561175.png";
import fertilizationBackground from "@assets/Professional Lawn Fertilization Services - Lawn Care Kuna_1763675561176.png";
import leafRemovalBackground from "@assets/Professional Leaf Removal Services - Lawn Care Kuna_1763675561176.png";
import snowRemovalBackground from "@assets/Professional Snow Removal Services - Lawn Care Kuna_1763675561176.png";
import sprinklerBlowoutBackground from "@assets/Professional Sprinkler Blowout Services - Lawn Care Kuna_1763675561176.png";
import defaultBackground from "@assets/Lawn Care Kuna Background Image_1763675543303.png";

// Service slug to background image mapping
export const SERVICE_BACKGROUNDS: ServiceBackgroundConfig = {
  // Christmas Lights
  "christmas-lights": christmasLightsBackground,
  
  // Lawn Care Services
  "hedge-trimming": hedgeTrimmingBackground,
  "aeration": aerationBackground,
  "fertilization": fertilizationBackground,
  "seasonal-cleanup": leafRemovalBackground,
  "fall-cleanup": leafRemovalBackground,
  "spring-cleanup": leafRemovalBackground,
  "sprinkler-blowout": sprinklerBlowoutBackground,
  
  // Winter Services (if applicable)
  "snow-removal": snowRemovalBackground,
  "winter-services": snowRemovalBackground,
};

// Default background for services without custom images
export const DEFAULT_SERVICE_BACKGROUND = defaultBackground;

/**
 * Get the appropriate background image for a service
 * @param serviceSlug - The service slug (e.g., 'aeration', 'christmas-lights')
 * @returns The background image URL
 */
export function getServiceBackground(serviceSlug: string): string {
  return SERVICE_BACKGROUNDS[serviceSlug] || DEFAULT_SERVICE_BACKGROUND;
}
