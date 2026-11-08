"use client";

/**
 * The family quote form, v2 (owner, 1 November: "the easiest user experience
 * possible", files "might be helpful", and "the more information we have, the
 * better"). Two steps:
 *
 * Step 1, one short screen that captures the lead:
 *   [Send a request | Have us call you]
 *   What can we help with?  (the easy, interesting question first)
 *   Add photos, plans or files  (one optional tile)
 *   Name, Phone, Email (optional), How should we reach you
 *   Prefer to talk? Call, Text us, Chat
 *   Send my request
 *
 * Step 2, on the success screen (components/quote/QuoteFollowUp.tsx): the
 * Step 1 files upload, then "Help us prepare (optional)" adds project type,
 * address, timing and more files to the SAME request. The lead never waits
 * on either.
 *
 * "Have us call you" reduces Step 1 to name, phone and an optional best time
 * and posts through the same /api/consultation pipeline with requestKind
 * "callback"; the server marks the notes "CALLBACK REQUEST" for the team
 * (server/services/consultationRequest.ts). Files and Step 2 are offered on
 * its success screen too.
 *
 * Native inputs, radios, select and details only (no Radix inside the form),
 * so nothing sets state during hydration. Every field keeps its label visible,
 * is 48px tall, carries an autocomplete token and is masked for Clarity.
 *
 * Owner-approved checks this form has to keep passing, read before changing a
 * label, a test id or the dock (scripts/lib/shortBrandEntry.mjs, run by
 * e2e/calculator.spec.ts, and scripts/cabinet-current-entry-browser.mjs):
 * - the accessible labels match exactly "Name", "Phone", "Email" and
 *   "Project". The project field shows "What can we help with?" and is also
 *   labelled by a visually hidden "Project" (aria-labelledby), and "Optional"
 *   sits beside the Email label, not inside it, so those exact names still
 *   resolve. The reply options stay "Call me", "Text me", "Email me" so no
 *   other control is named "Email";
 * - the send button sits in the docked WizardActionBar on /estimate and its
 *   test id is "button-estimate-quote-continue" until every required field is
 *   valid, then "button-estimate-quote-submit" (pressing it early checks the
 *   form and moves focus to the first field that needs attention);
 * - exactly one role="alert" message per check, inside the form;
 * - data-quote-step reads "project" once the form is complete;
 * - fields survive a reload on /estimate (sessionStorage, this tab only);
 * - "button-estimate-quote-back" is the "Send a request" option of the
 *   switch: it returns to the full request and keeps every value.
 * Stable test ids for the shared helpers: input-project, input-name,
 * input-phone, input-email, input-quote-files, quote-file-tile,
 * button-quote-callback, quote-form-success, quote-details-panel,
 * button-save-details, quote-details-saved.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { MessageCircle, MessageSquare, Phone } from "lucide-react";
import { PreferToTextLine } from "@/components/contact/PreferToTextLine";
import { AttachmentTile, type PickedFile } from "@/components/quote/AttachmentTile";
import { QuoteFollowUp } from "@/components/quote/QuoteFollowUp";
import { ERROR_CLASS, FIELD_CLASS, LABEL_CLASS, OUTLINE_ACTION_CLASS, PILL_CLASS } from "@/components/quote/quoteStyles";
import { WizardActionBar } from "@/components/estimate/wizard/WizardActionBar";
import { useKeyboardInset } from "@/components/estimate/wizard/useKeyboardInset";
import { useEstimateKeyboardFlag } from "@/components/estimate/wizard/useEstimateKeyboardFlag";
import { ConsultationAttempt } from "@/lib/consultationAttempt";
import { requireConsultationReceipt } from "@/lib/consultationReceipt";
import { consultationReferenceId } from "@/lib/consultationReferenceId";
import { clearConsultationSessionKey, consultationSessionKey } from "@/lib/consultationRetrySession";
import type { DetailsKey } from "@/lib/quoteUploads";
import { cn } from "@/lib/utils";
import { PHONE_VALIDATION_MESSAGE, phoneHasEnoughDigits } from "@/shared/phoneValidation";
import { SITE_CONFIG } from "@/shared/siteConfig";

export type QuoteMode = "request" | "callback";
type Mode = QuoteMode;
type Reach = "call" | "text" | "email";
type FieldKey = "name" | "phone" | "project" | "email";

const CALLBACK_PROJECT_TYPE = "Callback request";

const BEST_TIMES = ["Any time", "Morning", "Midday", "Afternoon"] as const;

const REACH_OPTIONS: ReadonlyArray<{ value: Reach; label: string }> = [
  { value: "call", label: "Call me" },
  { value: "text", label: "Text me" },
  { value: "email", label: "Email me" },
];

const FIELD_NAMES: Record<FieldKey, string> = {
  project: "what we can help with",
  name: "your name",
  phone: "your phone number",
  email: "a valid email",
};

/** Default reply channel: the site has a text line (PreferToTextLine), so a text. */
const DEFAULT_REACH: Reach = "text";

