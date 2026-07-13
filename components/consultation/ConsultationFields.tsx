"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useFormField,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Plus,
  Minus,
  AlertCircle,
  Home,
  ShieldCheck,
  Clock,
} from "lucide-react";
import type { StoredEstimate } from "@/shared/estimateEngine";
import {
  buildConsultationEstimatePayload,
  formatPlanningCurrency,
  mapEstimateProjectToConsultType,
} from "@/shared/estimateEngine";
import { clearWizardState } from "@/lib/estimate/wizardPersistence";
import { trackEstimatorEvent } from "@/lib/design/designAnalytics";
import { DisplayNum } from "@/components/marketing";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import type { PropertyProfile } from "@/shared/propertyProfile";
import { extractZipFromAddress } from "@/shared/propertyProfile";
import { phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE } from "@/shared/phoneValidation";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { useModals } from "@/components/modals/ModalProvider";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().refine(phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE),
  email: z.string().email("Please enter a valid email"),
  address: z.string().optional(),
  zip: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().optional(),
  companyWebsite: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const PROJECT_OPTIONS = [
  { value: "kitchen", label: "Kitchen Cabinets" },
  { value: "bathroom", label: "Bathroom Vanities" },
  { value: "laundry", label: "Laundry / Mudroom" },
  { value: "closet", label: "Closet & Storage" },
  { value: "other", label: "Other / Whole-home" },
];

const labelClass = "text-xs tracking-wide font-medium uppercase text-muted-foreground";

const consultInputClass = "aria-invalid:border-destructive/50";

const TRUST_POINTS = [
  { icon: Home, label: "Free in-home visit" },
  { icon: ShieldCheck, label: "No spam, ever" },
  { icon: Clock, label: "Reply within one business day" },
] as const;

/**
 * Softer, submit-gated field error. Reads the surrounding FormField's error via
 * the shared form context and renders an inline icon + message instead of the
 * default bold red block. Returns null until the field actually has an error.
 */
function FieldError() {
  const { error, formMessageId } = useFormField();
  const message = error ? String(error.message ?? "") : "";
  if (!message) return null;
  return (
    <p
      id={formMessageId}
      className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-destructive/90"
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

function TrustRow() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {TRUST_POINTS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-accent" />
          {label}
        </li>
      ))}
    </ul>
  );
}

