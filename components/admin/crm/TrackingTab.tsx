"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Send, AlertTriangle, MailX, Mail, Eye, MousePointerClick, Inbox } from "lucide-react";
import { HistoryTab } from "@/components/admin/crm/HistoryTab";

interface RecentSend {
  id: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  openCount: number;
  clickCount: number;
  openedAt: string | null;
  firstClickedAt: string | null;
  errorDetail: string | null;
  leadName: string | null;
  company: string | null;
  email: string | null;
  city: string | null;
  sequenceName: string | null;
}

interface Dashboard {
  config: {
    enabled: boolean;
    dryRun: boolean;
    dailyCap: number;
    minGapMinutes: number;
    sequenceEnabled: boolean;
    sendable: boolean;
  };
  queue: { active: number; completed: number; stopped: number; dueNow: number };
  sends: { total: number; sent: number; failed: number; opened: number; clicked: number };
  pacing: {
    sentLast24: number;
    remainingToday: number;
    lastSentAt: string | null;
    nextEligibleAt: string | null;
  };
  recent: RecentSend[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  testId,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  testId: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums" data-testid={testId}>
          {value}
        </div>
        {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
      </CardContent>
    </Card>
  );
}

function recipientLabel(r: RecentSend): string {
  return r.company || r.leadName || r.email || "Unknown";
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function TrackingTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [autoSend, setAutoSend] = useState(false);
  const autoRef = useRef(false);
  autoRef.current = autoSend;

  const { data, isLoading } = useQuery<Dashboard>({
    queryKey: ["/api/admin/outreach/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/outreach/dashboard");
      if (!res.ok) throw new Error("Failed to load tracking data");
      return res.json();
    },
    refetchInterval: 8000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cron/outreach", { method: "POST" });
      if (!res.ok) throw new Error("Send request failed");
      return res.json() as Promise<{
        sent: number;
        simulated: number;
        lastReason: string | null;
      }>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach/dashboard"] });
      if (result.sent > 0) {
        toast({ title: `Sent ${result.sent} email${result.sent === 1 ? "" : "s"}` });
      } else if (result.simulated > 0) {
        toast({
          title: "Test mode — email simulated",
          description: "Dry run is on, so no real email was delivered. Turn it off in Settings to send for real.",
        });
      } else {
        const reasonText: Record<string, string> = {
          throttled: "Waiting for the minimum gap between sends.",
          daily_cap: "Daily send limit reached for the last 24 hours.",
          disabled: "Sending is turned off. Enable it in Settings.",
          empty: "Nothing is due to send right now.",
          not_configured: "Email sending is not configured.",
        };
        toast({
          title: "No email sent",
          description: reasonText[result.lastReason ?? ""] ?? "Nothing to send.",
        });
      }
    },
    onError: () => toast({ title: "Could not send", variant: "destructive" }),
  });

  // Auto-send loop while the toggle is on and the tab is open. Each tick sends
  // at most one email (the server enforces the gap + daily cap), so this is a
  // safe way to watch progress without leaving the page.
  useEffect(() => {
    if (!autoSend) return;
    const id = setInterval(() => {
      if (autoRef.current && !sendMutation.isPending) {
        sendMutation.mutate();
      }
    }, 30000);
    // Fire one immediately when enabled.
    sendMutation.mutate();
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend]);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { config, queue, sends, pacing, recent } = data;
  const openRate = sends.sent > 0 ? Math.round((sends.opened / sends.sent) * 100) : 0;
  const clickRate = sends.sent > 0 ? Math.round((sends.clicked / sends.sent) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Status banner */}
      {!config.enabled ? (
        <Alert variant="destructive" data-testid="alert-sending-off">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sending is paused</AlertTitle>
          <AlertDescription>
            {queue.dueNow} contact{queue.dueNow === 1 ? " is" : "s are"} waiting in the queue, but the
            master switch is off. Turn on sending in the <strong>Settings</strong> tab to start
            delivering (about {config.dailyCap} per day).
          </AlertDescription>
        </Alert>
      ) : config.dryRun ? (
        <Alert data-testid="alert-dry-run">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Test mode (dry run)</AlertTitle>
          <AlertDescription>
            Sending is on but in test mode — emails are simulated and logged, not actually delivered.
            Turn off dry run in Settings to send for real.
          </AlertDescription>
        </Alert>
      ) : !config.sendable ? (
        <Alert variant="destructive" data-testid="alert-not-configured">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Email sending not configured</AlertTitle>
          <AlertDescription>The sender email or API key is missing.</AlertDescription>
        </Alert>
      ) : (
        <Alert data-testid="alert-sending-on">
          <Mail className="h-4 w-4" />
          <AlertTitle>Sending is live</AlertTitle>
          <AlertDescription>
            Up to {config.dailyCap} emails per day, one every {config.minGapMinutes} minutes.{" "}
            {pacing.remainingToday} left to send today.
            {pacing.nextEligibleAt
              ? ` Next send eligible at ${fmtTime(pacing.nextEligibleAt)}.`
              : ""}
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="auto-send"
            checked={autoSend}
            onCheckedChange={setAutoSend}
            data-testid="switch-auto-send"
          />
          <Label htmlFor="auto-send" className="text-sm">
            Auto-send while this page is open
          </Label>
        </div>
        <Button
          onClick={() => sendMutation.mutate()}
          disabled={sendMutation.isPending}
          data-testid="button-send-now"
        >
          <Send className="h-4 w-4" />
          {sendMutation.isPending ? "Sending…" : "Send next now"}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={Inbox}
          label="In queue"
          value={queue.active}
          sub={`${queue.dueNow} due now`}
          testId="stat-in-queue"
        />
        <StatCard
          icon={Mail}
          label="Sent"
          value={sends.sent}
          sub={`${pacing.sentLast24} in last 24h`}
          testId="stat-sent"
        />
        <StatCard
          icon={Eye}
          label="Opened"
          value={sends.opened}
          sub={`${openRate}% of sent`}
          testId="stat-opened"
        />
        <StatCard
          icon={MousePointerClick}
          label="Clicked"
          value={sends.clicked}
          sub={`${clickRate}% of sent`}
          testId="stat-clicked"
        />
        <StatCard icon={MailX} label="Failed" value={sends.failed} testId="stat-failed" />
        <StatCard
          icon={Inbox}
          label="Completed"
          value={queue.completed}
          sub={queue.stopped ? `${queue.stopped} stopped` : undefined}
          testId="stat-completed"
        />
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No emails sent yet. {queue.dueNow > 0 ? `${queue.dueNow} contacts are queued and ready.` : ""}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="text-right">Opens</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r) => (
                  <TableRow key={r.id} data-testid={`row-send-${r.id}`}>
                    <TableCell>
                      <div className="font-medium">{recipientLabel(r)}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.email || "no email"}
                        {r.city ? ` · ${r.city}` : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.status === "failed" ? (
                        <Badge variant="destructive">failed</Badge>
                      ) : r.firstClickedAt ? (
                        <Badge variant="default">clicked</Badge>
                      ) : r.openedAt ? (
                        <Badge variant="secondary">opened</Badge>
                      ) : (
                        <Badge variant="outline">sent</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmtTime(r.sentAt)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.openCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.clickCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* One-off blast runs */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">One-off blast runs</h3>
        <HistoryTab />
      </div>
    </div>
  );
}
