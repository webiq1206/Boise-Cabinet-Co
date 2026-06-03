"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminSubcontractorPanel } from "@/components/admin/AdminSubcontractorPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function AdminContractsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templateBody, setTemplateBody] = useState("");
  const [templateName, setTemplateName] = useState("");

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/admin/contracts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/contracts");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: true,
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_template",
          id: templates[0]?.id,
          name: templateName || templates[0]?.name || "Standard Subcontractor Agreement",
          bodyHtml: templateBody || templates[0]?.bodyHtml,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contracts"] });
      setEditingTemplate(false);
      toast({ title: "Template saved" });
    },
  });

  useEffect(() => {
    if (templates[0]) {
      setTemplateBody(templates[0].bodyHtml);
      setTemplateName(templates[0].name);
    }
  }, [templates]);

  return (
    <AdminAuthGate title="Contracts">
      <PortalShell variant="admin" title="Contracts">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contract Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use merge fields: {"{{project.title}}"}, {"{{project.address}}"}, {"{{contractor.name}}"},
              {" {{scopeOfWork}}"}, {"{{contractAmount}}"}, {"{{paymentTerms}}"}, {"{{startDate}}"},
              {" {{completionDate}}"}, {"{{changeOrdersSummary}}"}
            </p>
            {editingTemplate ? (
              <>
                <Textarea
                  rows={12}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button onClick={() => saveTemplateMutation.mutate()}>Save Template</Button>
                  <Button variant="outline" onClick={() => setEditingTemplate(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditingTemplate(true)}>
                Edit Template
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contract Workflow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Assign a subcontractor to a project</p>
            <p>2. From the project detail page, click &quot;Send Contract&quot;</p>
            <p>3. Subcontractor reviews and signs in their Contracts portal</p>
            <p>4. Signed PDF is stored and available to both parties</p>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
    </AdminAuthGate>
  );
}
