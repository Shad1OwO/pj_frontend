"use client";

/**
 * Account page (auth-gated). Lets the current user edit their display name,
 * which is shown publicly when a media's "show uploader" toggle is on.
 */
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import { api, ApiClientError } from "@/lib/api";

export default function AccountPage() {
  const { user, refresh } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Pre-fill once the user object is available.
  useEffect(() => {
    // Deliberate client-side sync of the user's display name into the form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayName(user?.displayName ?? "");
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await api.updateProfile(displayName.trim());
      await refresh();
      setSaved(true);
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
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <h1 className="mb-1 text-2xl font-bold">Account</h1>
        <p className="mb-6 text-sm text-zinc-500">
          Manage how you appear publicly.
        </p>

        <div className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Signed in as</p>
          <p className="text-sm font-medium">{user?.email}</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Display name</span>
            <input
              type="text"
              maxLength={40}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Shown when you enable 'who uploaded it'"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <span className="text-xs text-zinc-500">
              If empty, a masked version of your email is used instead.
            </span>
          </label>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          {saved && !error && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Saved.
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
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </RequireAuth>
  );
}
