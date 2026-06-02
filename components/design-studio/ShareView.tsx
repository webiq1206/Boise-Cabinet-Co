"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  rowToSnapshot,
  type DesignRow,
  type DesignSnapshot,
} from "@/lib/design/designSerialization";
import { snapshotSpecRows } from "@/lib/design/snapshotSpecs";
import { resolveRoomBounds } from "@/lib/design/resolveRoomBounds";
import { detectIssues } from "@/lib/design/planAdvisor";
import {
  buildFloorPlanSvg,
  downloadFloorPlanSvg,
} from "@/lib/design/floorPlanExport";
import { Download } from "lucide-react";
import { SnapshotPreview3D } from "./SnapshotPreview3D";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

interface ShareViewProps {
  shareToken: string;
}

export function ShareView({ shareToken }: ShareViewProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState<string>("");
  const [snapshot, setSnapshot] = useState<DesignSnapshot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/designs?shareToken=${encodeURIComponent(shareToken)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((row: DesignRow) => {
        if (cancelled) return;
        setDesignId(row.id);
        setDesignName(typeof row.name === "string" ? row.name : "");
        setSnapshot(rowToSnapshot(row));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shareToken]);

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
      toast({ title: "Please fill in your name, email, and phone.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/designs/pricing-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designId: designId ?? undefined,
          name,
          email,
          phone,
          message,
          roomType: snapshot?.roomType ?? undefined,
          collectionId: snapshot?.collection ?? undefined,
          styleJson: {
            doorStyle: snapshot?.doorStyle,
            finish: snapshot?.finish,
            hardware: snapshot?.hardware,
          },
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      toast({
        title: "Pricing request sent",
        description: `${SITE_CONFIG.name} will contact you within one business day.`,
      });
    } catch {
      toast({ title: "Could not send request", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const rows = snapshot ? snapshotSpecRows(snapshot) : [];

  const shareBounds = snapshot
    ? resolveRoomBounds(snapshot.modules, snapshot.roomBounds, snapshot.roomMeta)
    : null;
  const shareIssues = snapshot && shareBounds
    ? detectIssues(snapshot.modules, shareBounds, snapshot.roomMeta)
    : [];

  function downloadShareFloorPlan() {
    if (!snapshot || !shareBounds) return;
    const svg = buildFloorPlanSvg({
      modules: snapshot.modules,
      bounds: shareBounds,
      roomMeta: snapshot.roomMeta,
      designName: designName || "shared-design",
    });
    downloadFloorPlanSvg(svg, `shared-${shareToken.slice(0, 8)}-floor-plan.svg`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="font-semibold text-sm shrink-0">
            {SITE_CONFIG.name}
          </Link>
          <p className="text-sm text-muted-foreground hidden sm:block">Shared design</p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/design-studio">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Design your own</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container px-4 py-8 md:py-12 max-w-5xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error || !snapshot ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-lg font-medium">Design not found</p>
              <p className="text-sm text-muted-foreground">
                This share link may have expired or is incorrect.
              </p>
              <Button variant="brand" asChild>
                <Link href="/design-studio">Start your own design</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="brc-label mb-2">Shared design</p>
              <h1 className="text-3xl md:text-4xl font-sans font-light tracking-tight">
                {designName || "Cabinet design"}
              </h1>
              <p className="text-muted-foreground mt-2">
                A design shared with you from the {SITE_CONFIG.name} Design Studio.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="overflow-hidden">
                <SnapshotPreview3D snapshot={snapshot} className="aspect-[4/3]" />
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    Design details
                    <Badge variant="secondary">
                      {rows.find((r) => r.label === "Estimated tier")?.value}
                    </Badge>
                  </CardTitle>
                  <CardDescription>The choices that make up this design.</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y text-sm">
                    {rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-2 py-2"
                      >
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="font-medium text-right">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>

            {snapshot?.roomMeta?.userConfirmed && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Room & layout check</CardTitle>
                    <CardDescription>
                      Scanned {snapshot.roomMeta.widthIn}&quot; ×{" "}
                      {snapshot.roomMeta.depthIn}&quot;
                      {snapshot.roomMeta.scanConfidence
                        ? ` (${snapshot.roomMeta.scanConfidence} confidence)`
                        : ""}
                    </CardDescription>
                  </div>
                  {snapshot.modules.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={downloadShareFloorPlan}
                      data-testid="button-share-floor-plan"
                    >
                      <Download className="h-4 w-4" />
                      Floor plan
                    </Button>
                  )}
                </CardHeader>
                {shareIssues.length > 0 && (
                  <CardContent>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {shareIssues.slice(0, 6).map((issue) => (
                        <li key={issue.id}>
                          <span
                            className={
                              issue.severity === "error"
                                ? "text-destructive font-medium"
                                : ""
                            }
                          >
                            {issue.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request pricing for this design</CardTitle>
                <CardDescription>
                  We&apos;ll review this design and prepare a detailed quote.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="share-name">Name</Label>
                    <Input id="share-name" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-share-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="share-phone">Phone</Label>
                    <Input id="share-phone" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="input-share-phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="share-email">Email</Label>
                  <Input id="share-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="input-share-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="share-message">Notes (optional)</Label>
                  <Textarea id="share-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} data-testid="input-share-message" />
                </div>
                <Button
                  variant="brand"
                  onClick={handleSubmit}
                  disabled={submitting || submitted}
                  data-testid="button-share-request-pricing"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitted ? "Request submitted" : "Request pricing"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
