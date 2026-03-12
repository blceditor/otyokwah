# P0-P1 Security Fixes Plan

**Date**: 2025-12-03
**Author**: planner agent
**Phase**: QPLAN (Post-Review Implementation)
**Source**: PE Code Review + Security Review

---

## Executive Summary

This plan addresses **3 P0 critical security vulnerabilities** and **4 P1 hardening opportunities** identified in code reviews. All P0 issues must be fixed before production deployment. Total estimated effort: **0.8 SP** (P0: 0.3 SP, P1: 0.5 SP).

**Priority**: CRITICAL - P0 blockers for production deployment
**Risk Level**: HIGH - Tabnabbing, SSRF, and path traversal vulnerabilities present

---

## Requirements Lock Reference

**Requirements Created**:
- `requirements/security-fixes.lock.md` (to be created with this plan)

**REQ-IDs**:
- REQ-SEC-001: Fix tabnabbing vulnerability (P0)
- REQ-SEC-002: Restrict image domains (P0)
- REQ-SEC-003: Add path traversal protection (P0)
- REQ-SEC-004: Implement CSP headers (P1)
- REQ-SEC-005: Enhance URL validation (P1)
- REQ-SEC-006: Fix isomorphic sanitization (P1)
- REQ-SEC-007: Strict rehype schema (P1)

---

## Priority Order & Implementation Strategy

### Phase 1: P0 Fixes (MUST FIX - 0.3 SP)
1. **REQ-SEC-001**: Tabnabbing (0.1 SP) - Lowest complexity, highest impact
2. **REQ-SEC-002**: SSRF Image Domains (0.05 SP) - Simple config change
3. **REQ-SEC-003**: Path Traversal (0.15 SP) - Requires new validation utility

### Phase 2: P1 Hardening (SHOULD FIX - 0.5 SP)
4. **REQ-SEC-004**: CSP Headers (0.2 SP) - New middleware file
5. **REQ-SEC-005**: Enhanced URL Validation (0.1 SP) - Extends existing validator
6. **REQ-SEC-006**: Isomorphic DOMPurify (0.1 SP) - Package swap + test
7. **REQ-SEC-007**: Strict Rehype Schema (0.1 SP) - New config file

**Rationale**: Fix lowest-risk, highest-impact P0s first to unblock deployment quickly. P1 items add defense-in-depth and can be done in parallel.

---

## REQ-SEC-001: Fix Tabnabbing Vulnerability (P0)

### Problem
External links missing `rel="noopener noreferrer"` allow malicious sites to redirect original tab via `window.opener`.

### Attack Vector
```html
<!-- User clicks CTA button -->
<a href="https://ultracamp.com/register" target="_blank">Register Now</a>

<!-- Malicious ultracamp domain executes -->
<script>
  window.opener.location = 'https://bearlakecamp-fake.com/login';
</script>
```

### Impact
- **Likelihood**: HIGH (all registration/application links affected)
- **Impact**: MEDIUM (phishing, credential theft)
- **CVSS Score**: 5.4

### Files to Modify

#### 1. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/templates/HomepageTemplate.tsx`

**Line 312-317** (CTA Button):
```typescript
// OLD:
<a
  href={ctaButtonLink}
  target="_blank"
  className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold text-xl px-8 py-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
>
  {ctaButtonText}
</a>

// NEW:
<a
  href={ctaButtonLink}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold text-xl px-8 py-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
>
  {ctaButtonText}
</a>
```

#### 2. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/templates/ProgramTemplate.tsx`

**Line 151-157** (Registration Button):
```typescript
// OLD:
<a
  href={registrationLink}
  target="_blank"
  className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold text-xl px-8 py-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
>
  Register Now
</a>

// NEW:
<a
  href={registrationLink}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold text-xl px-8 py-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
>
  Register Now
</a>
```

#### 3. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/templates/StaffTemplate.tsx`

**Line 78-84** (CTA Button):
```typescript
// OLD:
<a
  href={ctaButtonLink}
  target="_blank"
  className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold text-xl px-8 py-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
>
  {ctaButtonText}
</a>

// NEW:
<a
  href={ctaButtonLink}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold text-xl px-8 py-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
>
  {ctaButtonText}
</a>
```

#### 4. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/[slug]/page.tsx`

**Line 179-184** (Dynamic CTA):
```typescript
// OLD:
<a
  href={page.templateFields.value.ctaButtonLink}
  target="_blank"
  className="inline-block bg-white text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
>
  {page.templateFields.value.ctaButtonText}
</a>

// NEW:
<a
  href={page.templateFields.value.ctaButtonLink}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-white text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
>
  {page.templateFields.value.ctaButtonText}
</a>
```

### Test Strategy

**New Tests** (add to existing `.spec.tsx` files):

```typescript
// components/templates/HomepageTemplate.spec.tsx
describe('REQ-SEC-001: Tabnabbing Protection', () => {
  test('CTA link has noopener noreferrer for security', () => {
    const props = {
      title: 'Test',
      bodyContent: 'Body',
      templateFields: {
        ctaButtonText: 'Register Now',
        ctaButtonLink: 'https://external.com/register'
      }
    };

    render(<HomepageTemplate {...props} />);
    const link = screen.getByRole('link', { name: /Register Now/i });

    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('href', 'https://external.com/register');
  });
});

// components/templates/ProgramTemplate.spec.tsx
describe('REQ-SEC-001: Tabnabbing Protection', () => {
  test('Registration link has noopener noreferrer', () => {
    const props = {
      title: 'Summer Camp',
      bodyContent: 'Body',
      templateFields: {
        registrationLink: 'https://ultracamp.com/register',
        ageRange: '8-12',
        dates: 'June 1-8',
        pricing: '$500'
      }
    };

    render(<ProgramTemplate {...props} />);
    const link = screen.getByRole('link', { name: /Register Now/i });

    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });
});

// components/templates/StaffTemplate.spec.tsx
describe('REQ-SEC-001: Tabnabbing Protection', () => {
  test('CTA link has noopener noreferrer', () => {
    const props = {
      title: 'Staff Page',
      bodyContent: 'Body',
      templateFields: {
        ctaButtonText: 'Apply Now',
        ctaButtonLink: 'https://jobs.bearlakecamp.com/apply'
      }
    };

    render(<StaffTemplate {...props} />);
    const link = screen.getByRole('link', { name: /Apply Now/i });

    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
```

### Verification

1. Run tests: `npm test -- --testNamePattern="REQ-SEC-001"`
2. Manual check: Inspect rendered HTML in browser DevTools
3. Security scan: `npm run lint` (ESLint rule `react/jsx-no-target-blank` should pass)

### Risk Assessment

- **Complexity**: LOW (simple attribute addition)
- **Breaking Change**: NO (additive only)
- **Browser Support**: Excellent (all modern browsers)
- **Rollback**: Simple (remove `rel` attribute)

### Story Points: 0.1 SP
- 4 files to edit
- Simple attribute addition
- Clear test cases
- No dependencies

---

## REQ-SEC-002: Restrict Image Domains (P0)

### Problem
Next.js image optimization accepts images from **any HTTPS domain** via wildcard `hostname: "**"`, enabling SSRF attacks.

