"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsTab } from "./LeadsTab";
import { LeadDetailModal } from "./LeadDetailModal";
import { DueTodayTasks } from "./DueTodayTasks";
import { TemplatesTab } from "./TemplatesTab";
import { SequencesTab } from "./SequencesTab";
import { ComposeTab } from "./ComposeTab";
import { HistoryTab } from "./HistoryTab";

export function CrmDashboard() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Deep link support: /admin/leads?leadId=... opens the lead modal.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get("leadId");
    if (leadId) setSelectedLeadId(leadId);
  }, []);

  return (
    <div className="space-y-4">
      <DueTodayTasks onOpenLead={setSelectedLeadId} />

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <LeadsTab onSelectLead={setSelectedLeadId} />
        </TabsContent>
        <TabsContent value="compose">
          <ComposeTab />
        </TabsContent>
        <TabsContent value="sequences">
          <SequencesTab />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>

      <LeadDetailModal
        leadId={selectedLeadId}
        open={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
