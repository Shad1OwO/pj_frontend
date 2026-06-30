/**
 * Environment access for the frontend.
 *
 * - `NEXT_PUBLIC_API_URL`: browser-side calls (must be public, inlined at build).
 * - `API_URL`: server-side calls inside Next.js (generateMetadata, route
 *   handlers) — stays private and can differ from the public URL.
 *
 * In local dev both default to http://localhost:3001. In production they point
 * at the deployed backend host.
 */

export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Server-only base URL; falls back to the public one if unset. */
export const SERVER_API_URL =
  process.env.API_URL ?? PUBLIC_API_URL;

/**
 * The absolute base origin of THIS frontend, used to build the shareable
 * /v/[id] link that gets pasted into Discord. On the server we can derive it
 * from the request, but a configured value is most reliable.
 */
export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
