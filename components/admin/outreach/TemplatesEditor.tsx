"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, RotateCcw, Save } from "lucide-react";

type TemplateKey = "personal" | "branded";

interface PersonalContent {
  subject: string;
  opener: string;
  pitch: string;
  closing: string;
}
interface BrandedContent {
  subject: string;
  intro: string;
  bullets: string[];
  closing: string;
}
interface TemplateContent {
  personal: PersonalContent;
  branded: BrandedContent;
}

interface FieldMeta {
  key: string;
  label: string;
  help: string;
  list?: boolean;
}

interface TemplatesData {
  content: TemplateContent;
  defaults: TemplateContent;
  fields: Record<TemplateKey, FieldMeta[]>;
  tokens: { token: string; description: string }[];
}

interface PreviewResult {
  subject: string;
  text: string;
  html: string;
  businessName: string;
  city: string;
}

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  personal: "Personal note",
  branded: "Branded intro",
};

export function TemplatesEditor() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<TemplateContent | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("personal");
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const { data, isLoading } = useQuery<TemplatesData>({
    queryKey: ["/api/admin/outreach/templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/outreach/templates");
      if (!res.ok) throw new Error("Failed to load templates");
      return res.json();
    },
  });

  useEffect(() => {
    if (data && !draft) setDraft(data.content);
  }, [data, draft]);

  const saveMutation = useMutation({
    mutationFn: async (content: TemplateContent) => {
      const res = await fetch("/api/admin/outreach/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed");
      return json as { content: TemplateContent };
    },
    onSuccess: (r) => {
      setDraft(r.content);
      toast({ title: "Templates saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/outreach/templates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey: activeTemplate, content: draft }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Preview failed");
      return json as PreviewResult;
    },
    onSuccess: (r) => setPreview(r),
    onError: (e: Error) =>
      toast({ title: "Preview failed", description: e.message, variant: "destructive" }),
  });

  if (isLoading || !data || !draft) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading templates...
      </div>
    );
  }

  function setField(template: TemplateKey, key: string, value: string | string[]) {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, [template]: { ...prev[template], [key]: value } };
    });
  }

  function resetTemplateToDefault(template: TemplateKey) {
    setDraft((prev) => {
      if (!prev || !data) return prev;
      return { ...prev, [template]: data.defaults[template] };
    });
    toast({ title: `${TEMPLATE_LABELS[template]} reset to the default wording` });
  }

  const fields = data.fields[activeTemplate];
  const current = draft[activeTemplate] as unknown as Record<string, string | string[]>;

  return (
    <div className="space-y-5">
      <Alert>
        <AlertDescription className="text-sm">
          These are the two cold-outreach emails. Edit the wording in plain
          English. You can drop in these tags and they get filled in for each
          contractor:
          <span className="mt-2 flex flex-wrap gap-1">
            {data.tokens.map((t) => (
              <Badge key={t.token} variant="secondary" title={t.description}>
                {t.token}
              </Badge>
            ))}
          </span>
          <span className="mt-2 block text-xs text-muted-foreground">
            Your name, title, phone, the unsubscribe link, and the legally
            required address are added automatically. Em-dashes are not allowed.
          </span>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTemplate} onValueChange={(v) => { setActiveTemplate(v as TemplateKey); setPreview(null); }}>
        <TabsList>
          <TabsTrigger value="personal" data-testid="tab-template-personal">
            Personal note
          </TabsTrigger>
          <TabsTrigger value="branded" data-testid="tab-template-branded">
            Branded intro
          </TabsTrigger>
        </TabsList>

        {(["personal", "branded"] as TemplateKey[]).map((tpl) => (
          <TabsContent key={tpl} value={tpl} className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{TEMPLATE_LABELS[tpl]} wording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.fields[tpl].map((f) => {
                  const value = (draft[tpl] as unknown as Record<string, string | string[]>)[f.key];
                  return (
                    <div key={f.key} className="space-y-1">
                      <Label className="text-xs">{f.label}</Label>
                      {f.list ? (
                        <Textarea
                          rows={5}
                          value={Array.isArray(value) ? value.join("\n") : String(value ?? "")}
                          onChange={(e) => setField(tpl, f.key, e.target.value.split("\n"))}
                          data-testid={`input-${tpl}-${f.key}`}
                        />
                      ) : f.key === "subject" ? (
                        <Input
                          value={String(value ?? "")}
                          onChange={(e) => setField(tpl, f.key, e.target.value)}
                          data-testid={`input-${tpl}-${f.key}`}
                        />
                      ) : (
                        <Textarea
                          rows={f.key === "pitch" ? 6 : 3}
                          value={String(value ?? "")}
                          onChange={(e) => setField(tpl, f.key, e.target.value)}
                          data-testid={`input-${tpl}-${f.key}`}
                        />
                      )}
                      <p className="text-xs text-muted-foreground">{f.help}</p>
                    </div>
                  );
                })}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    onClick={() => draft && saveMutation.mutate(draft)}
                    disabled={saveMutation.isPending}
                    data-testid="button-save-templates"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => previewMutation.mutate()}
                    disabled={previewMutation.isPending}
                    data-testid="button-preview-template"
                  >
                    {previewMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => resetTemplateToDefault(tpl)}
                    data-testid="button-reset-template"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset to default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {preview && (
        <Card data-testid="card-template-preview">
          <CardHeader>
            <CardTitle className="text-base">
              Preview for {preview.businessName} ({preview.city})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Subject</p>
              <p className="text-sm font-medium">{preview.subject}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">How it looks</p>
              <div
                className="rounded-md border bg-white p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
