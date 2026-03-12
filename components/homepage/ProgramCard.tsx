import Image from 'next/image';
import Link from 'next/link';

interface ProgramCardProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  benefits: string[];
  ctaText: string;
  ctaHref: string;
}

export default function ProgramCard({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  benefits,
  ctaText,
  ctaHref,
}: ProgramCardProps) {
  return (
    <div className="program-card group bg-cream rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-bark mb-2">{title}</h3>
        <p className="text-sm text-stone mb-2">{subtitle}</p>
        <ul className="space-y-2 mb-6">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start">
              <span className="text-secondary font-bold mr-2">✓</span>
              <span className="text-bark">{benefit}</span>
            </li>
          ))}
        </ul>
        <Link
          href={ctaHref}
          className="inline-block w-full text-center bg-secondary hover:bg-secondary-light text-cream font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
}
