"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackGoogleAdsLeadOnce } from "@/lib/analytics/track";
import { requireConsultationReceipt } from "@/lib/consultationReceipt";
import { consultationReferenceId } from "@/lib/consultationReferenceId";
import { clearConsultationSessionKey, consultationSessionKey } from "@/lib/consultationRetrySession";
import { isAllowedLeadFile, LEAD_UPLOAD_MAX_BYTES, LEAD_UPLOAD_MAX_FILES, leadUploadError } from "@/lib/leadAttachments";
import { PHONE_VALIDATION_MESSAGE, phoneHasEnoughDigits } from "@/shared/phoneValidation";

const TEL_HREF = "tel:+12084771169";
function focusErrorSummary(node: HTMLParagraphElement | null) { node?.focus(); }

function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function prepareLeadFile(file: File): Promise<File> {
  const lower = file.name.toLowerCase();
  const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
  if (isPdf) {
    if (file.size > LEAD_UPLOAD_MAX_BYTES) throw new Error("Each PDF must be under 6 MB.");
    return file;
  }
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    if (file.size > LEAD_UPLOAD_MAX_BYTES) {
      throw new Error("That photo is too large to attach. Try a smaller JPG or a screenshot.");
    }
    return file;
  }
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((value) => resolve(value), "image/jpeg", 0.82));
  if (!blob) return file;
  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
}

