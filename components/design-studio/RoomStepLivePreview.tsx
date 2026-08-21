"use client";

import { useState } from "react";
import { Box, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "./DesignStudioProvider";
import { ScannedRoomPreview } from "./ScannedRoomPreview";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { RoomPhotoOverlay } from "./RoomPhotoOverlay";
import { getPreviewFinishHex } from "@/lib/design/previewConfig";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { wizardCopy } from "@/shared/designStudioCopy";

/**
 * Sidebar / mobile preview during the wizard. The 3D view is the default "see
 * it"; the room-photo overlay is an explicit toggle so we never silently swap
 * views (and never run two WebGL contexts at once).
 */
export function RoomStepLivePreview({
  deferMount,
}: {
  deferMount?: boolean;
}) {
  const { design, updateDesign } = useDesignStudio();
  const finishHex = getPreviewFinishHex(design);
  const scanned = isScannedRoom(design.roomMeta);
  const hasPhoto = Boolean(design.photoUrl);
  const can3D = Boolean(design.layout) && scanned;
  const canOverlay = hasPhoto && Boolean(design.layout) && design.modules.length > 0;

  const [showInRoom, setShowInRoom] = useState(false);
  const inRoom = canOverlay && showInRoom;

  const toggle = can3D && canOverlay && (
    <div className="flex items-center gap-1 rounded-md border bg-card p-1">
      <button
        type="button"
        onClick={() => setShowInRoom(false)}
        aria-pressed={!showInRoom}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors min-h-9",
          !showInRoom
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted",
        )}
        data-testid="preview-toggle-3d"
      >
        <Box className="h-4 w-4" /> 3D view
      </button>
      <button
        type="button"
        onClick={() => setShowInRoom(true)}
        aria-pressed={showInRoom}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors min-h-9",
          showInRoom
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted",
        )}
        data-testid="preview-toggle-photo"
      >
        <ImageIcon className="h-4 w-4" /> See in my room
      </button>
    </div>
  );

  let body: React.ReactNode;
  if (inRoom) {
    body = (
      <div className="space-y-2" data-testid="room-step-photo-overlay-preview">
        <p className="px-1 text-sm text-muted-foreground">
          Drag cabinets on your photo to match your space.
        </p>
        <RoomPhotoOverlay
          photoUrl={design.photoUrl as string}
          finishColor={finishHex}
          onPhotoChange={(url) => updateDesign({ photoUrl: url })}
        />
      </div>
    );
  } else if (can3D) {
    body = <LivePreviewPanel deferMount={deferMount} />;
  } else if (canOverlay) {
    // Photo available but no 3D yet: the overlay is the only "see it" view.
    body = (
      <div className="space-y-2" data-testid="room-step-photo-overlay-preview">
        <p className="px-1 text-sm text-muted-foreground">
          Drag cabinets on your photo to match your space.
        </p>
        <RoomPhotoOverlay
          photoUrl={design.photoUrl as string}
          finishColor={finishHex}
          onPhotoChange={(url) => updateDesign({ photoUrl: url })}
        />
      </div>
    );
  } else if (hasPhoto && scanned) {
    body = (
      <div className="space-y-3" data-testid="room-step-photo-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={design.photoUrl as string}
          alt="Your room"
          className="w-full rounded-md border object-cover aspect-[4/3]"
        />
        <p className="px-1 text-sm text-muted-foreground">
          Pick a layout next to place cabinets on your photo.
        </p>
        <ScannedRoomPreview />
      </div>
    );
  } else if (scanned) {
    body = <ScannedRoomPreview />;
  } else {
    body = (
      <div className="rounded-md border bg-card aspect-[4/3] flex items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">{wizardCopy.previewPlaceholder}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {toggle}
      {body}
    </div>
  );
}