### Attack Vector
```yaml
# content/pages/malicious.mdoc
heroImage: https://169.254.169.254/latest/meta-data/iam/security-credentials/
# ^ AWS metadata service - leaks credentials
```

### Impact
- **Likelihood**: MEDIUM (requires CMS access)
- **Impact**: HIGH (internal network scanning, credential theft)
- **CVSS Score**: 7.5

### Files to Modify

#### 1. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/next.config.mjs`

**Lines 10-15** (Image Configuration):

```javascript
// OLD:
remotePatterns: [
  {
    protocol: "https",
    hostname: "**",  // ⚠️ Wildcard allows ANY domain
  },
],

// NEW:
remotePatterns: [
  {
    protocol: "https",
    hostname: "bearlakecamp.com",
    pathname: "/images/**",
  },
  {
    protocol: "https",
    hostname: "*.bearlakecamp.com",
    pathname: "/images/**",
  },
  {
    protocol: "https",
    hostname: "i.ytimg.com", // YouTube thumbnails
    pathname: "/vi/**",
  },
  // Add other trusted domains as needed:
  // {
  //   protocol: "https",
  //   hostname: "cdn.example.com",
  // },
],
```

**Full Recommended Configuration**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // REQ-SEC-002: Restrict image domains to prevent SSRF
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 1024, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bearlakecamp.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.bearlakecamp.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
    dangerouslyAllowSVG: false, // Security: block SVG exploits
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
```

#### 2. Create `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/lib/security/image-url-validator.ts`

**New File** (Additional Hardening):

```typescript
/**
 * REQ-SEC-002: Image URL Validation
 * Validates image URLs to prevent SSRF attacks
 */

const PRIVATE_IP_RANGES = [
  /^127\./,                      // 127.0.0.0/8 (localhost)
  /^10\./,                       // 10.0.0.0/8 (private)
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12 (private)
  /^192\.168\./,                 // 192.168.0.0/16 (private)
  /^169\.254\./,                 // 169.254.0.0/16 (link-local)
  /^::1$/,                       // IPv6 localhost
  /^fc00:/,                      // IPv6 private
  /^fe80:/,                      // IPv6 link-local
];

const ALLOWED_IMAGE_DOMAINS = [
  'bearlakecamp.com',
  'prelaunch.bearlakecamp.com',
  'i.ytimg.com',
];

/**
 * Checks if hostname is a private IP address
 */
export function isPrivateIP(hostname: string): boolean {
  return PRIVATE_IP_RANGES.some(regex => regex.test(hostname));
}

/**
 * Validates image URL for security
 * @returns true if URL is safe to load
 */
export function validateImageURL(url: string | undefined): boolean {
  if (!url) return false;

  // Allow relative paths (local images)
  if (url.startsWith('/')) return true;

  try {
    const parsed = new URL(url);

    // Only allow HTTPS (no HTTP, file:, etc.)
    if (parsed.protocol !== 'https:') return false;

    // Block private IP ranges
    if (isPrivateIP(parsed.hostname)) return false;

    // Block localhost
    if (parsed.hostname === 'localhost' || parsed.hostname === '0.0.0.0') {
      return false;
    }

    // Check against whitelist
    const isAllowed = ALLOWED_IMAGE_DOMAINS.some(domain => {
      if (domain.startsWith('*.')) {
        const baseDomain = domain.slice(2);
        return parsed.hostname.endsWith(baseDomain);
      }
      return parsed.hostname === domain;
    });

    return isAllowed;
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Validates and returns safe image URL or fallback
 */
export function safeImageURL(url: string | undefined, fallback: string = ''): string {
  return validateImageURL(url) ? url! : fallback;
}
```

#### 3. Update Templates to Use Validator

**HomepageTemplate.tsx** (line 118):
```typescript
import { validateImageURL } from '@/lib/security/image-url-validator';

// In hero section:
style={
  heroImage && validateImageURL(heroImage)
    ? {
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined
}
```

**Apply same pattern to**:
- `ProgramTemplate.tsx` (line 48)
- `FacilityTemplate.tsx` (line 44)
- `StaffTemplate.tsx` (line 42)

### Test Strategy

**New Tests** (`lib/security/image-url-validator.spec.ts`):

```typescript
import { validateImageURL, isPrivateIP, safeImageURL } from './image-url-validator';

describe('REQ-SEC-002: Image URL Validation', () => {
  describe('validateImageURL', () => {
    test('allows local relative paths', () => {
      expect(validateImageURL('/images/hero.jpg')).toBe(true);
      expect(validateImageURL('/public/photo.png')).toBe(true);
    });

    test('allows whitelisted HTTPS domains', () => {
      expect(validateImageURL('https://bearlakecamp.com/images/hero.jpg')).toBe(true);
      expect(validateImageURL('https://prelaunch.bearlakecamp.com/images/hero.jpg')).toBe(true);
      expect(validateImageURL('https://i.ytimg.com/vi/abc123/maxresdefault.jpg')).toBe(true);
    });

    test('blocks non-HTTPS protocols', () => {
      expect(validateImageURL('http://bearlakecamp.com/image.jpg')).toBe(false);
      expect(validateImageURL('file:///etc/passwd')).toBe(false);
      expect(validateImageURL('ftp://evil.com/image.jpg')).toBe(false);
    });

    test('blocks private IP ranges', () => {
      expect(validateImageURL('https://127.0.0.1/image.jpg')).toBe(false);
      expect(validateImageURL('https://10.0.0.1/image.jpg')).toBe(false);
      expect(validateImageURL('https://172.16.0.1/image.jpg')).toBe(false);
      expect(validateImageURL('https://192.168.1.1/image.jpg')).toBe(false);
      expect(validateImageURL('https://169.254.169.254/latest/meta-data')).toBe(false);
    });

    test('blocks localhost', () => {
      expect(validateImageURL('https://localhost/image.jpg')).toBe(false);
      expect(validateImageURL('https://0.0.0.0/image.jpg')).toBe(false);
    });

    test('blocks non-whitelisted domains', () => {
      expect(validateImageURL('https://evil.com/image.jpg')).toBe(false);
      expect(validateImageURL('https://attacker.net/malicious.png')).toBe(false);
    });

    test('rejects undefined and empty strings', () => {
      expect(validateImageURL(undefined)).toBe(false);
      expect(validateImageURL('')).toBe(false);
    });

    test('rejects invalid URLs', () => {
      expect(validateImageURL('not-a-url')).toBe(false);
      expect(validateImageURL('javascript:alert(1)')).toBe(false);
    });
  });

  describe('isPrivateIP', () => {
    test('detects private IPv4 ranges', () => {
      expect(isPrivateIP('127.0.0.1')).toBe(true);
      expect(isPrivateIP('10.0.0.1')).toBe(true);
      expect(isPrivateIP('172.16.0.1')).toBe(true);
      expect(isPrivateIP('192.168.1.1')).toBe(true);
    });

    test('allows public IPs', () => {
      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('1.1.1.1')).toBe(false);
    });
  });

  describe('safeImageURL', () => {
    test('returns URL if valid', () => {
      expect(safeImageURL('/images/hero.jpg')).toBe('/images/hero.jpg');
    });

    test('returns fallback if invalid', () => {
      expect(safeImageURL('https://evil.com/bad.jpg', '/default.jpg')).toBe('/default.jpg');
      expect(safeImageURL(undefined, '/default.jpg')).toBe('/default.jpg');
    });

    test('returns empty string if no fallback', () => {
      expect(safeImageURL('https://evil.com/bad.jpg')).toBe('');
    });
  });
});
```

### Verification

1. Run tests: `npm test -- image-url-validator.spec.ts`
2. Try loading image from invalid domain (should fail gracefully)
3. Verify all existing images still load (whitelist correct)
4. Check Next.js build: `npm run build` (should warn about invalid remote patterns)

### Migration Checklist

**Before Deployment**:
- [ ] Audit all `heroImage` URLs in CMS content
- [ ] Verify no external CDN dependencies
- [ ] Update whitelist if using external image CDN
- [ ] Test image loading on prelaunch environment

**If Using External CDN** (add to whitelist):
```javascript
{
  protocol: "https",
  hostname: "cdn.example.com",
  pathname: "/bearlakecamp/**",
}
```

### Risk Assessment

- **Complexity**: LOW (config change + validation utility)
- **Breaking Change**: POSSIBLE (if CMS has external image URLs)
- **Mitigation**: Audit CMS content first, update whitelist as needed
- **Rollback**: Revert `next.config.mjs` to wildcard (temporary)

### Story Points: 0.05 SP
- Simple config change
- New validation utility with clear logic
- Comprehensive test coverage
- Pre-deployment audit required

---

## REQ-SEC-003: Path Traversal Protection (P0)

### Problem
File path construction uses user-controlled `slug` parameter without validation, potentially allowing path traversal attacks.

### Attack Vector
```typescript
// User requests: /../../etc/passwd
// params.slug = "../../etc/passwd"
// path.join() resolves to: /Users/travis/etc/passwd.mdoc
```

### Impact
- **Likelihood**: LOW (Next.js sanitizes params, but defense-in-depth missing)
- **Impact**: MEDIUM (source code disclosure, config leaks)
- **CVSS Score**: 4.3

### Current Mitigation
- `generateStaticParams()` limits valid slugs at build time
- Next.js route sanitization

### Files to Modify

#### 1. Create `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/lib/security/path-validator.ts`

**New File**:

```typescript
/**
 * REQ-SEC-003: Path Traversal Protection
 * Validates and sanitizes file paths to prevent directory traversal attacks
 */

/**
 * Sanitizes slug to prevent path traversal
 * @throws Error if slug format is invalid
 */
export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Invalid slug: must be non-empty string');
  }

  // Remove path traversal sequences
  let cleaned = slug.replace(/\.\./g, '');

  // Remove leading/trailing slashes
  cleaned = cleaned.replace(/^\/+|\/+$/g, '');

  // Allow only alphanumeric, dash, underscore
  if (!/^[a-z0-9-_]+$/i.test(cleaned)) {
    throw new Error(`Invalid slug format: "${slug}". Only alphanumeric, dash, and underscore allowed.`);
  }

  // Additional safety: limit length
  if (cleaned.length > 100) {
    throw new Error('Slug exceeds maximum length (100 characters)');
  }

  return cleaned;
}

