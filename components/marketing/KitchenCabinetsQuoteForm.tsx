"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackGoogleAdsLeadOnce } from "@/lib/analytics/track";
import { requireConsultationReceipt } from "@/lib/consultationReceipt";
import { consultationReferenceId } from "@/lib/consultationReferenceId";
import { clearConsultationSessionKey, consultationSessionKey } from "@/lib/consultationRetrySession";
import { PHONE_VALIDATION_MESSAGE, phoneHasEnoughDigits } from "@/shared/phoneValidation";

const TEL_HREF = "tel:+12084771169";
function focusErrorSummary(node: HTMLParagraphElement | null) { node?.focus(); }

function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function KitchenCabinetsQuoteForm({context,projectPrompt,submitLabel="Request My Free Estimate"}:{context?:"built-ins"|"builder-contractor"|"cabinet-project";projectPrompt?:string;submitLabel?:string} = {}) {
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
  const lock = useRef(false);
  const requestRef = useRef<{ id: string; body: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedProject = project.trim();
    if (trimmedName.length < 2) {
      setError("Enter your name.");
      return;
    }
    if (!phoneHasEnoughDigits(trimmedPhone)) {
      setError(PHONE_VALIDATION_MESSAGE);
      return;
    }
    if (!emailLooksValid(trimmedEmail)) {
      setError("Enter a valid email.");
      return;
    }
    if (!trimmedProject) {
      setError("Tell us a little about the project.");
      return;
    }

    if (!requestRef.current) {
      const id = consultationSessionKey(consultationReferenceId);
      if (!id) { setError("We could not prepare a safe request reference. Please call or text us."); return; }
      requestRef.current = { id, body: JSON.stringify({
        name: trimmedName, phone: trimmedPhone, email: trimmedEmail,
        projectType: context ? `${context}: ${trimmedProject}` : trimmedProject,
        message: trimmedProject, companyWebsite, metaEventId: id, source: "consultation",
      }) };
    }
    // Freeze this inquiry across an uncertain response. Retrying uses the same key and body.
    const submission = requestRef.current;
    const currentBody = JSON.stringify({
      name: trimmedName, phone: trimmedPhone, email: trimmedEmail,
      projectType: context ? `${context}: ${trimmedProject}` : trimmedProject,
      message: trimmedProject, companyWebsite, metaEventId: submission.id, source: "consultation",
    });
    if (currentBody !== submission.body) {
      setError("Your earlier request is still unconfirmed. Restore the original details to retry, or call or text us before sending changed details.");
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
        // Validation rejects before persistence, so the visitor can correct the form.
        if (res.status === 400) {
          clearConsultationSessionKey(submission.id);
          requestRef.current = null;
        }
        if (res.status === 409) setUnconfirmed(true);
        setError(body.message || "Something went wrong. Please call or text us.");
        return;
      }
      let saved;
      try { saved = requireConsultationReceipt(body); } catch {
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
        if (!saved.replayed) trackGoogleAdsLeadOnce(body.submissionId || metaEventId, { projectType: context ?? "kitchen" });
      }
      setReceipt(body.requestId || body.submissionId || "");
      setDone(true);
    } catch {
      lock.current = false;
      setError("We could not confirm receipt. Retry here with the same details, or call or text us. Keep this page open; after a refresh, contact us before sending again if receipt is still uncertain.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p className="text-base leading-relaxed text-foreground" role="status" aria-live="polite">
        Your request has been received.{receipt ? ` Your reference is ${receipt}.` : ""} Prefer to speak with us?{" "}
        <a href={TEL_HREF} className="underline underline-offset-2">
          Call (208) 477-1169
        </a>
        .
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 estimate-quote-form"
      data-clarity-mask="True"
      data-c10-estimate-quote=""
      aria-busy={submitting}
      noValidate
    >
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
          disabled={submitting || unconfirmed || requestRef.current !== null}
          required
        />
      </div>
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
          disabled={submitting || unconfirmed || requestRef.current !== null}
          required
        />
      </div>
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
          disabled={submitting || unconfirmed || requestRef.current !== null}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kc-project">Project</Label>
        <Input
          id="kc-project"
          name="project"
          placeholder={projectPrompt ?? "e.g. full kitchen, vanity, built-ins"}
          className="h-12"
          value={project}
          onChange={(event) => setProject(event.target.value)}
          disabled={submitting || unconfirmed || requestRef.current !== null}
          required
        />
      </div>
      {error ? (
        <p ref={focusErrorSummary} tabIndex={-1} className="text-sm text-destructive" role="alert">
          {error}{" "}<a href={TEL_HREF} className="underline">Call Us</a>{" or "}<a href="sms:+12084771169" className="underline">Text Us</a>
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting || unconfirmed}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {submitting ? "Sending request…" : submitLabel}
      </button>
      <p className="text-sm leading-snug text-muted-foreground">
        No obligation. We reply within one business day. See our{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
