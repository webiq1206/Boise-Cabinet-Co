export type ServiceFieldType = 
  | "propertySize"
  | "linearFeet" 
  | "zones"
  | "dimensions"
  | "material"
  | "treeCount"
  | "treeSize"
  | "quantity"
  | "height"
  | "systemAge"
  | "installationAreas"
  | "lightingType";

/**
 * Measurement groups allow the UI to collect certain measurements once (per type),
 * then apply them to relevant services automatically.
 *
 * NOTE: "shared" means shared across services that use the *same* measurement type,
 * not shared across all linear services (roofline vs fence length are different).
 */
export type MeasurementGroup =
  | "sharedLawnArea" // sq ft (general lawn/property area)
  | "sharedRooflineFt" // linear feet (roofline/overhangs for lighting)
  | "sharedLotPerimeterFt" // linear feet (used for fence length entry in UI)
  | "sharedLawnPerimeterFt" // linear feet (edging)
  | "sharedHedgeFt" // linear feet (hedges/shrubs)
  | "perServiceProjectArea" // sq ft but not shareable (mulch/sod install areas, etc.)
  | "perService"; // everything else

export interface ServiceField {
  name: ServiceFieldType;
  label: string;
  placeholder?: string;
  type: "number" | "select" | "text" | "textarea";
  required: boolean;
  options?: string[];
  unit?: string;
  helpText?: string;
  /**
   * How this field should be collected in the quote flow.
   * - shared*: collected once in a shared measurements panel (when possible)
   * - perService*: collected within the service details UI
   */
  measurementGroup?: MeasurementGroup;
}

export interface ServiceFieldConfig {
  serviceId: string;
  serviceName: string;
  category: "lawn" | "hardscape" | "irrigation" | "lighting" | "trees" | "seasonal";
  fields: ServiceField[];
  requiresPropertySize: boolean;
}

