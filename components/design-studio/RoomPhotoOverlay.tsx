"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomPhotoOverlayProps {
  photoUrl: string | null;
  finishColor: string;
  onPhotoChange: (url: string | null) => void;
  className?: string;
}

export function RoomPhotoOverlay({
  photoUrl,
  finishColor,
  onPhotoChange,
  className,
}: RoomPhotoOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.85);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => onPhotoChange(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onPhotoChange],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Room photo overlay</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload photo
          </Button>
          {photoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPhotoChange(null)}
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="relative aspect-video rounded-sm overflow-hidden border border-border bg-muted">
        {photoUrl ? (
          <>
            <img src={photoUrl} alt="Your room" className="absolute inset-0 w-full h-full object-cover" />
            <div
              className="absolute bottom-[8%] left-[10%] right-[10%] h-[35%] rounded-sm border-2 border-dashed border-white/60"
              style={{
                backgroundColor: finishColor,
                opacity: overlayOpacity,
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}
            />
            <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs">
              Cabinet preview overlay
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-6 text-center">
            <ImageIcon className="h-10 w-10 opacity-40" />
            <p className="text-sm">Upload a photo of your space to preview cabinet placement</p>
          </div>
        )}
      </div>

      {photoUrl && (
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground shrink-0">Overlay opacity</label>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            className="flex-1 accent-primary"
          />
        </div>
      )}
    </div>
  );
}
