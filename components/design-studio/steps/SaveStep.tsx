"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDesignStudio } from "../DesignStudioProvider";
import { PlanIssuesPanel } from "../PlanIssuesPanel";
import { buildLayoutSummary } from "@/lib/design/layoutSummary";
import { detectIssues } from "@/lib/design/planAdvisor";
import { resolveRoomBounds } from "@/lib/design/resolveRoomBounds";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  CheckCircle2,
  Copy,
  RotateCcw,
  Loader2,
  Plus,
  FolderOpen,
  Trash2,
  GitCompare,
  Tag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";
import { SnapshotPreview3D } from "../SnapshotPreview3D";
import { snapshotSpecRows } from "@/lib/design/snapshotSpecs";
import type { SavedVersion } from "@/lib/design/designSerialization";

export function SaveStep({ embedded = false }: { embedded?: boolean }) {
  const {
    design,
    updateDesign,
    resetDesign,
    saveDesign,
    submitPricingRequest,
    isSaving,
    versions,
    saveVersion,
    loadVersion,
    deleteVersion,
    portalProjectId,
  } = useDesignStudio();
  const { toast } = useToast();
  const [name, setName] = useState(design.designName || `My ${design.roomType ?? "cabinet"} design`);
  const [versionName, setVersionName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [saved, setSaved] = useState(!!design.savedDesignId);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const handleSave = async () => {
    updateDesign({ designName: name });
    const result = await saveDesign();
    if (result) {
      setSaved(true);
      toast({
        title: "Design saved",
        description: result.linkedProjectId
          ? "Saved and synced to your project portal."
          : "Your design has been saved. Request pricing below.",
      });
    } else {
      toast({ title: "Could not save", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleSaveVersion = async () => {
    const label =
      versionName.trim() ||
      `Version ${versions.length + 1}`;
    const result = await saveVersion(label);
    if (result) {
      setSaved(true);
      setVersionName("");
      toast({
        title: "Version saved",
        description: `"${label}" was added to your saved versions.`,
      });
    } else {
      toast({
        title: "Could not save version",
        description: "Please finish your design first, then try again.",
        variant: "destructive",
      });
    }
  };

  const handleReopen = (version: SavedVersion) => {
    loadVersion(version.id);
    setName(version.name);
    toast({
      title: "Version reopened",
      description: `Now editing "${version.name}".`,
    });
  };

  const handleCopyVersionLink = (version: SavedVersion) => {
    if (!version.shareToken || typeof window === "undefined") {
      toast({ title: "No share link for this version", variant: "destructive" });
      return;
    }
    const url = `${window.location.origin}/design-studio?share=${version.shareToken}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Share link copied" });
  };

  const handleUseForPricing = (version: SavedVersion) => {
    loadVersion(version.id);
    setName(version.name);
    toast({
      title: "Version selected",
      description: "Fill in your contact info below to request pricing for this version.",
    });
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 3
          ? prev
          : [...prev, id],
    );
  };

  const compareVersions = versions.filter((v) => compareIds.includes(v.id));

  const layoutSummary = useMemo(
    () =>
      buildLayoutSummary({
        modules: design.modules,
        roomBounds: design.roomBounds,
        roomMeta: design.roomMeta,
        layout: design.layout,
      }),
    [design.modules, design.roomBounds, design.roomMeta, design.layout],
  );

  const bounds = resolveRoomBounds(
    design.modules,
    design.roomBounds,
    design.roomMeta,
  );
  const pricingIssues = useMemo(
    () => detectIssues(design.modules, bounds, design.roomMeta),
    [design.modules, bounds, design.roomMeta],
  );

  const handlePricing = async () => {
    if (!contactName || !contactEmail || !contactPhone) {
      toast({ title: "Contact info required", variant: "destructive" });
      return;
    }
    if (!saved && !design.savedDesignId) {
      await handleSave();
    }
    const ok = await submitPricingRequest({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      message: contactMessage,
    });
    if (ok) {
      toast({
        title: "Pricing request sent",
        description: `${SITE_CONFIG.name} will contact you within one business day.`,
      });
    }
  };

  const shareUrl =
    design.shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/design-studio?share=${design.shareToken}`
      : null;

  return (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h2 className="text-2xl font-sans font-light tracking-tight">
            Save & request <em className="brc-accent text-accent">pricing</em>
          </h2>
          <p className="text-muted-foreground mt-2">
            Save your design and our team will prepare a detailed quote.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {saved ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : null}
            {saved ? "Design saved" : "Save your design"}
          </CardTitle>
          <CardDescription>Name your design and save it for reference.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="designName">Design name</Label>
            <Input
              id="designName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g. ${
                (design.roomType && ROOM_BY_SLUG[design.roomType]?.name) || "Cabinet"
              } v1, White Oak`}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="brand" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save design
            </Button>
            {shareUrl && (
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast({ title: "Link copied" });
                }}
              >
                <Copy className="h-4 w-4" />
                Copy share link
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost">
                  <RotateCcw className="h-4 w-4" />
                  Start over
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start over?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This clears your current design. Saved versions in this browser are kept until you delete them.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetDesign}>Start over</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Saved versions
          </CardTitle>
          <CardDescription>
            Save different looks for this project, then reopen or compare them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="versionName">New version name</Label>
              <Input
                id="versionName"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder={`e.g. Version ${versions.length + 1}`}
                data-testid="input-version-name"
              />
            </div>
            <Button
              variant="brand"
              onClick={handleSaveVersion}
              disabled={isSaving}
              data-testid="button-save-version"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Save as version
            </Button>
            {compareIds.length >= 2 && (
              <Button
                variant="outline"
                onClick={() => setCompareOpen(true)}
                data-testid="button-open-compare"
              >
                <GitCompare className="h-4 w-4" />
                Compare ({compareIds.length})
              </Button>
            )}
          </div>

          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved versions yet. Save one above to keep multiple looks.
            </p>
          ) : (
            <ul className="space-y-2">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                  data-testid={`row-version-${version.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={compareIds.includes(version.id)}
                      onCheckedChange={() => toggleCompare(version.id)}
                      disabled={
                        !compareIds.includes(version.id) && compareIds.length >= 3
                      }
                      aria-label={`Select ${version.name} to compare`}
                      data-testid={`checkbox-compare-${version.id}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`text-version-name-${version.id}`}>
                        {version.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {snapshotSpecRows(version.snapshot)
                          .filter((r) => r.label === "Collection" || r.label === "Finish")
                          .map((r) => r.value)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReopen(version)}
                      data-testid={`button-reopen-${version.id}`}
                    >
                      <FolderOpen className="h-4 w-4" />
                      Reopen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUseForPricing(version)}
                      data-testid={`button-use-pricing-${version.id}`}
                    >
                      <Tag className="h-4 w-4" />
                      Use for pricing
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyVersionLink(version)}
                      disabled={!version.shareToken}
                      data-testid={`button-share-${version.id}`}
                    >
                      <Copy className="h-4 w-4" />
                      Share link
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        deleteVersion(version.id);
                        setCompareIds((prev) => prev.filter((x) => x !== version.id));
                      }}
                      aria-label={`Delete ${version.name}`}
                      data-testid={`button-delete-${version.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {design.modules.length > 0 && (
        <Card data-testid="card-layout-summary">
          <CardHeader>
            <CardTitle className="text-base">Layout summary (planning)</CardTitle>
            <CardDescription>
              Sent with your pricing request, planning ranges only, not a firm bid.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div className="flex justify-between gap-2 border-b border-dashed py-1">
                <dt className="text-muted-foreground">Room</dt>
                <dd className="font-medium">
                  {layoutSummary.roomDimensionsConfirmed
                    ? `${layoutSummary.roomWidthIn}" × ${layoutSummary.roomDepthIn}"`
                    : "Not entered"}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-dashed py-1">
                <dt className="text-muted-foreground">Base cabinets</dt>
                <dd className="font-medium">~{layoutSummary.approximateLinearFeet} linear ft</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-dashed py-1">
                <dt className="text-muted-foreground">Modules</dt>
                <dd className="font-medium">
                  {layoutSummary.baseCount} base / {layoutSummary.wallCount} wall
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-dashed py-1">
                <dt className="text-muted-foreground">Layout notes</dt>
                <dd className="font-medium">
                  {layoutSummary.errorCount} error{layoutSummary.errorCount === 1 ? "" : "s"},{" "}
                  {layoutSummary.warningCount} warning
                  {layoutSummary.warningCount === 1 ? "" : "s"}
                </dd>
              </div>
            </dl>
            <PlanIssuesPanel
              issues={pricingIssues}
              showRecommendations={false}
            />
          </CardContent>
        </Card>
      )}

      <Card id="request-pricing">
        <CardHeader>
          <CardTitle className="text-base">Request pricing</CardTitle>
          <CardDescription>
            We&apos;ll review your design and schedule a free consultation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Name</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactMessage">Notes (optional)</Label>
            <Textarea id="contactMessage" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={3} />
          </div>
          <Button variant="brand" onClick={handlePricing} disabled={isSaving || design.pricingSubmitted}>
            {design.pricingSubmitted ? "Request submitted" : "Request pricing"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Track your project in the client portal after we create your project file.
          </p>
          <Button variant="brandOutline" asChild>
            <Link
              href={
                portalProjectId
                  ? `/portal/projects/${portalProjectId}/design`
                  : "/portal"
              }
            >
              {portalProjectId ? "View project selections" : "Go to My Project"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Compare versions</DialogTitle>
            <DialogDescription>
              Side-by-side look at your saved versions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compareVersions.map((version) => {
              const rows = snapshotSpecRows(version.snapshot);
              return (
                <div
                  key={version.id}
                  className="rounded-md border overflow-hidden"
                  data-testid={`compare-card-${version.id}`}
                >
                  <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                    <span className="text-sm font-medium truncate">{version.name}</span>
                    <Badge variant="secondary">
                      {rows.find((r) => r.label === "Estimated tier")?.value}
                    </Badge>
                  </div>
                  <SnapshotPreview3D
                    snapshot={version.snapshot}
                    className="aspect-[4/3]"
                  />
                  <dl className="divide-y text-sm">
                    {rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-2 px-3 py-2"
                      >
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="font-medium text-right truncate">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="p-3">
                    <Button
                      variant="brandOutline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        handleUseForPricing(version);
                        setCompareOpen(false);
                      }}
                      data-testid={`button-compare-use-${version.id}`}
                    >
                      Use this version
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
