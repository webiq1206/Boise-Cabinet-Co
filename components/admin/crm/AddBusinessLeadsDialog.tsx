"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { TREASURE_VALLEY_CITIES } from "@/lib/crm/leads";

interface DiscoverResult {
  city: string;
  found: number;
  inserted: number;
  skippedExisting: number;
  emailsFound: number;
  error?: string;
}

export function AddBusinessLeadsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [city, setCity] = useState<string>(TREASURE_VALLEY_CITIES[0]);
  const [scrapeEmails, setScrapeEmails] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/crm/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, scrapeEmails }),
      });
      const data = (await res.json()) as DiscoverResult;
      if (!res.ok || data.error) {
        setError(data.error || "Discovery failed.");
      } else {
        setResult(data);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/leads"] });
      }
    } catch {
      setError("Discovery failed. Check the Google Places configuration.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add business leads</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Finds general contractors via Google Places and adds new ones as business leads. Only publicly listed emails are captured, never guessed.
          </p>
          <div className="space-y-1">
            <Label className="text-xs">City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TREASURE_VALLEY_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="scrape" checked={scrapeEmails} onCheckedChange={(v) => setScrapeEmails(!!v)} />
            <Label htmlFor="scrape" className="text-sm">Scrape public emails from websites</Label>
          </div>

          {error && (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          {result && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Found {result.found} in {result.city}: {result.inserted} added, {result.skippedExisting} already present, {result.emailsFound} emails captured.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={run} disabled={running}>{running ? "Searching..." : "Find contractors"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