/**
 * Validates that resolved file path is within allowed directory
 * @param filePath Resolved absolute file path
 * @param allowedDir Allowed base directory (absolute path)
 * @returns true if path is safe
 */
export function isPathWithinDirectory(filePath: string, allowedDir: string): boolean {
  // Normalize paths to handle symlinks, .., etc.
  const normalizedFile = require('path').resolve(filePath);
  const normalizedDir = require('path').resolve(allowedDir);

  // Check if file path starts with allowed directory
  return normalizedFile.startsWith(normalizedDir + require('path').sep);
}

/**
 * Safely constructs file path with validation
 * @throws Error if validation fails
 */
export function safeFilePath(baseDir: string, slug: string, extension: string = '.mdoc'): string {
  const path = require('path');

  // Sanitize slug
  const safeSlug = sanitizeSlug(slug);

  // Construct path
  const filePath = path.join(baseDir, `${safeSlug}${extension}`);

  // Verify path is within base directory
  if (!isPathWithinDirectory(filePath, baseDir)) {
    throw new Error(`Path traversal detected: "${slug}" resolves outside allowed directory`);
  }

  return filePath;
}
```

#### 2. Update `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/[slug]/page.tsx`

**Line 78** (File Path Construction):

```typescript
import { sanitizeSlug, safeFilePath } from '@/lib/security/path-validator';

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await reader.collections.pages.read(params.slug);

  if (!page) {
    notFound();
  }

  // OLD:
  // const filePath = path.join(process.cwd(), 'content', 'pages', `${params.slug}.mdoc`);

  // NEW - REQ-SEC-003: Validate slug before file system access
  try {
    const contentDir = path.join(process.cwd(), 'content', 'pages');
    const filePath = safeFilePath(contentDir, params.slug, '.mdoc');

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const contentMatch = fileContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    const bodyContent = contentMatch ? contentMatch[1].trim() : '';

    // ... rest of template rendering logic
  } catch (error) {
    // Log security event
    console.error(`[SECURITY] Invalid slug detected: "${params.slug}"`, error);
    notFound();
  }

  // ... rest of code
}
```

#### 3. Update `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/page.tsx`

**Line 16** (Homepage File Path):

```typescript
import { safeFilePath } from '@/lib/security/path-validator';

export default async function HomePage() {
  // OLD:
  // const filePath = path.join(process.cwd(), 'content', 'pages', 'index.mdoc');

  // NEW - REQ-SEC-003: Use safe path construction
  const contentDir = path.join(process.cwd(), 'content', 'pages');
  const filePath = safeFilePath(contentDir, 'index', '.mdoc');

  const fileContent = await fs.readFile(filePath, 'utf-8');
  // ... rest of code
}
```

### Test Strategy

**New Tests** (`lib/security/path-validator.spec.ts`):

```typescript
import { sanitizeSlug, isPathWithinDirectory, safeFilePath } from './path-validator';
import path from 'path';