function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export interface QuoteAcceptedInfo {
  submissionId: string;
  replayed: boolean;
  projectType: string;
  requestKind: Mode;
}

export interface QuoteRequestFormProps {
  /** Prefix for stable field ids (useId can differ between server and client HTML). */
  idPrefix: string;
  /** "h2" shows the family heading ("Request a quote" / "Request a call"); null when the page H1 is the heading. */
  headingLevel?: "h2" | "h3" | null;
  /** Lead context prefix the old form sent in projectType ("built-ins: ..."). */
  context?: string;
  /** The quote surfaces sent the visitor's own words as the project type when no context applied. */
  freeTextProjectType?: boolean;
  /** Placeholder for "What can we help with?", e.g. "Which room, and what would you like to store?". */
  projectPlaceholder?: string;
  /** Project type to send when the visitor picks no room (an attached estimate, the style finder). */
  defaultProjectType?: string;
  /** The estimate already decided the project: Step 2 does not ask for a project type. */
  projectTypeLocked?: boolean;
  /** Prefill for the project field (the style finder). */
  defaultMessage?: string;
  /** A planning range is attached; say so plainly. */
  estimateAttached?: boolean;
  /** Extra payload built at send time (estimate, estimate record). */
  extraPayload?: (input: { notes: string; zip: string }) => Record<string, unknown>;
  /** sessionStorage key for this tab's draft; omit to keep nothing. */
  persistKey?: string;
  /** Dock the send button to the bottom of the screen (the /estimate page owns the screen). */
  dock?: boolean;
  /** Analytics hooks, so each surface keeps firing exactly what it fired before. */
  onFirstFocus?: () => void;
  onAccepted?: (info: QuoteAcceptedInfo) => void;
  onFailed?: () => void;
  /** Step 2 saved (counts only, for the lead_details_added event). */
  onDetailsSaved?: (counts: { fields: number; files: number }) => void;
  className?: string;
  /** Start in "Have us call you" (the contact page opens it from its own switch). */
  initialMode?: Mode;
  /** When set, choosing "Send a request" hands back to the page's own request form. */
  onRequestMode?: () => void;
}

interface Draft {
  mode?: Mode;
  name?: string;
  phone?: string;
  email?: string;
  project?: string;
  reach?: Reach;
  bestTime?: string;
  room?: string;
  zip?: string;
}

/** useLayoutEffect in the browser, useEffect on the server (no warning during SSR). */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Runs while the HTML is parsed, before hydration: if this tab holds a draft,
 * the fields stay hidden until React has put the saved values back, so nobody
 * sees (or types into) an empty form that is about to be refilled. Released
 * after 3 seconds whatever happens, so a failed script can never hide the form.
 */
function draftGateScript(key: string): string {
  return `try{var d=sessionStorage.getItem(${JSON.stringify(key)});if(d){var j=JSON.parse(d);if(j&&(j.name||j.phone||j.email||j.project)){var r=document.documentElement;r.setAttribute("data-quote-draft-pending","");setTimeout(function(){r.removeAttribute("data-quote-draft-pending")},3000)}}}catch(e){}`;
}

/**
 * "Send a request" | "Have us call you": two native radios styled as one
 * full-width switch, the active option filled. Also used above the contact
 * page's step-by-step form.
 */
export function QuoteModeSwitch({
  name,
  mode,
  onChange,
  hintId,
}: {
  name: string;
  mode: Mode;
  onChange: (mode: Mode) => void;
  hintId?: string;
}) {
  return (
    <fieldset className="grid grid-cols-2 gap-2" data-quote-mode-switch="">
      <legend className="sr-only">How would you like to start?</legend>
      {/* Test id kept from the four-step form's Back button (see the header comment). */}
      <label className={PILL_CLASS} data-testid="button-estimate-quote-back">
        <input
          type="radio"
          name={name}
          value="request"
          className="sr-only"
          checked={mode === "request"}
          onChange={() => onChange("request")}
          data-clarity-mask="True"
        />
        Send a request
      </label>
      <label className={PILL_CLASS} data-testid="button-quote-callback">
        <input
          type="radio"
          name={name}
          value="callback"
          className="sr-only"
          checked={mode === "callback"}
          onChange={() => onChange("callback")}
          aria-describedby={hintId}
          data-clarity-mask="True"
        />
        Have us call you
      </label>
    </fieldset>
  );
}

