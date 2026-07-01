"use client";

/**
 * Dashboard (auth-gated). Lists the user's uploads with copy-link, edit, and
 * delete actions. Loads media on mount via the API; supports optimistic delete
 * with rollback on failure.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { MediaCard } from "@/components/MediaCard";
import { api } from "@/lib/api";
import type { MediaOwner } from "@/lib/types";

export default function DashboardPage() {
  const [items, setItems] = useState<MediaOwner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { media } = await api.listMedia();
      setItems(media);
    } catch {
      setError("Couldn't load your media. Please refresh.");
    }
  }, []);

  useEffect(() => {
    // Client-side data fetch on mount: intentional, so disable the
    // react-hooks/set-state-in-effect rule for this fetch-then-setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function onDelete(id: string) {
    if (!confirm("Delete this media? This cannot be undone.")) return;
    const snapshot = items;
    setItems((prev) => prev?.filter((m) => m.id !== id) ?? null);
    setDeletingId(id);
    try {
      await api.deleteMedia(id);
    } catch {
      setItems(snapshot);
      setError("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your media</h1>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Upload
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {items === null ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="mb-4 text-zinc-500">You haven&apos;t uploaded anything yet.</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" /> Upload your first media
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((m) => (
              <MediaCard
                key={m.id}
                media={m}
                onDelete={onDelete}
                deletingId={deletingId}
              />
            ))}
          </ul>
        )}
      </div>
    </RequireAuth>
  );
}
