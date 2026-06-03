"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { PLACEHOLDER_PROJECT } from "@/shared/portalPlaceholder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectSubNav } from "@/components/portal/ProjectSubNav";
import { ArrowLeft, Check } from "lucide-react";
import {
  getDoorStyleBySlug,
  getFinishBySlug,
  getCollectionBySlug,
  resolveFinishSlug,
  resolveDoorStyleSlug,
  getDoorStyleImages,
  getFinishImages,
} from "@/shared/catalog";
import { FINISHES, DOOR_STYLES, COLLECTIONS } from "@/shared/catalog";
import { cn } from "@/lib/utils";

function resolveLabel(
  category: string,
  value: string | null | undefined,
): { category: string; value: string; status: string; slug?: string } {
  if (!value) {
    return { category, value: "Not selected", status: "pending" };
  }
  if (category === "Collection") {
    const c = getCollectionBySlug(value) ?? COLLECTIONS.find((x) => x.id === value);
    return { category, value: c?.name ?? value, status: "selected", slug: c?.slug ?? value };
  }
  if (category === "Door style") {
    const resolved = resolveDoorStyleSlug(value);
    const d = getDoorStyleBySlug(resolved);
    return { category, value: d?.name ?? value, status: "selected", slug: d?.slug ?? resolved };
  }
  if (category === "Finish") {
    const resolved = resolveFinishSlug(value);
    const f = getFinishBySlug(value) ?? getFinishBySlug(resolved);
    return {
      category,
      value: f?.name ?? value,
      status: f ? "selected" : "pending",
      slug: f?.slug ?? resolved,
    };
  }
  return { category, value, status: "selected" };
}

function SelectionThumbnail({
  category,
  slug,
}: {
  category: string;
  slug?: string;
}) {
  if (!slug) return null;

  if (category === "Collection") {
    const c = getCollectionBySlug(slug) ?? COLLECTIONS.find((x) => x.id === slug);
    if (!c?.heroImage) return null;
    return (
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-muted">
        <Image src={c.heroImage} alt="" fill sizes="80px" className="object-cover" />
      </div>
    );
  }

  if (category === "Door style") {
    const d = getDoorStyleBySlug(slug);
    if (!d) return null;
    const { thumb640 } = getDoorStyleImages(d.slug, d.imagePath);
    return (
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-muted">
        <Image src={thumb640} alt="" fill sizes="80px" className="object-cover" />
      </div>
    );
  }

  if (category === "Finish") {
    const f = getFinishBySlug(slug);
    if (!f) return null;
    const { swatch } = getFinishImages(f.slug, f.imagePath);
    return (
      <div
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-border"
        style={{ backgroundColor: f.hexColor }}
      >
        <Image src={swatch} alt="" fill sizes="56px" className="object-cover" />
      </div>
    );
  }

  return null;
}

const statusBadge: Record<string, "default" | "secondary" | "outline"> = {
  selected: "default",
  pending: "secondary",
  review: "outline",
};

export default function ProjectDesignPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = PLACEHOLDER_PROJECT;

  const stored =
    typeof window !== "undefined"
      ? (() => {
          try {
            const raw = localStorage.getItem(`brc-design-${projectId}`);
            return raw ? (JSON.parse(raw) as Record<string, string>) : null;
          } catch {
            return null;
          }
        })()
      : null;

  const selections = [
    resolveLabel("Collection", stored?.collection ?? "custom"),
    resolveLabel("Door style", stored?.doorStyle ?? "modern-shaker"),
    resolveLabel("Finish", stored?.finish ?? "woodgrain-canyon-oak"),
    { category: "Hardware", value: stored?.hardware ?? "Matte black bar pulls", status: "selected" },
    { category: "Layout", value: stored?.layout ?? "L-shape with island", status: "review" },
  ];

  return (
    <PortalShell variant="customer" title="Design Selections">
      <div className="max-w-3xl mx-auto space-y-6">
        <ProjectSubNav />

        <div>
          <h2 className="text-xl font-sans font-light tracking-tight">
            Design <em className="brc-accent text-accent">selections</em>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {project.title}, selections use the same One Source catalog as our website
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current selections</CardTitle>
            <CardDescription>
              Save designs in Design Studio. Names match OSC catalog entries ({DOOR_STYLES.length}{" "}
              door styles, {FINISHES.length} finishes).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selections.map((item) => (
              <div
                key={item.category}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 py-3 border-b last:border-0",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <SelectionThumbnail category={item.category} slug={item.slug} />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {item.category}
                    </p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
                <Badge variant={statusBadge[item.status] ?? "outline"}>
                  {item.status === "selected" && <Check className="h-3 w-3 mr-1" />}
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="brand" asChild>
            <Link href="/design-studio">Open Design Studio</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/portal/projects/${projectId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to project
            </Link>
          </Button>
        </div>
      </div>
    </PortalShell>
  );
}
