/**
 * Normalizes relative image paths from Keystatic fields.image().
 * Keystatic stores filenames without the publicPath prefix in YAML,
 * but the reader should prepend it. When it doesn't (e.g., hero images
 * read via reader), this function adds the /images/ prefix.
 */
export function normalizeImagePath(path: string): string {
  if (!path || path.startsWith("/") || path.startsWith("http")) return path;
  return `/images/${path}`;
}