describe('REQ-SEC-003: Path Traversal Protection', () => {
  describe('sanitizeSlug', () => {
    test('allows valid slugs', () => {
      expect(sanitizeSlug('about-us')).toBe('about-us');
      expect(sanitizeSlug('summer_camp_2024')).toBe('summer_camp_2024');
      expect(sanitizeSlug('program123')).toBe('program123');
    });

    test('removes path traversal sequences', () => {
      expect(sanitizeSlug('../etc/passwd')).toBe('etcpasswd');
      expect(sanitizeSlug('../../secret')).toBe('secret');
      expect(sanitizeSlug('normal/../path')).toBe('normalpath');
    });

    test('removes leading/trailing slashes', () => {
      expect(sanitizeSlug('/about-us/')).toBe('about-us');
      expect(sanitizeSlug('///contact///')).toBe('contact');
    });

    test('throws on invalid characters', () => {
      expect(() => sanitizeSlug('about us')).toThrow('Invalid slug format');
      expect(() => sanitizeSlug('about@us')).toThrow('Invalid slug format');
      expect(() => sanitizeSlug('about<script>')).toThrow('Invalid slug format');
      expect(() => sanitizeSlug('a/b/c')).toThrow('Invalid slug format');
    });

    test('throws on empty slug', () => {
      expect(() => sanitizeSlug('')).toThrow('Invalid slug');
      expect(() => sanitizeSlug(null as any)).toThrow('Invalid slug');
      expect(() => sanitizeSlug(undefined as any)).toThrow('Invalid slug');
    });

    test('throws on excessively long slug', () => {
      const longSlug = 'a'.repeat(101);
      expect(() => sanitizeSlug(longSlug)).toThrow('exceeds maximum length');
    });
  });

  describe('isPathWithinDirectory', () => {
    test('allows paths within directory', () => {
      const baseDir = '/var/www/content/pages';
      expect(isPathWithinDirectory('/var/www/content/pages/about.mdoc', baseDir)).toBe(true);
      expect(isPathWithinDirectory('/var/www/content/pages/subfolder/post.mdoc', baseDir)).toBe(true);
    });

    test('blocks paths outside directory', () => {
      const baseDir = '/var/www/content/pages';
      expect(isPathWithinDirectory('/var/www/content/other/file.mdoc', baseDir)).toBe(false);
      expect(isPathWithinDirectory('/etc/passwd', baseDir)).toBe(false);
      expect(isPathWithinDirectory('/var/www/secret.key', baseDir)).toBe(false);
    });

    test('handles path traversal attempts', () => {
      const baseDir = '/var/www/content/pages';
      const maliciousPath = path.resolve('/var/www/content/pages/../../etc/passwd');
      expect(isPathWithinDirectory(maliciousPath, baseDir)).toBe(false);
    });
  });

  describe('safeFilePath', () => {
    const baseDir = path.join(process.cwd(), 'content', 'pages');

    test('constructs safe paths for valid slugs', () => {
      const result = safeFilePath(baseDir, 'about-us');
      expect(result).toContain('about-us.mdoc');
      expect(result).toContain('content/pages');
    });

    test('throws on path traversal attempts', () => {
      expect(() => safeFilePath(baseDir, '../../etc/passwd')).toThrow('Invalid slug format');
    });

    test('supports custom extensions', () => {
      const result = safeFilePath(baseDir, 'post', '.md');
      expect(result).toContain('post.md');
    });

    test('validates final path is within base directory', () => {
      // Even if slug sanitization fails, path validation catches it
      expect(() => {
        const maliciousSlug = '..\\..\\..\\etc\\passwd'; // Windows path separators
        safeFilePath(baseDir, maliciousSlug);
      }).toThrow();
    });
  });
});
```

**Integration Tests** (`app/[slug]/page.spec.tsx`):

```typescript
describe('REQ-SEC-003: Path Traversal Protection (Integration)', () => {
  test('returns 404 for path traversal attempts', async () => {
    const maliciousSlugs = [
      '../../etc/passwd',
      '../../../secret.key',
      '..%2F..%2Fetc%2Fpasswd', // URL-encoded
      '....//....//etc//passwd',
    ];

    for (const slug of maliciousSlugs) {
      const response = await fetch(`http://localhost:3000/${slug}`);
      expect(response.status).toBe(404);
    }
  });

  test('allows valid page slugs', async () => {
    const validSlugs = ['about-us', 'summer-camp', 'facilities'];

    for (const slug of validSlugs) {
      const response = await fetch(`http://localhost:3000/${slug}`);
      expect(response.status).toBe(200);
    }
  });
});
```

### Verification

1. Run unit tests: `npm test -- path-validator.spec.ts`
2. Run integration tests: `npm test -- "app/\[slug\]/page.spec.tsx"`
3. Manual test:
   - Navigate to `/../../etc/passwd` → Should return 404
   - Check server logs for security warning
4. Security scan: `npm audit` (check for path traversal vulnerabilities)

### Logging & Monitoring

**Add Security Event Logging**:

```typescript
// lib/telemetry/security-logger.ts
export function logSecurityEvent(event: string, details: Record<string, any>) {
  const timestamp = new Date().toISOString();
  console.error(`[SECURITY] ${timestamp} - ${event}`, JSON.stringify(details));

  // In production, send to monitoring service:
  // - Sentry
  // - Datadog
  // - CloudWatch Logs
}

// Usage in page.tsx:
import { logSecurityEvent } from '@/lib/telemetry/security-logger';

