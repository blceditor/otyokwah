'use client';

import Image from 'next/image';

interface SparkryBrandingProps {
  darkMode?: boolean;
}

export function SparkryBranding({ darkMode = false }: SparkryBrandingProps) {
  return (
    <a
      href="https://sparkry.ai"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center hover:opacity-80 transition-opacity"
      aria-label="Built & Powered by Sparkry.AI"
      title="Built & Powered by Sparkry.AI"
    >
      <Image
        src={darkMode ? '/sparkry-logo-inverted.png' : '/sparkry-logo.png'}
        alt="Sparkry AI"
        width={100}
        height={28}
        className={`${darkMode ? 'h-6' : 'h-8'} w-auto object-contain`}
        unoptimized
      />
    </a>
  );
}

export default SparkryBranding;
