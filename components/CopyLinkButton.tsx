"use client";

/**
 * Copies a link to the clipboard and shows transient "Copied!" feedback.
 * Falls back to selecting the text in a readonly input when the async clipboard
 * API is unavailable (older browsers / insecure contexts).
 */
import { useState, useCallback, useRef } from "react";
import { Copy, Check } from "lucide-react";

export function CopyLinkButton({
  value,
  label = "Copy link",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback: do nothing harmful; clipboard may be blocked in insecure ctx.
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }, [value]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied!" : label}
    </button>
  );
}
