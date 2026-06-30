"use client";

/**
 * Client island for the public view page's copy-link button. Kept separate so
 * the /v/[id] page can stay a Server Component (required for generateMetadata).
 * Wraps the shared CopyLinkButton with a label specific to this context.
 */
import { CopyLinkButton } from "@/components/CopyLinkButton";

export function ViewShareButton({ value }: { value: string }) {
  return <CopyLinkButton value={value} label="Copy Discord link" />;
}
