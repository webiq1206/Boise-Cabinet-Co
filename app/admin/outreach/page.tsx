"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageIntro } from "@/components/admin/AdminPageIntro";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Check, Loader2, Mail, Reply, Search, Send, Trash2, X } from "lucide-react";

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
}

interface TemplateOption {
  key: string;
  label: string;
  description: string;
}

// Sentinel value for "no override, follow the batch default" in the per-prospect
// template select (Radix SelectItem cannot use an empty string value).
const DEFAULT_TEMPLATE_SENTINEL = "__default__";

interface OutreachData {
  prospects: Prospect[];
  counts: Record<string, number>;
  config: OutreachConfig;
  templates: TemplateOption[];
  readiness: { discoveryConfigured: boolean; sendable: boolean };
}

interface PreviewData {
  subject: string;
  text: string;
  html: string;
  from: string | null;
  to: string | null;
  businessName: string;
  status: string;
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

const FILTER_TABS: { key: string; label: string; statuses: string[] }[] = [
  { key: "ready", label: "Ready", statuses: ["ready"] },
  { key: "approved", label: "Queued", statuses: ["approved", "sending"] },
  { key: "sent", label: "Sent", statuses: ["sent", "opened", "replied"] },
  { key: "discovered", label: "Discovered", statuses: ["discovered"] },
  { key: "no_email", label: "No email", statuses: ["needs_email"] },
  { key: "other", label: "Other", statuses: ["skipped", "unsubscribed", "bounced", "error"] },
];

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

function ProspectCard({
  p,
  selected,
  onToggleSelect,
  noteEdits,
  setNoteEdits,
  emailEdits,
  setEmailEdits,
  templates,
  defaultTemplateLabel,
  onMutate,
  onDelete,
  onPreview,
  onTrack,
}: {
  p: Prospect;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  noteEdits: Record<string, string>;
  setNoteEdits: (v: Record<string, string>) => void;
  emailEdits: Record<string, string>;
  setEmailEdits: (v: Record<string, string>) => void;
  templates: TemplateOption[];
  defaultTemplateLabel: string;
  onMutate: (id: string, body: unknown) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  onTrack: (id: string, status: "replied" | "bounced") => void;
}) {
  const emailValue = emailEdits[p.id] ?? p.email ?? "";
  const emailDirty = emailValue !== (p.email ?? "");
  const noteValue = noteEdits[p.id] ?? p.personalizationNote ?? "";
  const noteDirty = noteEdits[p.id] !== undefined && noteEdits[p.id] !== (p.personalizationNote ?? "");

  return (
    <Card data-testid={`card-prospect-${p.id}`} className={selected ? "ring-1 ring-primary" : undefined}>
      <CardContent className="pt-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect(p.id)}
              aria-label={`Select ${p.businessName}`}
              className="mt-0.5"
              data-testid={`checkbox-prospect-${p.id}`}
            />
            <div>
              <p className="font-medium text-sm" data-testid={`text-name-${p.id}`}>
                {p.businessName}
              </p>
              <p className="text-xs text-muted-foreground" data-testid={`text-address-${p.id}`}>
                {p.formattedAddress ?? p.city}
                {p.phone ? ` · ${p.phone}` : ""}
                {p.website ? (
                  <>
                    {" · "}
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="underline">
                      website
                    </a>
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <Badge variant="secondary">{STATUS_LABELS[p.status] ?? p.status}</Badge>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Email (publicly listed)</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-sm"
              placeholder="No public email found"
              value={emailValue}
              onChange={(e) => setEmailEdits({ ...emailEdits, [p.id]: e.target.value })}
              data-testid={`input-email-${p.id}`}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!emailDirty}
              onClick={() => onMutate(p.id, { action: "edit", email: emailValue })}
            >
              Save email
            </Button>
          </div>
          {p.emailSourceUrl && (
            <p className="text-xs text-muted-foreground">Source: {p.emailSourceUrl}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Personalization note (optional, added to opener)</Label>
          <Textarea
            rows={2}
            placeholder="e.g. I saw you do a lot of kitchen remodels around Eagle."
            value={noteValue}
            onChange={(e) => setNoteEdits({ ...noteEdits, [p.id]: e.target.value })}
            data-testid={`input-note-${p.id}`}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              disabled={!noteDirty}
              onClick={() => onMutate(p.id, { action: "edit", personalizationNote: noteValue })}
            >
              Save note
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Template (overrides the default for this prospect)</Label>
          <Select
            value={p.templateKey ?? DEFAULT_TEMPLATE_SENTINEL}
            onValueChange={(v) =>
              onMutate(p.id, {
                action: "edit",
                templateKey: v === DEFAULT_TEMPLATE_SENTINEL ? "" : v,
              })
            }
          >
            <SelectTrigger className="max-w-sm" data-testid={`select-template-${p.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_TEMPLATE_SENTINEL}>
                Use default ({defaultTemplateLabel})
              </SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {p.lastError && (
          <p className="text-xs text-destructive">{p.lastError}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview(p.id)}
            data-testid={`button-preview-${p.id}`}
          >
            <Mail className="h-4 w-4" /> Preview
          </Button>

          {p.status !== "approved" && (p.email || emailEdits[p.id]) && (
            <Button
              size="sm"
              onClick={() =>
                onMutate(p.id, {
                  action: "approve",
                  ...(emailEdits[p.id] && emailEdits[p.id] !== p.email
                    ? { email: emailEdits[p.id] }
                    : {}),
                  ...(noteEdits[p.id] !== undefined
                    ? { personalizationNote: noteEdits[p.id] }
                    : {}),
                })
              }
              data-testid={`button-approve-${p.id}`}
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
          )}

          {p.status === "approved" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMutate(p.id, { action: "reset" })}
            >
              Unqueue
            </Button>
          )}

          {p.status !== "skipped" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMutate(p.id, { action: "skip" })}
              data-testid={`button-skip-${p.id}`}
            >
              <X className="h-4 w-4" /> Skip
            </Button>
          )}

          {(p.status === "sent" || p.status === "opened" || p.status === "replied" || p.status === "bounced") && (
            <>
              {p.status !== "replied" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTrack(p.id, "replied")}
                >
                  <Reply className="h-4 w-4" /> Replied
                </Button>
              )}
              {p.status !== "bounced" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTrack(p.id, "bounced")}
                >
                  <Mail className="h-4 w-4" /> Bounced
                </Button>
              )}
            </>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(p.id)}
            data-testid={`button-delete-${p.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OutreachPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("ready");
  const [draftConfig, setDraftConfig] = useState<OutreachConfig | null>(null);
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [emailEdits, setEmailEdits] = useState<Record<string, string>>({});
  const [cityQuery, setCityQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery<OutreachData>({
    queryKey: ["/api/admin/outreach"],
    queryFn: async () => {
      const res = await fetch("/api/admin/outreach");
      if (!res.ok) throw new Error("Failed to load outreach data");
      return res.json();
    },
  });

  const { data: previewData } = useQuery<PreviewData>({
    queryKey: ["/api/admin/outreach/preview", previewId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/outreach/preview?id=${encodeURIComponent(previewId!)}`);
      if (!res.ok) throw new Error("Failed to load preview");
      return res.json();
    },
    enabled: !!previewId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach"] });

  const config = draftConfig ?? data?.config ?? null;
  const templates = data?.templates ?? [];
  const defaultTemplateLabel =
    templates.find((t) => t.key === (config?.defaultTemplate ?? ""))?.label ?? "default";

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

  const prospectMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      patchJson(`/api/admin/outreach/${id}`, body),
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/outreach/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => invalidate(),
  });

  const trackMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "replied" | "bounced" }) =>
      patchJson("/api/admin/outreach/tracking", { id, status }),
    onSuccess: () => {
      toast({ title: "Status updated" });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const cities = useMemo(() => {
    const set = new Set<string>();
    (data?.prospects ?? []).forEach((p) => set.add(p.city));
    return Array.from(set).sort();
  }, [data?.prospects]);

  const activeTab = FILTER_TABS.find((t) => t.key === tab) ?? FILTER_TABS[0];
  const filtered = useMemo(() => {
    let rows = (data?.prospects ?? []).filter((p) => activeTab.statuses.includes(p.status));
    if (cityQuery.trim()) {
      const q = cityQuery.trim().toLowerCase();
      rows = rows.filter((p) => p.city.toLowerCase().includes(q));
    }
    return rows;
  }, [data?.prospects, activeTab, cityQuery]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (isLoading || !data || !config) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const counts = data.counts;
  const selectedInView = filtered.filter((p) => selected.has(p.id));
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((p) => next.delete(p.id));
      } else {
        filtered.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const bulkApprove = () => {
    const ids = selectedInView.filter((p) => (p.email || emailEdits[p.id]) && p.status !== "approved").map((p) => p.id);
    if (ids.length === 0) {
      toast({ title: "Nothing to approve", description: "Selected prospects need an email and must not already be queued." });
      return;
    }
    ids.forEach((id) => prospectMutation.mutate({ id, body: { action: "approve" } }));
    toast({ title: `Approving ${ids.length} prospect(s)` });
    setSelected(new Set());
  };

  const bulkSkip = () => {
    const ids = selectedInView.filter((p) => p.status !== "skipped").map((p) => p.id);
    if (ids.length === 0) return;
    ids.forEach((id) => prospectMutation.mutate({ id, body: { action: "skip" } }));
    toast({ title: `Skipping ${ids.length} prospect(s)` });
    setSelected(new Set());
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <AdminPageIntro>
        Discover local contractors, personalize outreach, and manage your sending queue.
      </AdminPageIntro>
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
          <AlertTriangle className="h-4 w-4" />
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
                When on, the system trickles approved emails out on its own, spaced over the day.
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
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="batchSize">Batch size (per manual run)</Label>
              <Input id="batchSize" type="number" className="w-32" value={config.batchSize} min={1} max={10}
                onChange={(e) => setDraftConfig({ ...config, batchSize: Number(e.target.value) })}
                data-testid="input-outreach-batch-size" />
              <p className="text-xs text-muted-foreground">Max 10. The cap and gap still apply.</p>
            </div>
          </div>

          <div className="space-y-1 max-w-sm">
            <Label className="text-xs">Default template (voice for new sends)</Label>
            <Select
              value={config.defaultTemplate}
              onValueChange={(v) => setDraftConfig({ ...config, defaultTemplate: v })}
            >
              <SelectTrigger data-testid="select-outreach-default-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templates.find((t) => t.key === config.defaultTemplate)?.description && (
              <p className="text-xs text-muted-foreground">
                {templates.find((t) => t.key === config.defaultTemplate)?.description}
              </p>
            )}
          </div>

          <Button onClick={() => configMutation.mutate(config)} disabled={configMutation.isPending} data-testid="button-save-outreach-config">
            {configMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => discoverMutation.mutate()}
            disabled={discoverMutation.isPending || !data.readiness.discoveryConfigured} data-testid="button-discover">
            {discoverMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Find contractors
          </Button>
          <Button variant="outline" onClick={() => scrapeMutation.mutate()}
            disabled={scrapeMutation.isPending} data-testid="button-scrape">
            {scrapeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Look up emails
          </Button>
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

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[12rem]">
          <Input
            placeholder="Search by city (e.g. Eagle, Boise)"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            data-testid="input-city-search"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {cities.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={cityQuery === c ? "default" : "outline"}
              onClick={() => setCityQuery(cityQuery === c ? "" : c)}
              data-testid={`button-city-${c}`}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="sticky top-14 z-20 -mx-1 px-1 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 space-y-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap h-auto">
            {FILTER_TABS.map((t) => {
              const n = t.statuses.reduce((s, st) => s + (counts[st] ?? 0), 0);
              return (
                <TabsTrigger key={t.key} value={t.key} data-testid={`tab-${t.key}`}>
                  {t.label} ({n})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all in view"
                data-testid="checkbox-select-all"
              />
              {selectedInView.length > 0 ? `${selectedInView.length} selected` : "Select all"}
            </label>
            {selectedInView.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" onClick={bulkApprove} data-testid="button-bulk-approve">
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={bulkSkip} data-testid="button-bulk-skip">
                  <X className="h-4 w-4" /> Skip
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No prospects in this view.</p>
        )}
        {filtered.map((p) => (
          <ProspectCard
            key={p.id}
            p={p}
            selected={selected.has(p.id)}
            onToggleSelect={toggleSelect}
            noteEdits={noteEdits}
            setNoteEdits={setNoteEdits}
            emailEdits={emailEdits}
            setEmailEdits={setEmailEdits}
            templates={templates}
            defaultTemplateLabel={defaultTemplateLabel}
            onMutate={(id, body) => prospectMutation.mutate({ id, body })}
            onDelete={(id) => deleteMutation.mutate(id)}
            onPreview={(id) => setPreviewId(id)}
            onTrack={(id, status) => trackMutation.mutate({ id, status })}
          />
        ))}
      </div>

      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email preview</DialogTitle>
          </DialogHeader>
          {previewId && !previewData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading preview...
            </div>
          )}
          {previewData && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Subject</p>
                <p className="text-sm text-muted-foreground">{previewData.subject}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Text body</p>
                <pre className="text-xs bg-muted p-3 rounded-md whitespace-pre-wrap">{previewData.text}</pre>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">HTML body</p>
                <div className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                  <code className="whitespace-pre-wrap">{previewData.html}</code>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                From: {previewData.from ?? "(sending address not set)"} · To:{" "}
                {previewData.to ?? "(no email)"} · Status: {previewData.status}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
