"use client";

/**
 * What the visitor sees once the request is saved (family quote form v2):
 *
 * 1. The confirmation, first and unmistakable: "Thanks, {first name}. We have
 *    your request." with what happens next and a call link.
 * 2. Their Step 1 files uploading, each with its own state. A file that fails
 *    says so by name and offers "Try again" or texting it; the request itself
 *    is already saved and never depends on an upload.
 * 3. Step 2, "Help us prepare (optional)": a few optional details that add to
 *    the SAME request (/api/consultation/details with the request's details
 *    token). Never re-asks what Step 1 has. Skipping needs no action.
 *
 * Analytics: Step 1 already fired the one conversion; saving Step 2 fires
 * `lead_details_added` with counts only, never what was typed.
 */
import { forwardRef, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreferToTextLine } from "@/components/contact/PreferToTextLine";
import { AttachmentTile, FileChips, type PickedFile } from "@/components/quote/AttachmentTile";
import { ERROR_CLASS, FIELD_CLASS, LABEL_CLASS, PILL_CLASS } from "@/components/quote/quoteStyles";
import { postQuoteDetails, uploadQuoteFile, type DetailsKey } from "@/lib/quoteUploads";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/shared/siteConfig";

const PROJECT_TYPES = [
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom vanity" },
  { value: "laundry", label: "Laundry or mudroom" },
  { value: "closet", label: "Closet or storage" },
  { value: "other", label: "Something else" },
] as const;

const TIMINGS = ["Soon", "1 to 3 months", "3 to 6 months", "Just planning"] as const;
const BEST_TIMES = ["Any time", "Morning", "Midday", "Afternoon"] as const;

function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export interface QuoteFollowUpProps {
  idPrefix: string;
  firstName: string;
  kind: "request" | "callback";
  phone: string;
  bestTime: string;
  /** Null when the server issued no details token: Step 2 and uploads are not offered. */
  detailsKey: DetailsKey | null;
  /** Files chosen in Step 1, uploaded now that the request is saved. */
  initialFiles: PickedFile[];
  hasEmail: boolean;
  reach: "call" | "text" | "email";
  projectTypeLocked: boolean;
  /** Level of the "Help us prepare" heading. */
  panelHeading: "h2" | "h3" | "h4";
  onDetailsSaved?: (counts: { fields: number; files: number }) => void;
  /** Test id on the confirmation; "quote-form-success" unless a page pinned another. */
  successTestId?: string;
  className?: string;
}

type UploadRun = (list: PickedFile[], set: (update: (prev: PickedFile[]) => PickedFile[]) => void) => Promise<string[]>;

