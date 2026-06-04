"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";

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

const DESIGN_STUDIO_ROOMS = DESIGN_STUDIO_ROOM_SLUGS.map((slug) => ROOM_BY_SLUG[slug]).filter(
  Boolean,
);

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DESIGN_STUDIO_ROOMS.map((room) => {
          const selected = design.roomType === room.slug;

          return (
            <button
              key={room.slug}
              type="button"
              onClick={() =>
                updateDesign({
                  roomType: room.slug,
                  layout: null,
                })
              }
              className={cn(
                "group flex flex-col overflow-hidden rounded-lg border-2 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50",
              )}
              data-testid={`button-room-${room.slug}`}
            >
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface-greige">
                <Image
                  src={room.heroImage}
                  alt={`${room.name} custom cabinets`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <p className="font-medium">{room.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {room.description.split(".")[0]}.
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
