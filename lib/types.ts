/**
 * Shared types mirroring the backend DTOs (see pj_backend/src/lib/media.ts).
 * Keeping these in sync lets the frontend be fully typed against the API.
 */

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  user: AuthUser;
}

/** Per-media visibility toggles for the optional info (size/time/uploader). */
export interface MediaToggles {
  showSize: boolean;
  showTimestamp: boolean;
  showUploader: boolean;
}

/** Public media shape (GET /api/media/:id). No owner-only fields. */
export interface MediaPublic extends MediaToggles {
  id: string;
  title: string;
  description: string;
  originalFilename: string;
  mimeType: string;
  isVideo: boolean;
  width: number | null;
  height: number | null;
  size: number;
  /**
   * Public uploader label, present ONLY when showUploader is on. Null otherwise.
   */
  uploaderName: string | null;
  /** Absolute URL to the raw file — used as og:image / og:video src. */
  fileUrl: string;
  /** Bumped on every edit so the share URL forces Discord to re-scrape. */
  scrapeVersion: number;
  createdAt: number;
  updatedAt: number;
}

/** Owner media shape (dashboard / edit). Extends public with owner fields. */
export interface MediaOwner extends MediaPublic {
  userId: string;
  storedFilename: string;
}

export interface ApiError {
  error: string;
}
