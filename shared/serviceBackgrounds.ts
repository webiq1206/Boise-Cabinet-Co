import { GALLERY_IMAGES, SITE_IMAGES } from "./siteImages";

export interface ServiceBackgroundConfig {
  [key: string]: string;
}

const DEFAULT_BACKGROUND = SITE_IMAGES.hero;

export const SERVICE_BACKGROUNDS: ServiceBackgroundConfig = {
  "kitchen-remodel": "/images/services/kitchen-remodel.png",
  "bathroom-remodel": "/images/services/bathroom-remodel.png",
  "whole-home-remodel": "/images/services/whole-home-remodel.png",
  "room-addition": "/images/services/room-addition.png",
  "adu": "/images/services/adu.png",
  "basement-finish": GALLERY_IMAGES.basement.after,
  "outdoor-living": GALLERY_IMAGES.outdoor.after,
};

export const DEFAULT_SERVICE_BACKGROUND = DEFAULT_BACKGROUND;

export function getServiceBackground(serviceSlug: string): string {
  return SERVICE_BACKGROUNDS[serviceSlug] || DEFAULT_SERVICE_BACKGROUND;
}
