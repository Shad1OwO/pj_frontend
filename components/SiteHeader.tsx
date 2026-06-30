"use client";

/**
 * Top navigation bar. Shows the brand, and auth-aware links: dashboard/upload
 * when logged in, login/register otherwise. Reads user state from AuthProvider.
 */
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";
import Image from "next/image";

export function SiteHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100"
        >
          <span className="grid h-20 w-20 place-items-center">
            <Image src="/icon.ico" alt="" width={128} height={128}/>
          </span>
          NCZ host
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="rounded-md px-3 py-1.5 font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Upload
              </Link>
              <span className="hidden px-2 text-zinc-400 sm:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
