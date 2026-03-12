export function trackEvent(action: string, params?: Record<string, string>) {
  if (typeof window !== "undefined" && "gtag" in window) {
    window.gtag("event", action, params);
  }
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}
