"use client";

/**
 * Edit page (auth-gated). Loads a single media item owned by the current user,
 * lets them edit title + description, and on save shows the updated share link
 * (with the bumped scrape version).
 *
 * Note: ownership is enforced by the backend (PATCH returns 403 for non-owners),
 * so if the user navigates here for a media they don't own, the API call fails
 * and we surface an error.
 */
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { MediaPreview } from "@/components/MediaPreview";
import { api, ApiClientError } from "@/lib/api";
import { shareUrl } from "@/lib/share";
import type { MediaOwner } from "@/lib/types";

export default function EditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [media, setMedia] = useState<MediaOwner | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedVersion, setSavedVersion] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Find the media in the user's list (listMedia returns owner-owned only).
      try {
        const { media: all } = await api.listMedia();
        const found = all.find((m) => m.id === id) ?? null;
        if (cancelled) return;
        if (!found) {
          setError("Media not found, or you don't have access to it.");
          setLoading(false);
          return;
        }
        setMedia(found);
        setTitle(found.title);
        setDescription(found.description);
        setSavedVersion(found.scrapeVersion);
      } catch {
        if (!cancelled) setError("Couldn't load this media.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const { media: updated } = await api.updateMedia(id, title, description);
      setMedia(updated);
      setTitle(updated.title);
      setDescription(updated.description);
      setSavedVersion(updated.scrapeVersion);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Couldn't save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        <Link
          href="/dashboard"
          className="mb-4 inline-block text-sm text-zinc-500 hover:text-indigo-600"
        >
          ← Back to dashboard
        </Link>

        <h1 className="mb-6 text-2xl font-bold">Edit media</h1>

        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : error && !media ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        ) : media ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="sm:w-48 sm:shrink-0">
                <div className="aspect-square w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
                  <MediaPreview
                    media={media}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-500">{media.originalFilename}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {media.mimeType} · {Math.round(media.size / 1024)} KB
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Title</span>
                <input
                  type="text"
                  value={title}
                  maxLength={200}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={description}
                  maxLength={2000}
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-y rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>

            {savedVersion !== null && (
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-1 text-sm font-semibold">Discord share link</h2>
                <p className="mb-3 break-all rounded-md bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {shareUrl(id, savedVersion)}
                </p>
                <p className="mb-3 text-xs text-zinc-500">
                  Each save bumps the version so Discord re-scrapes the new
                  title/description.
                </p>
                <CopyLinkButton value={shareUrl(id, savedVersion)} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </RequireAuth>
  );
}
