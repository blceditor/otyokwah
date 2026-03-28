/**
 * REQ-MEDIA-001: Media upload constants
 * Shared between the media API route and tests.
 */

export const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
export const VIDEO_EXTENSIONS = [".mp4", ".webm"];
export const ALLOWED_MEDIA_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];
export const ALLOWED_EXTENSIONS = [...ALLOWED_MEDIA_EXTENSIONS, ...DOCUMENT_EXTENSIONS];

/** Vercel serverless body limit is ~4.5MB; use 3.5MB with margin for multipart overhead */
export const DIRECT_UPLOAD_THRESHOLD = 3.5 * 1024 * 1024;

export function getMaxFileSize(extension: string): number {
  const isDocument = DOCUMENT_EXTENSIONS.includes(extension);
  const isVideo = VIDEO_EXTENSIONS.includes(extension);
  return isDocument ? 10 * 1024 * 1024 : isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
}

export function getMaxFileSizeLabel(extension: string): string {
  const isDocument = DOCUMENT_EXTENSIONS.includes(extension);
  const isVideo = VIDEO_EXTENSIONS.includes(extension);
  return isDocument ? "10MB" : isVideo ? "50MB" : "10MB";
}

export function isDocumentExtension(ext: string): boolean {
  return DOCUMENT_EXTENSIONS.includes(ext);
}
