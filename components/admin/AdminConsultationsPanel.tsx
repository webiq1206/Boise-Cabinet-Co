"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, CalendarClock, DollarSign } from "lucide-react";

interface ConsultationRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  zip: string;
  address: string | null;
  city: string | null;
  projectType: string;
  message: string | null;
  estimateProject: string | null;
  estimateFinish: string | null;
  estimateLow: string | null;
  estimateHigh: string | null;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

function statusBadgeVariant(status: string) {
  switch (status) {
    case "new":
      return "default" as const;
    case "contacted":
      return "secondary" as const;
    case "converted":
      return "outline" as const;
    default:
      return "destructive" as const;
  }
}

function formatEstimate(low: string | null, high: string | null) {
  const l = low ? parseFloat(low) : NaN;
  const h = high ? parseFloat(high) : NaN;
  if (isNaN(l) || isNaN(h)) return null;
  return `$${Math.round(l).toLocaleString()} - $${Math.round(h).toLocaleString()}`;
}

export function AdminConsultationsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<ConsultationRequest[]>({
    queryKey: ["/api/admin/consultations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/consultations");
      if (!res.ok) throw new Error("Failed to fetch consultation requests");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/admin/consultations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations"] });
      toast({ title: "Status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading consultation requests…
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No consultation requests yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const estimateRange = formatEstimate(req.estimateLow, req.estimateHigh);
        return (
          <Card key={req.id} data-testid={`card-consultation-${req.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <CardTitle className="text-base">{req.name}</CardTitle>
                  <Badge variant={statusBadgeVariant(req.status)} className="text-[10px] px-1.5 py-0">
                    {STATUS_OPTIONS.find((o) => o.value === req.status)?.label ?? req.status}
                  </Badge>
                </div>
                <Select
                  value={req.status}
                  onValueChange={(status) => updateStatusMutation.mutate({ id: req.id, status })}
                >
                  <SelectTrigger className="w-36 h-8 text-xs" aria-label="Update status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CardDescription className="text-xs mt-0.5 capitalize">
                {req.projectType.replace(/-/g, " ")} consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${req.email}`} className="text-primary hover:underline truncate">
                    {req.email}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${req.phone}`} className="text-primary hover:underline">
                    {req.phone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    {req.address || [req.city, req.zip].filter(Boolean).join(", ") || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarClock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span>{new Date(req.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {estimateRange && (
                <div className="flex items-center gap-1.5 text-xs border-t pt-2">
                  <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{estimateRange}</span>
                  <span className="text-muted-foreground">
                    {[req.estimateProject, req.estimateFinish].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}

              {req.message && (
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Message:</p>
                  <p className="text-xs whitespace-pre-wrap">{req.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
