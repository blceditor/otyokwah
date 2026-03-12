import TestimonialsVideoPlayer from './TestimonialsVideoPlayer';
import { homepageConfig } from '@/lib/config/homepage';

interface TestimonialsProps {
  className?: string;
}

export default function Testimonials({ className = '' }: TestimonialsProps) {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className={`py-section-y md:py-section-y-md bg-sand ${className}`}
    >
      <div className="container mx-auto px-4">
        <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold text-center text-bark mb-12">
          Hear From Families
        </h2>

        {/* REQ-Q2-004: 3 Video Testimonials (parent, camper, staff) with lazy-loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {homepageConfig.testimonialVideos.map((video) => (
            <TestimonialsVideoPlayer
              key={video.id}
              videoId={video.id}
              caption={video.caption}
              thumbnail={video.thumbnail}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
