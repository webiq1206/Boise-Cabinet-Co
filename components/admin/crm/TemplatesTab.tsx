"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EMAIL_PREVIEW_SANDBOX, toEmailPreviewSrcDoc } from "@/lib/outreach/emailPreview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  audience: string;
  subject: string;
  openingLine: string | null;
  mainMessage: string | null;
  closingLine: string | null;
  body: string | null;
  signerName: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
  seedManaged: boolean;
}

const SPAM_WORDS = [
  "free",
  "act now",
  "limited time",
  "guarantee",
  "no obligation",
  "risk free",
  "winner",
  "cash",
  "cheap",
  "click here",
  "buy now",
  "100%",
  "urgent",
  "discount",
];

function spamCheck(subject: string, body: string): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  const text = `${subject} ${body}`.toLowerCase();
  let score = 0;

  const hits = SPAM_WORDS.filter((w) => text.includes(w));
  if (hits.length > 0) {
    score += hits.length;
    warnings.push(`Spam trigger words: ${hits.slice(0, 5).join(", ")}`);
  }
  const exclamations = (subject.match(/!/g) || []).length;
  if (exclamations > 0) {
    score += exclamations;
    warnings.push("Avoid exclamation marks in the subject line.");
  }
  const capsWords = (subject.match(/\b[A-Z]{3,}\b/g) || []).length;
  if (capsWords > 0) {
    score += capsWords;
    warnings.push("Avoid ALL CAPS words in the subject.");
  }
  if (subject.length > 60) warnings.push("Subject is long; aim for under 60 characters.");
  if (body.trim().length < 60) warnings.push("Body is very short; add more substance.");
  const links = (body.match(/https?:\/\//g) || []).length;
  if (links > 4) {
    score += 2;
    warnings.push("Too many links can hurt deliverability.");
  }

  return { score, warnings };
}

const EMPTY: Partial<Template> = {
  name: "",
  audience: "homeowner",
  subject: "",
  openingLine: "",
  mainMessage: "",
  closingLine: "",
  signerName: "",
  ctaLabel: "",
  ctaUrl: "",
};

export function TemplatesTab() {
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/admin/templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/templates");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Template>>(EMPTY);
  const [plainMode, setPlainMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const selected = templates.find((t) => t.id === selectedId);

  useEffect(() => {
    if (selected) {
      setDraft(selected);
      setPlainMode(!!selected.body);
    }
  }, [selected]);

  // Debounced live preview.
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/templates/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        if (res.ok) {
          const data = await res.json();
          setPreviewHtml(data.html);
        }
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [draft]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isNew = !selectedId;
      const url = isNew ? "/api/admin/templates" : `/api/admin/templates/${selectedId}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: (saved: Template) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      setSelectedId(saved.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      setSelectedId(null);
      setDraft(EMPTY);
    },
  });

  const bodyForCheck = plainMode
    ? draft.body || ""
    : [draft.openingLine, draft.mainMessage, draft.closingLine].filter(Boolean).join(" ");
  const spam = useMemo(() => spamCheck(draft.subject || "", bodyForCheck), [draft.subject, bodyForCheck]);

  const update = (field: keyof Template, value: string) => setDraft((d) => ({ ...d, [field]: value }));

  return (
    <div className="grid lg:grid-cols-[300px_1fr_1fr] gap-4">
      {/* Template list */}
      <Card>
        <CardContent className="p-3 space-y-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => { setSelectedId(null); setDraft(EMPTY); setPlainMode(false); }}
          >
            <Plus className="h-4 w-4 mr-1" /> New template
          </Button>
          {isLoading ? (
            <div className="space-y-1 pt-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          ) : (
            templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${selectedId === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium leading-snug break-words">{t.name}</span>
                  {t.seedManaged && <Badge variant="outline" className="text-[12px]">seed</Badge>}
                </div>
                <span className="text-xs opacity-70">{t.audience}</span>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Template name</Label>
            <Input value={draft.name || ""} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Audience</Label>
              <Select value={draft.audience || "homeowner"} onValueChange={(v) => update("audience", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner">Homeowner</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Signer name</Label>
              <Input value={draft.signerName || ""} onChange={(e) => update("signerName", e.target.value)} placeholder="The Boise Cabinet Co team" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subject</Label>
            <Input value={draft.subject || ""} onChange={(e) => update("subject", e.target.value)} />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Switch checked={plainMode} onCheckedChange={setPlainMode} id="plain-mode" />
            <Label htmlFor="plain-mode" className="text-xs">Plain body mode</Label>
          </div>

          {plainMode ? (
            <div className="space-y-1">
              <Label className="text-xs">Body</Label>
              <Textarea rows={10} value={draft.body || ""} onChange={(e) => update("body", e.target.value)} />
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Opening line</Label>
                <Textarea rows={2} value={draft.openingLine || ""} onChange={(e) => update("openingLine", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Main message</Label>
                <Textarea rows={5} value={draft.mainMessage || ""} onChange={(e) => update("mainMessage", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Closing line</Label>
                <Textarea rows={2} value={draft.closingLine || ""} onChange={(e) => update("closingLine", e.target.value)} />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">CTA label</Label>
              <Input value={draft.ctaLabel || ""} onChange={(e) => update("ctaLabel", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CTA URL</Label>
              <Input value={draft.ctaUrl || ""} onChange={(e) => update("ctaUrl", e.target.value)} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Tokens: {"{firstName} {business} {city} {projectType} {serviceArea} {planningRange} {phone}"}. Missing values drop gracefully.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !draft.name || !draft.subject}>
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

      {/* Preview + spam checker */}
      <div className="space-y-3">
        {spam.warnings.length === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Looks clean. No deliverability flags.</AlertDescription>
          </Alert>
        ) : (
          <Alert variant={spam.score >= 4 ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-0.5">
                {spam.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <Card>
          <CardContent className="p-0">
            <iframe title="Email preview" srcDoc={toEmailPreviewSrcDoc(previewHtml)} className="w-full h-[600px] rounded-md border-0" sandbox={EMAIL_PREVIEW_SANDBOX} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