export function KitchenCabinetsQuoteForm({
  context,
  projectPrompt,
  submitLabel = "Request My Free Estimate",
  idPrefix = "kc",
  compact = false,
}: {
  context?: "built-ins" | "builder-contractor" | "cabinet-project";
  projectPrompt?: string;
  submitLabel?: string;
  idPrefix?: string;
  compact?: boolean;
} = {}) {
  const fieldId = (name: string) => `${idPrefix}-${name}`;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);
  const requestRef = useRef<{ id: string; body: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = [...files];
    try {
      for (const file of Array.from(list)) {
        if (!isAllowedLeadFile(file)) {
          setError("Attach a photo, plan, or PDF.");
          return;
        }
        const prepared = await prepareLeadFile(file);
        next.push(prepared);
      }
      const picked = next.slice(0, LEAD_UPLOAD_MAX_FILES);
      const problem = leadUploadError(picked.map((file) => ({ name: file.name, type: file.type, size: file.size })));
      if (problem) {
        setError(problem);
        return;
      }
      setFiles(picked);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That file could not be attached.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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
    const fileProblem = leadUploadError(files.map((file) => ({ name: file.name, type: file.type, size: file.size })));
    if (fileProblem) {
      setError(fileProblem);
      return;
    }

    const fileKey = files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join("|");
    if (!requestRef.current) {
      const id = consultationSessionKey(consultationReferenceId);
      if (!id) { setError("We could not prepare a safe request reference. Please call or text us."); return; }
      requestRef.current = { id, body: JSON.stringify({
        name: trimmedName, phone: trimmedPhone, email: trimmedEmail,
        projectType: context ? `${context}: ${trimmedProject}` : trimmedProject,
        message: trimmedProject, companyWebsite, metaEventId: id, source: "consultation", fileKey,
      }) };
    }
    const submission = requestRef.current;
    const currentBody = JSON.stringify({
      name: trimmedName, phone: trimmedPhone, email: trimmedEmail,
      projectType: context ? `${context}: ${trimmedProject}` : trimmedProject,
      message: trimmedProject, companyWebsite, metaEventId: submission.id, source: "consultation", fileKey,
    });
    if (currentBody !== submission.body) {
      setError("Your earlier request is still unconfirmed. Restore the original details to retry, or call or text us before sending changed details.");
      return;
    }
    const metaEventId = submission.id;
    const projectType = context ? `${context}: ${trimmedProject}` : trimmedProject;
    lock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const headers: Record<string, string> = { "Idempotency-Key": submission.id };
      let body: BodyInit;
      if (files.length) {
        const form = new FormData();
        form.set("name", trimmedName);
        form.set("phone", trimmedPhone);
        form.set("email", trimmedEmail);
        form.set("projectType", projectType);
        form.set("message", trimmedProject);
        form.set("companyWebsite", companyWebsite);
        form.set("metaEventId", metaEventId);
        form.set("source", "consultation");
        for (const file of files) form.append("files", file, file.name);
        body = form;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          name: trimmedName, phone: trimmedPhone, email: trimmedEmail,
          projectType, message: trimmedProject, companyWebsite, metaEventId, source: "consultation",
        });
      }
      const res = await fetch("/api/consultation", { method: "POST", headers, body });
      const responseBody = (await res.json().catch(() => ({}))) as {
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
        setError(responseBody.message || "Something went wrong. Please call or text us.");
        return;
      }
      let saved;
      try { saved = requireConsultationReceipt(responseBody); } catch {
        setUnconfirmed(true);
        setError("We could not confirm receipt. Please call or text us before submitting again.");
        return;
      }
      if (!saved.accepted) {
        setUnconfirmed(true);
        setError("We could not confirm receipt. Please call or text us before submitting again.");
        return;
      }
      if (responseBody.accepted) {
        clearConsultationSessionKey(submission.id);
        if (!saved.replayed) trackGoogleAdsLeadOnce(responseBody.submissionId || metaEventId, { projectType: context ?? "kitchen" });
      }
      setReceipt(responseBody.requestId || responseBody.submissionId || "");
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

  const fieldGap = compact ? "space-y-1" : "space-y-2";
  const labelClass = compact ? "text-xs" : undefined;

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-2" : "space-y-4"} data-clarity-mask="True" aria-busy={submitting} noValidate>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={fieldId("company")}>Company website</label>
        <input
          id={fieldId("company")}
          data-clarity-mask="True"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(event) => setCompanyWebsite(event.target.value)}
        />
      </div>
      <div className={compact ? "grid grid-cols-2 gap-2" : "contents"}>
        <div className={fieldGap}>
          <Label htmlFor={fieldId("name")} className={labelClass}>Name</Label>
          <Input
            id={fieldId("name")}
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={submitting || unconfirmed || requestRef.current !== null}
            required
          />
        </div>
        <div className={fieldGap}>
          <Label htmlFor={fieldId("phone")} className={labelClass}>Phone</Label>
          <Input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="Best number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={submitting || unconfirmed || requestRef.current !== null}
            required
          />
        </div>
      </div>
      <div className={compact ? "grid grid-cols-2 gap-2" : "contents"}>
        <div className={fieldGap}>
          <Label htmlFor={fieldId("email")} className={labelClass}>Email</Label>
          <Input
            id={fieldId("email")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting || unconfirmed || requestRef.current !== null}
            required
          />
        </div>
        <div className={fieldGap}>
          <Label htmlFor={fieldId("project")} className={labelClass}>Project</Label>
          <Input
            id={fieldId("project")}
            name="project"
            placeholder={projectPrompt ?? (compact ? "Kitchen, vanity, built-in" : "e.g. full kitchen, bathroom vanity, built-in shelving")}
            value={project}
            onChange={(event) => setProject(event.target.value)}
            disabled={submitting || unconfirmed || requestRef.current !== null}
            required
          />
        </div>
      </div>
      {compact ? (
        <div className={fieldGap}>
          <Label htmlFor={fieldId("files")} className={labelClass}>Photo, plan, or file (optional)</Label>
          <input
            ref={fileRef}
            id={fieldId("files")}
            name="files"
            type="file"
            accept="image/*,application/pdf,.heic,.heif"
            multiple
            className="lead-file block w-full text-sm"
            onChange={(event) => { void onPickFiles(event.target.files); }}
            disabled={submitting || unconfirmed || requestRef.current !== null}
            data-clarity-mask="True"
          />
          {files.length > 0 ? (
            <ul className="flex flex-wrap gap-2 p-0 text-xs">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`} className="inline-flex items-center gap-2">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Up to 3 photos, plans, or PDFs. You can send this without a file.</p>
          )}
        </div>
      ) : null}
      {error ? (
        <p ref={focusErrorSummary} tabIndex={-1} className="text-sm text-destructive" role="alert">
          {error}{" "}<a href={TEL_HREF} className="underline">Call Us</a>{" or "}<a href="sms:+12084771169" className="underline">Text Us</a>
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting || unconfirmed}
        className="lead-submit inline-flex min-h-12 w-full items-center justify-center rounded-md px-6 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {submitting ? "Sending request…" : submitLabel}
      </button>
      {compact ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          We use your name, phone, email, project note, and any file only to reply about this request. We don&apos;t sell your information.{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2">Privacy Policy</Link>. No obligation.
        </p>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Keep this page open until your request is confirmed. If receipt is uncertain, retry here or call or text us. If you already sent a request and then refreshed or left this page without confirmation, contact us before sending again. When browser storage is available, we retain only a random request reference for this tab session, not your entered details.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;ll use your name, phone number, email, and project details only to call or text you about your estimate. We don&apos;t sell your information. See our{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            . No obligation.
          </p>
        </>
      )}
    </form>
  );
}
