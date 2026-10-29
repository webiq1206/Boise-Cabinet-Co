"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { PreferToTextLine } from "@/components/contact/PreferToTextLine";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackGoogleAdsLeadOnce } from "@/lib/analytics/track";
import { requireConsultationReceipt } from "@/lib/consultationReceipt";
import { consultationReferenceId } from "@/lib/consultationReferenceId";
import { clearConsultationSessionKey, consultationSessionKey } from "@/lib/consultationRetrySession";
import { PHONE_VALIDATION_MESSAGE, phoneHasEnoughDigits } from "@/shared/phoneValidation";
import { WizardActionBar } from "@/components/estimate/wizard/WizardActionBar";
import { useKeyboardInset } from "@/components/estimate/wizard/useKeyboardInset";
import { useEstimateKeyboardFlag } from "@/components/estimate/wizard/useEstimateKeyboardFlag";

const TEL_HREF = "tel:+12084771169";
function focusErrorSummary(node: HTMLParagraphElement | null) {
  node?.focus();
}

function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** C10: one keyboard field per step so the dock clears the software keyboard. */
type QuoteStep = "name" | "phone" | "email" | "project";
const QUOTE_STEPS: readonly QuoteStep[] = ["name", "phone", "email", "project"];
const QUOTE_STORAGE_KEY = "brc_estimate_quote_v1";

