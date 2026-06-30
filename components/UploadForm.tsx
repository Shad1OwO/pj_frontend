"use client";

/**
 * Upload form: file picker + title + description.
 *
 * Validates client-side (size/type) before POSTing as multipart. On success,
 * calls onUploaded with the created media so the parent can react (e.g. show
 * the share link or navigate to the dashboard).
 */
import { useState, useRef, type FormEvent } from "react";
import { Upload, Loader2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api";
import type { MediaOwner } from "@/lib/types";

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPTED =
  "image/png,image/jpeg,image/gif,image/webp,image/bmp,image/x-icon,image/tiff,video/mp4,video/webm,video/ogg,video/quicktime";

export function UploadForm({
  onUploaded,
}: {
  onUploaded: (media: MediaOwner) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (f && f.size > MAX_BYTES) {
      setError(`File is too large (max ${MAX_BYTES / 1024 / 1024} MB).`);
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose a file.");
      return;
    }
    setBusy(true);
    try {
      const { media } = await api.upload(file, title, description);
      onUploaded(media);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          File <span className="text-red-500">*</span>
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={onPick}
          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:text-zinc-400 dark:file:bg-indigo-950 dark:file:text-indigo-300"
        />
        {file && (
          <span className="text-xs text-zinc-500">
            {file.name} ({Math.round(file.size / 1024)} KB)
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </span>
        <input
          type="text"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A short title (optional)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </span>
        <textarea
          value={description}
          maxLength={2000}
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Shown under the image in Discord (optional)"
          className="resize-y rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !file}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {busy ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