catch (error) {
  logSecurityEvent('path_traversal_attempt', {
    slug: params.slug,
    ip: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
    error: error.message,
  });
  notFound();
}
```

### Risk Assessment

- **Complexity**: MEDIUM (new utility + integration in 2 files)
- **Breaking Change**: NO (only affects invalid slugs)
- **Performance Impact**: NEGLIGIBLE (validation is fast)
- **Rollback**: Remove validation, revert to original path construction

### Story Points: 0.15 SP
- New validation utility with multiple functions
- Integration in 2 page files
- Comprehensive test coverage (unit + integration)
- Security logging setup

---

## REQ-SEC-004: Implement CSP Headers (P1)

### Problem
No Content Security Policy headers to mitigate XSS attacks at HTTP layer. While `rehype-sanitize` provides primary defense, CSP adds defense-in-depth.

### Impact
- **Likelihood**: LOW (rehype-sanitize is primary defense)
- **Impact**: MEDIUM (missing defense-in-depth layer)
- **CVSS Score**: 3.7

### Files to Create

#### 1. Create `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/middleware.ts`

**New File**:

```typescript
/**
 * REQ-SEC-004: Content Security Policy & Security Headers
 * Implements defense-in-depth security headers at middleware layer
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // REQ-SEC-004: Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' https: data:", // Allow HTTPS images from whitelisted domains
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src https://www.youtube-nocookie.com", // YouTube embeds only
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'", // Clickjacking protection
    "upgrade-insecure-requests", // Force HTTPS
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Additional security headers
  response.headers.set('X-Frame-Options', 'DENY'); // Clickjacking protection
  response.headers.set('X-Content-Type-Options', 'nosniff'); // MIME sniffing protection
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin'); // Privacy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()'); // Disable APIs

  // HSTS (Strict-Transport-Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
```

### CSP Configuration Breakdown

| Directive | Value | Reason |
|-----------|-------|--------|
| `default-src 'self'` | Only load resources from same origin | Default deny |
| `script-src 'self' 'unsafe-inline' 'unsafe-eval'` | Allow inline scripts | Next.js requirement |
| `style-src 'self' 'unsafe-inline'` | Allow inline styles | Tailwind CSS |
| `img-src 'self' https: data:` | HTTPS images + data URIs | Next.js Image optimization |
| `frame-src youtube-nocookie.com` | Only YouTube embeds | Limit iframes |
| `frame-ancestors 'none'` | Block embedding site in iframe | Clickjacking protection |
| `upgrade-insecure-requests` | Force HTTPS | Security best practice |

### Test Strategy

**Manual Verification**:
```bash
# 1. Start dev server
npm run dev

# 2. Check headers
curl -I http://localhost:3000 | grep -i "content-security-policy"
curl -I http://localhost:3000 | grep -i "x-frame-options"

# Expected output:
# Content-Security-Policy: default-src 'self'; script-src...
# X-Frame-Options: DENY
```

**Browser DevTools Test**:
1. Open site in Chrome DevTools
2. Network tab → Select any page request
3. Response Headers → Verify CSP present
4. Console → Should show no CSP violation errors

**New Tests** (`middleware.spec.ts`):

```typescript
import { middleware } from './middleware';
import { NextRequest, NextResponse } from 'next/server';

describe('REQ-SEC-004: Security Headers', () => {
  test('adds Content-Security-Policy header', () => {
    const request = new NextRequest('http://localhost:3000/about-us');
    const response = middleware(request);

    const csp = response.headers.get('Content-Security-Policy');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("frame-src https://www.youtube-nocookie.com");
  });

  test('adds X-Frame-Options header', () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);

    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  test('adds X-Content-Type-Options header', () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  test('adds Referrer-Policy header', () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);

    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  test('adds HSTS header in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);

    const hsts = response.headers.get('Strict-Transport-Security');
    expect(hsts).toContain('max-age=31536000');

    process.env.NODE_ENV = originalEnv;
  });

  test('does not apply to static files', () => {
    const staticPaths = [
      '/_next/static/chunk.js',
      '/_next/image?url=test.jpg',
      '/favicon.ico',
    ];

    for (const path of staticPaths) {
      const request = new NextRequest(`http://localhost:3000${path}`);
      // Middleware should not process these (matcher excludes them)
    }
  });
});
```

### CSP Violation Monitoring

**In Production** (add to error reporter):

```typescript
// lib/telemetry/error-reporter.ts
export function setupCSPReporting() {
  if (typeof window === 'undefined') return;

  // Listen for CSP violations
  document.addEventListener('securitypolicyviolation', (event) => {
    console.error('[CSP VIOLATION]', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      documentURI: event.documentURI,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
    });

    // Send to monitoring service
    // sendToSentry('csp_violation', { ... });
  });
}
```

### Verification

1. Run tests: `npm test -- middleware.spec.ts`
2. Deploy to prelaunch: `npm run build && npm run start`
3. Check headers: `curl -I https://prelaunch.bearlakecamp.com`
4. Verify no CSP violations in browser console
5. Test YouTube embeds still work
6. Test external links still work

### Risk Assessment

- **Complexity**: LOW (single middleware file)
- **Breaking Change**: POSSIBLE (if site has inline scripts/styles)
- **Mitigation**: Test thoroughly on prelaunch first
- **Rollback**: Delete/rename `middleware.ts`

### Story Points: 0.2 SP
- Single new file with clear logic
- Comprehensive header coverage
- Well-documented directives
- Requires thorough testing

---

## REQ-SEC-005: Enhanced URL Validation (P1)

### Problem
Current URL validation only blocks `javascript:` and `data:` schemes, missing other dangerous protocols like `vbscript:`, `file:`, `blob:`.

### Impact
- **Likelihood**: LOW (most modern browsers block these)
- **Impact**: LOW (edge case attack vectors)
- **CVSS Score**: 2.7

### Files to Modify

#### 1. Create `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/lib/security/url-validator.ts`

**New File** (Shared Utility):

```typescript
/**
 * REQ-SEC-005: Comprehensive URL Validation
 * Validates URLs to prevent XSS, SSRF, and other injection attacks
 */

const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

const DANGEROUS_SCHEMES = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'blob:',
  'about:',
];

/**
 * Validates if URL is safe for use in links
 * @param href URL to validate
 * @returns true if URL is safe
 */
export function isValidLinkURL(href: string | undefined): boolean {
  if (!href) return false;

  // Empty or placeholder URLs
  if (href === '' || href === '()' || href === '#') return false;

  // Check for dangerous schemes
  const lowerHref = href.toLowerCase();
  if (DANGEROUS_SCHEMES.some(scheme => lowerHref.startsWith(scheme))) {
    return false;
  }

  try {
    // Parse URL (handles absolute URLs)
    const url = new URL(href, 'https://bearlakecamp.com');
    return ALLOWED_SCHEMES.includes(url.protocol);
  } catch {
    // Relative URLs are OK if they don't contain ':' (potential scheme)
    return !href.includes(':');
  }
}

/**
 * Validates image URLs (stricter than link URLs)
 * @param url Image URL to validate
 * @returns true if URL is safe for images
 */
