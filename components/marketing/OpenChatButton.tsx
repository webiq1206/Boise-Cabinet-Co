"use client";

/** Opens the on-site chat. The sheet itself lives in AssistantWidget. */
export function OpenChatButton({ className, label = "Chat" }: { className?: string; label?: string }) {
  return (
    <button
      type="button"
      className={className}
      aria-label="Chat with Boise Cabinet Co"
      onClick={() => window.dispatchEvent(new Event("p5:assistant-open"))}
    >
      {label}
    </button>
  );
}
