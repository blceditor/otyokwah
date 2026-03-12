import { Testimonial } from "./Testimonial";

export interface TestimonialData {
  quote: string;
  name: string;
  role: string;
}

export interface TestimonialWidgetProps {
  mode?: "specific" | "random";
  quote?: string;
  author?: string;
  role?: string;
  testimonials?: TestimonialData[];
}

function getDeterministicIndex(length: number): number {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dayOfYear % length;
}

export function TestimonialWidget({
  mode = "specific",
  quote,
  author,
  role,
  testimonials,
}: TestimonialWidgetProps): JSX.Element | null {
  if (mode === "specific" && quote && author) {
    return <Testimonial quote={quote} author={author} role={role} />;
  }

  if (mode === "random") {
    if (testimonials && testimonials.length > 0) {
      const index = getDeterministicIndex(testimonials.length);
      const t = testimonials[index];
      return <Testimonial quote={t.quote} author={t.name} role={t.role} />;
    }

    if (quote && author) {
      return <Testimonial quote={quote} author={author} role={role} />;
    }
    return null;
  }

  return null;
}

TestimonialWidget.displayName = "TestimonialWidget";

export default TestimonialWidget;
