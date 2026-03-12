"use client";

/**
 * Gallery Component
 * REQ-GALLERY-004: Reusable Gallery Component
 *
 * Responsive image gallery with lightbox modal
 */

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Image from "next/image";
import { isSafeImageUrl } from "@/lib/security/validate-url";

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryProps {
  images: GalleryImage[];
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export function Gallery({
  images,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
}: GalleryProps): JSX.Element {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out unsafe images
  const safeImages = images.filter((img) => isSafeImageUrl(img.src));

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }, [safeImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "Escape") {
        closeLightbox();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, goToNext, goToPrevious, closeLightbox]);

  const gridClasses = `grid grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop} gap-6`;

  if (safeImages.length === 0) {
    return <div />;
  }

  const currentImage = safeImages[currentIndex];

  return (
    <>
      {/* Gallery Grid */}
      <div
        data-component="gallery"
        data-testid="gallery-grid"
        className={gridClasses}
      >
        {safeImages.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="relative aspect-square">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            </div>
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                {image.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog
        open={isLightboxOpen}
        onClose={closeLightbox}
        className="relative z-50"
        aria-label="Image gallery lightbox"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/90" aria-hidden="true" />

        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="relative max-w-7xl w-full max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close lightbox"
              className="absolute top-0 right-0 z-10 text-white hover:text-white/70 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image Container */}
            <div className="relative flex-1 flex items-center justify-center">
              {currentImage && (
                <div className="relative w-full h-full">
                  <Image
                    src={currentImage.src}
                    alt={currentImage.alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-stone/50 p-2 bg-black/50 rounded-full"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-stone/50 p-2 bg-black/50 rounded-full"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Caption */}
            {currentImage?.caption && (
              <div className="mt-4 text-center text-white">
                <DialogTitle className="text-lg font-semibold">
                  {currentImage.caption}
                </DialogTitle>
              </div>
            )}

            {/* Image Counter */}
            {safeImages.length > 1 && (
              <div className="mt-2 text-center text-white/80 text-sm">
                {currentIndex + 1} / {safeImages.length}
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