function EstimateSummaryCard({ estimate, compact = false }: { estimate: StoredEstimate; compact?: boolean }) {
  if (compact) {
    // One-line range + project so the submit step fits a single screen.
    return (
      <div
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm bg-accent/5 border border-accent/20"
        data-testid="text-estimate-summary"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <span className="font-medium text-foreground" data-testid="text-estimate-range">
            <DisplayNum>
              {formatPlanningCurrency(estimate.priceLow)} to {formatPlanningCurrency(estimate.priceHigh)}
            </DisplayNum>
          </span>
          <span className="ml-2 text-xs text-muted-foreground">{estimate.projectLabel}</span>
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex gap-3 rounded-lg p-4 text-sm bg-accent/5 border border-accent/20"
      data-testid="text-estimate-summary"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Your planning range</p>
        <p className="mt-1 text-foreground" data-testid="text-estimate-range">
          <DisplayNum className="text-base font-medium">
            {formatPlanningCurrency(estimate.priceLow)} to {formatPlanningCurrency(estimate.priceHigh)}
          </DisplayNum>
        </p>
        <p className="mt-0.5 text-muted-foreground">
          {estimate.projectLabel}
          {estimate.sizeLabel ? ` · ${estimate.sizeLabel}` : ""}
        </p>
        {estimate.scopeSummary && (
          <p className="text-xs text-muted-foreground mt-1">{estimate.scopeSummary}</p>
        )}
        {estimate.confidenceLabel && (
          <p className="text-xs mt-1 text-muted-foreground">{estimate.confidenceLabel}</p>
        )}
      </div>
    </div>
  );
}

export interface ConsultationFieldsProps {
  /** Estimate attached to the submission (and optionally displayed). */
  estimate?: StoredEstimate | null;
  /** Show the compact planning-range card above the fields. */
  showEstimateSummary?: boolean;
  /** Prefill the project select when there is no estimate to derive it from. */
  defaultProjectType?: string;
  /** Prefill the notes textarea (e.g. from the style finder). */
  defaultMessage?: string;
  /** Form element id so an external button can submit via `form="..."`. */
  formId?: string;
  /** Hide the in-body submit button (e.g. when a sticky bar provides it). */
  hideSubmitButton?: boolean;
  /** Notified of the submit pending state, for an external submit button. */
  onPendingChange?: (pending: boolean) => void;
  /** Called after a successful submission. */
  onSuccess?: () => void;
  /** One-screen density (tighter spacing, single-line summary) for the wizard. */
  compact?: boolean;
}

export function ConsultationFields({
  estimate = null,
  showEstimateSummary = true,
  defaultProjectType = "",
  defaultMessage = "",
  formId,
  hideSubmitButton = false,
  onPendingChange,
  onSuccess,
  compact = false,
}: ConsultationFieldsProps) {
  const { close: closeModal } = useModals();
  const [success, setSuccess] = useState(false);
  const [propertyProfile, setPropertyProfile] = useState<PropertyProfile | null>(null);
  const [addressInput, setAddressInput] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  // When an estimate is attached we already know the project, so the select is
  // hidden and we send the mapped consultation project type instead.
  const projectTypeFromEstimate = estimate?.project
    ? mapEstimateProjectToConsultType(estimate.project)
    : "";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    // Errors only surface after the visitor attempts to submit, then clear as
    // each field becomes valid.
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      zip: "",
      projectType: projectTypeFromEstimate || defaultProjectType || "",
      message: defaultMessage || "",
      companyWebsite: "",
    },
  });

  // Late-arriving defaults (sessionStorage reads in the standalone wrapper) are
  // applied without clobbering anything the visitor has already typed.
  useEffect(() => {
    const next = projectTypeFromEstimate || defaultProjectType;
    if (next && !form.getValues("projectType")) {
      form.setValue("projectType", next, { shouldValidate: false });
    }
  }, [projectTypeFromEstimate, defaultProjectType, form]);

  useEffect(() => {
    if (defaultMessage && !form.getValues("message")) {
      form.setValue("message", defaultMessage, { shouldValidate: false });
      setDetailsOpen(true);
    }
  }, [defaultMessage, form]);

  function handleProfileResolved(profile: PropertyProfile | null) {
    setPropertyProfile(profile);
    if (profile?.zip) {
      form.setValue("zip", profile.zip.slice(0, 5), { shouldValidate: true });
    } else {
      form.setValue("zip", "", { shouldValidate: true });
    }
    if (profile?.formattedAddress) {
      form.setValue("address", profile.formattedAddress, { shouldValidate: true });
    }
  }

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        propertyProfile,
        estimate: buildConsultationEstimatePayload(estimate),
      };
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string;
          errors?: { fieldErrors?: Record<string, string[]> };
        };
        const fieldErrors = err.errors?.fieldErrors;
        if (fieldErrors) {
          const fieldMap: Record<string, keyof FormData> = {
            name: "name",
            phone: "phone",
            email: "email",
            address: "address",
            projectType: "projectType",
            message: "message",
          };
          for (const [key, messages] of Object.entries(fieldErrors)) {
            const field = fieldMap[key];
            if (field && messages?.[0]) {
              form.setError(field, { message: messages[0] });
            }
          }
        }
        throw new Error(err.message || "Something went wrong. Please try again.");
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      sessionStorage.removeItem("brc_estimate");
      clearWizardState();
      trackEstimatorEvent("estimator_lead_submitted");
      onSuccess?.();
      window.setTimeout(() => closeModal(), 4000);
    },
  });

  // Surface pending state to an external (sticky-bar) submit button without
  // re-running on every parent render that swaps the callback identity.
  const onPendingChangeRef = useRef(onPendingChange);
  onPendingChangeRef.current = onPendingChange;
  useEffect(() => {
    onPendingChangeRef.current?.(mutation.isPending);
  }, [mutation.isPending]);

  if (success) {
    return (
      <div
        className="flex flex-col items-start py-8 space-y-5"
        data-testid="consultation-success"
        aria-live="polite"
        role="status"
      >
        <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-accent/10">
          <CheckCircle2 className="h-5 w-5 text-accent" />
        </div>
        <h3 className="font-sans font-light text-2xl text-foreground">
          We&apos;ll be in touch shortly.
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thank you for reaching out. We sent a confirmation to your email and typically
          respond within one business day.
        </p>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
          <li>We call or text to confirm your details</li>
          <li>We schedule your free in-home design visit</li>
          <li>You get a planning range and next steps at your home</li>
        </ol>
        <p className="text-sm text-muted-foreground">
          Need us sooner?{" "}
          <a href={SITE_CONFIG.phoneHref} className="text-primary font-medium hover:underline">
            Call {SITE_CONFIG.phone}
          </a>
        </p>
      </div>
    );
  }

  const onSubmit = form.handleSubmit((data) => {
    if (mutation.isPending) return;
    const enriched = { ...data, zip: data.zip || extractZipFromAddress(data.address) };
    mutation.mutate(enriched);
  });

  return (
    <Form {...form}>
      <form id={formId} onSubmit={onSubmit} className={compact ? "space-y-2.5" : "space-y-5"}>
        {showEstimateSummary && estimate && <EstimateSummaryCard estimate={estimate} compact={compact} />}

        {mutation.isError && (
          <div className="rounded-sm p-4 text-sm bg-destructive/5 border border-destructive/20 text-destructive">
            {(mutation.error as Error).message || "Something went wrong. Please try again."}
          </div>
        )}

        {/* Honeypot - hidden from users and assistive tech */}
        <FormField
          control={form.control}
          name="companyWebsite"
          render={({ field }) => (
            <FormItem className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <FormControl>
                <Input tabIndex={-1} autoComplete="off" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div
          className={cn(
            "rounded-lg border border-border bg-card shadow-sm",
            compact ? "space-y-2 p-3" : "space-y-5 p-5 sm:p-6",
          )}
        >
          <div className={cn("grid gap-3", compact ? "grid-cols-2" : "sm:grid-cols-2 gap-4")}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jane Smith"
                      autoComplete="name"
                      data-testid="input-name"
                      className={consultInputClass}
                      {...field}
                    />
                  </FormControl>
                  <FieldError />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Your phone number"
                      autoComplete="tel"
                      inputMode="tel"
                      data-testid="input-phone"
                      className={consultInputClass}
                      {...field}
                    />
                  </FormControl>
                  <FieldError />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    autoComplete="email"
                    data-testid="input-email"
                    className={consultInputClass}
                    {...field}
                  />
                </FormControl>
                <FieldError />
              </FormItem>
            )}
          />

          {!projectTypeFromEstimate && (
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>What cabinetry are you planning?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-project-type">
                        <SelectValue placeholder="Select a project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError />
                </FormItem>
              )}
            />
          )}

          {/* Address + notes are off the critical path - one tap reveals them. */}
          <div className="rounded-sm border border-border bg-background">
            <button
              type="button"
              onClick={() => setDetailsOpen((o) => !o)}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 text-left text-sm text-muted-foreground transition-colors hover:text-foreground",
                compact ? "min-h-10 py-2" : "min-h-11 py-2.5",
              )}
              aria-expanded={detailsOpen}
              data-testid="button-toggle-details"
            >
              <span>Add address &amp; notes (optional)</span>
              {detailsOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
            {detailsOpen && (
              <div className="space-y-4 border-t border-border p-3">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Property address</FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          value={addressInput || field.value || ""}
                          onChange={(v) => {
                            setAddressInput(v);
                            field.onChange(v);
                          }}
                          onProfileResolved={handleProfileResolved}
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FieldError />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Anything else we should know?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little about your home, your vision, or your timeline..."
                          rows={3}
                          data-testid="textarea-message"
                          {...field}
                        />
                      </FormControl>
                      <FieldError />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {hideSubmitButton ? (
          <TrustRow />
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              type="submit"
              variant="brand"
              disabled={mutation.isPending}
              data-testid="button-submit-consultation"
            >
              {mutation.isPending ? "Sending…" : "Send my request"}
              {!mutation.isPending && <ArrowRight className="h-4 w-4" />}
            </Button>
            <TrustRow />
          </div>
        )}
      </form>
    </Form>
  );
}
