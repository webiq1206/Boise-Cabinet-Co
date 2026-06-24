"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileUp } from "lucide-react";

const SAMPLE = `businessName,city,email,website,phone,note
Summit Builders,Boise,office@summitbuilders.com,https://summitbuilders.com,208-555-0142,Does a lot of kitchen remodels
Eagle Home Pros,Eagle,,https://eaglehomepros.com,208-555-0190,`;

export function ImportDialog({ onImported }: { onImported: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/outreach/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Import failed");
      return json as {
        inserted: number;
        withEmail: number;
        withoutEmail: number;
        duplicates: number;
        skippedInvalid: number;
        total: number;
      };
    },
    onSuccess: (r) => {
      const parts = [`${r.inserted} added`];
      if (r.duplicates) parts.push(`${r.duplicates} already in list`);
      if (r.skippedInvalid) parts.push(`${r.skippedInvalid} skipped (missing name)`);
      toast({
        title: "Import complete",
        description: `${parts.join(", ")}. ${r.withoutEmail} have no email yet.`,
      });
      setCsv("");
      setOpen(false);
      onImported();
    },
    onError: (e: Error) =>
      toast({ title: "Import failed", description: e.message, variant: "destructive" }),
  });

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-open-import">
          <Upload className="h-4 w-4" /> Import contractors
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import contractors</DialogTitle>
          <DialogDescription>
            Add a list of contractors to your outreach list. They land in
            &quot;Ready&quot; so you can review them. Nothing is emailed until you
            approve it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription className="text-xs">
              Use columns named <strong>businessName</strong>, <strong>city</strong>,{" "}
              <strong>email</strong>, <strong>website</strong>, <strong>phone</strong>,{" "}
              and <strong>note</strong>. Only the business name is required. Rows
              without an email are added as &quot;No email&quot; so you can look one
              up later. Duplicates are skipped automatically.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              data-testid="button-upload-csv"
            >
              <FileUp className="h-4 w-4" /> Upload a CSV file
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCsv(SAMPLE)}
              data-testid="button-load-sample"
            >
              Load an example
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFile}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs" htmlFor="import-csv">
              Or paste your list here
            </Label>
            <Textarea
              id="import-csv"
              rows={10}
              className="font-mono text-xs"
              placeholder={SAMPLE}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              data-testid="input-import-csv"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending || csv.trim() === ""}
              data-testid="button-run-import"
            >
              {importMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
