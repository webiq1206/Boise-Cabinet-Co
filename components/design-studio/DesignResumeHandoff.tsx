"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useDesignStudio } from "./DesignStudioProvider";

/**
 * "Continue on another device" affordance. Surfaces the autosaved draft's
 * resume URL as a QR code plus copy / native-share / email options so a
 * homeowner can start on desktop and finish on their phone (and vice versa)
 * without an account. The draft autosaves continuously, so the link always
 * reflects the latest selections.
 */
export function DesignResumeHandoff({
  className,
  triggerLabel = "Resume on another device",
}: {
  className?: string;
  triggerLabel?: string;
}) {
  const { resumeUrl } = useDesignStudio();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!resumeUrl) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resumeUrl);
      setCopied(true);
      toast({ title: "Resume link copied" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy link", variant: "destructive" });
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "My cabinet design",
          text: "Pick up my cabinet design where I left off:",
          url: resumeUrl,
        });
        return;
      } catch {
        /* user cancelled or unsupported - fall through to email */
      }
    }
    const subject = encodeURIComponent("My Boise Cabinet Co design");
    const body = encodeURIComponent(
      `Continue my cabinet design where I left off:\n\n${resumeUrl}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          data-testid="button-resume-handoff"
        >
          <Smartphone className="h-4 w-4" />
          <span className="hidden sm:inline">{triggerLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Continue on another device</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scan this code with your phone, or copy the link. Your selections
              are saved automatically.
            </p>
          </div>
          <div className="flex justify-center rounded-md bg-white p-3">
            <QRCodeSVG value={resumeUrl} size={148} level="M" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-h-10"
              onClick={copy}
              data-testid="button-copy-resume-link"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-h-10"
              onClick={share}
              data-testid="button-share-resume-link"
            >
              <Share2 className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
