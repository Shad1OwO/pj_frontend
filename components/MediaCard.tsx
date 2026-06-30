"use client";

/**
 * A single media item row in the dashboard: thumbnail/preview, title, the
 * shareable Discord link with a copy button, and edit/delete actions.
 */
import Link from "next/link";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { MediaPreview } from "./MediaPreview";
import { CopyLinkButton } from "./CopyLinkButton";
import { shareUrl } from "@/lib/share";
import type { MediaOwner } from "@/lib/types";

export function MediaCard({
  media,
  onDelete,
  deletingId,
}: {
  media: MediaOwner;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const isDeleting = deletingId === media.id;
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row">
      <div className="sm:w-32 sm:shrink-0">
        <div className="aspect-square w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
          {media.isVideo ? (
            <MediaPreview
              media={media}
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.fileUrl}
              alt={media.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
              {media.title}
            </h3>
            <p className="truncate text-xs text-zinc-500">
              {media.originalFilename} · {Math.round(media.size / 1024)} KB
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {media.isVideo ? "video" : "image"}
          </span>
        </div>

        {media.description && (
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {media.description}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <CopyLinkButton value={shareUrl(media.id, media.scrapeVersion)} />
          <Link
            href={`/edit/${media.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(media.id)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" /> {isDeleting ? "…" : "Delete"}
          </button>
          <Link
            href={`/v/${media.id}?v=${media.scrapeVersion}`}
            target="_blank"
            className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400"
            title="Open the Discord embed page"
          >
            <ExternalLink className="h-4 w-4" /> View
          </Link>
        </div>
      </div>
    </li>
  );
}
