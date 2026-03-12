import Image from 'next/image';
import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

export function Testimonial({
  quote,
  author,
  role,
  avatar,
  rating,
}: TestimonialProps) {
  return (
    <figure className="rounded-lg border border-stone/20 bg-white p-6 shadow-sm sm:p-8 md:p-10">
      {rating && (
        <div className="mb-4 flex gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
          {Array.from({ length: rating }).map((_, index) => (
            <Star
              key={index}
              className="h-5 w-5 fill-yellow-400 text-yellow-400"
              data-testid={`star-${index}`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      <blockquote className="mb-6 text-base text-bark/80 sm:text-lg">
        <p>&ldquo;{quote}&rdquo;</p>
      </blockquote>

      <figcaption className="flex items-center gap-4">
        {avatar && (
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image
              src={avatar}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}

        <div>
          <cite className="font-semibold text-bark not-italic">{author}</cite>
          {role && <div className="text-sm text-stone">{role}</div>}
        </div>
      </figcaption>
    </figure>
  );
}

export default Testimonial;
