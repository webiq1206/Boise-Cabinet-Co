/**
 * Service field configuration for remodeling project types.
 * Defines which measurement fields are shown in the quote/lead forms for each service.
 */

export type MeasurementType =
  | "propertySize"      // sq ft of space being remodeled
  | "budgetRange"       // approximate budget
  | "roomCount"         // number of rooms
  | "stories"           // number of stories (for additions)
  | "notes";            // free-form project notes

export interface FieldConfig {
  id: string;
  label: string;
  helpText?: string;
  placeholder?: string;
  unit?: string;
  type: "number" | "text" | "select" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface ServiceFieldConfig {
  serviceId: string;
  displayName: string;
  measurementType: MeasurementType;
  fields: FieldConfig[];
}

export const SERVICE_FIELD_CONFIGS: ServiceFieldConfig[] = [
  {
    serviceId: "kitchen-remodel",
    displayName: "Kitchen Remodel",
    measurementType: "propertySize",
    fields: [
      {
        id: "propertySize",
        label: "Kitchen square footage",
        helpText: "Approximate size of your kitchen area",
        placeholder: "e.g., 200",
        unit: "sq ft",
        type: "number",
        required: false,
      },
      {
        id: "finishLevel",
        label: "Finish level",
        type: "select",
        options: [
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" },
          { value: "luxury", label: "Luxury / Custom" },
        ],
        required: false,
      },
    ],
  },
  {
    serviceId: "bathroom-remodel",
    displayName: "Bathroom Remodel",
    measurementType: "propertySize",
    fields: [
      {
        id: "propertySize",
        label: "Bathroom square footage",
        helpText: "Approximate size of the bathroom",
        placeholder: "e.g., 80",
        unit: "sq ft",
        type: "number",
        required: false,
      },
      {
        id: "finishLevel",
        label: "Finish level",
        type: "select",
        options: [
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" },
          { value: "luxury", label: "Luxury / Spa" },
        ],
        required: false,
      },
    ],
  },
  {
    serviceId: "whole-home-remodel",
    displayName: "Whole-Home Remodel",
    measurementType: "propertySize",
    fields: [
      {
        id: "propertySize",
        label: "Home square footage",
        helpText: "Total square footage of the home",
        placeholder: "e.g., 2000",
        unit: "sq ft",
        type: "number",
        required: false,
      },
      {
        id: "roomCount",
        label: "Number of rooms being remodeled",
        placeholder: "e.g., 5",
        type: "number",
        required: false,
      },
    ],
  },
  {
    serviceId: "room-addition",
    displayName: "Room Addition",
    measurementType: "propertySize",
    fields: [
      {
        id: "propertySize",
        label: "Addition square footage",
        helpText: "Approximate size of the new addition",
        placeholder: "e.g., 400",
        unit: "sq ft",
        type: "number",
        required: false,
      },
      {
        id: "stories",
        label: "Number of stories",
        type: "select",
        options: [
          { value: "1", label: "Single-story" },
          { value: "2", label: "Two-story" },
        ],
        required: false,
      },
    ],
  },
  {
    serviceId: "adu",
    displayName: "ADU / Guest House",
    measurementType: "propertySize",
    fields: [
      {
        id: "propertySize",
        label: "ADU square footage",
        helpText: "Approximate size of the accessory dwelling unit",
        placeholder: "e.g., 600",
        unit: "sq ft",
        type: "number",
        required: false,
      },
      {
        id: "finishLevel",
        label: "Finish level",
        type: "select",
        options: [
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" },
          { value: "luxury", label: "Luxury / Custom" },
        ],
        required: false,
      },
      {
        id: "aduType",
        label: "ADU type",
        type: "select",
        options: [
          { value: "detached", label: "Detached" },
          { value: "attached", label: "Attached" },
        ],
        required: false,
      },
    ],
  },
  {
    serviceId: "basement-finish",
    displayName: "Basement Finish",
    measurementType: "propertySize",
    fields: [
      {
        id: "propertySize",
        label: "Basement square footage",
        helpText: "Total unfinished basement area",
        placeholder: "e.g., 1000",
        unit: "sq ft",
        type: "number",
        required: false,
      },
    ],
  },
  {
    serviceId: "outdoor-living",
    displayName: "Outdoor Living",
    measurementType: "propertySize",
    fields: [
      {
        id: "propertySize",
        label: "Outdoor area square footage",
        helpText: "Approximate size of the outdoor space",
        placeholder: "e.g., 500",
        unit: "sq ft",
        type: "number",
        required: false,
      },
      {
        id: "notes",
        label: "What are you envisioning?",
        helpText: "Covered patio, outdoor kitchen, pergola, etc.",
        placeholder: "Describe your project idea...",
        type: "textarea",
        required: false,
      },
    ],
  },
];

export function getServiceFieldConfig(serviceId: string): ServiceFieldConfig | undefined {
  return SERVICE_FIELD_CONFIGS.find(c => c.serviceId === serviceId);
}

/** Canonical list of service IDs Boise Cabinet Co actually offers. Single source of truth for API + UI validation. */
export const ALLOWED_SERVICE_IDS: readonly string[] = SERVICE_FIELD_CONFIGS.map(
  (c) => c.serviceId
);

export function isValidServiceId(id: string): boolean {
  return ALLOWED_SERVICE_IDS.includes(id);
}
