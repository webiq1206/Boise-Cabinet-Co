import { GALLERY_IMAGES } from "./siteImages";

export interface GalleryProject {
  serviceType: string;
  city: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  title: string;
  description: string;
}

export const GALLERY_PROJECTS: GalleryProject[] = [
  {
    serviceType: "kitchen-remodel",
    city: "boise",
    beforeImageUrl: GALLERY_IMAGES.kitchen.before,
    afterImageUrl: GALLERY_IMAGES.kitchen.after,
    title: "Modern Kitchen Cabinet Upgrade",
    description:
      "Custom kitchen cabinets with shaker doors, soft-close hardware, and quartz island in Boise",
  },
  {
    serviceType: "bathroom-remodel",
    city: "meridian",
    beforeImageUrl: GALLERY_IMAGES.bathroom.before,
    afterImageUrl: GALLERY_IMAGES.bathroom.after,
    title: "Primary Bath Vanity Transformation",
    description:
      "Double vanity with linen tower, organized drawers, and coordinated mirrors in Meridian",
  },
  {
    serviceType: "whole-home-remodel",
    city: "eagle",
    beforeImageUrl: GALLERY_IMAGES.wholeHome.before,
    afterImageUrl: GALLERY_IMAGES.wholeHome.after,
    title: "Whole-Home Cabinet Program",
    description:
      "Coordinated kitchen, bath, mudroom, and office cabinetry across an Eagle home with one finish schedule",
  },
  {
    serviceType: "room-addition",
    city: "nampa",
    beforeImageUrl: GALLERY_IMAGES.addition.before,
    afterImageUrl: GALLERY_IMAGES.addition.after,
    title: "Pantry and Mudroom Storage",
    description:
      "Floor-to-ceiling pantry and mudroom locker system with bench storage in Nampa",
  },
  {
    serviceType: "basement-finish",
    city: "boise",
    beforeImageUrl: GALLERY_IMAGES.basement.before,
    afterImageUrl: GALLERY_IMAGES.basement.after,
    title: "Basement Wet Bar Cabinets",
    description:
      "Custom wet bar and storage cabinets in a Boise basement entertainment space",
  },
  {
    serviceType: "outdoor-kitchen",
    city: "meridian",
    beforeImageUrl: GALLERY_IMAGES.outdoor.before,
    afterImageUrl: GALLERY_IMAGES.outdoor.after,
    title: "Outdoor Kitchen Cabinets",
    description:
      "Weather-rated outdoor kitchen cabinetry with durable finish under a covered patio in Meridian",
  },
];
