'use client';

import { useRouter } from 'next/navigation';
import { MediaLibrary } from '@/components/keystatic/MediaLibrary';

/**
 * REQ-FUTURE-007: Media Library Page
 *
 * Standalone page for browsing and managing media files.
 */
export default function MediaPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/keystatic');
  };

  return (
    <div className="h-screen">
      <MediaLibrary onClose={handleClose} />
    </div>
  );
}
