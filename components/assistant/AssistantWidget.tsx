"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFormInView } from "@/hooks/use-form-in-view";
import Link from "next/link";
import { ImagePlus, Loader2, MessageCircle, Send, X } from "lucide-react";
import type { CombinedEstimateResult, EstimateSelections } from "@/shared/estimateEngine";
import { formatPlanningCurrency } from "@/shared/estimateEngine";
import { loadWizardState, saveWizardState } from "@/lib/estimate/wizardPersistence";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

/**
 * Conversational estimating assistant widget.
 *
 * Shares its structured project state with the guided estimator via
 * wizardPersistence, so rooms planned in chat prefill the wizard and vice
 * versa - the homeowner never repeats themselves, and both surfaces price
 * through the same engine. Renders nothing when the assistant API reports
 * itself unavailable (no key configured), leaving the site exactly as it
 * was without chat.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

const CHAT_STORE_KEY = "brc_assistant_chat";
const MAX_HISTORY = 40;
const MAX_PHOTOS = 3;

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm Boise Cabinet Co's virtual assistant. I can put together an honest planning price range for custom cabinets in a couple of minutes, answer questions about how we work, or connect you with the team. Which room are you thinking about?",
};

/** Routes where the launcher stays out of the way. */
function isSuppressedRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/design-studio") ||
    pathname.startsWith("/estimate")
  );
}

function loadChat(): ChatMessage[] | null {
  try {
    const raw = sessionStorage.getItem(CHAT_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { messages?: ChatMessage[] };
    return Array.isArray(parsed.messages) && parsed.messages.length
      ? parsed.messages
      : null;
  } catch {
    return null;
  }
}

function saveChat(messages: ChatMessage[]) {
  try {
    // Persist text only - photos are large and context-only.
    const slim = messages
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));
    sessionStorage.setItem(CHAT_STORE_KEY, JSON.stringify({ messages: slim }));
  } catch {
    /* storage unavailable; non-fatal */
  }
}

