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
  "home-office": { widthIn: 120, depthIn: 132 },
  entertainment: { widthIn: 168, depthIn: 168 },
  "built-ins": { widthIn: 120, depthIn: 120 },
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
  laundry: [
    { id: "laundry-compact", label: "Compact", hint: "Closet or hall laundry", widthIn: 96, depthIn: 84 },
    { id: "laundry-average", label: "Average", hint: "Dedicated laundry room", widthIn: 120, depthIn: 96 },
    { id: "laundry-large", label: "Large", hint: "Laundry + mud combo", widthIn: 156, depthIn: 120 },
  ],
  mudroom: [
    { id: "mudroom-compact", label: "Compact", hint: "Entry drop zone", widthIn: 84, depthIn: 60 },
    { id: "mudroom-average", label: "Average", hint: "Lockers + bench", widthIn: 120, depthIn: 96 },
    { id: "mudroom-large", label: "Large", hint: "Full locker wall", widthIn: 168, depthIn: 120 },
  ],
  "home-office": [
    { id: "office-compact", label: "Compact", hint: "Nook or small office", widthIn: 96, depthIn: 96 },
    { id: "office-average", label: "Average", hint: "Spare-bedroom office", widthIn: 120, depthIn: 132 },
    { id: "office-large", label: "Large", hint: "Shared or large office", widthIn: 168, depthIn: 156 },
  ],
  entertainment: [
    { id: "entertainment-compact", label: "Compact", hint: "Media wall", widthIn: 120, depthIn: 132 },
    { id: "entertainment-average", label: "Average", hint: "Great room", widthIn: 168, depthIn: 168 },
    { id: "entertainment-large", label: "Large", hint: "Large great room", widthIn: 216, depthIn: 192 },
  ],
  "built-ins": [
    { id: "built-ins-compact", label: "Compact", hint: "Single alcove", widthIn: 72, depthIn: 96 },
    { id: "built-ins-average", label: "Average", hint: "Living-room wall", widthIn: 120, depthIn: 120 },
    { id: "built-ins-large", label: "Large", hint: "Full wall of built-ins", widthIn: 168, depthIn: 144 },
  ],
  pantry: [
    { id: "pantry-reach", label: "Reach-in", hint: "Shallow closet", widthIn: 60, depthIn: 48 },
    { id: "pantry-walkin", label: "Walk-in", hint: "Most walk-in pantries", widthIn: 84, depthIn: 72 },
    { id: "pantry-large", label: "Large", hint: "Big walk-in", widthIn: 120, depthIn: 96 },
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
