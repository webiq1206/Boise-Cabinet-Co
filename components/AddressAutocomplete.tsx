"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyProfile } from "@/shared/propertyProfile";
import { getPropertyProfileSummary } from "@/shared/propertyProfile";
import {
  getConfidenceLabel,
  getMeasurementSummary,
} from "@/shared/measurementBundle";

interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onProfileResolved: (profile: PropertyProfile | null) => void;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onProfileResolved,
  disabled,
  className,
  "data-testid": testId = "input-address",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [profile, setProfile] = useState<PropertyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputFocusedRef = useRef(false);
  const suggestionsDismissedRef = useRef(false);

  const enrich = useCallback(
    async (opts: { placeId?: string; formattedAddress?: string }) => {
      setEnriching(true);
      setError(null);
      try {
        const res = await fetch("/api/property/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opts),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Could not load property data");
        }
        setProfile(json.profile);
        onProfileResolved(json.profile);
        if (json.profile?.formattedAddress) {
          onChange(json.profile.formattedAddress);
        }
      } catch (e) {
        setProfile(null);
        onProfileResolved(null);
        setError(e instanceof Error ? e.message : "Property lookup failed");
      } finally {
        setEnriching(false);
      }
    },
    [onChange, onProfileResolved]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    const controller = new AbortController();
    let active = true;
    if (trimmed.length < 3) {
      setOpen(false);
      setLoadingSuggestions(false);
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `/api/address/autocomplete?input=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        if (!active) return;
        setSuggestions(json.suggestions ?? []);
        setOpen(inputFocusedRef.current && !suggestionsDismissedRef.current && (json.suggestions?.length ?? 0) > 0);
      } catch {
        if (!active) return;
        setSuggestions([]);
      } finally {
        if (active) setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      active = false;
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function selectSuggestion(s: AddressSuggestion) {
    setOpen(false);
    onChange(s.description);
    await enrich({ placeId: s.placeId });
  }

  async function useTypedAddress() {
    const trimmed = value.trim();
    if (trimmed.length < 5) {
      setError("Enter a complete street address with city");
      return;
    }
    setOpen(false);
    await enrich({ formattedAddress: trimmed });
  }

  const confidence = profile ? getConfidenceLabel(profile.confidence) : null;
  const summaryLines = profile ? getPropertyProfileSummary(profile) : [];
  const measurementLines = profile?.measurementBundle
    ? getMeasurementSummary(profile.measurementBundle)
    : [];

  return (
    <div ref={containerRef} className={cn("space-y-3", className)}>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            suggestionsDismissedRef.current = false;
            onChange(e.target.value);
            setProfile(null);
            onProfileResolved(null);
            setError(null);
          }}
          onFocus={() => { inputFocusedRef.current = true; suggestionsDismissedRef.current = false; if (suggestions.length) setOpen(true); }}
          onBlur={() => { inputFocusedRef.current = false; setOpen(false); }}
          onKeyDown={(e) => { if (e.key === "Escape" || e.key === "Tab") { suggestionsDismissedRef.current = true; setOpen(false); } }}
          placeholder="Start typing your street address…"
          disabled={disabled || enriching}
          autoComplete="street-address"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="address-suggestions-list"
          aria-autocomplete="list"
          data-testid={testId}
        />
        {(loadingSuggestions || enriching) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {open && suggestions.length > 0 && (
          <ul
            id="address-suggestions-list"
            className="absolute z-50 mt-1 w-full rounded-sm border border-border bg-background shadow-md max-h-56 overflow-auto"
            role="listbox"
            aria-label="Address suggestions"
            data-testid="address-suggestions"
          >
            {suggestions.map((s) => (
              <li key={s.placeId} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 min-h-11 text-sm hover:bg-muted/60 flex gap-2 items-start"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(s)}
                  data-testid={`address-suggestion-${s.placeId}`}
                >
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span>
                    {s.mainText ? (
                      <>
                        <span className="font-medium text-foreground">{s.mainText}</span>
                        {s.secondaryText && (
                          <span className="block text-xs text-muted-foreground">
                            {s.secondaryText}
                          </span>
                        )}
                      </>
                    ) : (
                      s.description
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        className="inline-flex min-h-11 items-center text-sm text-primary underline-offset-2 hover:underline disabled:opacity-50"
        onClick={useTypedAddress}
        disabled={disabled || enriching || value.trim().length < 5}
        data-testid="button-use-typed-address"
      >
        Use this address and look up property data
      </button>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1" data-testid="address-error">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      {profile && (
        <div
          className="rounded-sm p-4 text-sm bg-muted/30 border border-border space-y-2"
          data-testid="property-profile-summary"
        >
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Property located</p>
              <p className="text-muted-foreground text-sm mt-0.5">
                {profile.formattedAddress}
              </p>
              {confidence && (
                <span
                  className={cn(
                    "inline-block mt-1 text-xs px-2 py-0.5 rounded-sm",
                    confidence.color === "green" && "bg-primary/10 text-primary",
                    confidence.color === "yellow" && "bg-accent/15 text-accent-foreground",
                    confidence.color === "gray" && "bg-muted text-muted-foreground"
                  )}
                >
                  {confidence.label}
                </span>
              )}
            </div>
          </div>
          {(summaryLines.length > 0 || measurementLines.length > 0) && (
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              {[...summaryLines, ...measurementLines].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          {profile.assessorNote && (
            <p className="text-sm text-muted-foreground italic">{profile.assessorNote}</p>
          )}
        </div>
      )}
    </div>
  );
}
