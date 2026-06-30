"use client";

/**
 * Renders an image or video element based on the media's mimeType.
 *
 * Uses plain <img>/<video> (not next/image) so arbitrary user uploads, GIFs,
 * and videos all display with zero remote-pattern configuration. The eslint
 * <img> warning is disabled per-line for this reason.
 */
import type { MediaPublic } from "@/lib/types";

export function MediaPreview({
  media,
  className,
}: {
  media: Pick<MediaPublic, "fileUrl" | "mimeType" | "isVideo" | "title">;
  className?: string;
}) {
  if (media.isVideo) {
    return (
      <video
        controls
        className={className}
        src={media.fileUrl}
        title={media.title}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={media.fileUrl}
      alt={media.title}
      loading="lazy"
    />
  );
}
