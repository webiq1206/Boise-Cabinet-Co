"use client";

import { useDesignStudio } from "./DesignStudioProvider";
import { ScannedRoomPreview } from "./ScannedRoomPreview";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { RoomPhotoOverlay } from "./RoomPhotoOverlay";
import { getPreviewFinishHex } from "@/lib/design/previewConfig";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { wizardCopy } from "@/shared/designStudioCopy";

/** Sidebar / mobile preview during the wizard — prioritizes the user's room photo. */
export function RoomStepLivePreview({
  deferMount,
}: {
  deferMount?: boolean;
}) {
  const { design, updateDesign } = useDesignStudio();
  const finishHex = getPreviewFinishHex(design);

  if (design.photoUrl && design.layout && design.modules.length > 0) {
    return (
      <div className="space-y-2" data-testid="room-step-photo-overlay-preview">
        <p className="text-xs text-muted-foreground px-1">
          Drag cabinets on your photo to match your space.
        </p>
        <RoomPhotoOverlay
          photoUrl={design.photoUrl}
          finishColor={finishHex}
          onPhotoChange={(url) => updateDesign({ photoUrl: url })}
        />
      </div>
    );
  }

  if (design.photoUrl && isScannedRoom(design.roomMeta)) {
    return (
      <div className="space-y-3" data-testid="room-step-photo-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={design.photoUrl}
          alt="Your room"
          className="w-full rounded-md border object-cover aspect-[4/3]"
        />
        <p className="text-xs text-muted-foreground px-1">
          {design.layout
            ? "Your layout is selected — continue to preview cabinets on this photo."
            : "Pick a layout next to place cabinets on your photo."}
        </p>
        <ScannedRoomPreview />
      </div>
    );
  }

  if (design.layout && isScannedRoom(design.roomMeta)) {
    return <LivePreviewPanel deferMount={deferMount} />;
  }

  if (isScannedRoom(design.roomMeta)) {
    return <ScannedRoomPreview />;
  }

  return (
    <div className="rounded-md border bg-card aspect-[4/3] flex items-center justify-center p-6 text-center">
      <p className="text-sm text-muted-foreground">{wizardCopy.previewPlaceholder}</p>
    </div>
  );
}
