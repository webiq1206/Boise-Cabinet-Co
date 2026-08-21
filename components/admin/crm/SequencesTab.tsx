"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EMAIL_PREVIEW_SANDBOX, toEmailPreviewSrcDoc } from "@/lib/outreach/emailPreview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface TemplateLite {
  id: string;
  name: string;
  audience: string;
  subject?: string | null;
  openingLine?: string | null;
  mainMessage?: string | null;
  closingLine?: string | null;
  body?: string | null;
}

interface Step {
  id?: string;
  templateId: string;
  delayHours: number;
  templateName?: string | null;
}

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  audience: string;
  seedKey: string | null;
  steps: Step[];
}

const EMPTY: { name: string; audience: string; description: string; steps: Step[] } = {
  name: "",
  audience: "homeowner",
  description: "",
  steps: [],
};

function StepPreview({ tpl }: { tpl: TemplateLite }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setHtml("");
    fetch("/api/admin/templates/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tpl),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active) { setHtml(d?.html || ""); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tpl.id]);
  if (loading) return <div className="w-full h-20 rounded-md border bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">Loading email preview...</div>;
  if (!html) return <div className="w-full rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">Preview unavailable.</div>;
  return <iframe title="Email preview" srcDoc={toEmailPreviewSrcDoc(html)} className="w-full h-[440px] rounded-md border bg-white" sandbox={EMAIL_PREVIEW_SANDBOX} />;
}

export function SequencesTab() {
  const queryClient = useQueryClient();
  const { data: sequences = [], isLoading } = useQuery<Sequence[]>({
    queryKey: ["/api/admin/sequences"],
    queryFn: async () => {
      const res = await fetch("/api/admin/sequences");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
  const { data: templates = [] } = useQuery<TemplateLite[]>({
    queryKey: ["/api/admin/templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/templates");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY);

  const selected = sequences.find((s) => s.id === selectedId);
  useEffect(() => {
    if (selected) {
      setDraft({
        name: selected.name,
        audience: selected.audience,
        description: selected.description || "",
        steps: selected.steps.map((s) => ({ templateId: s.templateId, delayHours: s.delayHours })),
      });
    }
  }, [selected]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isNew = !selectedId;
      const res = await fetch(isNew ? "/api/admin/sequences" : `/api/admin/sequences/${selectedId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: (saved: Sequence) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sequences"] });
      if (saved?.id) setSelectedId(saved.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sequences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sequences"] });
      setSelectedId(null);
      setDraft(EMPTY);
    },
  });

  const addStep = () =>
    setDraft((d) => ({ ...d, steps: [...d.steps, { templateId: templates[0]?.id || "", delayHours: d.steps.length === 0 ? 0 : 48 }] }));
  const removeStep = (i: number) => setDraft((d) => ({ ...d, steps: d.steps.filter((_, idx) => idx !== i) }));
  const moveStep = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const steps = [...d.steps];
      const j = i + dir;
      if (j < 0 || j >= steps.length) return d;
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...d, steps };
    });
  const updateStep = (i: number, patch: Partial<Step>) =>
    setDraft((d) => ({ ...d, steps: d.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4">
      <Card>
        <CardContent className="p-3 space-y-1">
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { setSelectedId(null); setDraft(EMPTY); }}>
            <Plus className="h-4 w-4 mr-1" /> New sequence
          </Button>
          {isLoading ? (
            <div className="space-y-1 pt-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
          ) : (
            sequences.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${selectedId === s.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium leading-snug break-words">{s.name}</span>
                  {s.seedKey && <Badge variant="outline" className="text-[12px] shrink-0">seed</Badge>}
                </div>
                <span className="text-xs opacity-70">{s.steps.length} steps · {s.audience}</span>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Sequence name</Label>
              <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Audience</Label>
              <Select value={draft.audience} onValueChange={(v) => setDraft((d) => ({ ...d, audience: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner">Homeowner</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Steps (first step with 0 hour delay sends immediately on enroll)</Label>
            {draft.steps.length === 0 && <p className="text-xs text-muted-foreground">No steps yet.</p>}
            {draft.steps.map((step, i) => (
              <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-2">
                <span className="text-xs text-muted-foreground w-10">#{i + 1}</span>
                <div className="flex-1 min-w-[160px] space-y-1">
                  <Label className="text-xs">Template</Label>
                  <Select value={step.templateId} onValueChange={(v) => updateStep(i, { templateId: v })}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Choose template" /></SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Delay (hrs)</Label>
                  <Input type="number" min={0} value={step.delayHours} onChange={(e) => updateStep(i, { delayHours: Number(e.target.value) })} className="h-8" />
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveStep(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveStep(i, 1)} disabled={i === draft.steps.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeStep(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                  {(() => { const tpl = templates.find((t) => t.id === step.templateId); return tpl ? (<div className="w-full mt-1"><StepPreview tpl={tpl} /></div>) : <p className="w-full mt-1 text-xs text-muted-foreground">Pick a template to preview the email here.</p>; })()}
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addStep} disabled={templates.length === 0}>
              <Plus className="h-4 w-4 mr-1" /> Add step
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !draft.name}>
              {selectedId ? "Save" : "Create"}
            </Button>
            {selectedId && (
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(selectedId)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
