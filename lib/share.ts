/**
 * Helpers for building the shareable /v/[id] link that gets pasted into Discord.
 *
 * The `?v={scrapeVersion}` query forces Discord's crawler to treat edits as a
 * fresh URL (Discord caches OG data per-URL), so updated titles/descriptions
 * actually get re-scraped.
 */
import { PUBLIC_SITE_URL } from "./env";

export function shareUrl(
  mediaId: string,
  scrapeVersion: number,
  absolute = true,
): string {
  const path = `/v/${mediaId}?v=${scrapeVersion}`;
  return absolute ? `${PUBLIC_SITE_URL}${path}` : path;
}
