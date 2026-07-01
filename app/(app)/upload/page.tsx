"use client";

/**
 * Upload page (auth-gated). Shows the UploadForm; on success, displays the
 * shareable Discord link for the just-uploaded media and offers to go to the
 * dashboard or upload another.
 */
import { useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { UploadForm } from "@/components/UploadForm";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { shareUrl } from "@/lib/share";
import type { MediaOwner } from "@/lib/types";

export default function UploadPage() {
  const [done, setDone] = useState<MediaOwner | null>(null);

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-xl px-4 py-12">
        <h1 className="mb-1 text-2xl font-bold">Upload media</h1>
        <p className="mb-6 text-sm text-zinc-500">
          Images, GIFs, and videos. Max 25 MB.
        </p>

        {!done ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <UploadForm onUploaded={setDone} />
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
            <h2 className="mb-2 text-lg font-semibold text-emerald-800 dark:text-emerald-200">
              Uploaded! Here&apos;s your Discord link:
            </h2>
            <p className="mb-4 break-all rounded-md bg-white px-3 py-2 font-mono text-sm text-emerald-900 dark:bg-black dark:text-emerald-100">
              {shareUrl(done.id, done.scrapeVersion)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <CopyLinkButton value={shareUrl(done.id, done.scrapeVersion)} />
              <Link
                href="/dashboard"
                className="rounded-md border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900"
              >
                Go to dashboard
              </Link>
              <button
                type="button"
                onClick={() => setDone(null)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-200"
              >
                Upload another
              </button>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
