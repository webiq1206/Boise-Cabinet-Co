"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  Send,
  Search,
  User,
} from "lucide-react";

interface LeadLite {
  id: string;
  name: string;
  email: string;
  city?: string | null;
  status: string;
  projectId?: string | null;
}

interface ProjectLite {
  id: string;
  title: string;
  name?: string | null;
  city?: string | null;
  status: string;
}

const PAGES = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/outreach", label: "Outreach", icon: Send },
];

/**
 * Global admin command palette (Cmd/Ctrl-K). Renders a header trigger button and
 * a searchable dialog for jumping to pages, leads, and projects.
 */
export function AdminCommandPalette() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: leads = [] } = useQuery<LeadLite[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      return res.json();
    },
    enabled: isAdmin && open,
    staleTime: 60_000,
  });

  const { data: projects = [] } = useQuery<ProjectLite[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    },
    enabled: isAdmin && open,
    staleTime: 60_000,
  });

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!isAdmin) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex h-9 gap-2 text-muted-foreground"
        aria-label="Search (Command or Control K)"
      >
        <Search className="h-4 w-4" />
        <span className="text-xs">Search</span>
        <kbd className="pointer-events-none ml-1 hidden items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[12px] font-medium lg:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, leads, projects..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {PAGES.map((p) => {
              const Icon = p.icon;
              return (
                <CommandItem
                  key={p.href}
                  value={`page ${p.label}`}
                  onSelect={() => go(p.href)}
                >
                  <Icon className="h-4 w-4" />
                  {p.label}
                </CommandItem>
              );
            })}
          </CommandGroup>

          {leads.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Leads">
                {leads.slice(0, 50).map((l) => (
                  <CommandItem
                    key={l.id}
                    value={`lead ${l.name} ${l.email} ${l.city ?? ""} ${l.id}`}
                    onSelect={() => go(`/admin/leads?leadId=${encodeURIComponent(l.id)}`)}
                  >
                    <User className="h-4 w-4" />
                    <span className="truncate">{l.name}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {l.city || l.email}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {projects.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projects">
                {projects.slice(0, 50).map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`project ${p.title} ${p.name ?? ""} ${p.city ?? ""} ${p.id}`}
                    onSelect={() => go(`/admin/projects/${p.id}`)}
                  >
                    <FolderKanban className="h-4 w-4" />
                    <span className="truncate">{p.title}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {p.city || p.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
