"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/hooks/useAuth";
import { formatProjectStatus } from "@/lib/formatStatus";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminPageIntro } from "@/components/admin/AdminPageIntro";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, LayoutGrid, List } from "lucide-react";

interface AdminProject {
  id: string;
  title: string;
  name: string;
  city: string;
  status: string;
  contractAmount?: string | null;
  startDate?: string | null;
  createdAt?: string | null;
}

const STATUS_ORDER = ["active", "draft", "on_hold", "completed", "cancelled"];

function formatAmount(amount?: string | null): string {
  if (!amount) return "—";
  const n = parseFloat(amount);
  if (Number.isNaN(n)) return "—";
  return `$${n.toLocaleString()}`;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "bg-green-600 hover:bg-green-600 text-white"
      : status === "completed"
        ? "bg-blue-600 hover:bg-blue-600 text-white"
        : status === "cancelled"
          ? "border-destructive/50 text-destructive"
          : "";
  return tone.startsWith("bg-") ? (
    <Badge className={tone}>{formatProjectStatus(status)}</Badge>
  ) : (
    <Badge variant="outline" className={tone}>
      {formatProjectStatus(status)}
    </Badge>
  );
}

export default function AdminProjectsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "amount" | "name">("recent");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push("/admin");
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("admin-projects-view") : null;
    if (saved === "cards" || saved === "table") setViewMode(saved);
  }, []);

  const changeViewMode = (mode: "cards" | "table") => {
    setViewMode(mode);
    if (typeof window !== "undefined") window.localStorage.setItem("admin-projects-view", mode);
  };

  const { data: projects = [], isLoading: loadingProjects } = useQuery<AdminProject[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: isAdmin,
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) counts[p.status] = (counts[p.status] ?? 0) + 1;
    return counts;
  }, [projects]);

  const availableStatuses = useMemo(() => {
    const present = Object.keys(statusCounts);
    return [
      ...STATUS_ORDER.filter((s) => present.includes(s)),
      ...present.filter((s) => !STATUS_ORDER.includes(s)),
    ];
  }, [statusCounts]);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    list.sort((a, b) => {
      if (sortBy === "amount") return (parseFloat(b.contractAmount || "0") || 0) - (parseFloat(a.contractAmount || "0") || 0);
      if (sortBy === "name") return (a.title || "").localeCompare(b.title || "");
      return new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime();
    });
    return list;
  }, [projects, search, statusFilter, sortBy]);

  const grouped = useMemo(() => {
    const groups: { status: string; items: AdminProject[] }[] = [];
    const order = statusFilter === "all" ? availableStatuses : [statusFilter];
    for (const status of order) {
      const items = filtered.filter((p) => p.status === status);
      if (items.length) groups.push({ status, items });
    }
    return groups;
  }, [filtered, availableStatuses, statusFilter]);

  if (isLoading || !isAdmin) {
    return (
      <AdminAuthGate title="Projects">
        <span />
      </AdminAuthGate>
    );
  }

  const ProjectCard = ({ project }: { project: AdminProject }) => (
    <Card className="hover:bg-muted/30 transition-colors">
      <Link href={`/admin/projects/${project.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base">{project.title}</CardTitle>
            <StatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            {project.name} · {project.city}
          </p>
          {project.contractAmount && (
            <p className="mt-1">Contract: {formatAmount(project.contractAmount)}</p>
          )}
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <AdminAuthGate title="Projects">
    <PortalShell variant="admin" title="Projects">
      <div className="space-y-4">
        <AdminPageIntro>Track active builds and manage every project from lead to completion.</AdminPageIntro>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, customers, cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses ({projects.length})</SelectItem>
              {availableStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatProjectStatus(s)} ({statusCounts[s]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="amount">Contract amount</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border p-0.5 shrink-0">
            <Button
              type="button"
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => changeViewMode("cards")}
              aria-label="Card view"
              aria-pressed={viewMode === "cards"}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => changeViewMode("table")}
              aria-label="Table view"
              aria-pressed={viewMode === "table"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loadingProjects ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No projects yet. Convert a lead from{" "}
              <Link href="/admin/leads" className="underline">
                Leads
              </Link>
              .
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No projects match your filters.
            </CardContent>
          </Card>
        ) : viewMode === "table" ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">City</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/projects/${project.id}`)}
                  >
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{project.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{project.city}</TableCell>
                    <TableCell className="tabular-nums">{formatAmount(project.contractAmount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : statusFilter === "all" ? (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">{formatProjectStatus(group.status)}</h2>
                  <Badge variant="secondary" className="tabular-nums">{group.items.length}</Badge>
                </div>
                <div className="space-y-3">
                  {group.items.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </PortalShell>
    </AdminAuthGate>
  );
}