export function isValidImageURL(url: string | undefined): boolean {
  if (!url) return false;

  // Allow relative paths
  if (url.startsWith('/')) return true;

  try {
    const parsed = new URL(url);

    // Only HTTPS for external images
    if (parsed.protocol !== 'https:') return false;

    // Additional checks can be added here
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes URL by removing dangerous schemes
 * @param href URL to sanitize
 * @param fallback Fallback URL if invalid (default: '#')
 * @returns Safe URL or fallback
 */
export function sanitizeURL(href: string | undefined, fallback: string = '#'): string {
  return isValidLinkURL(href) ? href! : fallback;
}

/**
 * Determines if URL is external (different origin)
 * @param href URL to check
 * @returns true if URL is external
 */
export function isExternalURL(href: string | undefined): boolean {
  if (!href) return false;

  try {
    const url = new URL(href, 'https://bearlakecamp.com');
    return url.hostname !== 'bearlakecamp.com' &&
           !url.hostname.endsWith('.bearlakecamp.com');
  } catch {
    return false; // Relative URLs are internal
  }
}
```

#### 2. Update `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/MarkdownRenderer.tsx`

**Line 117-136** (Link Component):

```typescript
import { isValidLinkURL, isExternalURL } from '@/lib/security/url-validator';

// OLD:
a: ({ href, children, ...props }) => {
  if (href?.startsWith('javascript:') || href?.startsWith('data:')) {
    return <span>{children}</span>;
  }
  if (!href || href === "" || href === "()") {
    return <span>{children}</span>;
  }
  return <a href={href} className="..." {...props}>{children}</a>;
}

// NEW - REQ-SEC-005:
a: ({ href, children, ...props }) => {
  // Validate URL
  if (!isValidLinkURL(href)) {
    return <span className="text-gray-500">{children}</span>;
  }

  // External links get security attributes
  const isExternal = isExternalURL(href);

  return (
    <a
      href={href}
      className="text-secondary hover:underline font-medium"
      {...(isExternal && {
        target: '_blank',
        rel: 'noopener noreferrer'
      })}
      {...props}
    >
      {children}
    </a>
  );
},
```

#### 3. Update `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/templates/HomepageTemplate.tsx`

**Line 178-196** (Link Component):

```typescript
import { isValidLinkURL, isExternalURL } from '@/lib/security/url-validator';

// Replace inline validation with shared utility
a: ({ href, children, ...props }) => {
  if (!isValidLinkURL(href)) {
    return <span className="text-gray-500">{children}</span>;
  }

  const isExternal = isExternalURL(href);

  return (
    <a
      href={href}
      className="text-secondary hover:underline font-medium"
      {...(isExternal && {
        target: '_blank',
        rel: 'noopener noreferrer'
      })}
      {...props}
    >
      {children}
    </a>
  );
},
```

### Test Strategy

**New Tests** (`lib/security/url-validator.spec.ts`):

```typescript
import {
  isValidLinkURL,
  isValidImageURL,
  sanitizeURL,
  isExternalURL
} from './url-validator';

describe('REQ-SEC-005: URL Validation', () => {
  describe('isValidLinkURL', () => {
    test('allows safe HTTP/HTTPS URLs', () => {
      expect(isValidLinkURL('https://bearlakecamp.com')).toBe(true);
      expect(isValidLinkURL('http://example.com')).toBe(true);
    });

    test('allows mailto and tel links', () => {
      expect(isValidLinkURL('mailto:info@bearlakecamp.com')).toBe(true);
      expect(isValidLinkURL('tel:+1234567890')).toBe(true);
    });

    test('allows relative URLs', () => {
      expect(isValidLinkURL('/about-us')).toBe(true);
      expect(isValidLinkURL('../contact')).toBe(true);
    });

    test('blocks javascript: URLs', () => {
      expect(isValidLinkURL('javascript:alert(1)')).toBe(false);
      expect(isValidLinkURL('JavaScript:void(0)')).toBe(false);
    });

    test('blocks data: URLs', () => {
      expect(isValidLinkURL('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    test('blocks vbscript: URLs', () => {
      expect(isValidLinkURL('vbscript:msgbox(1)')).toBe(false);
    });

    test('blocks file: URLs', () => {
      expect(isValidLinkURL('file:///etc/passwd')).toBe(false);
    });

    test('blocks blob: URLs', () => {
      expect(isValidLinkURL('blob:https://example.com/uuid')).toBe(false);
    });

    test('rejects empty/placeholder URLs', () => {
      expect(isValidLinkURL('')).toBe(false);
      expect(isValidLinkURL('()')).toBe(false);
      expect(isValidLinkURL('#')).toBe(false);
      expect(isValidLinkURL(undefined)).toBe(false);
    });
  });

  describe('isValidImageURL', () => {
    test('allows relative image paths', () => {
      expect(isValidImageURL('/images/hero.jpg')).toBe(true);
    });

    test('allows HTTPS image URLs', () => {
      expect(isValidImageURL('https://bearlakecamp.com/image.png')).toBe(true);
    });

    test('blocks HTTP image URLs', () => {
      expect(isValidImageURL('http://example.com/image.jpg')).toBe(false);
    });

    test('blocks data: URLs', () => {
      expect(isValidImageURL('data:image/png;base64,abc123')).toBe(false);
    });
  });

  describe('sanitizeURL', () => {
    test('returns safe URLs unchanged', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com');
      expect(sanitizeURL('/about')).toBe('/about');
    });

    test('returns fallback for dangerous URLs', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('#');
      expect(sanitizeURL('javascript:alert(1)', '/error')).toBe('/error');
    });
  });

  describe('isExternalURL', () => {
    test('detects external URLs', () => {
      expect(isExternalURL('https://google.com')).toBe(true);
      expect(isExternalURL('https://ultracamp.com/register')).toBe(true);
    });

    test('recognizes internal URLs', () => {
      expect(isExternalURL('https://bearlakecamp.com/about')).toBe(false);
      expect(isExternalURL('https://prelaunch.bearlakecamp.com')).toBe(false);
    });

    test('treats relative URLs as internal', () => {
      expect(isExternalURL('/about-us')).toBe(false);
      expect(isExternalURL('../contact')).toBe(false);
    });
  });
});
```

### Verification

1. Run tests: `npm test -- url-validator.spec.ts`
2. Test markdown links:
   - Create test page with various link types
   - Verify dangerous links render as `<span>` (not clickable)
   - Verify external links have `rel="noopener noreferrer"`
3. Check console for validation errors

### Risk Assessment

- **Complexity**: LOW (simple utility with clear logic)
- **Breaking Change**: NO (only affects invalid URLs)
- **Performance Impact**: NEGLIGIBLE
- **Rollback**: Revert to inline validation

### Story Points: 0.1 SP
- Simple validation utility
- Integration in 2 components
- Comprehensive test coverage

---

## REQ-SEC-006: Fix Isomorphic DOMPurify (P1)

### Problem
Current DOMPurify implementation bypasses sanitization during server-side rendering, exposing first-paint XSS risk.

### Current Code
```typescript
// lib/security/sanitize.ts
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    return html;  // ⚠️ No sanitization on server!
  }
  return DOMPurify.sanitize(html, { /* ... */ });
}
```

### Impact
- Server-rendered HTML bypasses sanitization
- First paint shows unsanitized content
- Hydration may introduce XSS

### Files to Modify

#### 1. Update `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/lib/security/sanitize.ts`

```typescript
// OLD:
import DOMPurify from 'dompurify';

export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }
  return DOMPurify.sanitize(html, { /* ... */ });
}

// NEW - REQ-SEC-006:
import DOMPurify from 'isomorphic-dompurify';

/**
 * REQ-SEC-006: Isomorphic HTML Sanitization
 * Works on both server and client to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre',
      'article', 'section', 'aside', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
    KEEP_CONTENT: true,
  });
}
```

#### 2. Update `package.json`

```bash
# Remove client-only DOMPurify
npm uninstall dompurify

# Install isomorphic version
npm install isomorphic-dompurify
npm install --save-dev @types/dompurify
```

### Test Strategy

**Update Tests** (`lib/security/sanitize.spec.ts`):

```typescript
import { sanitizeHTML } from './sanitize';

describe('REQ-SEC-006: Isomorphic Sanitization', () => {
  test('sanitizes on server-side (no window)', () => {
    // Simulate server environment
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const malicious = '<script>alert(1)</script><p>Safe content</p>';
    const result = sanitizeHTML(malicious);

    expect(result).not.toContain('<script>');
    expect(result).toContain('Safe content');

    global.window = originalWindow;
  });

  test('sanitizes on client-side (with window)', () => {
    const malicious = '<p onclick="alert(1)">Click me</p>';
    const result = sanitizeHTML(malicious);

    expect(result).not.toContain('onclick');
    expect(result).toContain('Click me');
  });

  test('blocks javascript: URLs', () => {
    const malicious = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHTML(malicious);

    expect(result).not.toContain('javascript:');
  });

  test('allows safe HTML', () => {
    const safe = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHTML(safe);

    expect(result).toBe(safe);
  });

  test('preserves allowed attributes', () => {
    const safe = '<a href="https://example.com" class="link" rel="noopener">Link</a>';
    const result = sanitizeHTML(safe);

    expect(result).toContain('href=');
    expect(result).toContain('class=');
    expect(result).toContain('rel=');
  });
});
```

### Verification

1. Run tests: `npm test -- sanitize.spec.ts`
2. Build app: `npm run build` (ensure no errors)
3. Check SSR output: View page source → Verify no `<script>` tags
4. Check hydration: Open browser console → No hydration mismatches

### Risk Assessment

- **Complexity**: LOW (package swap)
- **Breaking Change**: NO (same API)
- **Bundle Size**: +15KB (acceptable)
- **Rollback**: Revert package.json, reinstall old version

### Story Points: 0.1 SP
- Simple package replacement
- Update tests
- Verify SSR behavior

---

## REQ-SEC-007: Strict Rehype Schema (P1)

### Problem
`rehype-sanitize` uses default schema which may allow more tags than necessary, increasing attack surface.

### Impact
- Overly permissive whitelist
- Unnecessary tags allowed
- Larger attack surface

### Files to Create

#### 1. Create `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/lib/security/rehype-config.ts`

**New File**:

```typescript
/**
 * REQ-SEC-007: Strict Rehype Sanitization Schema
 * Minimal whitelist of allowed HTML tags and attributes
 */

import { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'rehype-sanitize';

/**
 * Strict sanitization schema for markdown rendering
 * Only allows tags/attributes needed for content rendering
 */
export const strictSanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    // Text formatting
    'p', 'br', 'strong', 'em', 'u', 'del', 's', 'mark',

    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',

    // Lists
    'ul', 'ol', 'li',

    // Links and quotes
    'a', 'blockquote',

    // Code
    'code', 'pre',

    // Tables
    'table', 'thead', 'tbody', 'tr', 'th', 'td',

    // Media (images handled by Next.js Image)
    'img', 'figure', 'figcaption',

    // Semantic HTML
    'div', 'span', 'article', 'section',
  ],

  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['className'], // Tailwind classes
  },

  protocols: {
    href: ['http', 'https', 'mailto', 'tel'],
    src: ['http', 'https'],
  },

  // Completely strip dangerous tags (don't just remove attributes)
  strip: ['script', 'style', 'iframe', 'object', 'embed'],
};

/**
 * Even stricter schema for untrusted content
 * Use for user-generated content or external sources
 */
export const extraStrictSchema: Schema = {
  ...strictSanitizeSchema,
  tagNames: [
    'p', 'br', 'strong', 'em', 'u',
    'h2', 'h3', 'h4', // No h1 (page should have only one)
    'ul', 'ol', 'li',
    'a', 'blockquote',
    'code',
  ],
  attributes: {
    a: ['href', 'title'], // No target or rel (controlled by component)
    '*': ['className'],
  },
};
```

#### 2. Update `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/MarkdownRenderer.tsx`

**Line 91** (Rehype Plugins):

```typescript
import { strictSanitizeSchema } from '@/lib/security/rehype-config';

// OLD:
rehypePlugins={[rehypeRaw, rehypeSanitize]}

// NEW - REQ-SEC-007:
rehypePlugins={[
  rehypeRaw,
  [rehypeSanitize, strictSanitizeSchema]
]}
```

#### 3. Update `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/templates/HomepageTemplate.tsx`

**Line 148** (Rehype Plugins):

```typescript
import { strictSanitizeSchema } from '@/lib/security/rehype-config';

// OLD:
rehypePlugins={[rehypeRaw, rehypeSanitize]}

// NEW - REQ-SEC-007:
rehypePlugins={[
  rehypeRaw,
  [rehypeSanitize, strictSanitizeSchema]
]}
```

### Test Strategy

**New Tests** (`lib/security/rehype-config.spec.ts`):

```typescript
import { strictSanitizeSchema, extraStrictSchema } from './rehype-config';

describe('REQ-SEC-007: Rehype Schema', () => {
  describe('strictSanitizeSchema', () => {
    test('includes common text formatting tags', () => {
      expect(strictSanitizeSchema.tagNames).toContain('p');
      expect(strictSanitizeSchema.tagNames).toContain('strong');
      expect(strictSanitizeSchema.tagNames).toContain('em');
    });

    test('includes heading tags', () => {
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        expect(strictSanitizeSchema.tagNames).toContain(tag);
      });
    });

    test('strips dangerous tags', () => {
      expect(strictSanitizeSchema.strip).toContain('script');
      expect(strictSanitizeSchema.strip).toContain('iframe');
      expect(strictSanitizeSchema.strip).toContain('object');
    });

    test('limits link protocols', () => {
      expect(strictSanitizeSchema.protocols?.href).toEqual(['http', 'https', 'mailto', 'tel']);
    });

    test('limits link attributes', () => {
      expect(strictSanitizeSchema.attributes?.a).toContain('href');
      expect(strictSanitizeSchema.attributes?.a).toContain('rel');
    });
  });

  describe('extraStrictSchema', () => {
    test('has fewer allowed tags than strict schema', () => {
      const strictCount = strictSanitizeSchema.tagNames?.length || 0;
      const extraStrictCount = extraStrictSchema.tagNames?.length || 0;
      expect(extraStrictCount).toBeLessThan(strictCount);
    });

    test('does not include h1 tag', () => {
      expect(extraStrictSchema.tagNames).not.toContain('h1');
    });

    test('removes target attribute from links', () => {
      expect(extraStrictSchema.attributes?.a).not.toContain('target');
    });
  });
});
```

**Integration Tests** (add to `MarkdownRenderer.spec.tsx`):

```typescript
describe('REQ-SEC-007: Strict Schema Enforcement', () => {
  test('blocks script tags', () => {
    const malicious = '<script>alert(1)</script><p>Safe</p>';
    render(<MarkdownRenderer content={malicious} />);

    expect(screen.queryByText('alert(1)')).not.toBeInTheDocument();
    expect(screen.getByText('Safe')).toBeInTheDocument();
  });

  test('blocks iframe tags', () => {
    const malicious = '<iframe src="https://evil.com"></iframe>';
    render(<MarkdownRenderer content={malicious} />);

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBe(0);
  });

  test('allows safe markdown', () => {
    const safe = '# Heading\n\nParagraph with **bold** and *italic*.';
    render(<MarkdownRenderer content={safe} />);

    expect(screen.getByRole('heading')).toHaveTextContent('Heading');
    expect(screen.getByText(/bold/)).toBeInTheDocument();
  });
});
```

### Verification

1. Run tests: `npm test -- rehype-config.spec.ts`
2. Test with malicious content:
   - Add test page with `<script>` tags in markdown
   - Verify scripts don't execute
3. Verify existing content renders correctly

### Risk Assessment

- **Complexity**: LOW (config file + integration)
- **Breaking Change**: POSSIBLE (if content uses non-whitelisted tags)
- **Mitigation**: Test with existing content first
- **Rollback**: Remove schema parameter, use default

### Story Points: 0.1 SP
- New config file
- Integration in 2 components
- Test coverage

---

## Summary: Implementation Order

### Week 1: P0 Fixes (MUST FIX - 0.3 SP)

**Day 1: REQ-SEC-001 - Tabnabbing (0.1 SP)**
1. Add `rel="noopener noreferrer"` to 4 files
2. Write tests (3 spec files)
3. Run tests: `npm test -- --testNamePattern="REQ-SEC-001"`
4. Commit: `fix(security): add tabnabbing protection to external links (REQ-SEC-001)`

**Day 2: REQ-SEC-002 - SSRF Protection (0.05 SP)**
1. Update `next.config.mjs` with whitelist
2. Create `lib/security/image-url-validator.ts`
3. Update 4 templates to use validator
4. Write tests
5. Audit CMS content for external images
6. Commit: `fix(security): restrict image domains to prevent SSRF (REQ-SEC-002)`

**Day 3: REQ-SEC-003 - Path Traversal (0.15 SP)**
1. Create `lib/security/path-validator.ts`
2. Update `app/[slug]/page.tsx`
3. Update `app/page.tsx`
4. Write unit + integration tests
5. Test with malicious slugs
6. Commit: `fix(security): add path traversal protection (REQ-SEC-003)`

**End of Day 3**: Run full test suite, deploy to prelaunch, manual QA

---

### Week 2: P1 Hardening (SHOULD FIX - 0.5 SP)

**Day 4: REQ-SEC-004 - CSP Headers (0.2 SP)**
1. Create `middleware.ts`
2. Write middleware tests
3. Deploy to prelaunch
4. Verify headers: `curl -I https://prelaunch.bearlakecamp.com`
5. Check for CSP violations in browser
6. Commit: `feat(security): implement CSP and security headers (REQ-SEC-004)`

