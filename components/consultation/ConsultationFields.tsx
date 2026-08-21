"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
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
import type {
  StoredEstimate,
  CombinedStoredEstimate,
  EstimateSelections,
} from "@/shared/estimateEngine";
import { buildEstimateRecord } from "@/shared/estimateRecord";
import {
  buildConsultationEstimatePayload,
  buildCombinedConsultationPayload,
  formatPlanningCurrency,
  mapEstimateProjectToConsultType,
} from "@/shared/estimateEngine";
import { clearWizardState } from "@/lib/estimate/wizardPersistence";
import { trackEstimatorEvent } from "@/lib/design/designAnalytics";
import { trackMetaLead } from "@/lib/analytics/metaPixel";
import { track } from "@/lib/analytics/track";
import { DisplayNum } from "@/components/marketing";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import type { PropertyProfile } from "@/shared/propertyProfile";
import { extractZipFromAddress } from "@/shared/propertyProfile";
import { phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE } from "@/shared/phoneValidation";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { useModals } from "@/components/modals/ModalProvider";
import { cn } from "@/lib/utils";

const baseFormSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().refine(phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE),
  email: z.string().email("Please enter a valid email"),
  address: z.string().optional(),
  zip: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  companyWebsite: z.string().optional(),
});

/**
 * The estimator asks for address, budget, and timeline outright: a lead that
 * reaches the CRM missing them cannot be scoped, qualified, or scheduled, and
 * chasing them afterwards costs more than asking once. The lighter contact
 * forms keep all three optional so a quick enquiry is never blocked. Same
 * component, two contracts.
 */
function buildFormSchema(requireDetails: boolean) {
  if (!requireDetails) return baseFormSchema;
  return baseFormSchema.extend({
    address: z
      .string()
      .trim()
      .min(6, "Please enter your property address so we can plan your visit"),
    budget: z.string().trim().min(1, "Please choose a budget range"),
    timeline: z.string().trim().min(1, "Please choose a timeline"),
  });
}

type FormData = z.infer<typeof baseFormSchema>;

const PROJECT_OPTIONS = [
  { value: "kitchen", label: "Kitchen Cabinets" },
  { value: "bathroom", label: "Bathroom Vanities" },
  { value: "laundry", label: "Laundry / Mudroom" },
  { value: "closet", label: "Closet & Storage" },
  { value: "other", label: "Other / Whole-home" },
];

const TIMELINE_OPTIONS = [
  "As soon as possible",
  "1 - 3 months",
  "3 - 6 months",
  "6 - 12 months",
  "Just planning for now",
];

/** Coarse bands, so a homeowner can answer without committing to a number. */
const BUDGET_OPTIONS = [
  "Under $15k",
  "$15k - $30k",
  "$30k - $50k",
  "$50k - $75k",
  "$75k - $100k",
  "Over $100k",
  "Not sure yet",
];

const labelClass = "text-xs tracking-wide font-medium uppercase text-muted-foreground";

const consultInputClass = "aria-invalid:border-destructive/50";

const TRUST_POINTS = [
  { icon: Home, label: "Free in-home visit" },
  { icon: ShieldCheck, label: "No spam, ever" },
  { icon: Clock, label: "Reply within one business day" },
] as const;

/**
 * Softer, touch-gated field error. Reads the surrounding FormField's error via
 * the shared form context and renders an inline icon + message instead of the
 * default bold red block. Stays silent until the visitor has actually engaged
 * the field, so nothing turns red before they've had a chance to type.
 */
function FieldError() {
  const { error, isTouched, formMessageId } = useFormField();
  const { formState } = useFormContext();
  const message = error ? String(error.message ?? "") : "";
  // Stay quiet until the visitor has engaged the field, so nothing turns red
  // before they have had a chance to type. But once they have ATTEMPTED to
  // submit, every problem has to explain itself - previously an untouched
  // required field went red with no message, leaving the visitor to guess which
  // field was wrong and why.
  if (!message || (!isTouched && !formState.isSubmitted)) return null;
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
          <p className="text-sm text-muted-foreground mt-1">{estimate.scopeSummary}</p>
        )}
        {estimate.confidenceLabel && (
          <p className="text-sm mt-1 text-muted-foreground">{estimate.confidenceLabel}</p>
        )}
      </div>
    </div>
  );
}

