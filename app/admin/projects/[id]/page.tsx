"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { PropertyProfileEditor } from "@/components/admin/PropertyProfileEditor";
import { AdminProjectPortalPanel } from "@/components/admin/AdminProjectPortalPanel";
import { formatProjectStatus } from "@/lib/formatStatus";
import type { PropertyProfile } from "@/shared/propertyProfile";
import { ArrowLeft, Check, Upload, FileText, Trash2, Download } from "lucide-react";

const STATUSES = ["draft", "active", "on_hold", "completed", "cancelled"];

function formatBytes(bytes?: number | null): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function SavableField({
  label,
  initialValue,
  multiline,
  rows,
  type,
  onSave,
}: {
  label: string;
  initialValue: string;
  multiline?: boolean;
  rows?: number;
  type?: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [savedValue, setSavedValue] = useState(initialValue ?? "");
  const [justSaved, setJustSaved] = useState(false);
  const dirty = value !== savedValue;

  const save = () => {
    if (!dirty) return;
    onSave(value);
    setSavedValue(value);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between min-h-[20px]">
        <Label>{label}</Label>
        {dirty ? (
          <span className="text-xs text-amber-600">Unsaved changes</span>
        ) : justSaved ? (
          <span className="text-xs text-green-600 inline-flex items-center gap-1">
            <Check className="h-3 w-3" /> Saved
          </span>
        ) : null}
      </div>
      {multiline ? (
        <Textarea value={value} rows={rows} onChange={(e) => setValue(e.target.value)} onBlur={save} />
      ) : (
        <Input type={type} value={value} onChange={(e) => setValue(e.target.value)} onBlur={save} />
      )}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={save} disabled={!dirty}>
          Save
        </Button>
      </div>
    </div>
  );
}

export default function AdminProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [coTitle, setCoTitle] = useState("");
  const [coDescription, setCoDescription] = useState("");
  const [coAmount, setCoAmount] = useState("0");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) router.push("/admin/projects");
  }, [projectId, router]);

  const { data, isLoading: loadingProject } = useQuery({
    queryKey: ["/api/admin/projects", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: !!projectId,
  });

  const actionMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects", projectId] });
      toast({ title: "Updated" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects", projectId] });
      toast({ title: "Project saved" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: (file: File) =>
      new Promise<unknown>((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "entity");
        formData.append("entityType", "project");
        formData.append("entityId", projectId);
        formData.append("category", "attachment");
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          setUploadProgress(null);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              resolve({});
            }
          } else {
            let msg = "Upload failed";
            try {
              msg = JSON.parse(xhr.responseText).error || msg;
            } catch {}
            reject(new Error(msg));
          }
        };
        xhr.onerror = () => {
          setUploadProgress(null);
          reject(new Error("Upload failed"));
        };
        xhr.open("POST", "/api/documents/upload");
        setUploadProgress(0);
        xhr.send(formData);
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects", projectId] });
      toast({ title: "Document uploaded" });
    },
    onError: (e: Error) => {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects", projectId] });
      toast({ title: "Document deleted" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) uploadDocMutation.mutate(file);
  };

  const project = data?.project;
  const changeOrders = data?.changeOrders ?? [];
  const documents = data?.documents ?? [];
  const invoices = data?.invoices ?? [];
  const messages = data?.messages ?? [];

  const activityNotes = [...((project?.internalNotes ?? []) as { text: string; addedAt: string; addedBy: string }[])].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );

  const breadcrumb = project ? (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin/projects">Projects</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="truncate max-w-[260px]">{project.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ) : undefined;

  return (
    <AdminAuthGate title="Project">
      <PortalShell variant="admin" title={project?.title ?? "Project"} breadcrumb={breadcrumb}>
      {loadingProject || !project ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-lg" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="md:hidden -ml-2">
            <Link href="/admin/projects">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Projects
            </Link>
          </Button>

          <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide flex-nowrap h-auto p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scope">Scope</TabsTrigger>
            <TabsTrigger value="change_orders">Change Orders</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="client_portal">Client Portal</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {project.name}</div>
                <div><span className="text-muted-foreground">Email:</span> {project.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {project.phone}</div>
                <div><span className="text-muted-foreground">Address:</span> {project.address}, {project.city}</div>
                <div><span className="text-muted-foreground">Amount:</span> ${project.contractAmount ? parseFloat(project.contractAmount).toLocaleString() : "TBD"}</div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge variant="outline">{formatProjectStatus(project.status)}</Badge>
                </div>
                {project.leadId && (
                  <div className="sm:col-span-2">
                    <Link href={`/admin/leads?leadId=${encodeURIComponent(project.leadId)}`} className="text-primary underline text-sm">
                      View original lead
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <PropertyProfileEditor
              profile={project.propertyProfile as PropertyProfile | null | undefined}
              saving={updateMutation.isPending}
              onSave={(profile) => updateMutation.mutate({ propertyProfile: profile })}
            />

            <div className="space-y-2">
              <Label>Project status</Label>
              <Select
                value={project.status}
                onValueChange={(v) => {
                  if (v !== project.status) setPendingStatus(v);
                }}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{formatProjectStatus(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="scope" className="mt-4 space-y-4">
            <SavableField
              label="Scope of Work"
              initialValue={project.scopeOfWork ?? ""}
              multiline
              rows={8}
              onSave={(v) => updateMutation.mutate({ scopeOfWork: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SavableField
                label="Payment Terms"
                initialValue={project.paymentTerms ?? ""}
                onSave={(v) => updateMutation.mutate({ paymentTerms: v })}
              />
              <SavableField
                label="Contract Amount"
                initialValue={project.contractAmount ?? ""}
                onSave={(v) => updateMutation.mutate({ contractAmount: v })}
              />
            </div>
          </TabsContent>

          <TabsContent value="change_orders" className="mt-4 space-y-4">
            {changeOrders.map(
              (co: { id: string; number: number; title: string; description: string; amountDelta: string; status: string }) => (
                <Card key={co.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">#{co.number} {co.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{co.description}</p>
                        <p className="text-sm mt-1">${co.amountDelta}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">{co.status}</Badge>
                        {co.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              actionMutation.mutate({
                                action: "update_change_order",
                                changeOrderId: co.id,
                                status: "approved",
                              })
                            }
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Input placeholder="Title" value={coTitle} onChange={(e) => setCoTitle(e.target.value)} />
                <Textarea placeholder="Description" value={coDescription} onChange={(e) => setCoDescription(e.target.value)} />
                <Input placeholder="Amount delta" type="number" value={coAmount} onChange={(e) => setCoAmount(e.target.value)} />
                <Button
                  disabled={!coTitle.trim()}
                  onClick={() => {
                    actionMutation.mutate({
                      action: "create_change_order",
                      title: coTitle,
                      description: coDescription,
                      amountDelta: coAmount,
                    });
                    setCoTitle("");
                    setCoDescription("");
                    setCoAmount("0");
                  }}
                >
                  Add Change Order
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4 space-y-4">
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => docInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") docInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">Drag &amp; drop a file, or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF or images</p>
            </div>

            {uploadProgress !== null && (
              <div className="space-y-1">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground">Uploading… {uploadProgress}%</p>
              </div>
            )}

            {documents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No documents uploaded.</p>
            ) : (
              <div className="rounded-md border divide-y">
                {documents.map((d: { id: string; fileName: string; fileSize?: number | null; createdAt?: string | null }) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {[formatBytes(d.fileSize), d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/api/documents/${d.id}/download`} aria-label={`Download ${d.fileName}`}>
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" aria-label={`Delete ${d.fileName}`}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete document?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{d.fileName}" will be permanently removed. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteDocMutation.mutate(d.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="client_portal">
            <AdminProjectPortalPanel
              projectId={projectId}
              currentStage={project.currentStage}
              customerUserId={project.customerUserId}
              customerEmail={project.email}
              invoices={invoices}
              messages={messages}
              onAction={(body) => actionMutation.mutate(body)}
              onPatch={(body) => updateMutation.mutate(body)}
              isPending={actionMutation.isPending || updateMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add internal note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && noteText.trim()) {
                    actionMutation.mutate({ action: "add_note", text: noteText });
                    setNoteText("");
                  }
                }}
              />
              <Button
                disabled={!noteText.trim()}
                onClick={() => {
                  actionMutation.mutate({ action: "add_note", text: noteText });
                  setNoteText("");
                }}
              >
                Add
              </Button>
            </div>
            {activityNotes.length === 0 ? (
              <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                No activity yet. Add an internal note to start the log.
              </div>
            ) : (
              <div className="space-y-2">
                {activityNotes.map((n, i) => (
                  <div key={i} className="text-sm border-b pb-2">
                    <p>{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.addedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          </Tabs>
        </div>
      )}

      <AlertDialog open={pendingStatus !== null} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change status?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus && (
                <>Set this project to <strong>{formatProjectStatus(pendingStatus)}</strong>?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingStatus) updateMutation.mutate({ status: pendingStatus });
                setPendingStatus(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalShell>
    </AdminAuthGate>
  );
}
