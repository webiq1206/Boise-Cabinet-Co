"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Users, Info } from "lucide-react";
import { TREASURE_VALLEY_CITIES } from "@/lib/crm/leads";

interface TemplateLite { id: string; name: string; audience: string }
interface SequenceLite { id: string; name: string; audience: string; steps: unknown[] }

const ALL = "all";

type Filter = {
  leadType?: string;
  emailStatus?: string;
  pipelineStage?: string;
  source?: string;
  serviceArea?: string;
};

export function ComposeTab() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"run" | "enroll">("run");
  const [filters, setFilters] = useState<Record<string, string>>({
    leadType: ALL,
    emailStatus: ALL,
    pipelineStage: ALL,
    serviceArea: ALL,
  });
  const [templateId, setTemplateId] = useState("");
  const [sequenceId, setSequenceId] = useState("");
  const [subjectOverride, setSubjectOverride] = useState("");
  const [batchSize, setBatchSize] = useState(10);
  const [dailyCap, setDailyCap] = useState(50);
  const [delaySeconds, setDelaySeconds] = useState(60);
  const [count, setCount] = useState<{ total: number; emailable: number; phoneOnly: number } | null>(null);
  const [result, setResult] = useState<string>("");

  const { data: templates = [] } = useQuery<TemplateLite[]>({
    queryKey: ["/api/admin/templates"],
    queryFn: async () => (await fetch("/api/admin/templates")).json(),
  });
  const { data: sequences = [] } = useQuery<SequenceLite[]>({
    queryKey: ["/api/admin/sequences"],
    queryFn: async () => (await fetch("/api/admin/sequences")).json(),
  });

  const cleanFilter = useMemo(() => {
    const f: Filter = {};
    for (const [k, v] of Object.entries(filters)) if (v !== ALL) (f as Record<string, string>)[k] = v;
    return f;
  }, [filters]);

  // Debounced pre-send count.
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/outreach/count", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filter: cleanFilter }),
        });
        if (res.ok) setCount(await res.json());
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [cleanFilter]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (mode === "run") {
        const res = await fetch("/api/admin/outreach/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, subjectOverride, filter: cleanFilter, batchSize, dailyCap, delaySeconds }),
        });
        if (!res.ok) throw new Error("Run failed");
        return { kind: "run", data: await res.json() };
      }
      const res = await fetch("/api/admin/outreach/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequenceId, filter: cleanFilter }),
      });
      if (!res.ok) throw new Error("Enroll failed");
      return { kind: "enroll", data: await res.json() };
    },
    onSuccess: (out) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach/run"] });
      if (out.kind === "run") {
        setResult(`Run created. The engine will send up to ${dailyCap}/day, pacing between sends.`);
      } else {
        setResult(`Enrolled ${out.data.enrolled} leads (${out.data.skipped} skipped, already enrolled or not emailable).`);
      }
    },
    onError: () => setResult("Something went wrong. Please try again."),
  });

  const canSubmit = mode === "run" ? !!templateId : !!sequenceId;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as "run" | "enroll")} className="justify-start">
            <ToggleGroupItem value="run"><Send className="h-4 w-4 mr-1" /> Send one email</ToggleGroupItem>
            <ToggleGroupItem value="enroll"><Users className="h-4 w-4 mr-1" /> Enroll in sequence</ToggleGroupItem>
          </ToggleGroup>

          <div className="space-y-2">
            <Label className="text-xs">Audience filters</Label>
            <div className="grid grid-cols-2 gap-2">
              <FilterSelect label="Type" value={filters.leadType} onChange={(v) => setFilters((f) => ({ ...f, leadType: v }))} options={[["homeowner", "Homeowner"], ["business", "Business"]]} />
              <FilterSelect label="Email status" value={filters.emailStatus} onChange={(v) => setFilters((f) => ({ ...f, emailStatus: v }))} options={[["new", "New"], ["contacted", "Contacted"]]} />
              <FilterSelect label="Pipeline" value={filters.pipelineStage} onChange={(v) => setFilters((f) => ({ ...f, pipelineStage: v }))} options={[["new", "New"], ["consultation_booked", "Consultation booked"], ["quoted", "Quoted"], ["on_hold", "On hold"]]} />
              <FilterSelect label="Service area" value={filters.serviceArea} onChange={(v) => setFilters((f) => ({ ...f, serviceArea: v }))} options={TREASURE_VALLEY_CITIES.map((c) => [c, c] as [string, string])} />
            </div>
          </div>

          {mode === "run" ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger><SelectValue placeholder="Choose template" /></SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Subject override (optional)</Label>
                <Input value={subjectOverride} onChange={(e) => setSubjectOverride(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Batch size</Label>
                  <Input type="number" min={1} value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Daily cap</Label>
                  <Input type="number" min={1} value={dailyCap} onChange={(e) => setDailyCap(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Delay (sec)</Label>
                  <Input type="number" min={0} value={delaySeconds} onChange={(e) => setDelaySeconds(Number(e.target.value))} />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">Sequence</Label>
              <Select value={sequenceId} onValueChange={setSequenceId}>
                <SelectTrigger><SelectValue placeholder="Choose sequence" /></SelectTrigger>
                <SelectContent>
                  {sequences.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={() => submitMutation.mutate()} disabled={!canSubmit || submitMutation.isPending}>
            {mode === "run" ? "Start run" : "Enroll audience"}
          </Button>
          {result && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <Label className="text-xs">Pre-send count</Label>
          {count ? (
            <div className="space-y-1 text-sm">
              <p><strong>{count.total}</strong> leads match this audience.</p>
              <p className="text-green-600"><strong>{count.emailable}</strong> emailable will send.</p>
              <p className="text-muted-foreground"><strong>{count.phoneOnly}</strong> phone-only / no email will be skipped.</p>
              <p className="text-xs text-muted-foreground pt-2">Suppressed and unsubscribed leads are also excluded automatically at send time.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Adjust filters to preview the audience.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: All</SelectItem>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
