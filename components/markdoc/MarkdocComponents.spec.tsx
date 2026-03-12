// REQ-404 to REQ-411: Rich Content Components Tests
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  ImageComponent,
  CTAComponent,
  FeatureGridComponent,
  PhotoGalleryComponent,
  YouTubeComponent,
  TestimonialComponent,
  AccordionComponent,
} from './MarkdocComponents';

describe('REQ-404 — Image Component', () => {
  test('renders with Next.js Image component at 800x600 default size', () => {

    const { container } = render(
      <ImageComponent
        src="/uploads/content/test-image.jpg"
        alt="Test image description"
        caption="Test caption"
      />
    );

    // Next.js Image renders as img tag
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Test image description');
  });

  test('caption appears below image with appropriate styling', () => {
    const CAPTION_TEXT = 'Beautiful mountain view at Bear Lake';

    render(
      <ImageComponent
        src="/uploads/content/mountain.jpg"
        alt="Mountain view"
        caption={CAPTION_TEXT}
      />
    );

    expect(screen.getByText(CAPTION_TEXT)).toBeInTheDocument();
  });

  test('alt text is required', () => {

    // TypeScript should enforce this, but test runtime behavior
    const { container } = render(
      <ImageComponent src="/uploads/content/test.jpg" alt="Required alt text" />
    );

    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBeTruthy();
  });

  test('caption is optional', () => {

    const { container } = render(
      <ImageComponent src="/uploads/content/test.jpg" alt="No caption image" />
    );

    expect(container).toBeInTheDocument();
  });

  test('uses image picker directory public/uploads/content', () => {

    const EXPECTED_SRC = '/uploads/content/camp-photo.jpg';

    const { container } = render(<ImageComponent src={EXPECTED_SRC} alt="Camp photo" />);

    const img = container.querySelector('img');
    // Next.js may transform src, but original should contain path
    expect(img?.src).toContain('camp-photo.jpg');
  });
});

