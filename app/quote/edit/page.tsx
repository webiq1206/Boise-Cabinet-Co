"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, Lock, Plus, X } from "lucide-react";
import { PRIORITY_SERVICES } from "@/shared/contentData";
import {
  getRecurringEligibleServices,
  isServiceInSeason,
} from "@/shared/serviceSeasonality";

type LeadFromApi = {
  leadId: string;
  quoteId?: string | null;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string;
  selectedServices: string[];
  frequency: string | null;
  serviceData: Record<string, any>;
  finalQuote: string | null;
  lineItems: Array<{ serviceId?: string; serviceName?: string; price?: number }>;
  updatedAt: string;
};

const FREQUENCY_OPTIONS = [
  { value: "one-time", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

function EditQuoteContent() {
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [lead, setLead] = useState<LeadFromApi | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ finalQuote: number } | null>(null);

  const recurringEligible = useMemo(() => new Set(getRecurringEligibleServices()), []);

  useEffect(() => {
    if (!token) {
      setLoadError("Missing edit link token.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/quotes/update?token=${encodeURIComponent(token)}`);
        const json = await res.json();
        if (!res.ok) {
          setLoadError(json?.error || "Unable to load your quote.");
        } else {
          setLead(json);
          setSelected(json.selectedServices || []);
          const freqs: Record<string, string> = {};
          for (const sid of json.selectedServices || []) {
            freqs[sid] = json.serviceData?.[sid]?.frequency || json.frequency || "one-time";
          }
          setFrequencies(freqs);
        }
      } catch {
        setLoadError("Unable to load your quote.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const toggleService = (sid: string) => {
    setSelected((prev) =>
      prev.includes(sid) ? prev.filter((s) => s !== sid) : [...prev, sid]
    );
    setFrequencies((prev) => {
      if (prev[sid]) return prev;
      return { ...prev, [sid]: "one-time" };
    });
  };

  const setFrequency = (sid: string, val: string) => {
    setFrequencies((prev) => ({ ...prev, [sid]: val }));
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setSubmitError("Please keep at least one service.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/quotes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          selectedServices: selected,
          serviceFrequencies: frequencies,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json?.error || "Failed to update quote.");
      } else {
        setSubmitted({ finalQuote: json.finalQuote });
      }
    } catch {
      setSubmitError("Failed to update quote.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !lead) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
        <div className="container px-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loadError || "Unable to load your quote."}</AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground mt-4">
                Need help? Call <a href="tel:2083522011" className="text-primary hover:underline">(208) 352-2011</a>
                {" "}or <Link href="/get-quote" className="text-primary hover:underline">start a new quote</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
        <div className="container px-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Your quote has been updated</h1>
              <p className="text-muted-foreground mb-4">
                Updated estimated value: <span className="font-bold text-foreground">${submitted.finalQuote.toLocaleString()}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                We'll be in touch shortly. Need anything else? Call (208) 352-2011.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const allInSeason = PRIORITY_SERVICES.filter((s) => isServiceInSeason(s.slug));
  const available = allInSeason.filter((s) => !selected.includes(s.slug));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12" data-testid="page-quote-edit">
      <div className="container px-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Update your quote</h1>
        <p className="text-muted-foreground mb-6">
          Add or remove services for your existing request. Your contact details and address are locked.
        </p>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-3">
            <div className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Locked details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Name</div>
                <div className="font-medium">{lead.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium">{lead.email}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Phone</div>
                <div className="font-medium">{lead.phone}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Property</div>
                <div className="font-medium">{lead.address || "On file"}, {lead.city}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-3">Selected services</h2>
            {selected.length === 0 && (
              <p className="text-sm text-muted-foreground mb-3">No services selected.</p>
            )}
            <div className="space-y-2">
              {selected.map((sid) => {
                const svc = PRIORITY_SERVICES.find((s) => s.slug === sid);
                const canRecur = recurringEligible.has(sid);
                return (
                  <div
                    key={sid}
                    className="flex items-center justify-between gap-3 border rounded-md p-3"
                    data-testid={`selected-service-${sid}`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium">{svc?.name || sid}</div>
                      {canRecur && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {FREQUENCY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setFrequency(sid, opt.value)}
                              className={`text-xs px-2 py-0.5 rounded border ${
                                frequencies[sid] === opt.value
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/50 hover:bg-muted"
                              }`}
                              data-testid={`freq-${sid}-${opt.value}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleService(sid)}
                      aria-label="Remove"
                      data-testid={`button-remove-${sid}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {available.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-3">Add more services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {available.map((s) => (
                  <Button
                    key={s.slug}
                    variant="outline"
                    onClick={() => toggleService(s.slug)}
                    className="justify-start"
                    data-testid={`button-add-${s.slug}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {s.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={submitting || selected.length === 0}
          onClick={handleSubmit}
          data-testid="button-submit-update"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function EditQuotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <EditQuoteContent />
    </Suspense>
  );
}
