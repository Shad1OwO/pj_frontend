/**
 * Public embed page: GET /v/[id]?v={scrapeVersion}
 *
 * This is the URL that gets pasted into Discord. Its `generateMetadata`
 * (server-side) fetches the media's meta from the backend and emits Open Graph
 * + Twitter tags, so Discord renders a rich embed with the editable
 * title/description and the media inline.
 *
 * The visible page body is intentionally MINIMAL: pure black background showing
 * ONLY the media. If the uploader opted into it, a subtle single grey line of
 * info (size / upload time / uploader) appears beneath the media. The title and
 * description are NOT shown on the page — they live only in the OG meta tags.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicMedia } from "@/lib/api";
import { PUBLIC_SITE_URL } from "@/lib/env";

// Always render fresh: edits must reflect immediately (Next 16 fetch is
// no-store by default, but we set this explicitly for clarity).
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/** Format a byte count as a compact human string (KB/MB). */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format a timestamp as a relative "x ago" string. */
function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

/** Build the subtle info line from whichever toggles the uploader enabled. */
function infoLine(
  m: NonNullable<Awaited<ReturnType<typeof fetchPublicMedia>>>,
): string | null {
  const parts: string[] = [];
  if (m.showSize) parts.push(formatSize(m.size));
  if (m.showTimestamp) parts.push(timeAgo(m.createdAt));
  if (m.showUploader && m.uploaderName) parts.push(`by ${m.uploaderName}`);
  return parts.length ? parts.join(" · ") : null;
}

// --- generateMetadata: the part Discord actually reads ---------------------

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const media = await fetchPublicMedia(id);
  if (!media) {
    return { title: "Media not found" };
  }

  // Build the canonical share URL (with scrape version) for og:url.
  const url = `${PUBLIC_SITE_URL}/v/${media.id}?v=${media.scrapeVersion}`;

  // Known image dimensions (if any) for og:image width/height.
  const hasDims = !!media.width && !!media.height;
  const dims = hasDims
    ? { width: media.width as number, height: media.height as number }
    : null;

  if (media.isVideo) {
    // Video embed: og:video + a poster image. Discord shows the player card.
    // The Open Graph video tags are what Discord actually reads; the twitter
    // player card requires known width/height, so we only set it when we have
    // dimensions (otherwise fall back to a large-image card).
    const video = {
      url: media.fileUrl,
      secureUrl: media.fileUrl,
      type: media.mimeType,
      ...(dims ? { width: dims.width, height: dims.height } : {}),
    };
    const twitter: Metadata["twitter"] = dims
      ? {
        card: "player",
        title: media.title,
        description: media.description,
        images: [media.fileUrl],
        players: [
          {
            playerUrl: url,
            streamUrl: media.fileUrl,
            width: dims.width,
            height: dims.height,
          },
        ],
      }
      : {
        card: "summary_large_image",
        title: media.title,
        description: media.description,
        images: [media.fileUrl],
      };
    return {
      title: media.title,
      description: media.description,
      alternates: { canonical: url },
      openGraph: {
        type: "video.other",
        title: media.title,
        description: media.description,
        url,
        siteName: "NCZ host",
        images: [{ url: media.fileUrl, alt: media.title }],
        videos: [video],
      },
      twitter,
    };
  }

  // Image (incl. GIF) embed.
  const image = {
    url: media.fileUrl,
    alt: media.title,
    ...(dims ? { width: dims.width, height: dims.height } : {}),
  };
  return {
    title: media.title,
    description: media.description,
    alternates: { canonical: url },
    openGraph: {
      type: media.mimeType === "image/gif" ? "article" : "website",
      title: media.title,
      description: media.description,
      url,
      siteName: "NCZ host",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: media.title,
      description: media.description,
      images: [media.fileUrl],
    },
  };
}

// --- Page body: pure black, media only -------------------------------------

export default async function ViewPage({ params }: PageProps) {
  const { id } = await params;
  const media = await fetchPublicMedia(id);
  if (!media) {
    notFound();
  }

  const info = infoLine(media);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-4 py-8">
      {media.isVideo ? (
        <video
          controls
          autoPlay
          loop
          className="max-h-[85vh] w-auto max-w-full object-contain"
          src={media.fileUrl}
          title={media.title}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="max-h-[85vh] w-auto max-w-full object-contain"
          src={media.fileUrl}
          alt={media.title}
        />
      )}

      {info && (
        <p className="mt-4 select-text text-center text-xs text-zinc-500">
          {info}
        </p>
      )}
    </div>
  );
}
