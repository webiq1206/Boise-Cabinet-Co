"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-media-query";

const VERSION_GROUP_STORAGE_KEY = "brc-design-version-group";

export function DesktopScanHandoff() {
  const isDesktop = useIsDesktop();
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUrl(window.location.href);
    const gid = window.localStorage.getItem(VERSION_GROUP_STORAGE_KEY);
    if (gid) {
      const u = new URL(window.location.href);
      u.searchParams.set("vg", gid);
      setUrl(u.toString());
    }
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      className="rounded-md border border-dashed p-4 flex flex-col sm:flex-row gap-4 items-center"
      data-testid="desktop-scan-handoff"
    >
      <div className="shrink-0 bg-white p-2 rounded-md">
        {url ? <QRCodeSVG value={url} size={120} level="M" /> : null}
      </div>
      <div>
        <p className="text-sm font-medium flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-accent" />
          Continue on your phone
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          AR room scan works on a phone or tablet. Scan this QR code to open the
          same design on your device — your progress is saved in this browser.
        </p>
      </div>
    </div>
  );
}