export function KitchenCabinetsQuoteForm({
  context,
  projectPrompt,
  submitLabel = "Request My Free Estimate",
}: {
  context?: "built-ins" | "builder-contractor" | "cabinet-project";
  projectPrompt?: string;
  submitLabel?: string;
} = {}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const lock = useRef(false);
  const requestRef = useRef<{ id: string; body: string } | null>(null);
  const keyboardInset = useKeyboardInset();
  useEstimateKeyboardFlag(true);

  const stepId = QUOTE_STEPS[Math.min(stepIndex, QUOTE_STEPS.length - 1)] ?? "name";
  const isLast = stepIndex >= QUOTE_STEPS.length - 1;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(QUOTE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        step?: number;
        name?: string;
        phone?: string;
        email?: string;
        project?: string;
      };
      if (typeof parsed.step === "number" && parsed.step >= 0) {
        setStepIndex(Math.min(parsed.step, QUOTE_STEPS.length - 1));
      }
      if (parsed.name) setName(parsed.name);
      if (parsed.phone) setPhone(parsed.phone);
      if (parsed.email) setEmail(parsed.email);
      if (parsed.project) setProject(parsed.project);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        QUOTE_STORAGE_KEY,
        JSON.stringify({ step: stepIndex, name, phone, email, project }),
      );
    } catch {
      /* ignore */
    }
  }, [stepIndex, name, phone, email, project]);

  useEffect(() => {
    if (keyboardInset <= 0) return;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    if (!active.matches("input, textarea")) return;
    const header = document.querySelector("header, .site-header");
    const headerH = header ? header.getBoundingClientRect().height : 64;
    const usableBottom = window.innerHeight - keyboardInset - 96;
    const targetTop = headerH + 8;
    const rect = active.getBoundingClientRect();
    if (rect.bottom > usableBottom || rect.top < targetTop) {
      const abs = rect.top + window.scrollY;
      window.scrollTo({ top: Math.max(0, abs - targetTop), behavior: "instant" as ScrollBehavior });
      const after = active.getBoundingClientRect();
      if (after.bottom > usableBottom) {
        window.scrollTo({
          top: window.scrollY + (after.bottom - usableBottom),
          behavior: "instant" as ScrollBehavior,
        });
      }
    }
  }, [keyboardInset, stepIndex]);

  function validateCurrentStep(): string | null {
    if (stepId === "name" && name.trim().length < 2) return "Enter your name.";
    if (stepId === "phone" && !phoneHasEnoughDigits(phone.trim())) return PHONE_VALIDATION_MESSAGE;
    if (stepId === "email" && !emailLooksValid(email.trim())) return "Enter a valid email.";
    if (stepId === "project" && !project.trim()) return "Tell us a little about the project.";
    return null;
  }

  async function submitLead() {
    if (lock.current) return;
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedProject = project.trim();
    if (trimmedName.length < 2) {
      setError("Enter your name.");
      setStepIndex(0);
      return;
    }
    if (!phoneHasEnoughDigits(trimmedPhone)) {
      setError(PHONE_VALIDATION_MESSAGE);
      setStepIndex(1);
      return;
    }
    if (!emailLooksValid(trimmedEmail)) {
      setError("Enter a valid email.");
      setStepIndex(2);
      return;
    }
    if (!trimmedProject) {
      setError("Tell us a little about the project.");
      setStepIndex(3);
      return;
    }

    if (!requestRef.current) {
      const id = consultationSessionKey(consultationReferenceId);
      if (!id) {
        setError("We could not prepare a safe request reference. Please call or text us.");
        return;
      }
      requestRef.current = {
        id,
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          projectType: context ? `${context}: ${trimmedProject}` : trimmedProject,
          message: trimmedProject,
          companyWebsite,
          metaEventId: id,
          source: "consultation",
        }),
      };
    }
    const submission = requestRef.current;
    const currentBody = JSON.stringify({
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      projectType: context ? `${context}: ${trimmedProject}` : trimmedProject,
      message: trimmedProject,
      companyWebsite,
      metaEventId: submission.id,
      source: "consultation",
    });
    if (currentBody !== submission.body) {
      setError(
        "Your earlier request is still unconfirmed. Restore the original details to retry, or call or text us before sending changed details.",
      );
      return;
    }
    const metaEventId = submission.id;
    lock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": submission.id },
        body: submission.body,
      });
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
        accepted?: boolean;
        submissionId?: string;
        requestId?: string;
      };
      if (!res.ok) {
        lock.current = false;
        if (res.status === 400) {
          clearConsultationSessionKey(submission.id);
          requestRef.current = null;
        }
        if (res.status === 409) setUnconfirmed(true);
        setError(body.message || "Something went wrong. Please call or text us.");
        return;
      }
      let saved;
      try {
        saved = requireConsultationReceipt(body);
      } catch {
        setUnconfirmed(true);
        setError("We could not confirm receipt. Please call or text us before submitting again.");
        return;
      }
      if (!saved.accepted) {
        setUnconfirmed(true);
        setError("We could not confirm receipt. Please call or text us before submitting again.");
        return;
      }
      if (body.accepted) {
        clearConsultationSessionKey(submission.id);
        try {
          sessionStorage.removeItem(QUOTE_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        if (!saved.replayed) {
          trackGoogleAdsLeadOnce(body.submissionId || metaEventId, {
            projectType: context ?? "kitchen",
          });
        }
      }
      setReceipt(body.requestId || body.submissionId || "");
      setDone(true);
    } catch {
      lock.current = false;
      setError(
        "We could not confirm receipt. Retry here with the same details, or call or text us. Keep this page open; after a refresh, contact us before sending again if receipt is still uncertain.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function onPrimary() {
    const stepError = validateCurrentStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError("");
    if (!isLast) {
      setStepIndex((i) => Math.min(i + 1, QUOTE_STEPS.length - 1));
      return;
    }
    void submitLead();
  }

  function onBack() {
    setError("");
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPrimary();
  }

  if (done) {
    return (
      <p className="text-base leading-relaxed text-foreground" role="status" aria-live="polite">
        Your request has been received.{receipt ? ` Your reference is ${receipt}.` : ""} Prefer to
        speak with us?{" "}
        <a href={TEL_HREF} className="underline underline-offset-2">
          Call (208) 477-1169
        </a>
        .
      </p>
    );
  }

  const locked = submitting || unconfirmed || requestRef.current !== null;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 estimate-quote-form"
      data-clarity-mask="True"
      data-c10-estimate-quote=""
      data-quote-step={stepId}
      aria-busy={submitting}
      noValidate
    >
      <p className="text-xs text-muted-foreground" data-testid="estimate-quote-progress">
        Step {stepIndex + 1} of {QUOTE_STEPS.length}
      </p>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="kc-company">Company website</label>
        <input
          id="kc-company"
          data-clarity-mask="True"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(event) => setCompanyWebsite(event.target.value)}
        />
      </div>

      {stepId === "name" && (
        <div className="space-y-1.5">
          <Label htmlFor="kc-name">Name</Label>
          <Input
            id="kc-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            className="h-12"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={locked}
            required
          />
        </div>
      )}
      {stepId === "phone" && (
        <div className="space-y-1.5">
          <Label htmlFor="kc-phone">Phone</Label>
          <Input
            id="kc-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="Best number"
            className="h-12"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={locked}
            required
          />
        </div>
      )}
      {stepId === "email" && (
        <div className="space-y-1.5">
          <Label htmlFor="kc-email">Email</Label>
          <Input
            id="kc-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your email"
            className="h-12"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={locked}
            required
          />
        </div>
      )}
      {stepId === "project" && (
        <div className="space-y-1.5">
          <Label htmlFor="kc-project">Project</Label>
          <Input
            id="kc-project"
            name="project"
            placeholder={projectPrompt ?? "e.g. full kitchen, vanity, built-ins"}
            className="h-12"
            value={project}
            onChange={(event) => setProject(event.target.value)}
            disabled={locked}
            required
          />
        </div>
      )}

      {error ? (
        <p ref={focusErrorSummary} tabIndex={-1} className="text-sm text-destructive" role="alert">
          {error}{" "}
          <a href={TEL_HREF} className="underline">
            Call Us
          </a>
          {" or "}
          <a href="sms:+12084771169" className="underline">
            Text Us
          </a>
        </p>
      ) : null}

      <WizardActionBar
        onBack={stepIndex > 0 ? onBack : undefined}
        onPrimary={onPrimary}
        primaryLabel={isLast ? submitLabel : "Continue"}
        primaryDisabled={submitting || unconfirmed}
        busy={submitting}
        busyLabel="Sending request…"
        primaryIcon={isLast ? "none" : "arrow"}
        primaryTestId={isLast ? "button-estimate-quote-submit" : "button-estimate-quote-continue"}
        backTestId="button-estimate-quote-back"
      />

      <p className="text-sm leading-snug text-muted-foreground">
        No obligation. We reply within one business day.{" "}<PreferToTextLine /> See our{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