/** Downscale a photo client-side to a bounded JPEG data URL (context only). */
async function fileToDataUrl(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;
  const MAX_EDGE = 1280;
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return null;
  ctx2d.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

function EstimateCard({ estimate }: { estimate: CombinedEstimateResult }) {
  return (
    <div className="mx-4 mb-2 rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Planning range
        </span>
        <span className="font-sans font-medium text-foreground">
          {formatPlanningCurrency(estimate.priceLow)} to {formatPlanningCurrency(estimate.priceHigh)}
        </span>
      </div>
      {estimate.rooms.length > 1 && (
        <ul className="mt-1.5 space-y-0.5">
          {estimate.rooms.map((room, i) => (
            <li key={i} className="flex justify-between gap-2 text-xs text-muted-foreground">
              <span>{room.projectLabel}</span>
              <span>
                {formatPlanningCurrency(room.priceLow)} to {formatPlanningCurrency(room.priceHigh)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/estimate"
        className="mt-1.5 inline-block text-xs font-medium text-accent underline underline-offset-2"
        onClick={() => track("assistant_estimate_reviewed", { placement: "widget_card" })}
      >
        Review and refine in the estimator
      </Link>
    </div>
  );
}

export function AssistantWidget() {
  const pathname = usePathname();
  const formInView = useFormInView(pathname, true);
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<CombinedEstimateResult | null>(null);
  const [wizardBarActive, setWizardBarActive] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Only offer the assistant when the server says it's configured.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/assistant/chat", { method: "GET" })
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((d) => {
        if (!cancelled) setAvailable(Boolean(d?.available));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Step aside whenever a guided-flow wizard shows its own mobile bar.
  useEffect(() => {
    const sync = () =>
      setWizardBarActive(
        ((window as unknown as { __wizardMobileBars?: number }).__wizardMobileBars ?? 0) > 0,
      );
    sync();
    window.addEventListener("wizardmobilebar", sync);
    return () => window.removeEventListener("wizardmobilebar", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open, pending]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    track("assistant_opened", { page_type: pathname ?? "unknown" });
    setMessages((prev) => {
      if (prev.length) return prev;
      const restored = loadChat();
      if (restored) return restored;
      // Acknowledge estimator progress instead of re-asking for it.
      const rooms = loadWizardState()?.rooms ?? [];
      const started = rooms.filter((r) => r.project).length;
      if (started > 0) {
        return [
          {
            role: "assistant",
            content: `Welcome back! I can see the project you've started in the estimator${started > 1 ? ` (${started} rooms)` : ""} - I'll build on it rather than starting over. What would you like to do next: refine it, add a room, or get your current range?`,
          },
        ];
      }
      return [GREETING];
    });
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [pathname]);

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && !photos.length) || pending) return;
    setError(null);
    const userMessage: ChatMessage = {
      role: "user",
      content: text || "(photo)",
      ...(photos.length ? { images: photos } : {}),
    };
    const nextMessages = [...messages, userMessage].slice(-MAX_HISTORY);
    setMessages(nextMessages);
    setInput("");
    setPhotos([]);
    setPending(true);
    track("assistant_message_sent", { has_photo: photos.length > 0 });
    try {
      const rooms = loadWizardState()?.rooms ?? [];
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // The greeting is client-side; the API requires user-first context
          // anyway, so send text-only history plus this turn's photos.
          messages: nextMessages.map((m, i) => ({
            role: m.role,
            content: m.content,
            ...(i === nextMessages.length - 1 && m.images ? { images: m.images } : {}),
          })),
          rooms,
          page: pathname ?? "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        rooms?: EstimateSelections[];
        estimate?: CombinedEstimateResult | null;
        error?: string;
      };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "The assistant hit a snag. Please try again.");
      }
      const withReply = [...nextMessages, { role: "assistant" as const, content: data.reply }];
      setMessages(withReply);
      saveChat(withReply);
      setEstimate(data.estimate ?? null);
      // Sync the shared project state back to the wizard store so the guided
      // estimator (and the consultation forms) pick up chat-built rooms.
      if (Array.isArray(data.rooms)) {
        const existing = loadWizardState();
        if (JSON.stringify(existing?.rooms ?? []) !== JSON.stringify(data.rooms)) {
          saveWizardState({ rooms: data.rooms, currentIndex: existing?.currentIndex ?? 0 });
          window.dispatchEvent(new CustomEvent("brc_estimate_updated"));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant hit a snag. Please try again.");
      track("assistant_error", {});
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }, [input, photos, pending, messages, pathname]);

  const attachPhotos = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const converted: string[] = [];
    for (const file of Array.from(files).slice(0, MAX_PHOTOS)) {
      const url = await fileToDataUrl(file);
      if (url) converted.push(url);
    }
    setPhotos((prev) => [...prev, ...converted].slice(0, MAX_PHOTOS));
  }, []);

  if (!available || isSuppressedRoute(pathname)) return null;

  return (
    <>
      {!open && !formInView && !wizardBarActive && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] right-4 z-[90] flex items-center gap-2 rounded-full bg-inverse px-4 py-3 text-sm font-medium text-inverse-foreground shadow-lg transition-transform hover:scale-[1.03] xl:bottom-6 xl:right-6"
          data-testid="button-assistant-open"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Estimate help</span>
          <span className="sr-only sm:hidden">Open the estimating assistant</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Boise Cabinet Co virtual estimating assistant"
          className="fixed inset-x-0 bottom-0 z-[110] flex h-[85dvh] flex-col rounded-t-xl border border-border bg-background shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:h-[600px] md:max-h-[80dvh] md:w-[400px] md:rounded-xl"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="font-sans text-sm font-medium text-foreground">
                Estimating assistant
              </p>
              <p className="text-sm text-muted-foreground">
                Virtual assistant - our human team takes over at your free visit
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close the assistant"
              data-testid="button-assistant-close"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-inverse text-inverse-foreground"
                    : "bg-secondary text-foreground",
                )}
              >
                {m.images?.length ? (
                  <span className="mb-1 block text-xs opacity-70">
                    {m.images.length === 1 ? "1 photo attached" : `${m.images.length} photos attached`}
                  </span>
                ) : null}
                {/* Rendered as plain text; strip stray markdown bold markers. */}
                {m.content.replace(/\*\*/g, "")}
              </div>
            ))}
            {pending && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground w-fit">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Thinking...
              </div>
            )}
            {error && (
              <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>

          {estimate && <EstimateCard estimate={estimate} />}

          {photos.length > 0 && (
            <div className="flex gap-2 px-4 pb-1">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt={`Attached photo ${i + 1}`} className="h-12 w-12 rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-inverse p-0.5 text-inverse-foreground"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            className="flex items-end gap-2 border-t border-border px-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                void attachPhotos(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-sm p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Attach a photo of your space (used for context only)"
              disabled={pending || photos.length >= MAX_PHOTOS}
            >
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Ask about pricing, rooms, or how we work..."
              aria-label="Message the estimating assistant"
              className="max-h-28 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
              data-testid="input-assistant-message"
            />
            <button
              type="submit"
              disabled={pending || (!input.trim() && !photos.length)}
              className="rounded-md bg-inverse p-2.5 text-inverse-foreground transition-opacity disabled:opacity-40"
              aria-label="Send message"
              data-testid="button-assistant-send"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
