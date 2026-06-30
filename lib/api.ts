/**
 * Typed API client for the browser.
 *
 * All requests send `credentials: 'include'` so the httpOnly auth cookie set by
 * the backend travels with every call. Errors are normalized into a thrown
 * Error whose `.message` is the backend's `error` string (or a fallback).
 */
import { PUBLIC_API_URL } from "./env";
import type {
  AuthResponse,
  AuthUser,
  MediaOwner,
  MediaPublic,
} from "./types";

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && String((data as { error: unknown }).error)) ||
      `Request failed (${res.status})`;
    throw new ApiClientError(message, res.status);
  }

  return data as T;
}

// --- Auth ------------------------------------------------------------------

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  me: () => request<{ user: AuthUser | null }>("/api/auth/me"),

  // --- Media -------------------------------------------------------------

  /** Upload a media file with optional title/description (multipart). */
  upload: (file: File, title: string, description: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    form.append("description", description);
    return request<{ media: MediaOwner }>("/api/media/", {
      method: "POST",
      body: form,
      // Do NOT set Content-Type; the browser sets the multipart boundary.
    });
  },

  listMedia: () => request<{ media: MediaOwner[] }>("/api/media/"),

  updateMedia: (id: string, title: string, description: string) =>
    request<{ media: MediaOwner }>(`/api/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    }),

  deleteMedia: (id: string) =>
    request<{ ok: true }>(`/api/media/${id}`, { method: "DELETE" }),
};

/**
 * Server-side fetch for use in Server Components / generateMetadata.
 * Returns the public media DTO or null if not found. Uses SERVER_API_URL so
 * it works regardless of the browser-facing host.
 */
export async function fetchPublicMedia(id: string): Promise<MediaPublic | null> {
  const { SERVER_API_URL } = await import("./env");
  try {
    const res = await fetch(`${SERVER_API_URL}/api/media/${id}`, {
      // Always fresh: generateMetadata must reflect the latest title/desc.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { media: MediaPublic };
    return data.media;
  } catch {
    return null;
  }
}
