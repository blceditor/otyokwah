// REQ-004: Image Upload Validation
export type ImageValidationResult = {
  valid: boolean;
  error?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  size?: number;
};

export type ImageType = 'hero' | 'social' | 'gallery' | 'thumbnail' | 'general';

export type RecommendedDimensions = {
  width: number;
  height: number;
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function validateImageFile(
  file: File
): Promise<ImageValidationResult> {
  // Validate file size
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image size ${formatFileSize(file.size)} exceeds limit of ${formatFileSize(MAX_SIZE_BYTES)}`,
      size: file.size,
    };
  }

  // Validate file type
  if (!validateImageType(file)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Accepted: JPG, PNG, WebP, AVIF`,
      size: file.size,
    };
  }

  // Extract dimensions
  try {
    const dimensions = await extractImageDimensions(file);
    return {
      valid: true,
      dimensions,
      size: file.size,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to read image file. File may be corrupt or invalid.',
      size: file.size,
    };
  }
}

export function getRecommendedDimensions(imageType: ImageType): RecommendedDimensions {
  const dimensions: Record<ImageType, RecommendedDimensions> = {
    hero: { width: 1920, height: 1080 },
    social: { width: 1200, height: 630 },
    gallery: { width: 1200, height: 800 },
    thumbnail: { width: 400, height: 300 },
    general: { width: 1200, height: 800 },
  };

  return dimensions[imageType];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return kb % 1 === 0 ? `${kb} KB` : `${kb.toFixed(1)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return mb % 1 === 0 ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

export async function extractImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export function validateImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  return validTypes.includes(file.type);
}