function CombinedEstimateSummaryCard({
  estimate,
  compact = false,
}: {
  estimate: CombinedStoredEstimate;
  compact?: boolean;
}) {
  const roomList = estimate.rooms.map((r) => r.projectLabel).join(", ");
  if (compact) {
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
          <span className="ml-2 text-xs text-muted-foreground">
            {estimate.rooms.length} rooms · {roomList}
          </span>
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
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">
          Your total planning range
        </p>
        <p className="mt-1 text-foreground" data-testid="text-estimate-range">
          <DisplayNum className="text-base font-medium">
            {formatPlanningCurrency(estimate.priceLow)} to {formatPlanningCurrency(estimate.priceHigh)}
          </DisplayNum>
        </p>
        <ul className="mt-2 space-y-1 border-t border-accent/15 pt-2">
          {estimate.rooms.map((r, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-foreground">{r.projectLabel}</span>
              <span className="tabular-nums whitespace-nowrap text-muted-foreground">
                {formatPlanningCurrency(r.priceLow)} to {formatPlanningCurrency(r.priceHigh)}
              </span>
            </li>
          ))}
        </ul>
        {estimate.confidenceLabel && (
          <p className="text-sm mt-2 text-muted-foreground">{estimate.confidenceLabel}</p>
        )}
      </div>
    </div>
  );
}

export interface ConsultationFieldsProps {
  /** Estimate attached to the submission (and optionally displayed). */
  estimate?: StoredEstimate | null;
  /** Multi-room estimate; when set it takes precedence over `estimate`. */
  combinedEstimate?: CombinedStoredEstimate | null;
  /**
   * Resolved consultation project type. When set, the project select is hidden
   * and this value is submitted (used by the multi-room wizard, which spans
   * several project types).
   */
  resolvedProjectType?: string;
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
  /**
   * Require the property address and promote it out of the optional disclosure
   * into a first-class field. Set by the estimator, where we cannot scope the
   * job or book the in-home visit without knowing the property.
   */
  requireDetails?: boolean;
  /**
   * Raw wizard selections, used to build the full estimate record submitted
   * with the lead. Passed instead of a prebuilt record because the address,
   * budget, and notes are only known at submit time.
   */
  estimateRooms?: EstimateSelections[];
}

