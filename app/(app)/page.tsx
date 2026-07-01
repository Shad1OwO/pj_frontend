"use client";

/**
 * Landing page. Auth-aware: logged-in users see a shortcut to their dashboard;
 * logged-out users see a marketing-style explainer with CTAs.
 */
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Image as ImageIcon, MessageSquare, Pencil } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Soft-redirect authenticated users to their dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <ImageIcon className="h-3.5 w-3.5" /> Image · GIF · Video
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Share media that embeds beautifully in Discord
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Upload an image, GIF, or video. Get a link. Paste it in Discord and it
          shows up as a rich embed — with an editable title and description.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!loading && !user && (
            <>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Get started — it&apos;s free
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Login
              </Link>
            </>
          )}
          {!loading && user && (
            <Link
              href="/dashboard"
              className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Go to dashboard
            </Link>
          )}
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        <Feature
          icon={<ImageIcon className="h-5 w-5" />}
          title="Upload once"
          body="PNG, JPEG, GIF, WebP, MP4, WebM and more — stored and served from your own host."
        />
        <Feature
          icon={<MessageSquare className="h-5 w-5" />}
          title="Embeds in Discord"
          body="The share link emits Open Graph tags, so Discord renders your media inline as a rich embed."
        />
        <Feature
          icon={<Pencil className="h-5 w-5" />}
          title="Edit anytime"
          body="Change the title or description whenever. Each edit bumps a version that forces Discord to re-scrape."
        />
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
