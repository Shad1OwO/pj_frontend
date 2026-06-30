/**
 * Shared types mirroring the backend DTOs (see pj_backend/src/lib/media.ts).
 * Keeping these in sync lets the frontend be fully typed against the API.
 */

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
}

/** Public media shape (GET /api/media/:id). No owner-only fields. */
export interface MediaPublic {
  id: string;
  title: string;
  description: string;
  originalFilename: string;
  mimeType: string;
  isVideo: boolean;
  width: number | null;
  height: number | null;
  size: number;
  /** Absolute URL to the raw file — used as og:image / og:video src. */
  fileUrl: string;
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
