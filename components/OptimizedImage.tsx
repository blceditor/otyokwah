// REQ-103: Next.js Image Optimization Component
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  loading,
  quality = 85,
  ...props
}: OptimizedImageProps) {
  // Convert relative paths to absolute
  const imageSrc = src.startsWith('/') ? src : `/${src}`;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      quality={quality}
      loading={priority ? undefined : loading || 'lazy'}
      priority={priority}
      {...props}
    />
  );
}

export default OptimizedImage;