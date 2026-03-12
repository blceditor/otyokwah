import Image from 'next/image';
import { sanitizeHTML } from '@/lib/security/sanitize';

interface SplitContentProps {
  image: string;
  heading: string;
  content: string;
  imagePosition?: 'left' | 'right';
}

export function SplitContent({
  image,
  heading,
  content,
  imagePosition = 'left',
}: SplitContentProps) {
  const isImageRight = imagePosition === 'right';
  const sanitizedContent = sanitizeHTML(content);

  return (
    <div
      className={`flex flex-col gap-8 md:flex-row md:items-center md:gap-12 lg:gap-16 ${
        isImageRight ? 'md:flex-row-reverse' : ''
      }`}
      data-testid="split-content"
    >
      <div className="relative h-64 w-full overflow-hidden rounded-lg md:h-96 md:w-1/2">
        <Image
          src={image}
          alt={heading}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1">
        <h2 className="mb-4 text-2xl font-bold text-bark sm:text-3xl md:text-4xl">
          {heading}
        </h2>
        <div
          className="text-base text-bark/80 sm:text-lg"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </div>
  );
}

export default SplitContent;
