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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Send, AlertTriangle, MailX, Mail, Eye, MousePointerClick, Inbox, MessageSquare } from "lucide-react";
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

interface ReplyItem {
  id: string;
  createdAt: string;
  message: string;
  detail: { from?: string; subject?: string; snippet?: string } | null;
  leadName: string | null;
  company: string | null;
  email: string | null;
  city: string | null;
}

interface SendDetail {
  send: {
    id: string;
    status: string;
    sentAt: string | null;
    createdAt: string;
    openedAt: string | null;
    firstClickedAt: string | null;
    openCount: number;
    clickCount: number;
    errorDetail: string | null;
  };
  recipient: { name: string | null; company: string | null; email: string | null; city: string | null } | null;
  context: {
    kind: "sequence" | "run" | null;
    sequenceName: string | null;
    stepOrder: number | null;
    templateName: string | null;
    subjectOverride: string | null;
  };
  email: { subject: string; html: string; text: string } | null;
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
  queue: { active: number; completed: number; stopped: number; replied: number; dueNow: number };
  sends: { total: number; sent: number; failed: number; opened: number; clicked: number };
  pacing: {
    sentLast24: number;
    remainingToday: number;
    lastSentAt: string | null;
    nextEligibleAt: string | null;
  };
  recent: RecentSend[];
  replies: ReplyItem[];
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
  const [openSendId, setOpenSendId] = useState<string | null>(null);
  const [openReply, setOpenReply] = useState<ReplyItem | null>(null);
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

  const { config, queue, sends, pacing, recent, replies } = data;
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
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
        <StatCard
          icon={MessageSquare}
          label="Replied"
          value={queue.replied}
          sub="sequence auto-stopped"
          testId="stat-replied"
        />
      </div>

      {/* Replies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Replies
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {replies.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No replies yet. When a contact emails back, they appear here, their
              sequence stops automatically, and a copy is forwarded to your inbox.
            </div>
          ) : (
            <div className="divide-y">
              {replies.map((r) => (
                <div
                  key={r.id}
                  className="cursor-pointer p-4 hover-elevate"
                  onClick={() => setOpenReply(r)}
                  data-testid={`row-reply-${r.id}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-medium">
                      {r.company || r.leadName || r.detail?.from || r.email || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">{fmtTime(r.createdAt)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.email || r.detail?.from || "no email"}
                    {r.city ? ` · ${r.city}` : ""}
                  </div>
                  {r.detail?.subject ? (
                    <div className="mt-1 text-sm font-medium">{r.detail.subject}</div>
                  ) : null}
                  {r.detail?.snippet ? (
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {r.detail.snippet}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => setOpenSendId(r.id)}
                    data-testid={`row-send-${r.id}`}
                  >
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

      <SendDetailDialog sendId={openSendId} onClose={() => setOpenSendId(null)} />
      <ReplyDetailDialog reply={openReply} onClose={() => setOpenReply(null)} />
    </div>
  );
}

function StatusBadge({ detail }: { detail: SendDetail }) {
  const s = detail.send;
  if (s.status === "failed") return <Badge variant="destructive">failed</Badge>;
  if (s.firstClickedAt) return <Badge variant="default">clicked</Badge>;
  if (s.openedAt) return <Badge variant="secondary">opened</Badge>;
  if (s.errorDetail === "dry_run") return <Badge variant="outline">test (dry run)</Badge>;
  return <Badge variant="outline">sent</Badge>;
}

function SendDetailDialog({ sendId, onClose }: { sendId: string | null; onClose: () => void }) {
  const { data, isLoading } = useQuery<SendDetail>({
    queryKey: ["/api/admin/outreach/sends", sendId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/outreach/sends/${sendId}`);
      if (!res.ok) throw new Error("Failed to load send detail");
      return res.json();
    },
    enabled: !!sendId,
  });

  return (
    <Dialog open={!!sendId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email detail</DialogTitle>
          <DialogDescription>
            The message this contact received, rebuilt from the template and their details.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipient + status */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-medium" data-testid="text-detail-recipient">
                  {data.recipient?.company || data.recipient?.name || data.recipient?.email || "Unknown"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.recipient?.email || "no email"}
                  {data.recipient?.city ? ` · ${data.recipient.city}` : ""}
                </div>
              </div>
              <StatusBadge detail={data} />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-3 text-sm">
              <DetailRow label="Sent" value={fmtTime(data.send.sentAt)} />
              <DetailRow
                label="Source"
                value={
                  data.context.kind === "sequence"
                    ? `${data.context.sequenceName ?? "Sequence"}${
                        data.context.stepOrder ? ` · step ${data.context.stepOrder}` : ""
                      }`
                    : data.context.kind === "run"
                    ? "One-off blast"
                    : "—"
                }
              />
              <DetailRow
                label="Opened"
                value={data.send.openedAt ? `${fmtTime(data.send.openedAt)} (${data.send.openCount}×)` : "Not yet"}
              />
              <DetailRow
                label="Clicked"
                value={
                  data.send.firstClickedAt
                    ? `${fmtTime(data.send.firstClickedAt)} (${data.send.clickCount}×)`
                    : "Not yet"
                }
              />
              <DetailRow label="Template" value={data.context.templateName ?? "—"} />
              {data.send.errorDetail && data.send.errorDetail !== "dry_run" ? (
                <DetailRow label="Error" value={data.send.errorDetail} />
              ) : null}
            </div>

            {/* Email content */}
            {data.email ? (
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subject
                  </div>
                  <div className="text-sm font-medium" data-testid="text-detail-subject">
                    {data.email.subject}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Message
                  </div>
                  <iframe
                    title="Email preview"
                    srcDoc={data.email.html}
                    className="h-[420px] w-full rounded-md border bg-white"
                    sandbox=""
                    data-testid="iframe-detail-body"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                The original template or contact is no longer available, so the exact message
                content can&apos;t be reconstructed.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function ReplyDetailDialog({ reply, onClose }: { reply: ReplyItem | null; onClose: () => void }) {
  return (
    <Dialog open={!!reply} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reply detail</DialogTitle>
          <DialogDescription>A copy was also forwarded to your inbox.</DialogDescription>
        </DialogHeader>
        {reply ? (
          <div className="space-y-4">
            <div>
              <div className="font-medium">
                {reply.company || reply.leadName || reply.detail?.from || reply.email || "Unknown"}
              </div>
              <div className="text-xs text-muted-foreground">
                {reply.detail?.from || reply.email || "no email"}
                {reply.city ? ` · ${reply.city}` : ""}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{fmtTime(reply.createdAt)}</div>
            </div>
            {reply.detail?.subject ? (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Subject
                </div>
                <div className="text-sm font-medium">{reply.detail.subject}</div>
              </div>
            ) : null}
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Message
              </div>
              {reply.detail?.snippet ? (
                <p className="whitespace-pre-wrap text-sm">{reply.detail.snippet}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No preview was captured. The full reply was forwarded to your inbox.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
