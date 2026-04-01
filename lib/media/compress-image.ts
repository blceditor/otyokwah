/**
 * REQ-MEDIA-COMPRESS: Client-side image compression using Canvas API.
 * Resizes images >1920px and quality-compresses images >500KB.
 * No external dependencies.
 */

export const MAX_IMAGE_DIMENSION = 1920;
export const COMPRESSION_QUALITY = 0.8;
export const COMPRESSION_SIZE_THRESHOLD = 500 * 1024;
export const IMAGE_COMPRESS_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export async function compressImage(file: File): Promise<File> {
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  if (!IMAGE_COMPRESS_EXTENSIONS.includes(ext)) return file;
  if (file.size < COMPRESSION_SIZE_THRESHOLD) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const needsResize =
        width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION;

      if (needsResize) {
        const scale = Math.min(
          MAX_IMAGE_DIMENSION / width,
          MAX_IMAGE_DIMENSION / height,
        );
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: file.type }));
        },
        ext === ".png" ? "image/png" : "image/jpeg",
        COMPRESSION_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}
