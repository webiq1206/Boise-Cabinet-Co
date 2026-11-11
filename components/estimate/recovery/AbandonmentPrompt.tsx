"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { track as trackEvent } from "@/lib/analytics/track";
import { deviceCategory, getEstimatorSessionId, recordRecoveryAction, type EstimatorFlow } from "@/lib/estimatorSession";
import type { ExitMethod } from "./useAbandonmentRecovery";

export interface AbandonmentPromptProps {
  open: boolean;
  flow: EstimatorFlow;
  method: ExitMethod | null;
  /** True when a link click was intercepted: "continue" resumes that navigation. */
  leaving: boolean;
  onStay: () => void;
  onContinue: () => void;
}

type CallbackState = "idle" | "sending" | "sent" | "error";

/**
 * "Prefer to talk instead?" - shown once when a visitor is about to leave an
 * incomplete estimator. Call, text, or leave a number for a callback; or simply
 * continue. It is a helper, not a wall: Escape and the backdrop dismiss it, and
 * dismissal is remembered for the session.
 *
 * Kept clean (owner, 11 November): the heading, one sentence, the phone field,
 * one button, one quiet line with the call and text links, and the way out.
 * The optional name sits behind a quiet text toggle. No eyebrow, no stacked
 * Call and Text buttons, no second helper sentence.
 */
export function AbandonmentPrompt({ open, flow, method, leaving, onStay, onContinue }: AbandonmentPromptProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<CallbackState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const shownFor = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const key = `${flow}:${method}`;
    if (shownFor.current === key) return;
    shownFor.current = key;
    recordRecoveryAction(flow, { shown: true }, method ?? undefined);
    trackEvent("estimator_recovery_prompt", { flow, method: method ?? "unknown", action: "shown" });
  }, [open, flow, method]);

  const dismiss = (how: "stay" | "continue") => {
    recordRecoveryAction(flow, { dismissed: true });
    trackEvent("estimator_recovery_prompt", { flow, action: how === "continue" ? "continue_leaving" : "stay" });
    if (how === "continue") onContinue();
    else onStay();
  };

  const onCall = () => { recordRecoveryAction(flow, { call: true }); trackEvent("estimator_recovery_prompt", { flow, action: "call" }); };
  const onText = () => { recordRecoveryAction(flow, { text: true }); trackEvent("estimator_recovery_prompt", { flow, action: "text" }); };

  async function submitCallback(event: FormEvent) {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setState("error"); setMessage("Please enter a 10-digit phone number."); return; }
    setState("sending"); setMessage(null);
    try {
      const res = await fetch("/api/recovery/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getEstimatorSessionId(), flow, phone: digits, name: name.trim() || undefined, pagePath: window.location.pathname, device: deviceCategory() }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setState("error");
        setMessage(json.message ?? `We could not save that. Please call ${SITE_CONFIG.phone}.`);
        return;
      }
      setState("sent");
      trackEvent("estimator_recovery_prompt", { flow, action: "callback_requested" });
    } catch {
      setState("error");
      setMessage(`We could not reach the server. Please call ${SITE_CONFIG.phone}.`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) dismiss("stay"); }}>
      <DialogContent
        className="max-w-md rounded-sm border border-inverse-foreground/15 bg-[hsl(var(--inverse))] p-6 text-inverse-foreground sm:p-7"
        data-testid="abandonment-prompt"
        aria-describedby="abandonment-prompt-desc"
      >
        <DialogTitle className="ed-h3 !leading-tight">
          {state === "sent" ? "We will call you back." : "Prefer to talk it through instead?"}
        </DialogTitle>
        <DialogDescription id="abandonment-prompt-desc" className="ed-body mt-2 text-[0.9375rem] text-inverse-muted">
          {state === "sent"
            ? "Thanks. Someone from the team will call you back to answer your questions."
            : "Call or text with your questions and we will answer them. Or leave a number and we will call you back."}
        </DialogDescription>

        {state !== "sent" && (
          <form onSubmit={submitCallback} noValidate className="mt-5 space-y-3" data-testid="recovery-callback-form" data-clarity-mask="True">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-inverse-foreground" htmlFor="recovery-phone">Phone</label>
              <input
                id="recovery-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); if (state === "error") setState("idle"); }}
                className="h-12 w-full rounded-sm border border-inverse-foreground/25 bg-inverse-foreground/[0.06] px-3 text-base text-inverse-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-legible"
                aria-invalid={state === "error" || undefined}
                aria-describedby={message ? "recovery-callback-msg" : undefined}
                data-testid="recovery-phone"
                data-clarity-mask="True" />
              {message && (
                <p id="recovery-callback-msg" role="alert" className="mt-1.5 text-[0.8125rem] text-red-300">
                  {message}
                </p>
              )}
            </div>
            {/* The name is optional, so it sits behind one quiet text toggle (no box). */}
            <details className="group" data-testid="recovery-options">
              <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 text-sm text-inverse-muted hover:text-inverse-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-legible [&::-webkit-details-marker]:hidden">
                <Plus className="h-4 w-4 flex-none transition-transform group-open:rotate-45" aria-hidden />
                Add your name (optional)
              </summary>
              <div className="pt-2">
                <label className="mb-1.5 block text-sm font-medium text-inverse-foreground" htmlFor="recovery-name">Name</label>
                <input
                  id="recovery-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 w-full rounded-sm border border-inverse-foreground/25 bg-inverse-foreground/[0.06] px-3 text-base text-inverse-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-legible"
                  data-clarity-mask="True" />
              </div>
            </details>
            <Button type="submit" variant="brand" className="min-h-12 w-full px-5" disabled={state === "sending"} data-testid="recovery-callback-submit">
              {state === "sending" ? "Sending…" : "Call me"}
            </Button>
            <p className="text-sm text-inverse-muted">
              Or{" "}
              <a href={SITE_CONFIG.phoneHref} onClick={onCall} className="font-medium text-inverse-foreground underline underline-offset-4 hover:no-underline" data-testid="recovery-call">
                call {SITE_CONFIG.phone}
              </a>
              {" or "}
              <span className="whitespace-nowrap">
                <a href={SITE_CONFIG.phoneSmsHref} onClick={onText} className="font-medium text-inverse-foreground underline underline-offset-4 hover:no-underline" data-testid="recovery-text">
                  text us
                </a>
                .
              </span>
            </p>
          </form>
        )}

        {/* The way out, as quiet text links. Leaving: "No thanks, continue" carries on with
            the link that was clicked, and "Keep going with my estimate" stays. Not leaving:
            both would do the same thing, so only one is shown. */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6">
          {state === "sent" ? (
            <Button type="button" variant="brandOutline" className="min-h-11 w-full border-inverse-foreground/70 text-inverse-foreground" onClick={() => (leaving ? onContinue() : onStay())}>
              {leaving ? "Continue" : "Close"}
            </Button>
          ) : (
            <>
              {leaving ? (
                <button
                  type="button"
                  onClick={() => dismiss("continue")}
                  className="min-h-11 text-left text-sm text-inverse-muted underline underline-offset-4 hover:text-inverse-foreground"
                  data-testid="recovery-dismiss"
                >
                  No thanks, continue
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => dismiss("stay")}
                className="min-h-11 text-left text-sm text-inverse-muted underline underline-offset-4 hover:text-inverse-foreground"
                data-testid="recovery-stay"
              >
                Keep going with my estimate
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