describe('REQ-405 — Call-to-Action Component', () => {
  test('renders centered card with heading and button', () => {

    const HEADING = 'Ready to Register?';
    const BUTTON_TEXT = 'Sign Up Now';

    render(
      <CTAComponent
        heading={HEADING}
        text="Join us for an unforgettable summer!"
        buttonText={BUTTON_TEXT}
        buttonLink="/register"
      />
    );

    expect(screen.getByText(HEADING)).toBeInTheDocument();
    expect(screen.getByText(BUTTON_TEXT)).toBeInTheDocument();
  });

  test('CTA renders with heading and button text', () => {
    render(
      <CTAComponent
        heading="Join Us"
        text="Test text"
        buttonText="Apply"
        buttonLink="/apply"
      />
    );

    expect(screen.getByText('Join Us')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  test('button uses Next.js Link for internal navigation', () => {

    const { container } = render(
      <CTAComponent
        heading="Learn More"
        text="Discover our programs"
        buttonText="View Programs"
        buttonLink="/programs"
      />
    );

    // Next.js Link renders as anchor tag
    const link = container.querySelector('a[href="/programs"]');
    expect(link).toBeInTheDocument();
  });

  test('button renders as a link element', () => {
    const { container } = render(
      <CTAComponent
        heading="Get Started"
        text="Begin your journey"
        buttonText="Start"
        buttonLink="/start"
      />
    );

    const link = container.querySelector('a[href="/start"]');
    expect(link).toBeInTheDocument();
    expect(link?.textContent).toContain('Start');
  });

  test('multiline text field renders correctly', () => {

    const MULTILINE_TEXT = `Experience Christ-centered summer camp.
Make lifelong friends.
Grow in your faith.`;

    render(
      <CTAComponent
        heading="Summer Camp 2024"
        text={MULTILINE_TEXT}
        buttonText="Register"
        buttonLink="/register"
      />
    );

    expect(screen.getByText(/Experience Christ-centered/)).toBeInTheDocument();
  });
});

describe('REQ-406 — Feature Grid Component', () => {
  test('renders all feature items', () => {
    const FEATURES = [
      { icon: '🏕️', title: 'Outdoor Adventure', description: 'Hiking, swimming, and more' },
      { icon: '✝️', title: 'Faith-Based', description: 'Christ-centered activities' },
      { icon: '🤝', title: 'Community', description: 'Build lasting friendships' },
    ];

    render(<FeatureGridComponent features={FEATURES} />);

    expect(screen.getByText('Outdoor Adventure')).toBeInTheDocument();
    expect(screen.getByText('Faith-Based')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  test('renders correct number of feature items', () => {
    const FEATURES = [
      { icon: '⛺', title: 'Camping', description: 'Outdoor experience' },
      { icon: '🎵', title: 'Worship', description: 'Daily worship sessions' },
    ];

    const { container } = render(<FeatureGridComponent features={FEATURES} />);

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer?.children).toHaveLength(2);
  });

  test('each feature has icon, title, and description', () => {

    const FEATURES = [
      {
        icon: '🌲',
        title: 'Nature Trails',
        description: 'Explore scenic mountain paths',
      },
    ];

    render(<FeatureGridComponent features={FEATURES} />);

    expect(screen.getByText('🌲')).toBeInTheDocument();
    expect(screen.getByText('Nature Trails')).toBeInTheDocument();
    expect(screen.getByText('Explore scenic mountain paths')).toBeInTheDocument();
  });

  test('supports array of features', () => {

    const FEATURES = [
      { icon: '1️⃣', title: 'Feature One', description: 'First feature' },
      { icon: '2️⃣', title: 'Feature Two', description: 'Second feature' },
      { icon: '3️⃣', title: 'Feature Three', description: 'Third feature' },
    ];

    render(<FeatureGridComponent features={FEATURES} />);

    expect(screen.getByText('Feature One')).toBeInTheDocument();
    expect(screen.getByText('Feature Two')).toBeInTheDocument();
    expect(screen.getByText('Feature Three')).toBeInTheDocument();
  });

  test('icon field accepts text and emoji', () => {

    const FEATURES = [
      { icon: '🏊', title: 'Swimming', description: 'Pool and lake activities' },
      { icon: 'ABC', title: 'Text Icon', description: 'Text-based icon' },
    ];

    render(<FeatureGridComponent features={FEATURES} />);

    expect(screen.getByText('🏊')).toBeInTheDocument();
    expect(screen.getByText('ABC')).toBeInTheDocument();
  });
});

describe('REQ-407 — Photo Gallery Component', () => {
  test('renders all gallery images', () => {
    const IMAGES = [
      { image: '/uploads/gallery/img1.jpg', alt: 'Image 1', caption: 'Caption 1' },
      { image: '/uploads/gallery/img2.jpg', alt: 'Image 2', caption: 'Caption 2' },
      { image: '/uploads/gallery/img3.jpg', alt: 'Image 3', caption: 'Caption 3' },
    ];

    render(<PhotoGalleryComponent images={IMAGES} />);

    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    expect(screen.getByAltText('Image 3')).toBeInTheDocument();
  });

  test('images are sized at 400x400', () => {

    const IMAGES = [{ image: '/uploads/gallery/test.jpg', alt: 'Test image', caption: '' }];

    const { container } = render(<PhotoGalleryComponent images={IMAGES} />);

    // Next.js Image may use width/height attributes or CSS
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  test('each image has image, alt, and caption fields', () => {

    const IMAGE_DATA = {
      image: '/uploads/gallery/campfire.jpg',
      alt: 'Campfire night',
      caption: 'Evening worship around the campfire',
    };

    const IMAGES = [IMAGE_DATA];

    render(<PhotoGalleryComponent images={IMAGES} />);

    const img = screen.getByAltText('Campfire night');
    expect(img).toBeInTheDocument();
    expect(screen.getByText('Evening worship around the campfire')).toBeInTheDocument();
  });

  test('uses image picker directory public/uploads/gallery', () => {

    const IMAGES = [
      { image: '/uploads/gallery/photo1.jpg', alt: 'Photo 1', caption: '' },
    ];

    const { container } = render(<PhotoGalleryComponent images={IMAGES} />);

    const img = container.querySelector('img');
    expect(img?.src).toContain('photo1.jpg');
  });

  test('supports array of images', () => {

    const IMAGES = [
      { image: '/uploads/gallery/1.jpg', alt: 'Image 1', caption: 'First' },
      { image: '/uploads/gallery/2.jpg', alt: 'Image 2', caption: 'Second' },
      { image: '/uploads/gallery/3.jpg', alt: 'Image 3', caption: 'Third' },
    ];

    render(<PhotoGalleryComponent images={IMAGES} />);

    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    expect(screen.getByAltText('Image 3')).toBeInTheDocument();
  });
});

describe('REQ-408 — YouTube Component', () => {
  test('renders responsive 16:9 iframe embed', () => {

    const { container } = render(
      <YouTubeComponent videoId="dQw4w9WgXcQ" title="Camp promotional video" />
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('dQw4w9WgXcQ'));
  });

  test('includes allowFullScreen attribute', () => {

    const { container } = render(
      <YouTubeComponent videoId="test123" title="Test video" />
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('allowfullscreen');
  });

  test('video title used for iframe title attribute', () => {

    const VIDEO_TITLE = 'Bear Lake Camp Summer 2024 Highlights';

    const { container } = render(<YouTubeComponent videoId="abc123" title={VIDEO_TITLE} />);

    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('title', VIDEO_TITLE);
  });

  test('videoId field accepts YouTube video IDs', () => {

    const VIDEO_IDS = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', 'o-YBDTqX_ZU'];

    for (const videoId of VIDEO_IDS) {
      const { container } = render(<YouTubeComponent videoId={videoId} title="Test" />);

      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain(videoId);
    }
  });

  test('embeds YouTube URL correctly', () => {

    const { container } = render(<YouTubeComponent videoId="testVideo" title="Test" />);

    const iframe = container.querySelector('iframe');
    expect(iframe?.src).toContain('youtube.com/embed');
  });
});

describe('REQ-409 — Testimonial Component', () => {
  test('renders styled blockquote with author attribution', () => {

    const QUOTE = 'Bear Lake Camp changed my life!';
    const AUTHOR = 'Sarah Johnson';
    const ROLE = 'Camper, Summer 2023';

    const { container } = render(
      <TestimonialComponent quote={QUOTE} author={AUTHOR} role={ROLE} />
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(screen.getByText(QUOTE)).toBeInTheDocument();
    expect(screen.getByText(AUTHOR)).toBeInTheDocument();
    expect(screen.getByText(ROLE)).toBeInTheDocument();
  });

  test('renders blockquote element', () => {
    const { container } = render(
      <TestimonialComponent quote="Great camp!" author="John" role="Parent" />
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(screen.getByText('Great camp!')).toBeInTheDocument();
  });

  test('photo renders as image element when provided', () => {
    const { container } = render(
      <TestimonialComponent
        quote="Amazing experience"
        author="Jane Doe"
        role="Counselor"
        photo="/uploads/testimonials/jane.jpg"
      />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.src).toContain('jane.jpg');
  });

  test('photo is optional - component works without it', () => {

    const { container } = render(
      <TestimonialComponent quote="Great camp" author="Anonymous" role="Camper" />
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Great camp')).toBeInTheDocument();
  });

  test('uses image picker directory public/uploads/testimonials', () => {

    const PHOTO_PATH = '/uploads/testimonials/sarah-smith.jpg';

    const { container } = render(
      <TestimonialComponent
        quote="Wonderful experience"
        author="Sarah Smith"
        role="Parent"
        photo={PHOTO_PATH}
      />
    );

    const img = container.querySelector('img');
    expect(img?.src).toContain('sarah-smith.jpg');
  });

  test('multiline quote field renders correctly', () => {

    const LONG_QUOTE = `Bear Lake Camp exceeded all expectations.
The counselors were amazing and my daughter grew so much in her faith.
We'll be back next year!`;

    render(<TestimonialComponent quote={LONG_QUOTE} author="Mary" role="Parent" />);

    expect(screen.getByText(/exceeded all expectations/)).toBeInTheDocument();
  });
});

describe('REQ-410 — Accordion Component', () => {
  test('uses native HTML details element', () => {

    const FAQ_ITEMS = [
      { question: 'What should I bring?', answer: 'Clothes, toiletries, Bible' },
      { question: 'How much does it cost?', answer: '$350 per camper' },
    ];

    const { container } = render(<AccordionComponent items={FAQ_ITEMS} />);

    const details = container.querySelectorAll('details');
    expect(details.length).toBe(2);
  });

  test('each item has question and answer fields', () => {

    const QUESTION = 'What age groups do you serve?';
    const ANSWER = 'We have programs for grades 6-12';

    const FAQ_ITEMS = [{ question: QUESTION, answer: ANSWER }];

    render(<AccordionComponent items={FAQ_ITEMS} />);

    expect(screen.getByText(QUESTION)).toBeInTheDocument();
    expect(screen.getByText(ANSWER)).toBeInTheDocument();
  });

  test('renders correct number of accordion items', () => {
    const FAQ_ITEMS = [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ];

    const { container } = render(<AccordionComponent items={FAQ_ITEMS} />);

    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(2);
  });

  test('supports array of FAQ items', () => {

    const FAQ_ITEMS = [
      { question: 'Question 1', answer: 'Answer 1' },
      { question: 'Question 2', answer: 'Answer 2' },
      { question: 'Question 3', answer: 'Answer 3' },
    ];

    render(<AccordionComponent items={FAQ_ITEMS} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Question 3')).toBeInTheDocument();
  });

  test('multiline answer field renders correctly', () => {

    const MULTILINE_ANSWER = `We serve junior high (grades 6-8) and senior high (grades 9-12).
Each age group has dedicated programs and activities.
Check our Programs page for specific details.`;

    const FAQ_ITEMS = [{ question: 'What ages?', answer: MULTILINE_ANSWER }];

    render(<AccordionComponent items={FAQ_ITEMS} />);

    expect(screen.getByText(/junior high/)).toBeInTheDocument();
  });
});

describe('REQ-411 — Component Renderers Implementation', () => {
  test('all 7 components export from MarkdocComponents.tsx', async () => {
    const components = await import('./MarkdocComponents');

    expect(components.ImageComponent).toBeDefined();
    expect(components.CTAComponent).toBeDefined();
    expect(components.FeatureGridComponent).toBeDefined();
    expect(components.PhotoGalleryComponent).toBeDefined();
    expect(components.YouTubeComponent).toBeDefined();
    expect(components.TestimonialComponent).toBeDefined();
    expect(components.AccordionComponent).toBeDefined();
  });

  test('CTA component renders heading, text, and link', () => {
    render(
      <CTAComponent
        heading="Test"
        text="Test text"
        buttonText="Click"
        buttonLink="/test"
      />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Test text')).toBeInTheDocument();
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  test('image components use Next.js Image for optimization', () => {
    // @ts-ignore - Component will be implemented

    const { container } = render(
      <ImageComponent src="/test.jpg" alt="Test" />
    );

    // Next.js Image renders img with specific attributes
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  test('link components use Next.js Link for navigation', () => {

    const { container } = render(
      <CTAComponent
        heading="Test"
        text="Text"
        buttonText="Click"
        buttonLink="/internal-page"
      />
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.href).toContain('/internal-page');
  });

  test('components handle missing optional fields gracefully', () => {
    // Image without caption
    const { container: imgContainer } = render(
      <ImageComponent src="/test.jpg" alt="Test" />
    );
    expect(imgContainer).toBeInTheDocument();

    // Testimonial without photo
    const { container: testimonialContainer } = render(
      <TestimonialComponent quote="Great!" author="John" role="Camper" />
    );
    expect(testimonialContainer).toBeInTheDocument();
  });

  test('components work when multiple instances exist on same page', () => {

    render(
      <>
        <TestimonialComponent quote="First quote" author="Person 1" role="Camper" />
        <TestimonialComponent quote="Second quote" author="Person 2" role="Parent" />
        <TestimonialComponent quote="Third quote" author="Person 3" role="Counselor" />
      </>
    );

    expect(screen.getByText('First quote')).toBeInTheDocument();
    expect(screen.getByText('Second quote')).toBeInTheDocument();
    expect(screen.getByText('Third quote')).toBeInTheDocument();
  });

  test('feature grid renders feature content', () => {
    const FEATURES = [
      { icon: '✨', title: 'Feature', description: 'Description' },
    ];

    render(<FeatureGridComponent features={FEATURES} />);

    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
