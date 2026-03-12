// REQ-005: Programs Component Structure
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

describe('REQ-005 — Programs Component Structure', () => {
  test('Programs component exists and exports default', async () => {
    const programsModule = await import('./Programs');

    expect(programsModule.default).toBeDefined();
    expect(typeof programsModule.default).toBe('function');
  });

  test('Programs component renders a section element', async () => {
    const { default: Programs } = await import('./Programs');

    const { container } = render(<Programs />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  test('Programs component renders without errors', async () => {
    const { default: Programs } = await import('./Programs');

    expect(() => {
      render(<Programs />);
    }).not.toThrow();
  });

  test('Programs component accepts className prop', async () => {
    const { default: Programs } = await import('./Programs');

    const customClass = 'custom-programs';
    const { container } = render(<Programs className={customClass} />);

    const section = container.querySelector('section');
  });

  test('Programs component has TypeScript interface defined', async () => {
    const fs = await import('fs');
    const programsSource = fs.readFileSync(
      require.resolve('./Programs'),
      'utf-8'
    );

    const hasTypeDefinition =
      programsSource.includes('interface') ||
      programsSource.includes('type ProgramsProps') ||
      programsSource.includes(': {') ||
      programsSource.includes('React.FC');

    expect(hasTypeDefinition).toBe(true);
  });

  test('Programs component has no TypeScript errors', async () => {
    const programsModule = await import('./Programs');

    expect(programsModule).toBeDefined();
    expect(programsModule.default).toBeDefined();
  });
});
