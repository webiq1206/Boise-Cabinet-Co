"use client";

/**
 * "Add photos, plans or files": one friendly tile instead of the browser's raw
 * "Choose files" control (family quote form v2). Tap opens the native picker
 * (camera, photo library and files on phones); desktop also takes a drop.
 * Chosen files show as chips with a preview or a PDF icon, the size, and a
 * 44px remove button. A file that is too large or not a photo or PDF gets a
 * plain message and is not added; it never blocks the rest of the form.
 *
 * The tile only collects files. Uploading happens after the request itself
 * has been saved (components/quote/QuoteRequestForm.tsx), so a slow or failed
 * upload can never cost the lead; a chip can then show its upload state and a
 * "Try again" button.
 */
import { useEffect, useRef, useState, type DragEvent } from "react";
import { FileText, Loader2, Paperclip, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  QUOTE_FILE_ACCEPT,
  QUOTE_FILE_HINT,
  QUOTE_FILE_MAX_COUNT,
  checkQuoteFile,
  formatFileSize,
  isPdfType,
} from "@/shared/quoteFiles";

export type UploadState = "ready" | "uploading" | "done" | "failed";

export interface PickedFile {
  key: string;
  file: File;
  contentType: string;
  /** Object URL for an image preview (browsers that cannot draw HEIC fall back to an icon). */
  preview: string | null;
  state: UploadState;
  /** Server id once stored. */
  id?: string;
  /** Why the upload failed, in plain words. */
  error?: string;
}

let counter = 0;
function nextKey(): string {
  counter += 1;
  return `qf-${Date.now().toString(36)}-${counter}`;
}

/** Turn a FileList into chips, or plain messages for the files that cannot be added. */
export function pickFiles(
  list: FileList | File[],
  room: number,
): { added: PickedFile[]; messages: string[] } {
  const added: PickedFile[] = [];
  const messages: string[] = [];
  for (const file of Array.from(list)) {
    if (added.length >= room) {
      messages.push(
        `${file.name} was not added. Up to ${QUOTE_FILE_MAX_COUNT} files can be attached.`,
      );
      continue;
    }
    const check = checkQuoteFile(file);
    if (!check.ok) {
      messages.push(check.message);
      continue;
    }
    const canPreview =
      check.contentType.startsWith("image/") &&
      !/heic|heif/.test(check.contentType);
    added.push({
      key: nextKey(),
      file,
      contentType: check.contentType,
      preview:
        canPreview && typeof URL !== "undefined"
          ? URL.createObjectURL(file)
          : null,
      state: "ready",
    });
  }
  return { added, messages };
}

export function releasePreviews(files: PickedFile[]): void {
  for (const file of files) if (file.preview) URL.revokeObjectURL(file.preview);
}

