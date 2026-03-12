/**
 * REQ-681: Image Section component for Markdoc
 * Large prominent image with optional text overlay
 */

import React from 'react';
import Image from 'next/image';

interface ImageSectionProps {
  image: string;
  alt: string;
  overlayText?: string;
  overlayPosition?: 'center' | 'bottom' | 'top';
  height?: 'sm' | 'md' | 'lg' | 'xl';
}

const heightMap: Record<string, string> = {
  sm: 'h-[300px]',
  md: 'h-[500px]',
  lg: 'h-[700px]',
  xl: 'h-[900px]',
};

const positionMap: Record<string, string> = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-16',
  bottom: 'items-end justify-center pb-16',
};

export function ImageSection({
  image,
  alt,
  overlayText,
  overlayPosition = 'center',
  height = 'md',
}: ImageSectionProps) {
  const heightClass = heightMap[height] || heightMap.md;
  const positionClass = positionMap[overlayPosition] || positionMap.center;

  return (
    <section
      className={`relative w-full ${heightClass} my-8 rounded-lg overflow-hidden`}
      data-testid="image-section"
    >
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
      />
      {overlayText && (
        <div className={`absolute inset-0 flex ${positionClass} bg-black/30`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center px-6 drop-shadow-lg">
            {overlayText}
          </h2>
        </div>
      )}
    </section>
  );
}

export default ImageSection;