export const QuoteFollowUp = forwardRef<HTMLDivElement, QuoteFollowUpProps>(function QuoteFollowUp(
  {
    idPrefix,
    firstName,
    kind,
    phone,
    bestTime,
    detailsKey,
    initialFiles,
    hasEmail,
    reach,
    projectTypeLocked,
    panelHeading,
    onDetailsSaved,
    successTestId = "quote-form-success",
    className,
  },
  successRef,
) {
  const [files1, setFiles1] = useState<PickedFile[]>(initialFiles);
  const [files2, setFiles2] = useState<PickedFile[]>([]);
  const [projectType, setProjectType] = useState("");
  const [address, setAddress] = useState("");
  const [timing, setTiming] = useState("");
  const [callTime, setCallTime] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [panelError, setPanelError] = useState("");
  const startedRef = useRef(false);
  const Heading = panelHeading;

  const upload: UploadRun = useCallback(
    async (list, set) => {
      const ids: string[] = [];
      for (const item of list) {
        if (item.state === "done" || item.state === "uploading") continue;
        set((prev) => prev.map((f) => (f.key === item.key ? { ...f, state: "uploading", error: undefined } : f)));
        const result = detailsKey
          ? await uploadQuoteFile(detailsKey, item.file)
          : { ok: false as const, message: "Uploads are not available on this page." };
        set((prev) =>
          prev.map((f) =>
            f.key === item.key
              ? result.ok
                ? { ...f, state: "done", id: result.id, error: undefined }
                : { ...f, state: "failed", error: result.message }
              : f,
          ),
        );
        if (result.ok) ids.push(result.id);
      }
      return ids;
    },
    [detailsKey],
  );

  /** Tell the team about files that are stored (a "Files added" note on the same request). */
  const announce = useCallback(
    async (fileIds: string[]) => {
      if (!detailsKey || !fileIds.length) return;
      const first = await postQuoteDetails(detailsKey, { kind: "files", fileIds });
      if (!first.ok) await postQuoteDetails(detailsKey, { kind: "files", fileIds });
    },
    [detailsKey],
  );

  // Step 1 files go up once, right after the request is saved.
  useEffect(() => {
    if (startedRef.current || !initialFiles.length) return;
    startedRef.current = true;
    void (async () => {
      const ids = await upload(initialFiles, setFiles1);
      await announce(ids);
    })();
  }, [initialFiles, upload, announce]);

  async function retry(key: string, list: PickedFile[], set: typeof setFiles1) {
    const item = list.find((f) => f.key === key);
    if (!item) return;
    const ids = await upload([item], set);
    await announce(ids);
  }

  const emailInvalid = Boolean(email.trim()) && !emailLooksValid(email.trim());
  const askBestTime = kind === "request" && reach === "call";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detailsKey || saving) return;
    if (emailInvalid) {
      setEmailTouched(true);
      document.getElementById(`${idPrefix}-d-email`)?.focus();
      return;
    }
    const fields: Record<string, string> = {};
    if (projectType) fields.projectType = projectType;
    if (address.trim()) fields.address = address.trim();
    if (timing) fields.timing = timing;
    if (askBestTime && callTime) fields.bestTime = callTime;
    if (!hasEmail && email.trim()) fields.email = email.trim();
    const pending = files2.filter((f) => f.state !== "done");
    if (!Object.keys(fields).length && !pending.length) {
      setPanelError("Add a detail above, or skip this. We have what we need to start.");
      return;
    }
    setSaving(true);
    setPanelError("");
    const fileIds = await upload(pending, setFiles2);
    if (!Object.keys(fields).length && !fileIds.length) {
      setSaving(false);
      setPanelError("Your files did not upload. Try again, or text them to us.");
      return;
    }
    const result = await postQuoteDetails(detailsKey, { kind: "details", fields, fileIds });
    setSaving(false);
    if (!result.ok) {
      setPanelError(result.message);
      return;
    }
    setSaved(true);
    onDetailsSaved?.({ fields: Object.keys(fields).length, files: fileIds.length });
  }

  const when = bestTime && bestTime !== "Any time" ? ` (${bestTime.toLowerCase()})` : "";
  const failed1 = files1.filter((f) => f.state === "failed");
  const failed2 = files2.filter((f) => f.state === "failed");
  const stored1 = files1.filter((f) => f.state === "done").length;
  const textUs = (
    <a href={SITE_CONFIG.phoneSmsHref} className="font-medium underline underline-offset-2">
      text it to us at {SITE_CONFIG.phone}
    </a>
  );

  return (
    // data-family-bar-yield: the family mobile bar steps aside while this success screen and its
    // Step 2 are on screen (components/family/MobileActionBar.tsx), as it does for the form.
    <div className={cn("space-y-6", className)} data-quote-follow-up="" data-family-bar-yield="">
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        data-clarity-mask="True"
        data-testid={successTestId}
        className="space-y-3 outline-none"
      >
        <p className="text-xl font-medium leading-snug text-foreground">Thanks, {firstName}. We have your request.</p>
        <p className="text-base leading-relaxed text-foreground/85">
          {kind === "callback"
            ? `We will call you at ${phone}${when} to answer your questions and help you work out the next step.`
            : "Our team reviews your project, answers your questions and helps you work out the next step."}{" "}
          <PreferToTextLine />
        </p>
        <p className="text-base leading-relaxed text-foreground/85">
          Prefer to talk it through?{" "}
          <a href={SITE_CONFIG.phoneHref} className="font-medium underline underline-offset-2">
            Call {SITE_CONFIG.phone}
          </a>
        </p>
      </div>

      {files1.length ? (
        <div className="space-y-2" data-testid="quote-upload-status">
          <p className="text-sm font-medium text-foreground">Your files</p>
          <FileChips files={files1} onRetry={(key) => void retry(key, files1, setFiles1)} label="Your files" />
          <p aria-live="polite" className={cn(ERROR_CLASS, !failed1.length && "sr-only")}>
            {failed1.length ? (
              <>
                {failed1.map((f) => f.file.name).join(", ")} did not upload. Your request is saved. Try again, or {textUs}.
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {detailsKey && !skipped ? (
        <section
          aria-labelledby={`${idPrefix}-d-heading`}
          className="space-y-4 border-t border-border pt-5"
          data-testid="quote-details-panel"
          data-clarity-mask="True"
        >
          <div className="space-y-1">
            <Heading id={`${idPrefix}-d-heading`} className="font-sans text-lg font-medium leading-snug text-foreground">
              Help us prepare (optional)
            </Heading>
            {saved ? null : (
              <p className="text-sm leading-snug text-muted-foreground">
                A few details help us give you a closer quote on the first call.
              </p>
            )}
          </div>

          {saved ? (
            <div className="space-y-3">
              <p role="status" className="text-base font-medium text-foreground" data-testid="quote-details-saved">
                Saved. Thank you.
              </p>
              {failed2.length ? (
                <>
                  <FileChips files={failed2} onRetry={(key) => void retry(key, files2, setFiles2)} label="Files that did not upload" />
                  <p className={ERROR_CLASS}>
                    {failed2.map((f) => f.file.name).join(", ")} did not upload. Try again, or {textUs}.
                  </p>
                </>
              ) : null}
            </div>
          ) : (
            <form onSubmit={save} noValidate className="space-y-4" data-quote-details-form="">
              {projectTypeLocked ? null : (
                <fieldset>
                  <legend className={LABEL_CLASS}>Project type</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PROJECT_TYPES.map((option) => (
                      <label key={option.value} className={PILL_CLASS}>
                        <input
                          type="radio"
                          name={`${idPrefix}-d-type`}
                          value={option.value}
                          className="sr-only"
                          checked={projectType === option.value}
                          onChange={() => setProjectType(option.value)}
                          disabled={saving}
                          data-clarity-mask="True"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <div>
                <label htmlFor={`${idPrefix}-d-address`} className={LABEL_CLASS}>
                  Project address or ZIP code
                </label>
                <input
                  id={`${idPrefix}-d-address`}
                  name="address"
                  autoComplete="street-address"
                  className={FIELD_CLASS}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  maxLength={300}
                  disabled={saving}
                  data-clarity-mask="True"
                  data-testid="input-details-address"
                />
              </div>

              <fieldset>
                <legend className={LABEL_CLASS}>When would you like to start?</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TIMINGS.map((option) => (
                    <label key={option} className={PILL_CLASS}>
                      <input
                        type="radio"
                        name={`${idPrefix}-d-timing`}
                        value={option}
                        className="sr-only"
                        checked={timing === option}
                        onChange={() => setTiming(option)}
                        disabled={saving}
                        data-clarity-mask="True"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              {askBestTime ? (
                <div>
                  <label htmlFor={`${idPrefix}-d-best-time`} className={LABEL_CLASS}>
                    Best time to call
                  </label>
                  <select
                    id={`${idPrefix}-d-best-time`}
                    name="bestTime"
                    className={cn(FIELD_CLASS, "pr-8")}
                    value={callTime}
                    onChange={(event) => setCallTime(event.target.value)}
                    disabled={saving}
                    data-clarity-mask="True"
                  >
                    <option value="">Choose a time</option>
                    {BEST_TIMES.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {hasEmail ? null : (
                <div>
                  <label htmlFor={`${idPrefix}-d-email`} className={LABEL_CLASS}>
                    Email
                  </label>
                  <input
                    id={`${idPrefix}-d-email`}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className={FIELD_CLASS}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    // A moment later, so a growing error cannot move "Save details" mid-click.
                    onBlur={() => window.setTimeout(() => setEmailTouched(true), 200)}
                    aria-invalid={(emailTouched && emailInvalid) || undefined}
                    aria-describedby={emailTouched && emailInvalid ? `${idPrefix}-d-email-error` : undefined}
                    disabled={saving}
                    data-clarity-mask="True"
                  />
                  {emailTouched && emailInvalid ? (
                    <p id={`${idPrefix}-d-email-error`} className={ERROR_CLASS}>
                      Enter a valid email, or leave it blank.
                    </p>
                  ) : null}
                </div>
              )}

              <AttachmentTile
                idPrefix={`${idPrefix}-d`}
                files={files2}
                onChange={setFiles2}
                disabled={saving}
                alreadyStored={stored1}
                onRetry={(key) => void retry(key, files2, setFiles2)}
                title={files1.length ? "Add more photos, plans or files" : "Add photos, plans or files"}
              />

              {panelError ? (
                <p aria-live="polite" className={ERROR_CLASS}>
                  {panelError}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Button type="submit" className="h-12 min-w-[10rem] px-6 text-base" disabled={saving} data-testid="button-save-details">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Saving…
                    </>
                  ) : (
                    "Save details"
                  )}
                </Button>
                <button
                  type="button"
                  className="min-h-12 px-1 text-base text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  onClick={() => setSkipped(true)}
                  disabled={saving}
                  data-testid="button-skip-details"
                >
                  Skip
                </button>
              </div>
            </form>
          )}
        </section>
      ) : null}
    </div>
  );
});