export function AttachmentTile({
  idPrefix,
  files,
  onChange,
  disabled = false,
  alreadyStored = 0,
  onRetry,
  title = "Add photos, plans or files",
}: {
  idPrefix: string;
  files: PickedFile[];
  onChange: (next: PickedFile[]) => void;
  disabled?: boolean;
  /** Files this request already holds (Step 1 uploads), so Step 2 respects the same total. */
  alreadyStored?: number;
  /** Shown on a failed chip once uploads have run. */
  onRetry?: (key: string) => void;
  title?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const filesRef = useRef(files);
  filesRef.current = files;
  const ids = {
    input: `${idPrefix}-files`,
    title: `${idPrefix}-files-title`,
    hint: `${idPrefix}-files-hint`,
    notes: `${idPrefix}-files-notes`,
  };
  const room = Math.max(0, QUOTE_FILE_MAX_COUNT - alreadyStored - files.length);

  // Previews are released when the form goes away.
  useEffect(() => () => releasePreviews(filesRef.current), []);

  function add(list: FileList | File[] | null) {
    if (!list || !list.length) return;
    const { added, messages: next } = pickFiles(list, room);
    setMessages(next);
    if (added.length) onChange([...files, ...added]);
  }

  function remove(key: string) {
    const gone = files.find((file) => file.key === key);
    if (gone) releasePreviews([gone]);
    onChange(files.filter((file) => file.key !== key));
    setMessages([]);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    add(event.dataTransfer?.files ?? null);
  }

  return (
    <div className="space-y-2" data-quote-files="">
      <label
        htmlFor={ids.input}
        data-testid="quote-file-tile"
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex min-h-14 w-full cursor-pointer items-center gap-3 border border-dashed border-foreground/45 bg-foreground/[0.03] px-3 py-2.5 text-left transition-colors hover:border-foreground hover:bg-foreground/[0.06] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
          dragging && "border-foreground bg-foreground/[0.08]",
          (disabled || room === 0) && "cursor-not-allowed opacity-60",
        )}
      >
        <Paperclip
          className="h-5 w-5 flex-none text-foreground/80"
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span
            id={ids.title}
            className="block text-base font-medium text-foreground"
          >
            {title}
          </span>
          <span
            id={ids.hint}
            className="block text-sm leading-snug text-muted-foreground"
          >
            {QUOTE_FILE_HINT}
          </span>
        </span>
        <input
          ref={inputRef}
          id={ids.input}
          type="file"
          multiple
          accept={QUOTE_FILE_ACCEPT}
          className="sr-only"
          aria-labelledby={ids.title}
          aria-describedby={`${ids.hint} ${ids.notes}`}
          disabled={disabled || room === 0}
          data-testid="input-quote-files"
          data-clarity-mask="True"
          onChange={(event) => {
            add(event.target.files);
            // Let the same file be chosen again after it was removed.
            event.target.value = "";
          }}
        />
      </label>

      <p
        id={ids.notes}
        aria-live="polite"
        className={cn(
          "text-sm leading-snug text-destructive",
          !messages.length && "sr-only",
        )}
      >
        {messages.join(" ")}
      </p>

      <FileChips
        files={files}
        onRemove={remove}
        onRetry={onRetry}
        disabled={disabled}
      />
    </div>
  );
}

/** Image preview, or an icon for PDFs, HEIC and anything the browser cannot draw. */
function Thumb({ item }: { item: PickedFile }) {
  const [broken, setBroken] = useState(false);
  if (item.preview && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing to optimise
      <img src={item.preview} alt="" className="h-11 w-11 flex-none object-cover" onError={() => setBroken(true)} />
    );
  }
  return (
    <span className="flex h-11 w-11 flex-none items-center justify-center bg-foreground/[0.08]" aria-hidden="true">
      {isPdfType(item.contentType) ? <FileText className="h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
    </span>
  );
}

/** The chips for chosen or uploaded files: preview or PDF icon, name, size, state, and remove or retry. */
export function FileChips({
  files,
  onRemove,
  onRetry,
  disabled = false,
  label = "Attached files",
}: {
  files: PickedFile[];
  onRemove?: (key: string) => void;
  onRetry?: (key: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  if (!files.length) return null;
  return (
    <ul className="space-y-2" aria-label={label} data-testid="quote-file-list">
      {files.map((item) => (
        <li
          key={item.key}
          className="flex min-h-14 items-center gap-3 border border-foreground/25 bg-foreground/[0.04] py-1.5 pl-1.5 pr-1"
          data-quote-file-state={item.state}
          data-clarity-mask="True"
        >
          <Thumb item={item} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {item.file.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {formatFileSize(item.file.size)}
              {item.state === "uploading" ? " · Uploading" : null}
              {item.state === "done" ? " · Uploaded" : null}
              {item.state === "failed" ? " · Did not upload" : null}
            </span>
          </span>
          {item.state === "uploading" ? (
            <Loader2
              className="mr-3 h-4 w-4 flex-none animate-spin"
              aria-label="Uploading"
            />
          ) : item.state === "failed" && onRetry ? (
            <button
              type="button"
              onClick={() => onRetry(item.key)}
              className="flex h-11 flex-none items-center gap-1.5 border border-foreground/45 px-3 text-sm font-medium text-foreground hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Try uploading ${item.file.name} again`}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          ) : item.state === "ready" && onRemove ? (
            <button
              type="button"
              onClick={() => onRemove?.(item.key)}
              disabled={disabled}
              className="flex h-11 w-11 flex-none items-center justify-center text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Remove ${item.file.name}`}
              data-testid="button-remove-quote-file"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