export function ConsultationFields({
  estimate = null,
  combinedEstimate = null,
  resolvedProjectType,
  showEstimateSummary = true,
  defaultProjectType = "",
  defaultMessage = "",
  formId,
  hideSubmitButton = false,
  onPendingChange,
  onSuccess,
  compact = false,
  requireDetails = false,
  estimateRooms,
}: ConsultationFieldsProps) {
  const { close: closeModal } = useModals();
  const [success, setSuccess] = useState(false);
  const [propertyProfile, setPropertyProfile] = useState<PropertyProfile | null>(null);
  const [addressInput, setAddressInput] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  // When an estimate is attached we already know the project, so the select is
  // hidden and we send the mapped consultation project type instead. A multi-room
  // estimate spans several projects, so the wizard passes an explicit resolved
  // type (e.g. "other" / whole-home).
  const projectTypeFromEstimate =
    resolvedProjectType ??
    (estimate?.project ? mapEstimateProjectToConsultType(estimate.project) : "");

  const formSchema = useMemo(() => buildFormSchema(requireDetails), [requireDetails]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    // A field is only validated once the visitor has actually engaged it (focused
    // then left it), so nothing turns red before they've had a chance to type.
    // Combined with the isTouched gate in FieldError, tapping the submit button on
    // an empty form focuses the first missing field instead of flooding red errors.
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      zip: "",
      projectType: projectTypeFromEstimate || defaultProjectType || "",
      message: defaultMessage || "",
      budget: "",
      timeline: "",
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

  // Shared ID so the browser Lead (pixel) and the server Lead (Conversions API)
  // deduplicate into one conversion.
  const metaEventIdRef = useRef<string | null>(null);
  // Fires "form_started" once, on the visitor's first focus into any field.
  const formStartedRef = useRef(false);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const metaEventId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `lead-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      metaEventIdRef.current = metaEventId;
      // The full record of everything the homeowner selected and was shown.
      // Built here rather than in the wizard because the address, budget, and
      // notes below only exist once they submit.
      const estimateRecord = estimateRooms?.length
        ? buildEstimateRecord({
            rooms: estimateRooms,
            capturedAt: new Date().toISOString(),
            budget: data.budget,
            notes: data.message,
            propertyAddress: data.address,
          })
        : null;

      const payload = {
        ...data,
        propertyProfile,
        metaEventId,
        estimate: combinedEstimate
          ? buildCombinedConsultationPayload(combinedEstimate)
          : buildConsultationEstimatePayload(estimate),
        estimateRecord,
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
      track("form_completed", { form: "consultation" });
      // Meta conversion: the consultation request is the site's primary Lead.
      // Pass the shared event ID so this browser event dedupes with the
      // server-side Conversions API event fired by /api/consultation.
      trackMetaLead(metaEventIdRef.current ?? undefined);
      onSuccess?.();
      window.setTimeout(() => closeModal(), 4000);
    },
    onError: () => {
      track("form_error", { form: "consultation" });
    },
  });

  // Surface pending state to an external (sticky-bar) submit button without
  // re-running on every parent render that swaps the callback identity.
  const onPendingChangeRef = useRef(onPendingChange);
  onPendingChangeRef.current = onPendingChange;
  useEffect(() => {
    onPendingChangeRef.current?.(mutation.isPending);
  }, [mutation.isPending]);

  // Move focus to the error alert on each new failed submission so
  // screen-reader users aren't left on the submit button with no
  // indication anything happened.
  const errorAlertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mutation.isError) {
      errorAlertRef.current?.focus({ preventScroll: true });
    }
  }, [mutation.isError]);

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
        <p className="text-base leading-relaxed text-muted-foreground">
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
      <form
        id={formId}
        onSubmit={onSubmit}
        onFocusCapture={() => {
          if (formStartedRef.current) return;
          formStartedRef.current = true;
          track("form_started", { form: "consultation" });
        }}
        className={compact ? "space-y-2.5" : "space-y-5"}
      >
        {showEstimateSummary &&
          (combinedEstimate ? (
            <CombinedEstimateSummaryCard estimate={combinedEstimate} compact={compact} />
          ) : (
            estimate && <EstimateSummaryCard estimate={estimate} compact={compact} />
          ))}

        {mutation.isError && (
          <div
            ref={errorAlertRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            className="rounded-sm p-4 text-sm bg-destructive/5 border border-destructive/20 text-destructive focus:outline-none"
          >
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

          {/* In the estimator the property address is required, so it is a
              first-class field rather than something hidden behind a toggle. */}
          {requireDetails && (
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
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Start typing and pick your address. We use it to plan your in-home visit.
                  </p>
                  <FieldError />
                </FormItem>
              )}
            />
          )}

          {/* Budget and timeline are required here too: a lead without them
              cannot be qualified or scheduled, and both are one tap. */}
          {requireDetails && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Budget range</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className={consultInputClass} data-testid="select-budget">
                          <SelectValue placeholder="Select a range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUDGET_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Timeline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className={consultInputClass} data-testid="select-timeline">
                          <SelectValue placeholder="When to start" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMELINE_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Remaining optional detail stays off the critical path. */}
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
              <span>
                {requireDetails
                  ? "Add budget & notes (optional)"
                  : "Add address & notes (optional)"}
              </span>
              {detailsOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
            {detailsOpen && (
              <div className="space-y-4 border-t border-border p-3">
                {!requireDetails && (
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
                )}
                {!requireDetails && (
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Budget in mind</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className={consultInputClass} data-testid="select-budget">
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUDGET_OPTIONS.map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError />
                      </FormItem>
                    )}
                  />
                )}
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
