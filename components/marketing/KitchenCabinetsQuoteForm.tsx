"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackGoogleAdsLeadOnce } from "@/lib/analytics/track";
import { consultationReferenceId } from "@/lib/consultationReferenceId";
import { PHONE_VALIDATION_MESSAGE, phoneHasEnoughDigits } from "@/shared/phoneValidation";

const TEL_HREF = "tel:+12084771169";

function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function KitchenCabinetsQuoteForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const lock = useRef(false);

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

    lock.current = true;
    setError("");
    const metaEventId = consultationReferenceId();
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          projectType: trimmedProject,
          message: trimmedProject,
          companyWebsite,
          metaEventId,
          source: "consultation",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
        accepted?: boolean;
        submissionId?: string;
      };
      if (!res.ok) {
        lock.current = false;
        setError(body.message || "Something went wrong. Please call or text us.");
        return;
      }
      if (body.accepted) {
        trackGoogleAdsLeadOnce(body.submissionId || metaEventId, { projectType: "kitchen" });
      }
      setDone(true);
    } catch {
      lock.current = false;
      setError("Something went wrong. Please call or text us.");
    }
  }

  if (done) {
    return (
      <p className="text-base leading-relaxed text-foreground" role="status" aria-live="polite">
        Thanks, we got it. We&apos;ll call or text you during business hours. Need us sooner?{" "}
        <a href={TEL_HREF} className="underline underline-offset-2">
          Call (208) 477-1169
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" data-clarity-mask="True" noValidate>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="kc-company">Company website</label>
        <input
          id="kc-company"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(event) => setCompanyWebsite(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kc-name">Name</Label>
        <Input
          id="kc-name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kc-phone">Phone</Label>
        <Input
          id="kc-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="Best number for a call or text"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kc-email">Email</Label>
        <Input
          id="kc-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kc-project">Project</Label>
        <Input
          id="kc-project"
          name="project"
          placeholder="e.g. full kitchen, new island, replace upper cabinets"
          value={project}
          onChange={(event) => setProject(event.target.value)}
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="inline-flex min-h-14 w-full items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Get My Free Estimate
      </button>
      <p className="text-sm leading-relaxed text-muted-foreground">
        We&apos;ll use your name, phone number, email and project details only to call or text you about your estimate. We don&apos;t sell your information. See our{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        . No obligation.
      </p>
    </form>
  );
}
