"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarClock } from "lucide-react";

interface DueTask {
  id: string;
  leadId: string;
  title: string;
  dueAt: string | null;
  leadName: string | null;
  companyName: string | null;
}

export function DueTodayTasks({ onOpenLead }: { onOpenLead?: (leadId: string) => void }) {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery<DueTask[]>({
    queryKey: ["/api/admin/tasks"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      return res.json();
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (task: DueTask) => {
      const res = await fetch(`/api/admin/leads/${task.leadId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, completed: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] }),
  });

  if (data.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium inline-flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-amber-400" /> Due today and overdue ({data.length})
        </p>
        <div className="space-y-1">
          {data.map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={false} onCheckedChange={() => completeMutation.mutate(task)} />
              <span>{task.title}</span>
              <button
                type="button"
                className="text-xs text-muted-foreground underline ml-auto"
                onClick={() => onOpenLead?.(task.leadId)}
              >
                {task.companyName || task.leadName || "View lead"}
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
