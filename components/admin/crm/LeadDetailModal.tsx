"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";

interface LeadDetail {
  lead: Record<string, any>;
  submissions: Array<{ id: string; formType: string; rawPayload: Record<string, unknown>; sourcePage: string | null; submittedAt: string }>;
  quotes: Array<{ id: string; projectType: string | null; sizeOrScope: string | null; finish: string | null; planningRangeLow: string | null; planningRangeHigh: string | null; createdAt: string }>;
  tasks: Array<{ id: string; title: string; dueAt: string | null; completedAt: string | null }>;
  timeline: Array<{ type: string; at: string | null; label: string; detail?: string }>;
}

const PIPELINE_OPTIONS: [string, string][] = [
  ["new", "New"],
  ["consultation_booked", "Consultation booked"],
  ["quoted", "Quoted"],
  ["won", "Won"],
  ["lost", "Lost"],
  ["on_hold", "On hold"],
];

const EMAIL_STATUS_OPTIONS: [string, string][] = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["failed", "Failed"],
  ["unsubscribed", "Unsubscribed"],
];

function fmt(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function LeadDetailModal({
  leadId,
  open,
  onClose,
}: {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<LeadDetail>({
    queryKey: ["/api/admin/crm/leads", leadId, "detail"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/crm/leads/${leadId}`);
      if (!res.ok) throw new Error("Failed to load lead");
      return res.json();
    },
    enabled: open && !!leadId,
  });

  const lead = data?.lead;

  const [name, setName] = useState("");
  const [pipelineStage, setPipelineStage] = useState("new");
  const [emailStatus, setEmailStatus] = useState("new");
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (lead) {
      setName(lead.companyName || lead.name || "");
      setPipelineStage(lead.pipelineStage || "new");
      setEmailStatus(lead.emailStatus || "new");
    }
  }, [lead]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/leads", leadId, "detail"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/leads"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/admin/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: invalidate,
  });

  const taskMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const method = body._method || "POST";
      delete body._method;
      const res = await fetch(`/api/admin/leads/${leadId}/tasks`, {
        method: method as string,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Task update failed");
      return res.json();
    },
    onSuccess: invalidate,
  });

  const phone = lead?.phone as string | undefined;
  const email = lead?.email as string | undefined;
  const website = lead?.website as string | undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isLoading ? "Loading lead..." : lead?.companyName || lead?.name || "Lead"}</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary + click-to-call/text */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{lead?.leadType}</Badge>
              <Badge variant="secondary">{lead?.pipelineStage}</Badge>
              {!email && phone && <Badge variant="outline"><Phone className="h-3 w-3 mr-1" /> Phone only</Badge>}
            </div>

            <div className="flex flex-wrap gap-2">
              {phone && (
                <>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${phone}`}><Phone className="h-4 w-4 mr-1" /> Call {phone}</a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`sms:${phone}`}><MessageSquare className="h-4 w-4 mr-1" /> Text</a>
                  </Button>
                </>
              )}
              {email && (
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${email}`}><Mail className="h-4 w-4 mr-1" /> {email}</a>
                </Button>
              )}
              {website && (
                <Button size="sm" variant="outline" asChild>
                  <a href={website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4 mr-1" /> Website</a>
                </Button>
              )}
            </div>

            {/* Editable fields */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name / Company</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name !== (lead?.companyName || lead?.name) && updateMutation.mutate(lead?.leadType === "business" ? { companyName: name } : { name })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pipeline stage</Label>
                <Select value={pipelineStage} onValueChange={(v) => { setPipelineStage(v); updateMutation.mutate({ pipelineStage: v }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PIPELINE_OPTIONS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email status</Label>
                <Select value={emailStatus} onValueChange={(v) => { setEmailStatus(v); updateMutation.mutate({ emailStatus: v }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMAIL_STATUS_OPTIONS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Service area</Label>
                <Input value={lead?.serviceArea || lead?.city || ""} disabled />
              </div>
            </div>

            {/* Planning range */}
            {data.quotes.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Planning range</h3>
                {data.quotes.map((q) => (
                  <div key={q.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{q.projectType || "Project"}</span>
                      {q.planningRangeLow && q.planningRangeHigh && (
                        <span className="font-semibold">${Number(q.planningRangeLow).toLocaleString()} to ${Number(q.planningRangeHigh).toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">{[q.sizeOrScope, q.finish].filter(Boolean).join(" | ")}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Exact submission */}
            {data.submissions.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Submission</h3>
                {data.submissions.slice(0, 1).map((s) => (
                  <div key={s.id} className="rounded-md border p-3 text-sm space-y-2">
                    <p className="text-xs text-muted-foreground">{s.formType} | {fmt(s.submittedAt)}{s.sourcePage ? ` | ${s.sourcePage}` : ""}</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(s.rawPayload)
                        .filter(([, v]) => v !== null && v !== "" && typeof v !== "object")
                        .map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <dt className="text-muted-foreground capitalize">{k}:</dt>
                            <dd className="break-all">{String(v)}</dd>
                          </div>
                        ))}
                    </dl>
                    <button type="button" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowRaw((s) => !s)}>
                      {showRaw ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />} Raw payload
                    </button>
                    {showRaw && (
                      <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">{JSON.stringify(s.rawPayload, null, 2)}</pre>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Tasks */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Tasks</h3>
              <div className="space-y-1">
                {data.tasks.length === 0 && <p className="text-xs text-muted-foreground">No tasks yet.</p>}
                {data.tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={!!t.completedAt}
                      onCheckedChange={(checked) => taskMutation.mutate({ _method: "PATCH", taskId: t.id, completed: !!checked })}
                    />
                    <span className={t.completedAt ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                    {t.dueAt && <span className="text-xs text-muted-foreground ml-auto inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {fmt(t.dueAt)}</span>}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[160px]">
                  <Input placeholder="New task" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                </div>
                <Input type="datetime-local" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="w-auto" />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!taskTitle.trim()}
                  onClick={() => {
                    taskMutation.mutate({ title: taskTitle, dueAt: taskDue || null });
                    setTaskTitle("");
                    setTaskDue("");
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </section>

            {/* Note */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Add note</h3>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note" />
              <div className="flex justify-end">
                <Button size="sm" variant="outline" disabled={!note.trim()} onClick={() => { updateMutation.mutate({ note }); setNote(""); }}>
                  Save note
                </Button>
              </div>
            </section>

            {/* Timeline */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Timeline</h3>
              <ol className="space-y-2 border-l pl-4">
                {data.timeline.map((e, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute -left-[1.4rem] top-1 h-2 w-2 rounded-full bg-primary" />
                    <div className="flex items-center justify-between gap-2">
                      <span>{e.label}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{fmt(e.at)}</span>
                    </div>
                    {e.detail && <p className="text-xs text-muted-foreground">{e.detail}</p>}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