export function QuoteRequestForm({
  idPrefix,
  headingLevel = "h2",
  context,
  freeTextProjectType = false,
  projectPlaceholder,
  defaultProjectType = "",
  projectTypeLocked = false,
  defaultMessage = "",
  estimateAttached = false,
  extraPayload,
  persistKey,
  dock = false,
  onFirstFocus,
  onAccepted,
  onFailed,
  className,
  initialMode = "request",
  onRequestMode,
  onDetailsSaved,
}: QuoteRequestFormProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [reach, setReach] = useState<Reach>(DEFAULT_REACH);
  const [bestTime, setBestTime] = useState<string>(BEST_TIMES[0]);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [checked, setChecked] = useState(false);
  const [summary, setSummary] = useState("");
  /** "check": the list of missing fields (goes away once fixed); "send": a send or receipt problem (stays). */
  const [summaryKind, setSummaryKind] = useState<"check" | "send">("send");
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState<{
    firstName: string;
    kind: Mode;
    phone: string;
    bestTime: string;
    hasEmail: boolean;
    reach: Reach;
    detailsKey: DetailsKey | null;
    files: PickedFile[];
  } | null>(null);
  const [chatAvailable, setChatAvailable] = useState(false);
  const [restored, setRestored] = useState(!persistKey);
  const attemptRef = useRef<ConsultationAttempt | null>(null);
  if (!attemptRef.current) {
    attemptRef.current = new ConsultationAttempt(
      () => consultationSessionKey(consultationReferenceId),
      clearConsultationSessionKey,
    );
  }
  const startedRef = useRef(false);
  const summaryRef = useRef<HTMLParagraphElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);
  const keyboardInset = useKeyboardInset();
  useEstimateKeyboardFlag(dock);

  const ids = useMemo(
    () => ({
      heading: `${idPrefix}-heading`,
      projectQuestion: `${idPrefix}-project-question`,
      projectName: `${idPrefix}-project-name`,
      emailNote: `${idPrefix}-email-note`,
      name: `${idPrefix}-name`,
      phone: `${idPrefix}-phone`,
      project: `${idPrefix}-project`,
      email: `${idPrefix}-email`,
      bestTime: `${idPrefix}-best-time`,
      company: `${idPrefix}-company`,
      summary: `${idPrefix}-summary`,
      modeHint: `${idPrefix}-mode-hint`,
    }),
    [idPrefix],
  );

  // Late defaults (the style finder, an attached estimate) never overwrite typing.
  useEffect(() => {
    if (defaultMessage) setProject((current) => current || defaultMessage);
  }, [defaultMessage]);

  // Right after hydration, before anything re-renders: keep what the visitor
  // typed while the page was still loading (the server HTML is a working form,
  // and React's first update would otherwise reset those fields to empty), then
  // fill the rest from this tab's draft and release the pre-hydration gate.
  useIsomorphicLayoutEffect(() => {
    const typed = (id: string) => {
      const el = document.getElementById(id);
      return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : "";
    };
    const early = { name: typed(ids.name), phone: typed(ids.phone), email: typed(ids.email), project: typed(ids.project) };
    let draft: Draft = {};
    if (persistKey) {
      try {
        const raw = sessionStorage.getItem(persistKey);
        if (raw) draft = JSON.parse(raw) as Draft;
      } catch {
        /* storage unavailable; the form simply starts empty */
      }
    }
    if (draft.mode === "callback" || draft.mode === "request") setMode(draft.mode);
    if (early.name || draft.name) setName(early.name || draft.name || "");
    if (early.phone || draft.phone) setPhone(early.phone || draft.phone || "");
    if (early.email || draft.email) setEmail(early.email || draft.email || "");
    if (early.project || draft.project) setProject(early.project || draft.project || "");
    if (draft.reach === "call" || draft.reach === "text" || draft.reach === "email") setReach(draft.reach);
    if (draft.bestTime && (BEST_TIMES as readonly string[]).includes(draft.bestTime)) setBestTime(draft.bestTime);
    setRestored(true);
    // Once, on mount: ids and persistKey are fixed for a mounted form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restored) document.documentElement.removeAttribute("data-quote-draft-pending");
  }, [restored]);

  useEffect(() => {
    if (!persistKey || !restored || done) return;
    try {
      const draft: Draft = { mode, name, phone, email, project, reach, bestTime };
      sessionStorage.setItem(persistKey, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [persistKey, restored, done, mode, name, phone, email, project, reach, bestTime]);

  // Chat sits beside Call and Text only where the site assistant can open.
  useEffect(() => {
    const read = () => setChatAvailable(document.documentElement.dataset.assistantAvailable === "true");
    read();
    window.addEventListener("p5:assistant-availability", read);
    return () => window.removeEventListener("p5:assistant-availability", read);
  }, []);

  // Keep the focused field above the docked send button while the phone keyboard is open.
  useEffect(() => {
    if (!dock || keyboardInset <= 0) return;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !active.matches("input, textarea, select")) return;
    const header = document.querySelector("header, .site-header");
    const headerH = header ? header.getBoundingClientRect().height : 64;
    const usableBottom = window.innerHeight - keyboardInset - 96;
    const rect = active.getBoundingClientRect();
    if (rect.bottom > usableBottom || rect.top < headerH + 8) {
      window.scrollTo({ top: Math.max(0, rect.top + window.scrollY - headerH - 8), behavior: "instant" as ScrollBehavior });
    }
  }, [dock, keyboardInset]);

  const errors = useMemo(() => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!phoneHasEnoughDigits(phone.trim())) next.phone = PHONE_VALIDATION_MESSAGE;
    if (mode === "request") {
      if (!project.trim()) next.project = "Tell us a little about the project.";
      const trimmedEmail = email.trim();
      if (trimmedEmail && !emailLooksValid(trimmedEmail)) next.email = "Enter a valid email, or leave it blank.";
      else if (!trimmedEmail && reach === "email") next.email = "Enter your email so we can reply by email.";
    }
    return next;
  }, [mode, name, phone, project, email, reach]);

  // Visual order, so the first field needing attention is the one focused.
  const order: FieldKey[] = mode === "request" ? ["project", "name", "phone", "email"] : ["name", "phone"];
  const invalid = order.filter((key) => errors[key]);
  const ready = invalid.length === 0;
  const showError = (key: FieldKey) => Boolean(errors[key] && (checked || touched[key]));

  // Once the visitor has fixed what the summary asked for, the summary goes away.
  useEffect(() => {
    if (summary && summaryKind === "check" && checked && ready && !submitting) setSummary("");
  }, [summary, summaryKind, checked, ready, submitting]);

  /**
   * Inline errors appear on blur, a moment later: leaving a field by pressing
   * the send button would otherwise grow the form under the pointer between
   * mousedown and click, and the click would land beside the button.
   */
  const markTouched = useCallback((key: FieldKey) => {
    window.setTimeout(() => setTouched((t) => (t[key] ? t : { ...t, [key]: true })), 200);
  }, []);

  const markStarted = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    onFirstFocus?.();
  }, [onFirstFocus]);

  function projectTypeFor(kind: Mode): string {
    // Step 1 asks no project type: an estimate or the style finder may supply
    // one, otherwise the context or the visitor's own words, and Step 2 refines it.
    const chosen = defaultProjectType;
    if (kind === "callback") {
      if (chosen) return chosen;
      return context ? `${context}: ${CALLBACK_PROJECT_TYPE}` : CALLBACK_PROJECT_TYPE;
    }
    if (chosen) return context ? `${context}: ${chosen}` : chosen;
    // The quote surfaces always sent "context: what you need"; the consultation
    // surfaces sent a room value, and "other" when the visitor had none.
    if (context) return `${context}: ${project.trim()}`;
    return freeTextProjectType ? project.trim() : "other";
  }

  async function send() {
    const attempt = attemptRef.current!;
    if (attempt.busy || locked) return;
    const kind = mode;
    const trimmed = {
      name: name.trim(),
      phone: phone.trim(),
      email: kind === "request" ? email.trim() : "",
      project: kind === "request" ? project.trim() : "",
      zip: "",
    };
    const projectType = projectTypeFor(kind);
    const notes = trimmed.project;
    let submission: { id: string; body: string };
    try {
      submission = attempt.begin(
        { kind, ...trimmed, projectType, reach, bestTime },
        (metaEventId) => ({
          name: trimmed.name,
          phone: trimmed.phone,
          email: trimmed.email,
          zip: trimmed.zip,
          projectType,
          message: notes,
          companyWebsite,
          metaEventId,
          source: "consultation",
          requestKind: kind,
          preferredContact: kind === "callback" ? "call" : reach,
          bestTime: kind === "callback" ? bestTime : "",
          ...(kind === "request" ? extraPayload?.({ notes, zip: trimmed.zip }) : null),
        }),
      );
    } catch (error) {
      setSummary(error instanceof Error ? error.message : "Please call or text us.");
      return;
    }
    setSubmitting(true);
    setSummary("");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": submission.id },
        body: submission.body,
      });
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
        submissionId?: string;
        requestId?: string;
        detailsToken?: string;
      };
      if (!res.ok) {
        // Validation happens before anything is saved, so a 400 may be corrected and resent.
        if (res.status === 400) attempt.confirmed();
        if (res.status === 409) setLocked(true);
        setSummary(body.message || "Something went wrong. Please call or text us.");
        onFailed?.();
        return;
      }
      let receipt: ReturnType<typeof requireConsultationReceipt>;
      try {
        receipt = requireConsultationReceipt(body);
      } catch (error) {
        // Not locked: the attempt keeps its key and exact body, so sending again
        // is a safe replay the server recognises (lib/consultationAttempt.ts).
        setSummary(error instanceof Error ? error.message : "We could not confirm receipt. Please call or text us.");
        onFailed?.();
        return;
      }
      attempt.confirmed();
      if (persistKey) {
        try {
          sessionStorage.removeItem(persistKey);
        } catch {
          /* ignore */
        }
      }
      onAccepted?.({
        submissionId: receipt.submissionId || submission.id,
        replayed: Boolean(receipt.replayed),
        projectType,
        requestKind: kind,
      });
      setDone({
        firstName: trimmed.name.split(/\s+/)[0] ?? trimmed.name,
        kind,
        phone: trimmed.phone,
        bestTime,
        hasEmail: Boolean(trimmed.email),
        reach: kind === "callback" ? "call" : reach,
        detailsKey:
          typeof body.requestId === "string" && typeof body.detailsToken === "string"
            ? { requestId: body.requestId, token: body.detailsToken }
            : null,
        // Callback mode shows no tile; anything picked before switching stays behind.
        files: kind === "request" ? files : [],
      });
    } catch {
      setSummary(
        "We could not confirm receipt. Retry here with the same details, or call or text us. Keep this page open; after a refresh, contact us before sending again if receipt is still uncertain.",
      );
      onFailed?.();
    } finally {
      attempt.finish();
      setSubmitting(false);
    }
  }

  function onPrimary() {
    setChecked(true);
    setSummaryKind("send");
    if (!ready) {
      const names = invalid.map((key) => FIELD_NAMES[key]);
      setSummaryKind("check");
      setSummary(`Please add ${listJoin(names)}.`);
      const first = invalid[0];
      if (first) document.getElementById(ids[first])?.focus();
      return;
    }
    void send();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPrimary();
  }

  useEffect(() => {
    if (done) successRef.current?.focus({ preventScroll: false });
  }, [done]);

  useEffect(() => {
    if (summary) summaryRef.current?.scrollIntoView({ block: "nearest" });
  }, [summary]);

  const Heading = headingLevel ?? null;
  const headingText = mode === "callback" ? "Request a call" : "Request a quote";

  if (done) {
    return (
      <QuoteFollowUp
        ref={successRef}
        idPrefix={idPrefix}
        firstName={done.firstName}
        kind={done.kind}
        phone={done.phone}
        bestTime={done.bestTime}
        detailsKey={done.detailsKey}
        initialFiles={done.files}
        hasEmail={done.hasEmail}
        reach={done.reach}
        projectTypeLocked={projectTypeLocked}
        panelHeading={headingLevel === "h2" ? "h3" : headingLevel === "h3" ? "h4" : "h2"}
        onDetailsSaved={onDetailsSaved}
        className={className}
      />
    );
  }

  const describedBy = (key: FieldKey, hint?: string) =>
    [hint, showError(key) ? `${ids[key]}-error` : null].filter(Boolean).join(" ") || undefined;

  const fieldError = (key: FieldKey) => (
    <p id={`${ids[key]}-error`} aria-live="polite" className={cn(ERROR_CLASS, !showError(key) && "hidden")}>
      {showError(key) ? errors[key] : ""}
    </p>
  );

  const disabled = submitting || locked;
  const sendLabel = mode === "callback" ? "Request a call" : "Send my request";

  const talk = (
    <div className="space-y-2" data-quote-talk="">
      <p className="text-sm font-medium text-muted-foreground">Prefer to talk?</p>
      <a href={SITE_CONFIG.phoneHref} className={OUTLINE_ACTION_CLASS}>
        <Phone className="h-4 w-4" aria-hidden="true" />
        Call {SITE_CONFIG.phone}
      </a>
      <div className={cn("grid gap-2", chatAvailable && "grid-cols-2")}>
        <a href={SITE_CONFIG.phoneSmsHref} className={OUTLINE_ACTION_CLASS} aria-label={`Text us at ${SITE_CONFIG.phone}`}>
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Text us
        </a>
        {chatAvailable ? (
          <button
            type="button"
            className={OUTLINE_ACTION_CLASS}
            onClick={() => window.dispatchEvent(new Event("p5:assistant-open"))}
            data-testid="button-quote-chat"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Chat
          </button>
        ) : null}
      </div>
    </div>
  );

  const nameField = (
    <div>
      <label htmlFor={ids.name} className={LABEL_CLASS}>
        Name
      </label>
      <input
        id={ids.name}
        name="name"
        autoComplete="name"
        className={FIELD_CLASS}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => markTouched("name")}
        aria-invalid={showError("name") || undefined}
        aria-describedby={describedBy("name")}
        aria-required="true"
        disabled={disabled}
        data-testid="input-name"
        data-clarity-mask="True"
      />
      {fieldError("name")}
    </div>
  );

  const phoneField = (
    <div>
      <label htmlFor={ids.phone} className={LABEL_CLASS}>
        Phone
      </label>
      <input
        id={ids.phone}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        className={FIELD_CLASS}
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        onBlur={() => markTouched("phone")}
        aria-invalid={showError("phone") || undefined}
        aria-describedby={describedBy("phone")}
        aria-required="true"
        disabled={disabled}
        data-testid="input-phone"
        data-clarity-mask="True"
      />
      {fieldError("phone")}
    </div>
  );

  return (
    // data-family-bar-yield: the family mobile bar steps aside while this form is on screen
    // (components/family/MobileActionBar.tsx); QuoteFollowUp carries it after sending.
    <div className={cn("space-y-4", className)} data-quote-form="" data-quote-mode={mode} data-family-bar-yield="">
      {persistKey ? <script dangerouslySetInnerHTML={{ __html: draftGateScript(persistKey) }} /> : null}
      {Heading ? (
        <Heading
          id={ids.heading}
          tabIndex={-1}
          data-quote-form-heading=""
          className="text-2xl font-normal leading-tight text-foreground outline-none md:text-[1.75rem]"
        >
          {headingText}
        </Heading>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="space-y-4 estimate-quote-form"
        data-clarity-mask="True"
        data-c10-estimate-quote=""
        data-quote-step={mode === "callback" ? "callback" : (invalid[0] ?? "project")}
        aria-labelledby={Heading ? ids.heading : undefined}
        aria-label={Heading ? undefined : headingText}
        aria-busy={submitting}
        noValidate
        onFocus={markStarted}
      >
        <QuoteModeSwitch
          name={`${idPrefix}-mode`}
          mode={mode}
          onChange={(next) => (next === "request" && onRequestMode ? onRequestMode() : setMode(next))}
          hintId={ids.modeHint}
        />
        <p id={ids.modeHint} className={cn("text-sm text-muted-foreground", mode !== "callback" && "sr-only")}>
          Leave your name and number and we will call you.
        </p>

        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor={ids.company}>Company website</label>
          <input
            id={ids.company}
            name="companyWebsite"
            tabIndex={-1}
            autoComplete="off"
            value={companyWebsite}
            onChange={(event) => setCompanyWebsite(event.target.value)}
            data-clarity-mask="True"
          />
        </div>

        <div className="space-y-4" data-quote-fields="">
          {mode === "callback" ? (
            <>
              {nameField}
              {phoneField}
              <div>
                <label htmlFor={ids.bestTime} className={LABEL_CLASS}>
                  Best time to call <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <select
                  id={ids.bestTime}
                  name="bestTime"
                  className={cn(FIELD_CLASS, "pr-8")}
                  value={bestTime}
                  onChange={(event) => setBestTime(event.target.value)}
                  disabled={disabled}
                  data-clarity-mask="True"
                >
                  {BEST_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                {/* Shown as the question; the hidden "Project" keeps the field's
                    exact accessible name for the shared entry checks. */}
                <label id={ids.projectQuestion} htmlFor={ids.project} className={LABEL_CLASS}>
                  What can we help with?
                </label>
                <span id={ids.projectName} className="sr-only">
                  Project
                </span>
                <textarea
                  id={ids.project}
                  name="project"
                  rows={3}
                  autoComplete="off"
                  placeholder={projectPlaceholder ?? "For example: new kitchen cabinets with an island, a bathroom vanity, or a pantry wall"}
                  className={cn(FIELD_CLASS, "h-auto min-h-[6.5rem] resize-y py-3 leading-snug")}
                  value={project}
                  onChange={(event) => setProject(event.target.value)}
                  onBlur={() => markTouched("project")}
                  aria-labelledby={`${ids.projectQuestion} ${ids.projectName}`}
                  aria-invalid={showError("project") || undefined}
                  aria-describedby={describedBy("project", estimateAttached ? `${ids.project}-estimate` : undefined)}
                  aria-required="true"
                  disabled={disabled}
                  data-testid="input-project"
                  data-clarity-mask="True"
                />
                {estimateAttached ? (
                  <p id={`${ids.project}-estimate`} className="mt-1.5 text-sm text-muted-foreground">
                    Your planning range is attached to this request.
                  </p>
                ) : null}
                {fieldError("project")}
              </div>

              <AttachmentTile idPrefix={idPrefix} files={files} onChange={setFiles} disabled={disabled} />

              {nameField}
              {phoneField}

              <div>
                <div className="mb-1.5 flex items-baseline gap-2">
                  <label htmlFor={ids.email} className="block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <span id={ids.emailNote} className="text-sm text-muted-foreground">
                    {reach === "email" ? "Needed to reply by email" : "Optional"}
                  </span>
                </div>
                <input
                  id={ids.email}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className={FIELD_CLASS}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => markTouched("email")}
                  aria-invalid={showError("email") || undefined}
                  aria-describedby={describedBy("email", ids.emailNote)}
                  aria-required={reach === "email" ? "true" : undefined}
                  disabled={disabled}
                  data-testid="input-email"
                  data-clarity-mask="True"
                />
                {fieldError("email")}
              </div>

              <fieldset>
                <legend className={LABEL_CLASS}>How should we reach you?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {REACH_OPTIONS.map((option) => (
                    <label key={option.value} className={PILL_CLASS}>
                      <input
                        type="radio"
                        name={`${idPrefix}-reach`}
                        value={option.value}
                        className="sr-only"
                        checked={reach === option.value}
                        onChange={() => setReach(option.value)}
                        disabled={disabled}
                        data-clarity-mask="True"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </div>

        {summary ? (
          <p
            ref={summaryRef}
            id={ids.summary}
            role="alert"
            className="border-l-2 border-destructive pl-3 text-sm leading-snug text-destructive"
          >
            {summary}
          </p>
        ) : null}

        {/* Phones and tablets: the talk options sit directly above the send button. */}
        <div className="lg:hidden">{talk}</div>

        <WizardActionBar
          pinned={dock}
          dockWhenFormInView={dock}
          ownsBottomEdge={dock}
          onPrimary={onPrimary}
          primaryLabel={sendLabel}
          primaryDisabled={locked}
          busy={submitting}
          busyLabel="Sending…"
          primaryIcon="none"
          primaryTestId={ready ? "button-estimate-quote-submit" : "button-estimate-quote-continue"}
          footnote={
            <p className="text-center text-sm text-muted-foreground lg:text-right">We answer your questions and help you work out the next step.</p>
          }
          className={dock ? undefined : "mt-2"}
        >
          {/* Wide screens: the talk options sit beside the send button. */}
          <div className="hidden lg:block lg:w-[18rem] lg:flex-none">{talk}</div>
        </WizardActionBar>

        <p className="text-sm leading-snug text-muted-foreground">
          No obligation. <PreferToTextLine /> See our{" "}
          <Link href="/privacy-policy" prefetch={false} className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
