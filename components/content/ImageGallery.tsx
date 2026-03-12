// REQ-201: Image Gallery Content Component
// REQ-UAT-003: Gallery Component with lightbox
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  layout?: "grid" | "masonry" | "carousel";
  columns?: number;
}

export function ImageGallery({
  images,
  layout = "grid",
  columns = 3,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setCurrentSlide(index);
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const navigateSlide = useCallback(
    (direction: "prev" | "next") => {
      const newIndex =
        direction === "next"
          ? (currentSlide + 1) % images.length
          : (currentSlide - 1 + images.length) % images.length;
      setCurrentSlide(newIndex);
    },
    [currentSlide, images.length],
  );

  // REQ-UAT-003: Keyboard navigation for lightbox accessibility
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          navigateSlide("prev");
          break;
        case "ArrowRight":
          navigateSlide("next");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, closeLightbox, navigateSlide]);

  const gridClass =
    layout === "masonry"
      ? "columns-1 sm:columns-2 lg:columns-3 gap-4"
      : `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4`;

  if (layout === "carousel") {
    return (
      <div
        data-component="gallery"
        className="carousel-container relative my-8"
      >
        <div className="overflow-hidden rounded-lg shadow-lg">
          <div className="relative h-96">
            <Image
              src={images[currentSlide].src}
              alt={images[currentSlide].alt}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <button
          onClick={() => navigateSlide("prev")}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
          aria-label="Previous image"
        >
          ←
        </button>
        <button
          onClick={() => navigateSlide("next")}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
          aria-label="Next image"
        >
          →
        </button>
        {images[currentSlide].caption && (
          <p className="mt-2 text-center text-sm text-stone">
            {images[currentSlide].caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        data-component="gallery"
        className={`image-gallery my-8 ${gridClass}`}
      >
        {images.filter(img => img.src).map((image, index) => (
          <div
            key={index}
            className={layout === "masonry" ? "break-inside-avoid mb-4" : ""}
          >
            <button
              onClick={() => openLightbox(index)}
              className="block w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </button>
            {image.caption && (
              <p className="mt-2 text-sm text-stone text-center">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="lightbox fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Image lightbox"
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-stone/50"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-stone/50"
            onClick={(e) => {
              e.stopPropagation();
              navigateSlide("prev");
            }}
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-stone/50"
            onClick={(e) => {
              e.stopPropagation();
              navigateSlide("next");
            }}
            aria-label="Next image"
          >
            →
          </button>
          <div className="max-w-7xl max-h-full p-8">
            <Image
              src={images[currentSlide].src}
              alt={images[currentSlide].alt}
              width={images[currentSlide].width || 1920}
              height={images[currentSlide].height || 1080}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images[currentSlide].caption && (
              <p className="mt-4 text-white text-center">
                {images[currentSlide].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ImageGallery;
