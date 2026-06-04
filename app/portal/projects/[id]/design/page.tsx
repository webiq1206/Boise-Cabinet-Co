"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectSubNav } from "@/components/portal/ProjectSubNav";
import { ArrowLeft, Check } from "lucide-react";
import { FINISHES, DOOR_STYLES } from "@/shared/catalog";
import type { SelectionDisplayRow } from "@/lib/catalog/selectionDisplay";
import { cn } from "@/lib/utils";

const statusBadge: Record<string, "default" | "secondary" | "outline"> = {
  selected: "default",
  pending: "secondary",
  review: "outline",
};

interface ProjectDesignResponse {
  project: { id: string; title: string };
  design: {
    designId: string | null;
    designName: string | null;
    source: string;
    rows: SelectionDisplayRow[];
  };
}

function SelectionThumbnail({ row }: { row: SelectionDisplayRow }) {
  if (!row.imageSrc) return null;
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-sm bg-muted",
        row.category === "Finish" ? "h-14 w-14 border border-border" : "h-14 w-20",
      )}
    >
      <Image src={row.imageSrc} alt="" fill sizes="80px" className="object-cover" />
    </div>
  );
}

export default function ProjectDesignPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data, isLoading, isError } = useQuery<ProjectDesignResponse>({
    queryKey: [`/api/portal/projects/${projectId}/design`],
    queryFn: async () => {
      const res = await fetch(`/api/portal/projects/${projectId}/design`);
      if (!res.ok) throw new Error("Failed to load design");
      return res.json();
    },
  });

  const project = data?.project;
  const rows = data?.design?.rows ?? [];

  return (
    <PortalShell variant="customer" title="Design Selections">
      <div className="max-w-3xl mx-auto space-y-6">
        <ProjectSubNav />

        <div>
          <h2 className="text-xl font-sans font-light tracking-tight">
            Design <em className="brc-accent text-accent">selections</em>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {project?.title ?? "Project"}, selections use the same catalog as our website
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">
                We couldn&apos;t load design selections.{" "}
                <Link href={`/portal/projects/${projectId}`} className="text-primary underline">
                  Return to project
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {data?.design?.designName ?? "Current selections"}
              </CardTitle>
              <CardDescription>
                Save designs in Design Studio. Names match our catalog entries ({DOOR_STYLES.length}{" "}
                door styles, {FINISHES.length} finishes).
                {data?.design?.source === "demo" && (
                  <span className="block mt-1 text-xs">
                    Showing demo selections until a saved design is linked to this project.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rows.map((item) => (
                <div
                  key={item.category}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SelectionThumbnail row={item} />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {item.category}
                      </p>
                      {item.href ? (
                        <Link href={item.href} className="font-medium hover:text-accent">
                          {item.value}
                        </Link>
                      ) : (
                        <p className="font-medium">{item.value}</p>
                      )}
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
        )}

        <div className="flex gap-3">
          <Button variant="brand" asChild>
            <Link href={`/design-studio?projectId=${projectId}`}>Open Design Studio</Link>
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
