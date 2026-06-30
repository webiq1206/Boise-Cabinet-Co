"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";

import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { ImportDialog } from "@/components/admin/outreach/ImportDialog";
import { ComposeTab } from "@/components/admin/crm/ComposeTab";
import { TrackingTab } from "@/components/admin/crm/TrackingTab";
import { TemplatesTab } from "@/components/admin/crm/TemplatesTab";
import { SequencesTab } from "@/components/admin/crm/SequencesTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Ban,
  Info,
  Loader2,
  Mail,
  Search,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";

interface Prospect {
  id: string;
  businessName: string;
  city: string;
  website: string | null;
  phone: string | null;
  formattedAddress: string | null;
  email: string | null;
  emailSourceUrl: string | null;
  status: string;
  personalizationNote: string | null;
  templateKey: string | null;
  sentAt: string | null;
  followupSentAt: string | null;
  openedAt: string | null;
  lastError: string | null;
}

interface OutreachConfig {
  enabled: boolean;
  dryRun: boolean;
  dailyCap: number;
  minGapMinutes: number;
  batchSize: number;
  defaultTemplate: string;
  sequenceEnabled: boolean;
  followupDelayDays: number;
  followupTemplate: string;
}

interface TemplateOption {
  key: string;
  label: string;
  description: string;
}

interface OutreachData {
  prospects: Prospect[];
  counts: Record<string, number>;
  config: OutreachConfig;
  templates: TemplateOption[];
  readiness: { discoveryConfigured: boolean; sendable: boolean };
}

const STATUS_LABELS: Record<string, string> = {
  discovered: "Discovered",
  needs_email: "No email found",
  ready: "Ready to review",
  approved: "Approved (queued)",
  sending: "Sending",
  sent: "Sent",
  opened: "Opened",
  replied: "Replied",
  bounced: "Bounced",
  skipped: "Skipped",
  unsubscribed: "Unsubscribed",
  error: "Error",
};

const STOP_REASONS: Record<string, string> = {
  limit: "reached the batch size",
  daily_cap: "hit the daily cap",
  throttled: "minimum gap not elapsed yet",
  empty: "no more approved prospects",
  disabled: "sending is turned off",
  not_configured: "sending not configured",
};

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

async function patchJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

interface Suppression {
  email: string;
  reason: string;
  createdAt: string;
}

const SUPPRESSION_REASON_LABELS: Record<string, string> = {
  unsubscribe: "Unsubscribed",
  bounce: "Bounced",
  complaint: "Spam complaint",
  manual: "Added manually",
};

function SuppressionsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");

  const { data, isLoading } = useQuery<{ suppressions: Suppression[] }>({
    queryKey: ["/api/admin/outreach/suppressions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/outreach/suppressions");
      if (!res.ok) throw new Error("Failed to load do-not-email list");
      return res.json();
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach/suppressions"] });

  const addMutation = useMutation({
    mutationFn: (email: string) => postJson("/api/admin/outreach/suppressions", { email }),
    onSuccess: () => {
      toast({ title: "Address added", description: "This address will not be contacted." });
      setNewEmail("");
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Could not add", description: e.message, variant: "destructive" }),
  });

  const removeMutation = useMutation({
    mutationFn: (email: string) =>
      fetch("/api/admin/outreach/suppressions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json.error || "Request failed");
        return json;
      }),
    onSuccess: () => {
      toast({ title: "Removed", description: "This address can be contacted again." });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Could not remove", description: e.message, variant: "destructive" }),
  });

  const rows = data?.suppressions ?? [];

  return (
    <div className="space-y-5 pt-4">
      <Alert>
        <Ban className="h-4 w-4" />
        <AlertTitle>The do-not-email list</AlertTitle>
        <AlertDescription>
          These addresses are permanently skipped on every send. They land here
          automatically when someone unsubscribes, an email hard-bounces, or it is
          marked as spam. Add an address by hand to block it, or remove one that was
          suppressed by mistake so outreach can reach it again.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add an address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Input
              type="email"
              className="max-w-sm"
              placeholder="name@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              data-testid="input-suppression-email"
            />
            <Button
              onClick={() => addMutation.mutate(newEmail.trim())}
              disabled={addMutation.isPending || newEmail.trim() === ""}
              data-testid="button-add-suppression"
            >
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
              Block this address
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading do-not-email list...
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="text-suppressions-empty">
          No addresses are suppressed yet.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground" data-testid="text-suppressions-count">
            {rows.length} {rows.length === 1 ? "address" : "addresses"} suppressed
          </p>
          <div className="space-y-2">
            {rows.map((s) => (
              <Card key={s.email} data-testid={`card-suppression-${s.email}`}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm break-all" data-testid={`text-suppression-email-${s.email}`}>
                      {s.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {SUPPRESSION_REASON_LABELS[s.reason] ?? s.reason}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMutation.mutate(s.email)}
                      disabled={removeMutation.isPending}
                      data-testid={`button-remove-suppression-${s.email}`}
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OutreachPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState("recipients");
  const [draftConfig, setDraftConfig] = useState<OutreachConfig | null>(null);

  const { data, isLoading } = useQuery<OutreachData>({
    queryKey: ["/api/admin/outreach"],
    queryFn: async () => {
      const res = await fetch("/api/admin/outreach");
      if (!res.ok) throw new Error("Failed to load outreach data");
      return res.json();
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach"] });

  const config = draftConfig ?? data?.config ?? null;
  const templates = data?.templates ?? [];

  const discoverMutation = useMutation({
    mutationFn: () => postJson("/api/admin/outreach/discover", {}),
    onSuccess: (r) => {
      toast({ title: `Discovery complete`, description: `${r.totalInserted} new contractors added.` });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Discovery failed", description: e.message, variant: "destructive" }),
  });

  const scrapeMutation = useMutation({
    mutationFn: () => postJson("/api/admin/outreach/scrape", { limit: 10 }),
    onSuccess: (r) => {
      toast({ title: "Email lookup complete", description: `${r.withEmail} emails found, ${r.withoutEmail} with none listed.` });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Lookup failed", description: e.message, variant: "destructive" }),
  });

  const sendMutation = useMutation({
    mutationFn: () => postJson("/api/admin/outreach/send", {}),
    onSuccess: (r) => {
      const parts: string[] = [];
      if (r.sent) parts.push(`${r.sent} sent`);
      if (r.dryRun) parts.push(`${r.dryRun} previewed (dry run)`);
      if (r.skipped) parts.push(`${r.skipped} skipped`);
      if (r.errors) parts.push(`${r.errors} failed`);
      const summary = parts.length ? parts.join(", ") : "nothing sent";
      const desc = `${summary}. Stopped: ${STOP_REASONS[r.stoppedReason] ?? r.stoppedReason}.`;
      toast({ title: "Send run complete", description: desc });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Send failed", description: e.message, variant: "destructive" }),
  });

  const configMutation = useMutation({
    mutationFn: (patch: Partial<OutreachConfig>) => patchJson("/api/admin/outreach/config", patch),
    onSuccess: (r) => {
      setDraftConfig(r.config);
      toast({ title: "Settings saved" });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  if (isLoading || !data || !config) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading outreach data...
      </div>
    );
  }

  const counts = data.counts;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <p className="text-sm text-muted-foreground">
        Find local general contractors, review them, and send a friendly introduction. Website leads live under Leads and are never cold-emailed.
      </p>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Who gets emailed here</AlertTitle>
        <AlertDescription>
          Only contractors you <strong>approve</strong> are queued for automatic
          sending. People who fill out a form on your website are warm leads and
          show up under Leads, never here. Nothing is sent until you approve it
          and turn sending on in Settings.
        </AlertDescription>
      </Alert>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="recipients" data-testid="tab-view-recipients">
            Recipients
          </TabsTrigger>
            <TabsTrigger value="send" data-testid="tab-view-send">
              Send
            </TabsTrigger>
          <TabsTrigger value="all-templates" data-testid="tab-view-all-templates">
              Templates
            </TabsTrigger>
          <TabsTrigger value="sequences" data-testid="tab-view-sequences">
            Sequences
          </TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-view-activity">
              Activity
            </TabsTrigger>
          <TabsTrigger value="suppressions" data-testid="tab-view-suppressions">
            Do-not-email
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-view-settings">
              Settings
            </TabsTrigger>
        </TabsList>

        {/* RECIPIENTS */}
        <TabsContent value="recipients" className="space-y-5 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Build your list</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => discoverMutation.mutate()}
                disabled={discoverMutation.isPending || !data.readiness.discoveryConfigured}
                data-testid="button-discover"
              >
                {discoverMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Find contractors
              </Button>
              <Button
                variant="outline"
                onClick={() => scrapeMutation.mutate()}
                disabled={scrapeMutation.isPending}
                data-testid="button-scrape"
              >
                {scrapeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Look up emails
              </Button>
              <ImportDialog onImported={invalidate} />
              <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending} data-testid="button-send-next">
                {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send next now
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {Object.entries(counts).map(([status, n]) => (
              <Badge key={status} variant="secondary" data-testid={`badge-count-${status}`}>
                {STATUS_LABELS[status] ?? status}: {n}
              </Badge>
            ))}
          </div>
        </TabsContent>

        {/* SEND (single email or full sequence) */}
        <TabsContent value="send" className="pt-4">
          <ComposeTab />
        </TabsContent>

        {/* ALL TEMPLATES (full editor) */}
        <TabsContent value="all-templates" className="pt-4">
          <TemplatesTab />
        </TabsContent>

        {/* SEQUENCES (full editor) */}
        <TabsContent value="sequences" className="pt-4">
          <SequencesTab />
        </TabsContent>

        {/* ACTIVITY (tracking dashboard) */}
        <TabsContent value="activity" className="pt-4">
          <TrackingTab />
        </TabsContent>

        {/* DO-NOT-EMAIL */}
        <TabsContent value="suppressions">
          <SuppressionsPanel />
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings" className="space-y-5 pt-4">
          {!data.readiness.discoveryConfigured && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Discovery not configured</AlertTitle>
              <AlertDescription>
                Add the GOOGLE_PLACES_API_KEY secret to find contractors automatically.
              </AlertDescription>
            </Alert>
          )}
          {!data.readiness.sendable && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Real sending not fully configured</AlertTitle>
              <AlertDescription>
                Real sends require two things: OUTREACH_FROM_EMAIL set to a Resend-verified subdomain address,
                and OUTREACH_MAILING_ADDRESS set to a real physical postal address (legally required in the email
                footer). Until both are set, sends stay in preview only.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sending controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <Label className="text-sm font-medium">Automatic sending</Label>
                  <p className="text-xs text-muted-foreground">
                    Master switch for all outbound email. When on, your sequences send on their own, spaced over the day by the cap and gap below. When off, nothing sends automatically. Build and choose what goes out in the Sequences and Send tabs.
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(v) => setDraftConfig({ ...config, enabled: v })}
                  data-testid="switch-outreach-enabled"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <Label className="text-sm font-medium">Preview (dry run) mode</Label>
                  <p className="text-xs text-muted-foreground">
                    When on, no real email is sent. Turn off only after you have verified your sending subdomain in Resend.
                  </p>
                </div>
                <Switch
                  checked={config.dryRun}
                  onCheckedChange={(v) => setDraftConfig({ ...config, dryRun: v })}
                  data-testid="switch-outreach-dryrun"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="dailyCap">Daily cap (emails / 24h)</Label>
                  <Input id="dailyCap" type="number" className="w-32" value={config.dailyCap} min={1} max={50}
                    onChange={(e) => setDraftConfig({ ...config, dailyCap: Number(e.target.value) })}
                    data-testid="input-outreach-daily-cap" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="minGap">Minimum gap (minutes)</Label>
                  <Input id="minGap" type="number" className="w-32" value={config.minGapMinutes} min={5} max={240}
                    onChange={(e) => setDraftConfig({ ...config, minGapMinutes: Number(e.target.value) })}
                    data-testid="input-outreach-min-gap" />
                </div>
              </div>

              <Button onClick={() => configMutation.mutate(config)} disabled={configMutation.isPending} data-testid="button-save-outreach-config">
                {configMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminOutreachPage() {
  return (
    <AdminAuthGate title="Contractor Outreach">
      <PortalShell variant="admin" title="Contractor Outreach">
        <OutreachPanel />
      </PortalShell>
    </AdminAuthGate>
  );
}
