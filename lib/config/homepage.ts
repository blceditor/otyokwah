// REQ-Q2-001: Hero video configuration (optional)
export interface HeroVideoSources {
  webm?: string;
  mp4?: string;
  poster?: string;
}

// REQ-Q2-004: Testimonial videos array (expanded to 3)
export interface TestimonialVideo {
  id: string;
  caption: string;
  thumbnail: string;
}

export const homepageConfig = {
  // REQ-Q2-001: Hero video (placeholder - swap with real footage when available)
  heroVideo: {
    webm: '/videos/hero-camp.webm',
    mp4: '/videos/hero-camp.mp4',
    poster: '/uploads/heroes/program-page-test/heroImage.jpg',
  } as HeroVideoSources,

  // REQ-Q2-004: Testimonial videos (3 total: parent, camper, staff)
  testimonialVideos: [
    {
      id: 'dQw4w9WgXcQ', // Parent testimonial
      caption: 'Parent: "Our son came home with a deeper faith"',
      thumbnail: '/testimonials/parent-thumb.jpg',
    },
    {
      id: 'placeholder-camper', // Camper testimonial (placeholder)
      caption: 'Camper: "I made friends who challenge me to grow"',
      thumbnail: '/testimonials/camper-thumb.jpg',
    },
    {
      id: 'placeholder-staff', // Staff testimonial (placeholder)
      caption: 'Staff: "Watching students encounter Christ is life-changing"',
      thumbnail: '/testimonials/staff-thumb.jpg',
    },
  ] as TestimonialVideo[],

  // Legacy single video support (deprecated, kept for backward compatibility)
  testimonialVideoId: process.env.NEXT_PUBLIC_TESTIMONIAL_VIDEO_ID || 'dQw4w9WgXcQ',
  testimonialCaption: "Parent: \"Our son came home with a deeper faith\"",
} as const;
