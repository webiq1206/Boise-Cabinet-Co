"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, MailX, Phone, Search, Upload, Building2, User, MapPin } from "lucide-react";
import { ImportDialog } from "./ImportDialog";
import { AddBusinessLeadsDialog } from "./AddBusinessLeadsDialog";
import { TREASURE_VALLEY_CITIES } from "@/lib/crm/leads";

interface LeadRow {
  id: string;
  leadType: string;
  emailable: boolean;
  name: string | null;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  serviceArea: string | null;
  source: string | null;
  emailStatus: string;
  pipelineStage: string;
  leadGroup: string | null;
  createdAt: string;
}

interface LeadsResponse {
  leads: LeadRow[];
  total: number;
  page: number;
  pageSize: number;
  stats: { emailable: number; newQuoteRequestsToday: number; openDeals: number };
}

const ALL = "all";

const PIPELINE_LABELS: Record<string, string> = {
  new: "New",
  consultation_booked: "Consultation booked",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  on_hold: "On hold",
};

const EMAIL_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  failed: "Failed",
  bounced: "Bounced",
  unsubscribed: "Unsubscribed",
};

const SOURCE_OPTIONS = [
  "consultation",
  "estimate_form",
  "contact_form",
  "estimator",
  "lead_magnet",
  "meta_ad",
  "manual",
  "csv",
];

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function LeadsTab({ onSelectLead }: { onSelectLead: (leadId: string) => void }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    leadType: ALL,
    emailStatus: ALL,
    pipelineStage: ALL,
    source: ALL,
    serviceArea: ALL,
    emailable: ALL,
  });
  const [importOpen, setImportOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  // Reset to page 1 whenever filters or search change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("search", debouncedSearch);
    p.set("page", String(page));
    for (const [key, value] of Object.entries(filters)) {
      if (value !== ALL) p.set(key, value);
    }
    return p.toString();
  }, [debouncedSearch, page, filters]);

  const { data, isLoading, isFetching } = useQuery<LeadsResponse>({
    queryKey: ["/api/admin/crm/leads", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/admin/crm/leads?${queryString}`);
      if (!res.ok) throw new Error("Failed to load leads");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile label="Emailable leads" value={data?.stats.emailable} loading={isLoading} icon={<Mail className="h-4 w-4" />} />
        <StatTile label="New quote requests today" value={data?.stats.newQuoteRequestsToday} loading={isLoading} icon={<Search className="h-4 w-4" />} />
        <StatTile label="Open deals" value={data?.stats.openDeals} loading={isLoading} icon={<Building2 className="h-4 w-4" />} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone, company, city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-lead-search"
          />
        </div>
        <Button variant="outline" onClick={() => setDiscoverOpen(true)} data-testid="button-discover">
          <MapPin className="h-4 w-4 mr-1" /> Add business leads
        </Button>
        <Button variant="outline" onClick={() => setImportOpen(true)} data-testid="button-import">
          <Upload className="h-4 w-4 mr-1" /> Import
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterSelect label="Type" value={filters.leadType} onChange={(v) => setFilter("leadType", v)} options={[["homeowner", "Homeowner"], ["business", "Business"]]} />
        <FilterSelect label="Email status" value={filters.emailStatus} onChange={(v) => setFilter("emailStatus", v)} options={Object.entries(EMAIL_STATUS_LABELS)} />
        <FilterSelect label="Pipeline" value={filters.pipelineStage} onChange={(v) => setFilter("pipelineStage", v)} options={Object.entries(PIPELINE_LABELS)} />
        <FilterSelect label="Source" value={filters.source} onChange={(v) => setFilter("source", v)} options={SOURCE_OPTIONS.map((s) => [s, s])} />
        <FilterSelect label="Service area" value={filters.serviceArea} onChange={(v) => setFilter("serviceArea", v)} options={TREASURE_VALLEY_CITIES.map((c) => [c, c])} />
        <FilterSelect label="Emailable" value={filters.emailable} onChange={(v) => setFilter("emailable", v)} options={[["true", "Emailable"], ["false", "Phone only / no email"]]} />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data || data.leads.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No leads match these filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.leads.map((lead) => {
                  const phoneOnly = !lead.email && !!lead.phone;
                  const displayName = lead.leadType === "business" ? lead.companyName || lead.name : lead.name;
                  return (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer"
                      onClick={() => onSelectLead(lead.id)}
                      data-testid={`row-lead-${lead.id}`}
                    >
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          {lead.leadType === "business" ? <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                          {displayName || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lead.email || lead.phone || "No contact"}
                        {phoneOnly && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <Phone className="h-3 w-3 mr-1" /> Phone only
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{lead.serviceArea || lead.city || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{lead.source || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{PIPELINE_LABELS[lead.pipelineStage] ?? lead.pipelineStage}</Badge>
                      </TableCell>
                      <TableCell>
                        {lead.emailable ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <Mail className="h-3.5 w-3.5" /> {EMAIL_STATUS_LABELS[lead.emailStatus] ?? lead.emailStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MailX className="h-3.5 w-3.5" /> {EMAIL_STATUS_LABELS[lead.emailStatus] ?? "No email"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data.total} leads {isFetching && <span className="opacity-60">(updating...)</span>}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm tabular-nums">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <AddBusinessLeadsDialog open={discoverOpen} onClose={() => setDiscoverOpen(false)} />
    </div>
  );
}

function StatTile({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <p className="brc-display-num text-2xl font-semibold mt-1 tabular-nums">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
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
  options: [string, string][] | string[][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto min-w-[150px] h-9">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: All</SelectItem>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
