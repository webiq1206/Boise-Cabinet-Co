"use client";

import { useDesignStudio } from "../DesignStudioProvider";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";
import { VisualOptionGrid } from "@/components/catalog/visual";

// Keep in lockstep with the primary navigation + estimator project types so
// every surface offers the same eight rooms.
const DESIGN_STUDIO_ROOM_SLUGS = [
  "kitchen",
  "bathroom",
  "laundry",
  "mudroom",
  "home-office",
  "entertainment",
  "built-ins",
  "pantry",
] as const;

const DESIGN_STUDIO_ROOMS = DESIGN_STUDIO_ROOM_SLUGS.map(
  (slug) => ROOM_BY_SLUG[slug],
).filter(Boolean);

export function RoomStep({ showHeader = true }: { showHeader?: boolean }) {
  const { design, updateDesign } = useDesignStudio();

  return (
    <div className="space-y-6">
      {showHeader && (
        <div>
          <h2 className="text-2xl font-sans font-light tracking-tight">
            Which <em className="brc-accent text-accent">room</em> are we designing?
          </h2>
          <p className="text-muted-foreground mt-2">
            Pick your room, then add a photo or rough size so cabinets fit your space.
          </p>
        </div>
      )}

      {/* Uses the same selection card as every other step for consistency. */}
      <VisualOptionGrid
        columns={3}
        items={DESIGN_STUDIO_ROOMS.map((room) => ({
          id: room.slug,
          label: room.name,
          description: `${room.description.split(".")[0]}.`,
          imageSrc: room.heroImage,
          imageAlt: `${room.name} custom cabinets`,
        }))}
        selectedId={design.roomType ?? undefined}
        onSelect={(slug) => updateDesign({ roomType: slug, layout: null })}
        testIdPrefix="button-room"
      />
    </div>
  );
}
