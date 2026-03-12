#!/usr/bin/env npx ts-node
/**
 * SEO Structure Validator
 *
 * Validates SEO best practices for camp websites
 *
 * Usage: npx ts-node scripts/validation/seo-check.ts [url]
 *
 * Checks:
 * - Meta tags (title, description, og:*, twitter:*)
 * - Heading hierarchy (single h1, proper nesting)
 * - Image alt text coverage
 * - Schema.org structured data
 * - Canonical URL
 * - Robots meta
 * - Internal linking
 */

interface SEOCheckResult {
  url: string;
  timestamp: string;
  passed: boolean;
  score: number;
  checks: {
    category: string;
    name: string;
    passed: boolean;
    value?: string;
    recommendation?: string;
  }[];
  structuredData: {
    found: boolean;
    types: string[];
  };
}

const REQUIRED_META = [
  { name: 'title', selector: 'title', minLength: 30, maxLength: 60 },
  { name: 'description', selector: 'meta[name="description"]', attr: 'content', minLength: 120, maxLength: 155 },
  { name: 'og:title', selector: 'meta[property="og:title"]', attr: 'content' },
  { name: 'og:description', selector: 'meta[property="og:description"]', attr: 'content' },
  { name: 'og:image', selector: 'meta[property="og:image"]', attr: 'content' },
  { name: 'twitter:card', selector: 'meta[name="twitter:card"]', attr: 'content' },
];

function generateReport(result: SEOCheckResult): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════',
    '  SEO STRUCTURE VALIDATION REPORT',
    '═══════════════════════════════════════════════════════',
    '',
    `URL: ${result.url}`,
    `Timestamp: ${result.timestamp}`,
    `Score: ${result.score}/100`,
    '',
  ];

  // Group checks by category
  const categories = new Map<string, typeof result.checks>();
  result.checks.forEach(check => {
    if (!categories.has(check.category)) {
      categories.set(check.category, []);
    }
    categories.get(check.category)!.push(check);
  });

  categories.forEach((checks, category) => {
    lines.push(`─── ${category} ────────────────────────────────────`);
    checks.forEach(check => {
      const status = check.passed ? '✅' : '❌';
      lines.push(`  ${status} ${check.name}`);
      if (check.value) {
        lines.push(`      Value: ${check.value.slice(0, 60)}${check.value.length > 60 ? '...' : ''}`);
      }
      if (!check.passed && check.recommendation) {
        lines.push(`      Fix: ${check.recommendation}`);
      }
    });
    lines.push('');
  });

  if (result.structuredData.found) {
    lines.push('─── Structured Data ─────────────────────────────────');
    lines.push(`  ✅ Found ${result.structuredData.types.length} schema type(s):`);
    result.structuredData.types.forEach(type => {
      lines.push(`      - ${type}`);
    });
    lines.push('');
  }

  lines.push('─── Result ──────────────────────────────────────────');
  lines.push(result.passed
    ? '  ✅ PASSED - SEO structure is well-optimized'
    : '  ❌ FAILED - SEO improvements recommended');
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}

