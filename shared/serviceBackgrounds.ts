import { GALLERY_IMAGES, SITE_IMAGES } from "./siteImages";

export interface ServiceBackgroundConfig {
  [key: string]: string;
}

const DEFAULT_BACKGROUND = SITE_IMAGES.hero;

export const SERVICE_BACKGROUNDS: ServiceBackgroundConfig = {
  "kitchen-remodel": GALLERY_IMAGES.kitchen.after,
  "bathroom-remodel": GALLERY_IMAGES.bathroom.after,
  "whole-home-remodel": GALLERY_IMAGES.wholeHome.after,
  "room-addition": GALLERY_IMAGES.addition.after,
  "adu": GALLERY_IMAGES.addition.after,
  "basement-finish": GALLERY_IMAGES.basement.after,
  "outdoor-living": GALLERY_IMAGES.outdoor.after,
};

export const DEFAULT_SERVICE_BACKGROUND = DEFAULT_BACKGROUND;

export function getServiceBackground(serviceSlug: string): string {
  return SERVICE_BACKGROUNDS[serviceSlug] || DEFAULT_SERVICE_BACKGROUND;
}
