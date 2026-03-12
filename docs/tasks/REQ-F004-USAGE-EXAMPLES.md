# FAQ Accordion Component - Usage Examples

## Basic Usage with Keystatic Reader

### Server Component (Recommended)

```typescript
// app/faq/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { FAQAccordion } from '@/components/content/FAQAccordion';

export default async function FAQPage() {
  // Fetch all FAQs from Keystatic
  const allFAQs = await reader.collections.faqs.all();

  // Filter published FAQs and sort by order
  const publishedFAQs = allFAQs
    .filter((faq) => faq.entry.published)
    .sort((a, b) => a.entry.order - b.entry.order)
    .map((faq) => ({
      question: faq.entry.question,
      answer: faq.entry.answer,
      category: faq.entry.category,
    }));

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Frequently Asked Questions</h1>
      <FAQAccordion items={publishedFAQs} />
    </main>
  );
}
```

## Category-Specific FAQs

### Show Only Summer Camp FAQs

```typescript
// app/summer-camp/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { FAQAccordion } from '@/components/content/FAQAccordion';

export default async function SummerCampPage() {
  const allFAQs = await reader.collections.faqs.all();

  // Filter for summer-camp category only
  const summerCampFAQs = allFAQs
    .filter((faq) => faq.entry.published && faq.entry.category === 'summer-camp')
    .sort((a, b) => a.entry.order - b.entry.order)
    .map((faq) => ({
      question: faq.entry.question,
      answer: faq.entry.answer,
      category: faq.entry.category,
    }));

  return (
    <div>
      <h2>Summer Camp FAQs</h2>
      <FAQAccordion items={summerCampFAQs} />
    </div>
  );
}
```

## Allow Multiple Open Items

### Registration Page with Multiple FAQs Open

```typescript
// app/register/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { FAQAccordion } from '@/components/content/FAQAccordion';

export default async function RegisterPage() {
  const allFAQs = await reader.collections.faqs.all();

  const registrationFAQs = allFAQs
    .filter((faq) => faq.entry.published && faq.entry.category === 'registration')
    .sort((a, b) => a.entry.order - b.entry.order)
    .map((faq) => ({
      question: faq.entry.question,
      answer: faq.entry.answer,
      category: faq.entry.category,
    }));

  return (
    <div>
      <h2>Registration Questions</h2>
      {/* Allow multiple FAQs to be open at once */}
      <FAQAccordion items={registrationFAQs} allowMultiple={true} />
    </div>
  );
}
```

## Custom Styling

### FAQ Section with Custom Container Styles

```typescript
// app/about/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { FAQAccordion } from '@/components/content/FAQAccordion';

export default async function AboutPage() {
  const allFAQs = await reader.collections.faqs.all();

  const generalFAQs = allFAQs
    .filter((faq) => faq.entry.published && faq.entry.category === 'general')
    .sort((a, b) => a.entry.order - b.entry.order)
    .map((faq) => ({
      question: faq.entry.question,
      answer: faq.entry.answer,
      category: faq.entry.category,
    }));

  return (
    <section className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Common Questions
        </h2>
        {/* Custom className for additional spacing */}
        <FAQAccordion items={generalFAQs} className="max-w-3xl mx-auto" />
      </div>
    </section>
  );
}
```

## Static Data (Without Keystatic)

### Hardcoded FAQs for Testing

```typescript
// app/test/page.tsx
import { FAQAccordion, type FAQItem } from '@/components/content/FAQAccordion';

const MOCK_FAQS: FAQItem[] = [
  {
    question: 'What ages do you serve?',
    answer: 'We offer programs for kids ages 8-18, divided into age-appropriate groups.',
    category: 'summer-camp',
  },
  {
    question: 'When is the registration deadline?',
    answer: 'Registration typically closes two weeks before each session starts.',
    category: 'registration',
  },
  {
    question: 'What are the staff requirements?',
    answer: 'Staff must be 18+ years old and complete a background check.',
    category: 'staff',
  },
];

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Test FAQs</h1>
      <FAQAccordion items={MOCK_FAQS} />
    </div>
  );
}
```

## Multiple FAQ Sections on One Page

### Homepage with Top FAQs from Each Category

```typescript
// app/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { FAQAccordion } from '@/components/content/FAQAccordion';

export default async function HomePage() {
  const allFAQs = await reader.collections.faqs.all();

  // Get top 2 FAQs from each category
  const topFAQs = allFAQs
    .filter((faq) => faq.entry.published)
    .sort((a, b) => a.entry.order - b.entry.order)
    .reduce((acc, faq) => {
      const category = faq.entry.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      if (acc[category].length < 2) {
        acc[category].push({
          question: faq.entry.question,
          answer: faq.entry.answer,
          category: faq.entry.category,
        });
      }
      return acc;
    }, {} as Record<string, FAQItem[]>);

  const topFAQsList = Object.values(topFAQs).flat();

  return (
    <main>
      {/* Other homepage sections */}

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Quick Answers
          </h2>
          <FAQAccordion items={topFAQsList} className="max-w-4xl mx-auto" />
          <div className="mt-8 text-center">
            <a
              href="/faq"
              className="inline-block rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary-dark"
            >
              View All FAQs
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
```

## TypeScript Typed Props

### Using FAQItem Type for Type Safety

```typescript
import type { FAQItem } from '@/components/content/FAQAccordion';
import { FAQAccordion } from '@/components/content/FAQAccordion';

function transformKestaticFAQs(keystatic: any[]): FAQItem[] {
  return keystatic.map((item) => ({
    question: item.entry.question,
    answer: item.entry.answer,
    category: item.entry.category,
  }));
}

export default async function Page() {
  const rawFAQs = await reader.collections.faqs.all();
  const faqs = transformKestaticFAQs(rawFAQs);

  return <FAQAccordion items={faqs} />;
}
```

## Integration with Page Templates

### Adding FAQs to Program Template

```typescript
// components/templates/ProgramTemplate.tsx
import { FAQAccordion } from '@/components/content/FAQAccordion';

interface ProgramTemplateProps {
  // ... other props
  faqs?: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
}

export function ProgramTemplate({ faqs, ...otherProps }: ProgramTemplateProps) {
  return (
    <div>
      {/* Program content */}

      {faqs && faqs.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">Program FAQs</h2>
          <FAQAccordion items={faqs} allowMultiple={true} />
        </section>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Filter Published FAQs
```typescript
const publishedFAQs = allFAQs.filter((faq) => faq.entry.published);
```

### 2. Sort by Order Field
```typescript
const sortedFAQs = publishedFAQs.sort((a, b) => a.entry.order - b.entry.order);
```

### 3. Use Type-Safe Props
```typescript
import type { FAQItem } from '@/components/content/FAQAccordion';
```

### 4. Provide Fallback for Empty State
```typescript
{faqs.length > 0 ? (
  <FAQAccordion items={faqs} />
) : (
  <p>No FAQs available at this time.</p>
)}
```

### 5. Constrain Width for Readability
```typescript
<FAQAccordion items={faqs} className="max-w-3xl mx-auto" />
```

## Accessibility Notes

- Component is fully keyboard accessible (Tab, Enter, Space)
- Screen readers announce expanded/collapsed state
- Focus indicators are visible
- Category headers provide semantic structure
- All interactive elements are properly labeled

## Performance Notes

- Component only renders expanded content when opened
- Lightweight (no heavy dependencies)
- Client-side state is minimal (array of open indexes)
- Works efficiently with 100+ FAQ items

---

**Last Updated**: 2025-12-11
**Component**: FAQAccordion
**File**: `/components/content/FAQAccordion.tsx`
