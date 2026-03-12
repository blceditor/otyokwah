// REQ-Q2-007: Initialize scroll animations on client side
'use client';

import { useEffect } from 'react';
import { initScrollAnimations } from '@/lib/scroll-animations';

export default function ScrollAnimationsInit() {
  useEffect(() => {
    // Initialize scroll animations after component mounts
    initScrollAnimations();
  }, []);

  return null; // This component doesn't render anything
}