async function runSEOCheck(url: string): Promise<SEOCheckResult> {
  console.log(`\n🔍 Running SEO check for: ${url}\n`);

  const result: SEOCheckResult = {
    url,
    timestamp: new Date().toISOString(),
    passed: true,
    score: 0,
    checks: [],
    structuredData: {
      found: false,
      types: [],
    },
  };

  try {
    const response = await fetch(url);
    const html = await response.text();

    let passedChecks = 0;
    let totalChecks = 0;

    // Check meta tags
    REQUIRED_META.forEach(meta => {
      totalChecks++;
      const regex = new RegExp(meta.selector.replace(/[[\]]/g, '\\$&').replace('=', '=["\']?').replace(']', '["\']?]'), 'i');
      const match = html.match(new RegExp(`<${meta.selector}[^>]*(?:content=["']([^"']+)["']|>([^<]+)</)`, 'i'));

      let value = '';
      if (meta.name === 'title') {
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        value = titleMatch ? titleMatch[1] : '';
      } else if (match) {
        value = match[1] || match[2] || '';
      }

      let passed = !!value;
      let recommendation = '';

      if (meta.minLength && value.length < meta.minLength) {
        passed = false;
        recommendation = `Should be at least ${meta.minLength} characters (currently ${value.length})`;
      }
      if (meta.maxLength && value.length > meta.maxLength) {
        passed = false;
        recommendation = `Should be at most ${meta.maxLength} characters (currently ${value.length})`;
      }
      if (!value) {
        recommendation = `Add ${meta.name} tag`;
      }

      if (passed) passedChecks++;

      result.checks.push({
        category: 'Meta Tags',
        name: meta.name,
        passed,
        value: value || undefined,
        recommendation: passed ? undefined : recommendation,
      });
    });

    // Check heading hierarchy
    totalChecks++;
    const h1Matches = html.match(/<h1[^>]*>/gi);
    const h1Count = h1Matches ? h1Matches.length : 0;
    const h1Passed = h1Count === 1;
    if (h1Passed) passedChecks++;

    result.checks.push({
      category: 'Heading Structure',
      name: 'Single H1',
      passed: h1Passed,
      value: `Found ${h1Count} h1 tag(s)`,
      recommendation: h1Passed ? undefined : h1Count === 0 ? 'Add an h1 tag' : 'Use only one h1 per page',
    });

    // Check heading order
    totalChecks++;
    const headings = html.match(/<h([1-6])[^>]*>/gi) || [];
    let headingOrderValid = true;
    let prevLevel = 0;
    headings.forEach(h => {
      const level = parseInt(h.match(/h([1-6])/i)?.[1] || '0');
      if (level > prevLevel + 1 && prevLevel > 0) {
        headingOrderValid = false;
      }
      prevLevel = level;
    });
    if (headingOrderValid) passedChecks++;

    result.checks.push({
      category: 'Heading Structure',
      name: 'Heading Order',
      passed: headingOrderValid,
      recommendation: headingOrderValid ? undefined : 'Headings should not skip levels (e.g., h1 → h3)',
    });

    // Check image alt text
    totalChecks++;
    const images = html.match(/<img[^>]+>/gi) || [];
    const imagesWithoutAlt = images.filter(img => !img.includes('alt=') || img.includes('alt=""'));
    const altPassed = imagesWithoutAlt.length === 0;
    if (altPassed) passedChecks++;

    result.checks.push({
      category: 'Images',
      name: 'Alt Text Coverage',
      passed: altPassed,
      value: `${images.length - imagesWithoutAlt.length}/${images.length} images have alt text`,
      recommendation: altPassed ? undefined : `Add alt text to ${imagesWithoutAlt.length} image(s)`,
    });

    // Check canonical URL
    totalChecks++;
    const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
    if (hasCanonical) passedChecks++;

    result.checks.push({
      category: 'Technical SEO',
      name: 'Canonical URL',
      passed: hasCanonical,
      recommendation: hasCanonical ? undefined : 'Add a canonical URL link tag',
    });

    // Check robots meta
    totalChecks++;
    const robotsMeta = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    const robotsContent = robotsMeta ? robotsMeta[1] : 'index, follow (default)';
    const robotsPassed = !robotsContent.includes('noindex');
    if (robotsPassed) passedChecks++;

    result.checks.push({
      category: 'Technical SEO',
      name: 'Robots Meta',
      passed: robotsPassed,
      value: robotsContent,
      recommendation: robotsPassed ? undefined : 'Remove noindex if page should be indexed',
    });

    // Check structured data
    const ldJsonMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (ldJsonMatches) {
      result.structuredData.found = true;
      ldJsonMatches.forEach(match => {
        try {
          const jsonContent = match.replace(/<[^>]+>/g, '');
          const parsed = JSON.parse(jsonContent);
          if (parsed['@type']) {
            result.structuredData.types.push(parsed['@type']);
          }
        } catch {
          // Invalid JSON, skip
        }
      });
    }

    totalChecks++;
    if (result.structuredData.found) passedChecks++;

    result.checks.push({
      category: 'Structured Data',
      name: 'Schema.org JSON-LD',
      passed: result.structuredData.found,
      value: result.structuredData.found ? `${result.structuredData.types.length} type(s) found` : undefined,
      recommendation: result.structuredData.found ? undefined : 'Add Organization and LocalBusiness schema',
    });

    // Check internal links
    totalChecks++;
    const internalLinks = (html.match(/href=["']\/[^"']+["']/gi) || []).length;
    const internalLinksPassed = internalLinks >= 3;
    if (internalLinksPassed) passedChecks++;

    result.checks.push({
      category: 'Internal Linking',
      name: 'Internal Links',
      passed: internalLinksPassed,
      value: `${internalLinks} internal links found`,
      recommendation: internalLinksPassed ? undefined : 'Add more internal links for better site structure',
    });

    // Calculate score
    result.score = Math.round((passedChecks / totalChecks) * 100);
    result.passed = result.score >= 80;

  } catch (error) {
    result.checks.push({
      category: 'Error',
      name: 'Fetch Failed',
      passed: false,
      recommendation: `Could not fetch URL: ${error}`,
    });
    result.passed = false;
  }

  return result;
}

// Main execution
const url = process.argv[2] || 'https://www.bearlakecamp.com';

runSEOCheck(url)
  .then(result => {
    console.log(generateReport(result));
    process.exit(result.passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running SEO check:', error);
    process.exit(1);
  });

export { runSEOCheck };
export type { SEOCheckResult };
