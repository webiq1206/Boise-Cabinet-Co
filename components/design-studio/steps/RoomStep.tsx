"use client";

import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { ROOM_CATEGORIES } from "@/shared/catalog/roomCategories";
import {
  ChefHat,
  Bath,
  Shirt,
  Briefcase,
  Home,
  Archive,
  Tv,
  Car,
  type LucideIcon,
} from "lucide-react";

const DESIGN_STUDIO_ROOMS = ROOM_CATEGORIES.filter((r) =>
  ["kitchen", "bathroom", "laundry", "home-office", "closet", "mudroom"].includes(r.slug),
);

const ROOM_ICONS: Record<string, LucideIcon> = {
  kitchen: ChefHat,
  bathroom: Bath,
  laundry: Shirt,
  "home-office": Briefcase,
  closet: Archive,
  mudroom: Home,
  entertainment: Tv,
  garage: Car,
};

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
            Pick your room, then scan it so cabinets fit your space.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DESIGN_STUDIO_ROOMS.map((room) => {
          const Icon = ROOM_ICONS[room.slug] ?? Home;
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
                "flex flex-col items-start gap-3 rounded-lg border-2 p-5 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50",
              )}
              data-testid={`button-room-${room.slug}`}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
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
