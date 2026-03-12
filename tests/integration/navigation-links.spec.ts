// REQ-TEST-001: Navigation Integration Tests
// Verifies all navigation links have corresponding pages
import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// REQ-TEST-001: Verify page exists by checking for corresponding file
function verifyPageExists(href: string): boolean {
  const cleanHref = href.split('#')[0];
  const slug = cleanHref.substring(1);

  const possiblePaths = [
    path.join(process.cwd(), 'app', cleanHref, 'page.tsx'),
    path.join(process.cwd(), 'content', 'pages', `${slug}.mdoc`),
    path.join(process.cwd(), 'content', 'pages', slug),
  ];

  return possiblePaths.some(p => fs.existsSync(p));
}

// Read navigation.yaml and extract links
function readNavigationYaml(): { menuItems: string[]; hrefs: string[] } {
  const navigationFile = path.join(process.cwd(), 'content', 'navigation', 'navigation.yaml');
  const content = fs.readFileSync(navigationFile, 'utf-8');

  // Extract all href values from YAML using simple regex
  const hrefMatches = content.match(/href:\s*['"]?([^'"\n]+)['"]?/g) || [];
  const hrefs = hrefMatches
    .map(m => m.replace(/href:\s*['"]?/, '').replace(/['"]$/, '').trim())
    .filter(h => h.startsWith('/'));

  // Extract all label values
  const labelMatches = content.match(/label:\s*['"]?([^'"\n]+)['"]?/g) || [];
  const labels = labelMatches
    .map(m => m.replace(/label:\s*['"]?/, '').replace(/['"]$/, '').trim());

  return { menuItems: labels, hrefs };
}

describe('REQ-TEST-001 — Navigation Integration Tests', () => {
  describe('Navigation YAML Configuration', () => {
    test('navigation.yaml exists', () => {
      const navigationFile = path.join(process.cwd(), 'content', 'navigation', 'navigation.yaml');
      expect(fs.existsSync(navigationFile)).toBe(true);
    });

    test('navigation.yaml has menuItems and primaryCTA', () => {
      const navigationFile = path.join(process.cwd(), 'content', 'navigation', 'navigation.yaml');
      const fileContent = fs.readFileSync(navigationFile, 'utf-8');

      expect(fileContent).toContain('menuItems');
      expect(fileContent).toContain('primaryCTA');
      expect(fileContent).toContain('label');
      expect(fileContent).toContain('href');
    });

    test('navigation has multiple menu items', () => {
      const { menuItems } = readNavigationYaml();
      expect(menuItems.length).toBeGreaterThan(3);
    });

    test('all internal navigation links have corresponding pages', () => {
      const { hrefs } = readNavigationYaml();

      const results = hrefs.map(href => ({
        href,
        exists: verifyPageExists(href),
      }));

      const brokenLinks = results.filter(r => !r.exists);
      expect(brokenLinks).toEqual([]);
      expect(hrefs.length).toBeGreaterThan(0);
    });
  });

  describe('URL Redirects', () => {
    const redirects = [
      { source: '/summer-camp/jr-high', destination: '/summer-camp-sessions#jr-high-camp' },
      { source: '/summer-camp/high-school', destination: '/summer-camp-sessions#sr-high-camp' },
    ];

    test('all redirect destinations have corresponding pages', () => {
      redirects.forEach(({ destination }) => {
        const exists = verifyPageExists(destination);
        expect(exists).toBe(true);
      });
    });

    test('redirect configuration is valid', () => {
      redirects.forEach(({ source, destination }) => {
        expect(source).toBeDefined();
        expect(destination).toBeDefined();
        expect(source.startsWith('/')).toBe(true);
        expect(destination.startsWith('/')).toBe(true);
        expect(source).not.toBe(destination);
      });
    });
  });

  describe('Staff Pages', () => {
    test('about-our-team content exists', () => {
      const aboutOurTeamContent = path.join(process.cwd(), 'content', 'pages', 'about-our-team.mdoc');
      expect(fs.existsSync(aboutOurTeamContent)).toBe(true);
    });
  });
});
