"use client";

import { useEffect, useState } from "react";
import { LeadsTab } from "./LeadsTab";
import { LeadDetailModal } from "./LeadDetailModal";
import { DueTodayTasks } from "./DueTodayTasks";

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

      <LeadsTab onSelectLead={setSelectedLeadId} />

      <LeadDetailModal
        leadId={selectedLeadId}
        open={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
