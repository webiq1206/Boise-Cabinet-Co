"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { RoomMeta } from "@/lib/design/roomMeta";
import type { RoomBounds } from "@/lib/design/previewConfig";
import { inchesToM } from "@/lib/design/roomMeta";

interface RoomPlanImportProps {
  onImport: (meta: RoomMeta, bounds: RoomBounds) => void;
}

export function RoomPlanImport({ onImport }: RoomPlanImportProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/design-studio/import-roomplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(typeof err.error === "string" ? err.error : "Import failed");
      }
      const data = (await res.json()) as {
        widthIn: number;
        depthIn: number;
        ceilingIn?: number;
        obstacles?: RoomMeta["obstacles"];
        floorPolygon?: { x: number; z: number }[];
      };

      const w = inchesToM(data.widthIn);
      const d = inchesToM(data.depthIn);
      const meta: RoomMeta = {
        widthIn: data.widthIn,
        depthIn: data.depthIn,
        ceilingIn: data.ceilingIn ?? 96,
        obstacles: data.obstacles ?? [],
        userConfirmed: true,
        source: "ar-scan",
        floorPolygon: data.floorPolygon,
        scanConfidence: "high",
      };
      onImport(meta, {
        minX: -w / 2,
        maxX: w / 2,
        minZ: -d / 2,
        maxZ: d / 2,
      });
      toast({
        title: "RoomPlan imported",
        description: `${data.widthIn}" × ${data.depthIn}", review before continuing.`,
      });
    } catch (e) {
      toast({
        title: "Could not import RoomPlan",
        description: e instanceof Error ? e.message : "Check JSON format.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border p-3" data-testid="roomplan-import">
      <p className="text-sm text-muted-foreground mb-2">
        iOS RoomPlan export (JSON), best accuracy for L-shaped rooms.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => fileRef.current?.click()}
        data-testid="button-import-roomplan"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Import RoomPlan JSON
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
