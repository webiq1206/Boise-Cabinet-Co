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
    title: "Modern Kitchen Transformation",
    description:
      "Full kitchen remodel with custom cabinets, quartz countertops, and new layout in Boise",
  },
  {
    serviceType: "bathroom-remodel",
    city: "meridian",
    beforeImageUrl: GALLERY_IMAGES.bathroom.before,
    afterImageUrl: GALLERY_IMAGES.bathroom.after,
    title: "Primary Bathroom Renovation",
    description:
      "Luxury primary bathroom remodel with walk-in shower, freestanding tub, and heated floors in Meridian",
  },
  {
    serviceType: "whole-home-remodel",
    city: "eagle",
    beforeImageUrl: GALLERY_IMAGES.wholeHome.before,
    afterImageUrl: GALLERY_IMAGES.wholeHome.after,
    title: "Whole-Home Remodel",
    description:
      "Complete interior renovation of a 1990s Eagle home with open floor plan, new kitchen, and three updated bathrooms",
  },
  {
    serviceType: "room-addition",
    city: "nampa",
    beforeImageUrl: GALLERY_IMAGES.addition.before,
    afterImageUrl: GALLERY_IMAGES.addition.after,
    title: "Master Suite Addition",
    description:
      "600 sq ft master suite addition with ensuite bath and walk-in closet in Nampa",
  },
  {
    serviceType: "basement-finish",
    city: "boise",
    beforeImageUrl: GALLERY_IMAGES.basement.before,
    afterImageUrl: GALLERY_IMAGES.basement.after,
    title: "Basement Finish",
    description:
      "Unfinished basement transformed into a family room, home office, and full bath in Boise",
  },
  {
    serviceType: "outdoor-living",
    city: "star",
    beforeImageUrl: GALLERY_IMAGES.outdoor.before,
    afterImageUrl: GALLERY_IMAGES.outdoor.after,
    title: "Outdoor Living Space",
    description:
      "Covered patio with outdoor kitchen and pergola for year-round entertaining in Star",
  },
];