**Day 5: REQ-SEC-005 + REQ-SEC-006 (0.2 SP)**

**REQ-SEC-005 - Enhanced URL Validation (0.1 SP)**
1. Create `lib/security/url-validator.ts`
2. Update `MarkdownRenderer.tsx`
3. Update `HomepageTemplate.tsx`
4. Write tests
5. Commit: `feat(security): enhance URL validation (REQ-SEC-005)`

**REQ-SEC-006 - Isomorphic DOMPurify (0.1 SP)**
1. `npm uninstall dompurify && npm install isomorphic-dompurify`
2. Update `lib/security/sanitize.ts`
3. Update tests
4. Verify SSR: `npm run build && npm run start`
5. Commit: `fix(security): use isomorphic DOMPurify for SSR (REQ-SEC-006)`

**Day 6: REQ-SEC-007 - Strict Rehype (0.1 SP)**
1. Create `lib/security/rehype-config.ts`
2. Update `MarkdownRenderer.tsx`
3. Update `HomepageTemplate.tsx`
4. Write tests
5. Test with existing content
6. Commit: `feat(security): strict rehype-sanitize schema (REQ-SEC-007)`

**End of Week 2**: Full regression testing, final deployment

---

## Testing Strategy

### Pre-Deployment Tests

**Automated Tests** (must pass):
```bash
# Unit tests
npm test -- --coverage

# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

**Manual Tests** (checklist):
- [ ] All CTA buttons have `rel="noopener noreferrer"`
- [ ] Images from whitelisted domains load correctly
- [ ] Path traversal attempts return 404
- [ ] CSP headers present in response
- [ ] No CSP violations in browser console
- [ ] External links open in new tab with security attributes
- [ ] YouTube embeds still work
- [ ] Markdown rendering works correctly

### Security Scanning

**Tools to Run**:
```bash
# NPM audit
npm audit --production

# OWASP dependency check
npm install -g snyk
snyk test

# Security headers check
npm install -g securityheaders
securityheaders https://prelaunch.bearlakecamp.com
```

---

## Risk Assessment & Rollback Plan

### Overall Risk: LOW-MEDIUM

| REQ-ID | Risk Level | Rollback Complexity |
|--------|-----------|---------------------|
| REQ-SEC-001 | LOW | Remove `rel` attribute |
| REQ-SEC-002 | MEDIUM | Revert to wildcard (test content first) |
| REQ-SEC-003 | LOW | Remove validation calls |
| REQ-SEC-004 | MEDIUM | Delete `middleware.ts` |
| REQ-SEC-005 | LOW | Revert to inline validation |
| REQ-SEC-006 | LOW | Reinstall `dompurify` |
| REQ-SEC-007 | LOW | Remove schema parameter |

### Rollback Procedure (if production issues)

1. **Immediate Rollback** (< 5 min):
   ```bash
   git revert HEAD~7..HEAD
   npm install
   npm run build
   git push origin main
   ```

2. **Partial Rollback** (specific REQ):
   ```bash
   git revert <commit-sha>
   npm install
   npm run build
   git push origin main
   ```

3. **Emergency Rollback** (if site down):
   ```bash
   # Restore last known good commit
   git reset --hard <last-good-commit>
   git push --force origin main
   ```

---

## Story Point Summary

### P0 Fixes (MUST FIX)
- REQ-SEC-001: Tabnabbing Protection - **0.1 SP**
- REQ-SEC-002: SSRF Image Domains - **0.05 SP**
- REQ-SEC-003: Path Traversal - **0.15 SP**

**P0 Subtotal: 0.3 SP**

### P1 Hardening (SHOULD FIX)
- REQ-SEC-004: CSP Headers - **0.2 SP**
- REQ-SEC-005: Enhanced URL Validation - **0.1 SP**
- REQ-SEC-006: Isomorphic DOMPurify - **0.1 SP**
- REQ-SEC-007: Strict Rehype Schema - **0.1 SP**

**P1 Subtotal: 0.5 SP**

### Total Effort
- **P0 + P1: 0.8 SP**
- **P0 Only: 0.3 SP** (minimum for production)

---

## Pre-Deployment Checklist

### Before Starting Implementation
- [ ] Read and understand all 7 REQs
- [ ] Review current code in affected files
- [ ] Set up branch: `git checkout -b security-fixes-p0-p1`
- [ ] Create requirements lock: `requirements/security-fixes.lock.md`

### After P0 Fixes
- [ ] All P0 tests pass
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Build succeeds
- [ ] Manual QA on localhost
- [ ] Deploy to prelaunch
- [ ] Manual QA on prelaunch
- [ ] Security scan passed

### Before Production Deployment
- [ ] All P0 + P1 tests pass
- [ ] Full regression testing
- [ ] Performance testing (no slowdowns)
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing
- [ ] Security headers verified
- [ ] CSP violations checked
- [ ] Documentation updated

### Post-Deployment Monitoring
- [ ] Check error logs (first 24 hours)
- [ ] Monitor CSP violation reports
- [ ] Verify no broken images
- [ ] Verify no broken links
- [ ] Check analytics for errors

---

## Success Criteria

### P0 Success (Required for Production)
1. All external links have `rel="noopener noreferrer"`
2. Next.js image domains restricted to whitelist
3. Path traversal attempts blocked and logged
4. All P0 tests pass
5. No security vulnerabilities in `npm audit`

### P1 Success (Defense-in-Depth)
6. CSP headers present on all pages
7. No CSP violations in browser console
8. URL validation blocks dangerous schemes
9. DOMPurify works on server and client
10. Rehype sanitize uses strict schema

### Deployment Success
11. All automated tests pass
12. Manual QA checklist complete
13. Security scan passed
14. Performance benchmarks maintained
15. Zero production errors in first 24 hours

---

## References

- **PE Code Review Report**: `/docs/tasks/pe-code-review-report.md`
- **Security Review Report**: `/docs/tasks/security-review-report.md`
- **OWASP Top 10 2021**: https://owasp.org/Top10/
- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- **rehype-sanitize**: https://github.com/rehypejs/rehype-sanitize
- **DOMPurify**: https://github.com/cure53/DOMPurify

---

## Next Steps

1. **QNEW**: Create `requirements/security-fixes.lock.md` with all 7 REQs
2. **QCODET**: Implement tests for REQ-SEC-001 (tabnabbing)
3. **QCODE**: Implement REQ-SEC-001 fix
4. **QCHECK**: Review REQ-SEC-001 implementation
5. Repeat for remaining REQs in priority order
6. **QDOC**: Update security documentation
7. **QGIT**: Commit and deploy to prelaunch
8. **Manual QA**: Test on prelaunch
9. **Production Deploy**: After successful QA

---

**Plan Created**: 2025-12-03
**Plan Owner**: planner agent
**Implementation Target**: Week of 2025-12-03
**Production Target**: After P0 fixes + QA
