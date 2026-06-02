"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText, Upload } from "lucide-react";

const PLACEHOLDER_DOCUMENTS = [
  { id: "doc-1", name: "Signed Design Agreement.pdf", type: "Contract", date: "May 12, 2026", size: "245 KB" },
  { id: "doc-2", name: "Kitchen Floor Plan.pdf", type: "Design", date: "May 18, 2026", size: "1.2 MB" },
  { id: "doc-3", name: "Cabinet Elevation — North Wall.pdf", type: "Design", date: "May 22, 2026", size: "890 KB" },
  { id: "doc-4", name: "Inspiration Photos.zip", type: "Upload", date: "May 25, 2026", size: "4.8 MB" },
];

export default function ProjectDocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <PortalShell variant="customer" title="Documents">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/portal/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to project
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-sans font-light tracking-tight">
              Project <em className="brc-accent text-accent">documents</em>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Contracts, plans, and uploaded files
            </p>
          </div>
          <Button variant="brand" disabled>
            <Upload className="h-4 w-4" />
            Upload file
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All documents</CardTitle>
            <CardDescription>{PLACEHOLDER_DOCUMENTS.length} files</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {PLACEHOLDER_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.date} · {doc.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{doc.type}</Badge>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
