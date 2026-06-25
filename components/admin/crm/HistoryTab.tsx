"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pause, Play } from "lucide-react";

interface Run {
  id: string;
  templateId: string;
  templateName: string | null;
  subjectOverride: string | null;
  status: string;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  createdAt: string;
}

export function HistoryTab() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery<Run[]>({
    queryKey: ["/api/admin/outreach/run"],
    queryFn: async () => {
      const res = await fetch("/api/admin/outreach/run");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 5000, // poll for live progress
  });

  const statusMutation = useMutation({
    mutationFn: async ({ runId, status }: { runId: string; status: string }) => {
      const res = await fetch("/api/admin/outreach/run", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach/run"] }),
  });

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No runs yet. Start one from the Compose tab.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead className="text-right">Skipped</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.templateName || run.templateId}</TableCell>
                  <TableCell>
                    <Badge variant={run.status === "active" ? "default" : "secondary"}>{run.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{run.sentCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{run.failedCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{run.skippedCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {run.status === "active" ? (
                      <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ runId: run.id, status: "paused" })}>
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : run.status === "paused" ? (
                      <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ runId: run.id, status: "active" })}>
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
