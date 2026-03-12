import Image from 'next/image';

interface GalleryProps {
  className?: string;
}

const galleryImages = [
  {
    src: '/images/summer-program-and-general/campfire.jpg',
    alt: 'Campers gathered around campfire for evening worship and fellowship',
  },
  {
    src: '/images/summer-program-and-general/backflip-water.jpg',
    alt: 'Camper doing backflip off dock into the lake',
  },
  {
    src: '/images/summer-program-and-general/bible-study.jpg',
    alt: 'Small group Bible study session with campers and counselor',
  },
  {
    src: '/images/summer-program-and-general/volleyball.jpg',
    alt: 'Campers playing volleyball on the beach at sunset',
  },
  {
    src: '/images/summer-program-and-general/water-launch.jpg',
    alt: 'Campers laughing while playing on the water blob',
  },
  {
    src: '/images/summer-program-and-general/crafts.jpg',
    alt: 'Campers working on creative arts and crafts projects',
  },
];

export default function Gallery({ className = '' }: GalleryProps) {
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className={`py-section-y md:py-section-y-md bg-cream ${className}`}
    >
      <div className="container mx-auto px-4">
        <h2 id="gallery-heading" className="text-3xl md:text-4xl font-bold text-center text-bark mb-12">
          Life at Camp
        </h2>

        {/* REQ-Q1-002: Gallery with 6 authentic camp photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((image, idx) => (
            <div
              key={image.src}
              className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
                loading={idx < 3 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
