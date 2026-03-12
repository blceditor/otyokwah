// REQ-Q2-007: Implement Scroll Animations
// Subtle fade-in animations using Intersection Observer API
// Respects prefers-reduced-motion for accessibility

/**
 * Trigger animations when element is 20% visible in viewport.
 * Lower values = animations trigger sooner (may animate before user sees).
 * Higher values = animations trigger later (may miss animations on fast scrolls).
 */
const ANIMATION_VISIBILITY_THRESHOLD = 0.2;

export function initScrollAnimations(): void {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Don't initialize animations if user prefers reduced motion
    return;
  }

  // Select all elements with fade-trigger class
  const fadeElements = document.querySelectorAll('.fade-trigger');

  if (fadeElements.length === 0) {
    return;
  }

  // Create Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add fade-in class when element reaches threshold
          entry.target.classList.add('fade-in');
          // Unobserve after animation triggers (performance optimization)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: ANIMATION_VISIBILITY_THRESHOLD,
      rootMargin: '0px', // No margin adjustment
    }
  );

  // Observe all fade-trigger elements
  fadeElements.forEach((element) => {
    observer.observe(element);
  });
}
