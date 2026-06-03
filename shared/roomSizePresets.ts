/** Typical wall-to-wall sizes (inches) for Design Studio quick presets. */

export interface RoomSizePreset {
  id: string;
  label: string;
  widthIn: number;
  depthIn: number;
  ceilingIn?: number;
}

const ROOM_DEFAULTS: Record<string, { widthIn: number; depthIn: number }> = {
  kitchen: { widthIn: 144, depthIn: 132 },
  "wet-bar": { widthIn: 120, depthIn: 108 },
  bathroom: { widthIn: 96, depthIn: 84 },
  laundry: { widthIn: 108, depthIn: 96 },
  mudroom: { widthIn: 108, depthIn: 96 },
  closet: { widthIn: 120, depthIn: 96 },
  garage: { widthIn: 240, depthIn: 168 },
  office: { widthIn: 120, depthIn: 108 },
  pantry: { widthIn: 84, depthIn: 72 },
  "outdoor-kitchen": { widthIn: 168, depthIn: 120 },
};

const KITCHEN_PRESETS: RoomSizePreset[] = [
  { id: "kitchen-11x12", label: "11×12 ft", widthIn: 132, depthIn: 144 },
  { id: "kitchen-12x14", label: "12×14 ft", widthIn: 144, depthIn: 168 },
  { id: "kitchen-13x15", label: "13×15 ft", widthIn: 156, depthIn: 180 },
];

const BATH_PRESETS: RoomSizePreset[] = [
  { id: "bath-8x7", label: "8×7 ft", widthIn: 96, depthIn: 84 },
  { id: "bath-10x8", label: "10×8 ft", widthIn: 120, depthIn: 96 },
];

/** Rough size when the homeowner does not have a tape measure. */
export const ROOM_SIZE_BUCKETS: Record<
  string,
  { id: string; label: string; hint: string; widthIn: number; depthIn: number }[]
> = {
  kitchen: [
    {
      id: "kitchen-compact",
      label: "Compact",
      hint: "Galley or small condo",
      widthIn: 120,
      depthIn: 132,
    },
    {
      id: "kitchen-average",
      label: "Average",
      hint: "Most Treasure Valley homes",
      widthIn: 144,
      depthIn: 168,
    },
    {
      id: "kitchen-large",
      label: "Large / open",
      hint: "Great room or big island",
      widthIn: 180,
      depthIn: 192,
    },
  ],
  bathroom: [
    {
      id: "bath-small",
      label: "Small bath",
      hint: "Guest or hall bath",
      widthIn: 84,
      depthIn: 72,
    },
    {
      id: "bath-primary",
      label: "Primary bath",
      hint: "Double vanity common",
      widthIn: 120,
      depthIn: 96,
    },
  ],
};

export function sizeBucketsForRoom(roomType: string | null) {
  if (!roomType) return [];
  return ROOM_SIZE_BUCKETS[roomType] ?? [];
}

export function presetsForRoomType(roomType: string | null): RoomSizePreset[] {
  if (!roomType) return [];
  if (roomType === "kitchen") return KITCHEN_PRESETS;
  if (roomType === "bathroom") return BATH_PRESETS;
  const d = ROOM_DEFAULTS[roomType];
  if (!d) return [];
  return [
    {
      id: `${roomType}-typical`,
      label: "Typical size",
      widthIn: d.widthIn,
      depthIn: d.depthIn,
    },
  ];
}
