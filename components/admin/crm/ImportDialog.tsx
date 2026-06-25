"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import * as XLSX from "xlsx";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, CheckCircle2 } from "lucide-react";

const TARGET_FIELDS: { key: string; label: string }[] = [
  { key: "companyName", label: "Company name" },
  { key: "name", label: "Contact name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "website", label: "Website" },
  { key: "city", label: "City" },
  { key: "street", label: "Street" },
  { key: "state", label: "State" },
  { key: "zip", label: "ZIP" },
  { key: "county", label: "County" },
  { key: "fullAddress", label: "Full address" },
  { key: "businessCategory", label: "Business category" },
  { key: "leadGroup", label: "Lead group" },
  { key: "rating", label: "Rating" },
  { key: "reviewCount", label: "Review count" },
  { key: "googleMapsUrl", label: "Google Maps URL" },
];

const NONE = "__none__";

function normalize(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Auto-detect a source header for each target field.
function autoDetect(headers: string[]): Record<string, string> {
  const norm = headers.map((h) => ({ raw: h, n: normalize(h) }));
  const find = (...candidates: string[]): string => {
    for (const c of candidates) {
      const match = norm.find((x) => x.n === c || x.n.includes(c));
      if (match) return match.raw;
    }
    return NONE;
  };
  return {
    companyName: find("companyname", "company", "businessname", "business", "name"),
    name: find("contactname", "contact", "fullname", "owner"),
    email: find("email", "emailaddress"),
    phone: find("phone", "phonenumber", "tel", "mobile"),
    website: find("website", "url", "site", "web"),
    city: find("city", "town"),
    street: find("street", "address1", "addressline1"),
    state: find("state", "province"),
    zip: find("zip", "zipcode", "postalcode", "postcode"),
    county: find("county"),
    fullAddress: find("fulladdress", "formattedaddress", "address"),
    businessCategory: find("category", "businesscategory", "type"),
    leadGroup: find("leadgroup", "group", "segment"),
    rating: find("rating", "stars"),
    reviewCount: find("reviewcount", "reviews", "numreviews"),
    googleMapsUrl: find("googlemapsurl", "mapsurl", "maps"),
  };
}

type ImportSummary = {
  created: number;
  merged: number;
  skipped: number;
  emailable: number;
  phoneOnly: number;
  total: number;
};

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [leadType, setLeadType] = useState<"business" | "homeowner">("business");
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState("");

  const reset = () => {
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setSummary(null);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    setError("");
    setSummary(null);
    setFileName(file.name);
    try {
      let parsedRows: Record<string, string>[] = [];
      if (file.name.toLowerCase().endsWith(".csv")) {
        const text = await file.text();
        const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
        parsedRows = result.data;
      } else {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        parsedRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
      }
      if (parsedRows.length === 0) {
        setError("No rows found in file.");
        return;
      }
      const detectedHeaders = Object.keys(parsedRows[0]);
      setHeaders(detectedHeaders);
      setRows(parsedRows);
      setMapping(autoDetect(detectedHeaders));
    } catch (err) {
      console.error(err);
      setError("Could not read that file. Use a .csv or .xlsx export.");
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const cleanMapping: Record<string, string> = {};
      for (const [field, header] of Object.entries(mapping)) {
        if (header && header !== NONE) cleanMapping[field] = header;
      }
      const res = await fetch("/api/admin/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapping: cleanMapping, rows, leadType, sourceDetail: fileName }),
      });
      if (!res.ok) throw new Error("Import failed");
      const result = (await res.json()) as ImportSummary;
      setSummary(result);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/leads"] });
    } catch (err) {
      console.error(err);
      setError("Import failed. Check your column mapping and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import leads</DialogTitle>
        </DialogHeader>

        {summary ? (
          <div className="space-y-3">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Imported {summary.total} rows: <strong>{summary.created} created</strong>, {summary.merged} merged, {summary.skipped} skipped.
                <br />
                {summary.emailable} emailable, {summary.phoneOnly} phone-only / no email.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={reset}>Import another</Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>File (.csv or .xlsx)</Label>
              <label className="flex items-center gap-2 border border-dashed rounded-md p-4 cursor-pointer hover:bg-muted/50">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{fileName || "Choose a CSV or Excel file"}</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </div>

            {headers.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label>Lead type</Label>
                  <Select value={leadType} onValueChange={(v) => setLeadType(v as "business" | "homeowner")}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="homeowner">Homeowner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Map columns ({rows.length} rows detected)</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {TARGET_FIELDS.map((field) => (
                      <div key={field.key} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-32 shrink-0">{field.label}</span>
                        <Select
                          value={mapping[field.key] || NONE}
                          onValueChange={(v) => setMapping((m) => ({ ...m, [field.key]: v }))}
                        >
                          <SelectTrigger className="h-8 flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>Not mapped</SelectItem>
                            {headers.map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button onClick={submit} disabled={submitting}>
                    {submitting ? "Importing..." : `Import ${rows.length} rows`}
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
