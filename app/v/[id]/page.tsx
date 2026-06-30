/**
 * Public embed page: GET /v/[id]?v={scrapeVersion}
 *
 * This is the URL that gets pasted into Discord. Its `generateMetadata`
 * (server-side) fetches the media's meta from the backend and emits Open Graph
 * + Twitter tags, so Discord renders a rich embed with the editable
 * title/description and the media inline.
 *
 * The page body is a Server Component that renders the media and a copy-link
 * button (the button is a small client island).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicMedia } from "@/lib/api";
import { shareUrl } from "@/lib/share";
import { PUBLIC_SITE_URL } from "@/lib/env";
import { ViewShareButton } from "./view-share-button";

// Always render fresh: edits must reflect immediately (Next 16 fetch is
// no-store by default, but we set this explicitly for clarity).
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

// --- Page body -------------------------------------------------------------

export default async function ViewPage({ params }: PageProps) {
  const { id } = await params;
  const media = await fetchPublicMedia(id);
  if (!media) {
    notFound();
  }

  const link = shareUrl(media.id, media.scrapeVersion, true);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="bg-black/95 flex items-center justify-center">
          {media.isVideo ? (
            <video
              controls
              autoPlay
              loop
              className="max-h-[70vh] w-full"
              src={media.fileUrl}
              title={media.title}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="max-h-[70vh] w-full object-contain"
              src={media.fileUrl}
              alt={media.title}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {media.title}
          </h1>
          {media.description && (
            <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
              {media.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-900">
            <ViewShareButton value={link} />
            <span className="font-mono text-xs text-zinc-400">
              {media.originalFilename}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