export const SERVICE_FIELD_CONFIGS: ServiceFieldConfig[] = [
  {
    serviceId: "lawn-mowing",
    serviceName: "Lawn Mowing & Edging",
    category: "lawn",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Property Size",
        placeholder: "e.g., 5000",
        type: "number",
        required: true,
        unit: "sq ft",
        helpText: "Total lawn area to be mowed",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "aeration",
    serviceName: "Core Aeration",
    category: "lawn",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Lawn Area",
        placeholder: "e.g., 5000",
        type: "number",
        required: true,
        unit: "sq ft",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "fertilization",
    serviceName: "Fertilization",
    category: "lawn",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Lawn Area",
        placeholder: "e.g., 5000",
        type: "number",
        required: true,
        unit: "sq ft",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "weed-control",
    serviceName: "Weed Control",
    category: "lawn",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Lawn Area",
        placeholder: "e.g., 5000",
        type: "number",
        required: true,
        unit: "sq ft",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "overseeding",
    serviceName: "Overseeding",
    category: "lawn",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Lawn Area",
        placeholder: "e.g., 5000",
        type: "number",
        required: true,
        unit: "sq ft",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "dethatching",
    serviceName: "Dethatching",
    category: "lawn",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Lawn Area",
        placeholder: "e.g., 5000",
        type: "number",
        required: true,
        unit: "sq ft",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "sod-installation",
    serviceName: "Sod Installation",
    category: "lawn",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Installation Area",
        placeholder: "e.g., 2000",
        type: "number",
        required: true,
        unit: "sq ft",
        helpText: "Area where sod will be installed",
        measurementGroup: "perServiceProjectArea",
      }
    ]
  },
  {
    serviceId: "patio-installation",
    serviceName: "Patio Installation",
    category: "hardscape",
    requiresPropertySize: false,
    fields: [
      {
        name: "dimensions",
        label: "Patio Dimensions",
        placeholder: "e.g., 20x15 or 300",
        type: "text",
        required: true,
        unit: "sq ft",
        helpText: "Approximate patio size (length x width or total sq ft)"
      },
      {
        name: "material",
        label: "Preferred Material",
        type: "select",
        required: true,
        options: ["Concrete", "Pavers", "Natural Stone", "Stamped Concrete", "Not Sure"],
        helpText: "What material would you like for your patio?"
      }
    ]
  },
  {
    serviceId: "retaining-walls",
    serviceName: "Retaining Walls",
    category: "hardscape",
    requiresPropertySize: false,
    fields: [
      {
        name: "linearFeet",
        label: "Wall Length",
        placeholder: "e.g., 50",
        type: "number",
        required: true,
        unit: "linear feet",
        helpText: "Approximate length of retaining wall needed",
        measurementGroup: "perService",
      },
      {
        name: "height",
        label: "Wall Height",
        placeholder: "e.g., 4",
        type: "number",
        required: true,
        unit: "feet",
        helpText: "Approximate height of wall",
        measurementGroup: "perService",
      },
      {
        name: "material",
        label: "Preferred Material",
        type: "select",
        required: true,
        options: ["Concrete Blocks", "Natural Stone", "Timber", "Boulder", "Not Sure"]
      }
    ]
  },
  {
    serviceId: "fence",
    serviceName: "Fence Installation",
    category: "hardscape",
    requiresPropertySize: false,
    fields: [
      {
        name: "linearFeet",
        label: "Fence Length",
        placeholder: "e.g., 150",
        type: "number",
        required: true,
        unit: "linear feet",
        helpText: "Total linear feet of fencing needed",
        measurementGroup: "sharedLotPerimeterFt",
      },
      {
        name: "height",
        label: "Fence Height",
        placeholder: "e.g., 6",
        type: "number",
        required: false,
        unit: "feet",
        helpText: "Desired fence height",
        measurementGroup: "perService",
      },
      {
        name: "material",
        label: "Fence Material",
        type: "select",
        required: false,
        options: ["Wood", "Vinyl", "Chain Link", "Composite", "Wrought Iron", "Not Sure"]
      }
    ]
  },
  {
    serviceId: "fire-pit-installation",
    serviceName: "Fire Pit Installation",
    category: "hardscape",
    requiresPropertySize: false,
    fields: [
      {
        name: "dimensions",
        label: "Fire Pit Size",
        placeholder: "e.g., 6x6 or 36",
        type: "text",
        required: true,
        unit: "sq ft",
        helpText: "Desired fire pit diameter or area"
      },
      {
        name: "material",
        label: "Preferred Material",
        type: "select",
        required: true,
        options: ["Natural Stone", "Brick", "Concrete", "Fire Bricks", "Not Sure"]
      }
    ]
  },
  {
    serviceId: "christmas-light-installation",
    serviceName: "Christmas Light Installation",
    category: "lighting",
    requiresPropertySize: false,
    fields: [
      {
        name: "lightingType",
        label: "Lighting Type",
        type: "select",
        required: true,
        options: ["Traditional Seasonal", "Permanent Lighting"],
        helpText: "Traditional lights are installed seasonally. Permanent lights stay year-round and are fully controllable via app",
        measurementGroup: "perService",
      },
      {
        name: "linearFeet",
        label: "Linear Feet",
        placeholder: "e.g., 200",
        type: "number",
        required: true,
        unit: "linear feet",
        helpText: "Total linear feet of roofline, trees, or other areas to be lit",
        measurementGroup: "sharedRooflineFt",
      },
      {
        name: "installationAreas",
        label: "Installation Areas",
        type: "textarea",
        required: false,
        placeholder: "e.g., Roofline (150 ft), 3 trees, bushes along walkway",
        helpText: "Describe where lights will be installed",
        measurementGroup: "perService",
      }
    ]
  },
  {
    serviceId: "landscape-lighting",
    serviceName: "Landscape Lighting",
    category: "lighting",
    requiresPropertySize: false,
    fields: [
      {
        name: "quantity",
        label: "Number of Fixtures",
        placeholder: "e.g., 12",
        type: "number",
        required: true,
        unit: "fixtures",
        helpText: "Approximate number of light fixtures needed"
      },
      {
        name: "installationAreas",
        label: "Installation Areas",
        type: "textarea",
        required: false,
        placeholder: "e.g., Pathway lighting, uplighting for trees, accent lights for landscaping",
        helpText: "Describe lighting goals and areas"
      }
    ]
  },
  {
    serviceId: "sprinkler-blowout",
    serviceName: "Sprinkler Winterization",
    category: "irrigation",
    requiresPropertySize: false,
    fields: [
      {
        name: "zones",
        label: "Number of Zones",
        placeholder: "e.g., 6",
        type: "number",
        required: true,
        unit: "zones",
        helpText: "How many irrigation zones does your system have?",
        measurementGroup: "perService",
      }
    ]
  },
  {
    serviceId: "sprinkler-repair",
    serviceName: "Sprinkler Repair",
    category: "irrigation",
    requiresPropertySize: false,
    fields: [
      {
        name: "zones",
        label: "Number of Zones",
        placeholder: "e.g., 6",
        type: "number",
        required: false,
        unit: "zones"
      },
      {
        name: "systemAge",
        label: "System Age",
        type: "select",
        required: false,
        options: ["Less than 5 years", "5-10 years", "10-20 years", "Over 20 years", "Not Sure"]
      }
    ]
  },
  {
    serviceId: "sprinkler-system-installation",
    serviceName: "Sprinkler System Installation",
    category: "irrigation",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Area to Irrigate",
        placeholder: "e.g., 5000",
        type: "number",
        required: true,
        unit: "sq ft",
        helpText: "Total lawn/landscape area needing irrigation",
        measurementGroup: "sharedLawnArea",
      },
      {
        name: "zones",
        label: "Estimated Zones",
        placeholder: "e.g., 6",
        type: "number",
        required: false,
        unit: "zones",
        helpText: "Leave blank if unsure - we'll determine during consultation",
        measurementGroup: "perService",
      }
    ]
  },
  {
    serviceId: "irrigation-repair",
    serviceName: "Irrigation Repair",
    category: "irrigation",
    requiresPropertySize: false,
    fields: [
      {
        name: "zones",
        label: "Number of Zones",
        placeholder: "e.g., 6",
        type: "number",
        required: false,
        unit: "zones"
      }
    ]
  },
  {
    serviceId: "irrigation-maintenance",
    serviceName: "Irrigation Maintenance",
    category: "irrigation",
    requiresPropertySize: false,
    fields: [
      {
        name: "zones",
        label: "Number of Zones",
        placeholder: "e.g., 6",
        type: "number",
        required: false,
        unit: "zones"
      }
    ]
  },
  {
    serviceId: "tree-removal",
    serviceName: "Tree Removal",
    category: "trees",
    requiresPropertySize: false,
    fields: [
      {
        name: "treeCount",
        label: "Number of Trees",
        placeholder: "e.g., 2",
        type: "number",
        required: true,
        unit: "trees",
        measurementGroup: "perService",
      },
      {
        name: "treeSize",
        label: "Tree Size",
        type: "select",
        required: true,
        options: ["Small (under 15 ft)", "Medium (15-30 ft)", "Large (30-50 ft)", "Very Large (over 50 ft)", "Mixed Sizes"]
      }
    ]
  },
  {
    serviceId: "tree-trimming",
    serviceName: "Tree Trimming & Pruning",
    category: "trees",
    requiresPropertySize: false,
    fields: [
      {
        name: "treeCount",
        label: "Number of Trees",
        placeholder: "e.g., 3",
        type: "number",
        required: true,
        unit: "trees",
        measurementGroup: "perService",
      },
      {
        name: "treeSize",
        label: "Tree Size",
        type: "select",
        required: true,
        options: ["Small (under 15 ft)", "Medium (15-30 ft)", "Large (30-50 ft)", "Very Large (over 50 ft)", "Mixed Sizes"]
      }
    ]
  },
  {
    serviceId: "stump-grinding",
    serviceName: "Stump Grinding",
    category: "trees",
    requiresPropertySize: false,
    fields: [
      {
        name: "quantity",
        label: "Number of Stumps",
        placeholder: "e.g., 2",
        type: "number",
        required: true,
        unit: "stumps",
        measurementGroup: "perService",
      },
      {
        name: "dimensions",
        label: "Stump Diameter",
        placeholder: "e.g., 24 inches",
        type: "text",
        required: false,
        helpText: "Approximate diameter of largest stump",
        measurementGroup: "perService",
      }
    ]
  },
  {
    serviceId: "hedge-trimming",
    serviceName: "Hedge & Shrub Trimming",
    category: "seasonal",
    requiresPropertySize: false,
    fields: [
      {
        name: "linearFeet",
        label: "Linear Feet of Hedges",
        placeholder: "e.g., 100",
        type: "number",
        required: false,
        unit: "linear feet",
        helpText: "Approximate length of hedges/shrubs",
        measurementGroup: "sharedHedgeFt",
      },
      {
        name: "quantity",
        label: "Or Number of Individual Shrubs",
        placeholder: "e.g., 12",
        type: "number",
        required: false,
        unit: "shrubs",
        measurementGroup: "perService",
      },
      {
        name: "height",
        label: "Average Height",
        placeholder: "e.g., 6",
        type: "number",
        required: false,
        unit: "feet",
        measurementGroup: "perService",
      }
    ]
  },
  {
    serviceId: "spring-cleanup",
    serviceName: "Spring Cleanup",
    category: "seasonal",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Property Size",
        placeholder: "e.g., 8000",
        type: "number",
        required: true,
        unit: "sq ft",
        helpText: "Total property area needing cleanup",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "fall-cleanup",
    serviceName: "Fall Cleanup",
    category: "seasonal",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Property Size",
        placeholder: "e.g., 8000",
        type: "number",
        required: true,
        unit: "sq ft",
        helpText: "Total property area needing cleanup",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "seasonal-cleanup",
    serviceName: "Seasonal Cleanup",
    category: "seasonal",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Property Size",
        placeholder: "e.g., 8000",
        type: "number",
        required: true,
        unit: "sq ft",
        measurementGroup: "sharedLawnArea",
      }
    ]
  },
  {
    serviceId: "mulch-installation",
    serviceName: "Mulch Installation",
    category: "seasonal",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Mulch Area",
        placeholder: "e.g., 500",
        type: "number",
        required: true,
        unit: "sq ft",
        helpText: "Area to be mulched",
        measurementGroup: "perServiceProjectArea",
      },
      {
        name: "material",
        label: "Mulch Type",
        type: "select",
        required: false,
        options: ["Bark Mulch", "Wood Chips", "Rubber Mulch", "Rock/Gravel", "Not Sure"]
      }
    ]
  },
  {
    serviceId: "lawn-edging",
    serviceName: "Lawn Edging",
    category: "lawn",
    requiresPropertySize: false,
    fields: [
      {
        name: "linearFeet",
        label: "Linear Feet",
        placeholder: "e.g., 200",
        type: "number",
        required: true,
        unit: "linear feet",
        helpText: "Perimeter of lawn areas needing edging",
        measurementGroup: "sharedLawnPerimeterFt",
      }
    ]
  },
  {
    serviceId: "lawn-renovation",
    serviceName: "Lawn Renovation",
    category: "lawn",
    requiresPropertySize: true,
    fields: [
      {
        name: "propertySize",
        label: "Lawn Area",
        placeholder: "e.g., 5000",
        type: "number",
        required: true,
        unit: "sq ft",
        helpText: "Total lawn area to be renovated",
        measurementGroup: "sharedLawnArea",
      }
    ]
  }
];

export function getServiceFieldConfig(serviceId: string): ServiceFieldConfig | undefined {
  return SERVICE_FIELD_CONFIGS.find(config => config.serviceId === serviceId);
}

export function getServicesByCategory(category: string): ServiceFieldConfig[] {
  return SERVICE_FIELD_CONFIGS.filter(config => config.category === category);
}

export function requiresPropertySize(serviceIds: string[]): boolean {
  return serviceIds.some(id => {
    const config = getServiceFieldConfig(id);
    return config?.requiresPropertySize === true;
  });
}
