# QPLAN: Keystatic CMS Enhancements

**Project**: Bear Lake Camp Next.js + Keystatic CMS
**Task ID**: CMS-ENH-2025-001
**Execution Mode**: UNASSISTED (8-hour autonomous execution)
**Created**: 2025-11-21
**Status**: READY FOR EXECUTION

---

## Executive Summary

### Mission
Implement 9 P0/P1 critical enhancements to Keystatic CMS admin interface, following strict TDD discipline with recursive P0/P1 fixing until all quality gates pass.

### Scope
- **Total Requirements**: 9 (8 P0, 1 P1)
- **Total Story Points**: 47.8 SP
- **Execution Phases**: 10 (with max 4 recursive fix loops)
- **Parallel Streams**: 4 concurrent implementation streams
- **Quality Gates**: prettier, lint, typecheck, tests (all MUST pass)

### Critical Path
1. REQ-000 Hydration fixes (BLOCKING - must complete first)
2. Parallel Stream A: Header components (REQ-001, REQ-P1-005)
3. Parallel Stream B: API routes (REQ-002, REQ-006, REQ-012)
4. Parallel Stream C: Form components (REQ-003, REQ-004)
5. Parallel Stream D: Content components (REQ-011)

### Parallel Streams
- **4 concurrent streams** during implementation phase
- **3 concurrent reviewers** during QCHECK phases
- **Research phase**: 2 specialists in parallel

### Story Points Breakdown
| Phase | Story Points | Description |
|-------|-------------|-------------|
| Research | 2.0 SP | Best practices discovery |
| Architecture | 3.0 SP | System design + contracts |
| Test Writing (QCODET) | 12.8 SP | Comprehensive test coverage |
| Test Review (QCHECKT) | 2.0 SP | Test quality audit |
| Implementation (QCODE) | 21.0 SP | Core functionality |
| Implementation Review (QCHECK+QCHECKF) | 3.0 SP | Code quality audits |
| Recursive Fixes (P0/P1) | 6.0 SP | Estimated fix cycles (max 4 loops) |
| Documentation (QDOC) | 2.0 SP | Progressive docs |
| Release (QGIT) | 1.0 SP | Quality gates + commit |
| **TOTAL** | **47.8 SP** | |

---

## Research Findings

### Phase Completed By
- **research-director** (orchestrator)
- **industry-signal-scout** (2025 best practices)
- **fact-checker** (source validation)

### React Server Components + Keystatic Hydration (2025)

**Best Practice**: Separate server/client boundaries explicitly
- **Source**: Next.js 14 Documentation (Tier-1, official docs, 2025-01-15)
- **Pattern**: Use `'use client'` directive ONLY for components with browser APIs
- **Keystatic Context**: Keystatic admin UI is fully client-side; must not render during SSR
- **Fix Strategy**:
  - Dynamic import with `ssr: false` for Keystatic routes
  - Suppress hydration warnings ONLY for known Keystatic UI elements
  - Use `useEffect` + `useState` for localStorage/sessionStorage access

**Common Hydration Causes** (React 18+):
1. Server rendering dates/timestamps differently than client
2. Accessing `window`, `localStorage`, `document` during SSR
3. Third-party scripts modifying DOM before React hydrates
4. Environment variable mismatches (NEXT_PUBLIC_ prefix required for client)

**Resolution Pattern**:
```typescript
// Pattern for client-only rendering
'use client';
import dynamic from 'next/dynamic';

const KeystaticApp = dynamic(
  () => import('@keystatic/next'),
  { ssr: false }
);
```

### Vercel Deployment API v6 Polling (2025)

**Best Practice**: Smart polling with exponential backoff
- **Source**: Vercel API Documentation v6 (Tier-1, official, 2025-01-10)
- **Endpoint**: `GET https://api.vercel.com/v6/deployments?projectId={id}&limit=1&target=production`
- **Rate Limits**: 100 requests/hour per token (authenticated)
- **Polling Strategy**:
  - Initial delay: 45s after commit (Vercel build trigger delay)
  - Poll interval: 15s during active deployment
  - Stop conditions: state=READY or state=ERROR
  - Timeout: 10 minutes max (typical deploy: 2-4 minutes)

**State Machine**:
```
QUEUED → BUILDING → DEPLOYING → READY (success)
                              → ERROR (failure)
                              → CANCELED (user-triggered)
```

**Implementation**:
```typescript
// app/api/vercel-status/route.ts
const VERCEL_API = 'https://api.vercel.com/v6/deployments';
const headers = {
  Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
};
```

### Next.js 14 Image Optimization + Validation (2025)

**Best Practice**: Client-side validation before upload
- **Source**: Next.js Image Optimization Docs (Tier-1, official, 2025-01-12)
- **Max File Size**: 5MB recommended (balance quality vs performance)
- **Validation Points**:
  1. Client-side: Immediate user feedback (before network)
  2. Server-side: Security validation (prevent malicious files)
  3. Edge optimization: Vercel handles AVIF/WebP conversion

**Keystatic Integration**:
```typescript
// Custom image field validation
fields.image({
  label: 'Image',
  directory: 'public/uploads',
  publicPath: '/uploads/',
  // Client-side validation via custom component wrapper
})
```

**Recommended Dimensions**:
- Hero images: 1920×1080px (16:9)
- Social share: 1200×630px (OG standard)
- Gallery: 1200×800px (3:2)
- Thumbnails: 400×300px (4:3)

### Markdoc Component Architecture (2025)

**Best Practice**: Component composition over configuration
- **Source**: Markdoc Official Patterns (Tier-1, 2025-01-08)
- **Pattern**: Small, composable components with clear props
- **Keystatic Integration**: Define components in `keystatic.config.ts` → Auto-generate UI

**Component Design Principles**:
1. **Single Responsibility**: Each component does one thing well
2. **Composable**: Components nest naturally
3. **Validated**: Props validated at CMS level (prevent runtime errors)
4. **Accessible**: ARIA labels, keyboard nav, semantic HTML
5. **Responsive**: Mobile-first Tailwind classes

**Example Architecture**:
```typescript
// keystatic.config.ts
components: {
  Hero: component({
    label: 'Hero Section',
    schema: {
      backgroundImage: fields.image({ label: 'Background' }),
      heading: fields.text({ label: 'Heading' }),
      // ... more fields
    }
  })
}
```

### Universal LLM Router Integration (2025)

**Best Practice**: OpenAI-compatible API for cost-optimized multi-provider routing
- **Source**: Universal LLM Router Docs (https://universal.sparkry.ai/help, 2025-01-15)
- **Pattern**: API route → Universal LLM → Optimized model selection
- **Rate Limiting**: User-level limits (10 requests/hour for SEO generation)

**Integration Details**:
- **Endpoint**: `https://universal.sparkry.ai/v1/chat/completions`
- **Auth**: `Authorization: Bearer <UNIVERSAL_LLM_KEY>` (optional, works without)
- **Model**: `"cost"` (routes to cheapest: OpenAI/Anthropic/Google)
- **Format**: OpenAI-compatible chat completion API
- **Advantages**: Auto-failover, cost optimization, vendor-agnostic

**SEO Generation Request** (OpenAI-compatible format):
```typescript
// app/api/generate-seo/route.ts
const response = await fetch('https://universal.sparkry.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.UNIVERSAL_LLM_KEY}`
  },
  body: JSON.stringify({
    model: 'cost', // Cheapest available model
    messages: [
      {
        role: 'system',
        content: 'You are an SEO expert. Generate optimized meta tags as JSON only.'
      },
      {
        role: 'user',
        content: `Generate SEO metadata for: Title: ${pageTitle}, Content: ${truncate(content, 1000)}.

Return JSON: {"metaTitle": "50-60 chars", "metaDescription": "150-155 chars", "ogTitle": "creative", "ogDescription": "descriptive"}`
      }
    ]
  })
});
```

### GitHub OAuth + App Integration Security (2025)

**Best Practice**: Scope minimization + token rotation
- **Source**: GitHub Apps Best Practices (Tier-1, official, 2025-01-10)
- **Required Scopes**: `repo:write` (for issue creation), `read:user` (for username)
- **Token Security**:
  - Store in server-side env vars (NEVER client-side)
  - Rotate every 90 days
  - Use GitHub App installation tokens (1-hour expiry) over personal tokens

**Bug Report Submission**:
```typescript
// app/api/submit-bug/route.ts
POST https://api.github.com/repos/{owner}/{repo}/issues
Headers: {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json'
}
Body: {
  title: string,
  body: string, // Markdown formatted
  labels: ['bug', 'cms-reported']
}
```

**Security Considerations**:
- Rate limit: 5 reports/user/hour (prevent spam)
- Sanitize user input (prevent XSS in issue body)
- Validate context data (prevent sensitive data leakage)

---

## Industry Best-of-Breed Examples (2025)

### CMS Deployment Status Indicators

**Best Example**: Netlify CMS
- **Pattern**: Persistent header badge (not intrusive modal)
- **States**: Building (animated spinner), Published (checkmark), Failed (error icon)
- **UX**: Click badge → Show detailed log
- **Polling**: Start on save, stop on success/failure

**Implementation for Keystatic**:
- Header badge component (top-right)
- Lucide icons: Loader2 (spin), CheckCircle2, XCircle
- Tooltip on hover: "Last deployed 2m ago"

### AI-Powered SEO Generation UX

**Best Example**: Webflow AI Assistant
- **Pattern**: Inline button next to field ("Generate with AI")
- **States**: Idle → Loading (3-5s) → Preview (editable)
- **UX**: User can accept, edit, or regenerate
- **Rate Limiting**: Visual counter ("8/10 generations remaining")

**Implementation for Keystatic**:
- Button next to SEO accordion header
- Modal with: Loading spinner → Generated preview → Edit + Save
- LocalStorage for rate limit tracking

### Bug Reporting Modals with Context Capture

**Best Example**: Linear Bug Reporter
- **Pattern**: Keyboard shortcut (Cmd+Shift+B) → Modal
- **Auto-Capture**: URL, user agent, console errors, local state
- **Optional**: Screenshot (html2canvas library)
- **Submission**: GitHub issue with formatted context

**Implementation for Keystatic**:
- Header "Report Bug" button (Bug icon)
- Modal fields: Title, Description, Include context (checkbox)
- Auto-capture: Page slug, field values, browser info
- Optional: Screenshot via html2canvas (lazy-loaded)

---

## Architecture Design

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    KEYSTATIC ADMIN UI                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Header Components (Client-Side)                     │  │
│  │  ├─ Production Link (REQ-001)                        │  │
│  │  ├─ Deployment Status Badge (REQ-002) ←─── Polls API │  │
│  │  ├─ Sparkry Branding (REQ-P1-005)                    │  │
│  │  └─ Bug Report Button (REQ-006) ←──────── Opens Modal│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Content Editor (Server + Client)                    │  │
│  │  ├─ SEO Accordion (REQ-003) ←───── Collapsible       │  │
│  │  │  └─ Generate SEO Button (REQ-012) ←─── Universal LLM │  │
│  │  ├─ Image Upload (REQ-004) ←────── 5MB Validation    │  │
│  │  └─ Enhanced Components (REQ-011) ←─ 8 new Markdoc   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  GET  /api/vercel-status      (REQ-002)             │  │
│  │  POST /api/submit-bug          (REQ-006)             │  │
│  │  POST /api/generate-seo        (REQ-012)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIS                             │
│  ├─ Vercel Deployment API v6 (polling)                      │
│  ├─ GitHub Issues API (bug submission)                      │
│  └─ Universal LLM Router (SEO generation)                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
app/
├── keystatic/
│   ├── layout.tsx (MODIFIED: Add custom header)
│   └── [[...params]]/page.tsx (MODIFIED: Fix hydration)
│
├── api/
│   ├── vercel-status/route.ts (NEW: REQ-002)
│   ├── submit-bug/route.ts (NEW: REQ-006)
│   └── generate-seo/route.ts (NEW: REQ-012)
│
components/
├── keystatic/
│   ├── KeystaticHeader.tsx (NEW: Custom header wrapper)
│   ├── ProductionLink.tsx (NEW: REQ-001)
│   ├── DeploymentStatus.tsx (NEW: REQ-002)
│   ├── SparkryBranding.tsx (NEW: REQ-P1-005)
│   ├── BugReportButton.tsx (NEW: REQ-006)
│   ├── BugReportModal.tsx (NEW: REQ-006)
│   ├── SEOGenerateButton.tsx (NEW: REQ-012)
│   └── ImageUploadValidator.tsx (NEW: REQ-004)
│
├── content/ (EXISTING)
│   ├── Hero.tsx (NEW: REQ-011)
│   ├── FeatureGrid.tsx (NEW: REQ-011)
│   ├── StatsCounter.tsx (NEW: REQ-011)
│   ├── TestimonialCard.tsx (NEW: REQ-011)
│   ├── AccordionFAQ.tsx (NEW: REQ-011)
│   ├── SplitContent.tsx (NEW: REQ-011)
│   ├── Timeline.tsx (NEW: REQ-011)
│   └── PricingTable.tsx (NEW: REQ-011)
│
keystatic.config.ts (MODIFIED: REQ-003, REQ-004, REQ-011)
```

### API Route Contracts

#### REQ-002: Vercel Deployment Status API

```typescript
// app/api/vercel-status/route.ts
// GET /api/vercel-status

// Response Schema
interface DeploymentStatus {
  state: 'QUEUED' | 'BUILDING' | 'DEPLOYING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: string; // ISO timestamp
  url: string | null; // Production URL (null if not deployed)
  duration: number | null; // Milliseconds (null if still deploying)
}

// Success Response (200)
{
  state: 'READY',
  createdAt: '2025-11-21T10:30:00Z',
  url: 'https://prelaunch.bearlakecamp.com',
  duration: 120000
}

// Error Response (500)
{
  error: 'Vercel API unavailable',
  code: 'VERCEL_API_ERROR'
}

// Rate Limit (429)
{
  error: 'Rate limit exceeded',
  retryAfter: 60 // seconds
}
```

#### REQ-006: GitHub Bug Submission API

```typescript
// app/api/submit-bug/route.ts
// POST /api/submit-bug

// Request Schema
interface BugReportRequest {
  title: string; // Required, 5-100 chars
  description: string; // Required, 10-5000 chars
  includeContext: boolean; // Default: true
  context?: {
    pageSlug: string;
    fieldValues: Record<string, unknown>;
    userAgent: string;
    timestamp: string;
    screenshot?: string; // Base64 encoded (optional)
  };
}

// Response Schema
interface BugReportResponse {
  success: boolean;
  issueUrl: string; // GitHub issue URL
  issueNumber: number;
}

// Success Response (201)
{
  success: true,
  issueUrl: 'https://github.com/sparkst/bearlakecamp/issues/42',
  issueNumber: 42
}

// Error Responses
// 400: Invalid input
{
  error: 'Title required',
  code: 'VALIDATION_ERROR'
}

// 429: Rate limit
{
  error: 'Rate limit exceeded (5 reports/hour)',
  retryAfter: 3600,
  code: 'RATE_LIMIT'
}

// 500: GitHub API error
{
  error: 'GitHub API unavailable',
  code: 'GITHUB_API_ERROR'
}
```

#### REQ-012: SEO Generation API

```typescript
// app/api/generate-seo/route.ts
// POST /api/generate-seo

// Request Schema
interface SEOGenerationRequest {
  pageTitle: string; // Required
  pageContent: string; // Required, max 1000 chars (truncated)
}

// Response Schema
interface SEOGenerationResponse {
  metaTitle: string; // 50-60 chars
  metaDescription: string; // 150-155 chars
  ogTitle: string;
  ogDescription: string;
  tokensUsed: number; // For monitoring
}

// Success Response (200)
{
  metaTitle: 'Bear Lake Camp: Christian Summer Camp for Youth',
  metaDescription: 'Experience transformative Christian summer camps in Idaho. Programs for grades 3-12 featuring worship, outdoor adventures, and biblical teaching.',
  ogTitle: 'Bear Lake Camp - Where Faith Meets Adventure',
  ogDescription: 'Join hundreds of youth experiencing life-changing Christian summer camp programs in the beautiful Idaho mountains.',
  tokensUsed: 450
}

// Error Responses
// 400: Invalid input
{
  error: 'Page content required',
  code: 'VALIDATION_ERROR'
}

// 429: Rate limit
{
  error: 'Rate limit exceeded (10 generations/hour)',
  remaining: 0,
  retryAfter: 3600,
  code: 'RATE_LIMIT'
}

// 500: Universal LLM API error
{
  error: 'AI service unavailable',
  code: 'LLM_API_ERROR'
}
```

### State Management Architecture

**Deployment Status Polling** (REQ-002):
```typescript
// components/keystatic/DeploymentStatus.tsx
// Uses React Query (or SWR) for smart polling

const { data, error } = useQuery({
  queryKey: ['deployment-status'],
  queryFn: fetchDeploymentStatus,
  refetchInterval: (data) => {
    // Smart polling logic
    if (!data) return false; // No initial fetch
    if (data.state === 'READY' || data.state === 'ERROR') return false; // Stop
    return 15000; // Poll every 15s during deployment
  },
  refetchIntervalInBackground: false,
  staleTime: 10000, // 10s
});
```

**Bug Report Modal** (REQ-006):
```typescript
// components/keystatic/BugReportModal.tsx
// Local state for form + context capture

const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({
  title: '',
  description: '',
  includeContext: true,
});

// Capture context on modal open
useEffect(() => {
  if (isOpen) {
    captureContext(); // Page slug, field values, browser info
  }
}, [isOpen]);
```

**Rate Limiting** (Client-Side):
```typescript
// lib/rate-limiter.ts
// LocalStorage-based rate limiting

interface RateLimit {
  endpoint: string;
  limit: number;
  window: number; // milliseconds
}

const LIMITS: RateLimit[] = [
  { endpoint: 'bug-report', limit: 5, window: 3600000 }, // 5/hour
  { endpoint: 'seo-generate', limit: 10, window: 3600000 }, // 10/hour
];

function checkRateLimit(endpoint: string): { allowed: boolean; remaining: number; retryAfter: number } {
  // Implementation uses localStorage
}
```

### Data Flow Diagrams

**REQ-002: Deployment Status Polling**
```
User saves content in Keystatic
        ↓
Content committed to GitHub
        ↓
(Wait 45 seconds - Vercel build trigger delay)
        ↓
Start polling: GET /api/vercel-status every 15s
        ↓
API route → Vercel API v6: GET /deployments?projectId=...
        ↓
Parse state: QUEUED → BUILDING → DEPLOYING → READY
        ↓
Update badge: Loading spinner → Checkmark (green)
        ↓
Stop polling (state = READY)
```

**REQ-006: Bug Report Submission**
```
User clicks "Report Bug" → Open modal
        ↓
Auto-capture: Page slug, field values, browser info
        ↓
Optional: Capture screenshot (html2canvas)
        ↓
User fills: Title, Description
        ↓
Submit → POST /api/submit-bug
        ↓
Rate limit check (client + server)
        ↓
Sanitize input (XSS prevention)
        ↓
Format issue body (Markdown)
        ↓
GitHub API: POST /repos/.../issues
        ↓
Success → Show issue URL to user
```

**REQ-012: AI SEO Generation**
```
User expands SEO accordion → Click "Generate SEO"
        ↓
Extract: Page title + content (max 1000 chars)
        ↓
POST /api/generate-seo { pageTitle, pageContent }
        ↓
Rate limit check (10/hour)
        ↓
Universal LLM: POST /v1/chat/completions
        ↓
Prompt: "Generate SEO metadata for this webpage..."
        ↓
Parse JSON response
        ↓
Validate field lengths (metaTitle 50-60, metaDescription 150-155)
        ↓
Pre-fill SEO fields (user can edit)
        ↓
User saves (or discards)
```

### Security Architecture

**Environment Variables** (Server-Side Only):
```bash
# Vercel Dashboard → Settings → Environment Variables
VERCEL_TOKEN=<token>           # Deployment status API
VERCEL_PROJECT_ID=<id>          # Project identifier
GITHUB_TOKEN=<token>            # Bug report API (issues:write)
UNIVERSAL_LLM_KEY=<key>         # SEO generation (universal-llm router)
```

**Client-Side Security**:
- NO API keys exposed to browser
- All external API calls proxied through Next.js API routes
- Rate limiting enforced both client (UX) and server (security)
- Input sanitization (XSS, injection prevention)

**Rate Limiting Strategy**:
```typescript
// Server-side (in-memory cache or Redis for production)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkServerRateLimit(userId: string, endpoint: string): boolean {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const limit = rateLimiter.get(key);

  if (!limit || limit.resetAt < now) {
    rateLimiter.set(key, { count: 1, resetAt: now + 3600000 });
    return true;
  }

  if (limit.count >= LIMITS[endpoint]) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}
```

---

## Test Strategy

### Test Scope Summary

| REQ-ID | Unit Tests | Integration Tests | E2E Tests | Total Tests |
|--------|-----------|------------------|-----------|------------|
| REQ-000 | 3 | 1 | 1 | 5 |
| REQ-001 | 4 | 0 | 1 | 5 |
| REQ-002 | 6 | 2 | 1 | 9 |
| REQ-003 | 5 | 0 | 1 | 6 |
| REQ-004 | 8 | 1 | 1 | 10 |
| REQ-P1-005 | 3 | 0 | 1 | 4 |
| REQ-006 | 12 | 3 | 1 | 16 |
| REQ-011 | 48 | 8 | 4 | 60 |
| REQ-012 | 10 | 2 | 1 | 13 |
| **TOTAL** | **99** | **17** | **12** | **128** |

### Unit Tests (By REQ-ID)

#### REQ-000: Fix React Hydration Errors (3 unit tests)
**File**: `app/keystatic/[[...params]]/page.spec.tsx`

```typescript
describe('REQ-000 — React Hydration Fixes', () => {
  test('Keystatic page renders without hydration errors', () => {
    // Test server + client render produce same HTML
  });

  test('localStorage access deferred until client-side', () => {
    // Verify no SSR access to browser APIs
  });

  test('suppressHydrationWarning used only for Keystatic UI', () => {
    // Verify warnings suppressed only where necessary
  });
});
```

#### REQ-001: Production Link (4 unit tests)
**File**: `components/keystatic/ProductionLink.spec.tsx`

```typescript
describe('REQ-001 — Production Link', () => {
  test('renders link with correct production URL', () => {
    // Verify URL construction for page slug
  });

  test('opens link in new tab', () => {
    // Verify target="_blank" and rel="noopener noreferrer"
  });

  test('handles homepage slug correctly', () => {
    // Verify '/' slug maps to base URL
  });

  test('displays fallback for unpublished pages', () => {
    // Verify message when page not yet deployed
  });
});
```

#### REQ-002: Deployment Status (6 unit tests)
**File**: `components/keystatic/DeploymentStatus.spec.tsx`

```typescript
describe('REQ-002 — Deployment Status Indicator', () => {
  test('displays correct icon for READY state', () => {
    // CheckCircle2 icon, green color
  });

  test('displays animated spinner for BUILDING state', () => {
    // Loader2 icon with spin animation
  });

  test('displays error icon for ERROR state', () => {
    // XCircle icon, red color
  });

  test('shows relative timestamp', () => {
    // "2 minutes ago" format
  });

  test('starts polling on mount if deployment active', () => {
    // Verify polling logic
  });

  test('stops polling when state is READY or ERROR', () => {
    // Verify polling termination
  });
});
```

#### REQ-003: SEO Accordion (5 unit tests)
**File**: `keystatic.config.spec.ts`

```typescript
describe('REQ-003 — SEO Metadata Accordion', () => {
  test('SEO fields grouped in collapsible accordion', () => {
    // Verify fields.object structure
  });

  test('accordion defaults to collapsed state', () => {
    // Verify initial state
  });

  test('meta title enforces 60 character limit', () => {
    // Validation: length.max = 60
  });

  test('meta description enforces 160 character limit', () => {
    // Validation: length.max = 160
  });

  test('OG fields default to meta fields when empty', () => {
    // Logic test for fallback behavior
  });
});
```

#### REQ-004: Image Validation (8 unit tests)
**File**: `components/keystatic/ImageUploadValidator.spec.tsx`

```typescript
describe('REQ-004 — Image Upload Validation', () => {
  test('rejects files larger than 5MB', () => {
    // File size validation
  });

  test('displays error message with current size and limit', () => {
    // Error message content
  });

  test('accepts files under 5MB', () => {
    // Success path
  });

  test('displays image dimensions after upload', () => {
    // Extract and display width × height
  });

  test('validates drag-and-drop uploads', () => {
    // Drag-drop event handling
  });

  test('validates file picker uploads', () => {
    // Input file event handling
  });

  test('handles corrupt/invalid image files', () => {
    // Error handling for non-image files
  });

  test('displays recommended dimensions based on field', () => {
    // Contextual help text
  });
});
```

#### REQ-P1-005: Sparkry Branding (3 unit tests)
**File**: `components/keystatic/SparkryBranding.spec.tsx`

```typescript
describe('REQ-P1-005 — Sparkry AI Branding', () => {
  test('renders logo with correct dimensions', () => {
    // Height: 24px, width: auto
  });

  test('links to https://sparkry.ai in new tab', () => {
    // Verify href and target
  });

  test('displays "Powered by" text', () => {
    // Text content verification
  });
});
```

#### REQ-006: Bug Submission (12 unit tests)
**File**: `components/keystatic/BugReportModal.spec.tsx` (6 tests)

```typescript
describe('REQ-006 — Bug Report Modal (UI)', () => {
  test('modal opens on button click', () => {});
  test('modal closes on cancel', () => {});
  test('validates title required', () => {});
  test('validates description required', () => {});
  test('captures context when checkbox checked', () => {});
  test('displays success message after submission', () => {});
});
```

**File**: `app/api/submit-bug/route.spec.ts` (6 tests)

```typescript
describe('REQ-006 — Bug Submission API', () => {
  test('creates GitHub issue with correct format', () => {});
  test('enforces rate limit (5 reports/hour)', () => {});
  test('sanitizes user input (XSS prevention)', () => {});
  test('returns 400 for invalid input', () => {});
  test('returns 500 on GitHub API failure', () => {});
  test('includes context in issue body', () => {});
});
```

#### REQ-011: Enhanced Content Components (48 unit tests - 6 per component)
**Files**: `components/content/{Hero,FeatureGrid,StatsCounter,TestimonialCard,AccordionFAQ,SplitContent,Timeline,PricingTable}.spec.tsx`

**Per Component** (6 tests each):
```typescript
describe('REQ-011 — {ComponentName}', () => {
  test('renders with required props', () => {});
  test('applies responsive classes correctly', () => {});
  test('handles missing optional props gracefully', () => {});
  test('renders accessible ARIA labels', () => {});
  test('supports keyboard navigation', () => {});
  test('matches snapshot', () => {});
});
```

**Component Breakdown**:
- Hero (6 tests)
- FeatureGrid (6 tests)
- StatsCounter (6 tests)
- TestimonialCard (6 tests)
- AccordionFAQ (6 tests)
- SplitContent (6 tests)
- Timeline (6 tests)
- PricingTable (6 tests)

#### REQ-012: AI SEO Generation (10 unit tests)
**File**: `components/keystatic/SEOGenerateButton.spec.tsx` (4 tests)

```typescript
describe('REQ-012 — SEO Generate Button (UI)', () => {
  test('button appears next to SEO accordion', () => {});
  test('displays loading spinner during generation', () => {});
  test('pre-fills fields with generated content', () => {});
  test('shows remaining generations counter', () => {});
});
```

**File**: `app/api/generate-seo/route.spec.ts` (6 tests)

```typescript
describe('REQ-012 — SEO Generation API', () => {
  test('calls Universal LLM API with correct format', () => {});
  test('validates meta title length (50-60 chars)', () => {});
  test('validates meta description length (150-155 chars)', () => {});
  test('enforces rate limit (10 generations/hour)', () => {});
  test('returns 500 on LLM API failure', () => {});
  test('truncates page content to 1000 chars', () => {});
});
```

### Integration Tests

#### REQ-002: Deployment Status Integration (2 tests)
**File**: `tests/integration/vercel-status.spec.ts`

```typescript
describe('REQ-002 — Vercel Status Integration', () => {
  test('API route fetches live Vercel deployment status', async () => {
    // Mock Vercel API response
    // Verify API route parses correctly
  });

  test('Component polls API and updates UI state', async () => {
    // Mock API responses (BUILDING → READY)
    // Verify polling starts, updates, stops
  });
});
```

#### REQ-004: Image Upload Integration (1 test)
**File**: `tests/integration/image-upload.spec.ts`

```typescript
describe('REQ-004 — Image Upload Integration', () => {
  test('End-to-end upload flow with validation', async () => {
    // Select file → Validate size → Upload → Display dimensions
  });
});
```

#### REQ-006: Bug Report Integration (3 tests)
**File**: `tests/integration/bug-report.spec.ts`

```typescript
describe('REQ-006 — Bug Report Integration', () => {
  test('Submit bug → GitHub issue created', async () => {
    // Mock GitHub API
    // Verify issue format
  });

  test('Rate limiting enforced across requests', async () => {
    // Submit 6 reports → Verify 6th fails
  });

  test('Context capture includes all fields', async () => {
    // Verify context data structure
  });
});
```

#### REQ-011: Content Components Integration (8 tests - 1 per component)
**File**: `tests/integration/content-components.spec.ts`

```typescript
describe('REQ-011 — Content Components Integration', () => {
  test('Hero component renders in Markdoc context', async () => {});
  test('FeatureGrid component renders in Markdoc context', async () => {});
  // ... 6 more (one per component)
});
```

#### REQ-012: SEO Generation Integration (2 tests)
**File**: `tests/integration/seo-generation.spec.ts`

```typescript
describe('REQ-012 — SEO Generation Integration', () => {
  test('Generate SEO → Universal LLM → Pre-fill fields', async () => {
    // Mock Universal LLM API
    // Verify field population
  });

  test('Rate limiting prevents excessive API calls', async () => {
    // Submit 11 requests → Verify 11th fails
  });
});
```

### E2E Tests (Playwright)

#### REQ-000: Hydration E2E (1 test)
**File**: `tests/e2e/keystatic-hydration.spec.ts`

```typescript
test('REQ-000 — Keystatic loads without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/keystatic');
  await page.waitForSelector('[data-testid="keystatic-ui"]');

  expect(consoleErrors.filter(e => e.includes('Hydration'))).toHaveLength(0);
});
```

#### REQ-001: Production Link E2E (1 test)
**File**: `tests/e2e/production-link.spec.ts`

```typescript
test('REQ-001 — Production link opens correct URL', async ({ page, context }) => {
  await page.goto('/keystatic');
  const pagePromise = context.waitForEvent('page');
  await page.click('[data-testid="production-link"]');
  const newPage = await pagePromise;
  expect(newPage.url()).toContain('prelaunch.bearlakecamp.com');
});
```

#### REQ-002: Deployment Status E2E (1 test)
**File**: `tests/e2e/deployment-status.spec.ts`

```typescript
test('REQ-002 — Deployment status updates during polling', async ({ page }) => {
  await page.goto('/keystatic');

  // Initial state
  await expect(page.locator('[data-testid="deployment-status"]')).toHaveText(/Published|Deploying/);

  // If deploying, wait for READY state (timeout: 5 minutes)
  await page.waitForSelector('[data-testid="status-icon-ready"]', { timeout: 300000 });
});
```

#### REQ-003: SEO Accordion E2E (1 test)
**File**: `tests/e2e/seo-accordion.spec.ts`

```typescript
test('REQ-003 — SEO accordion expands and collapses', async ({ page }) => {
  await page.goto('/keystatic/pages');
  await page.click('[data-testid="seo-accordion-header"]');
  await expect(page.locator('[data-testid="seo-fields"]')).toBeVisible();
  await page.click('[data-testid="seo-accordion-header"]');
  await expect(page.locator('[data-testid="seo-fields"]')).toBeHidden();
});
```

#### REQ-004: Image Upload E2E (1 test)
**File**: `tests/e2e/image-upload.spec.ts`

```typescript
test('REQ-004 — Image upload rejects files >5MB', async ({ page }) => {
  await page.goto('/keystatic/pages');

  // Create 6MB file
  const largeFile = Buffer.alloc(6 * 1024 * 1024);
  await page.setInputFiles('input[type="file"]', {
    name: 'large.jpg',
    mimeType: 'image/jpeg',
    buffer: largeFile,
  });

  await expect(page.locator('[data-testid="upload-error"]')).toHaveText(/exceeds 5MB limit/);
});
```

#### REQ-P1-005: Sparkry Branding E2E (1 test)
**File**: `tests/e2e/sparkry-branding.spec.ts`

```typescript
test('REQ-P1-005 — Sparkry logo links to sparkry.ai', async ({ page, context }) => {
  await page.goto('/keystatic');
  const pagePromise = context.waitForEvent('page');
  await page.click('[data-testid="sparkry-branding"]');
  const newPage = await pagePromise;
  expect(newPage.url()).toBe('https://sparkry.ai/');
});
```

#### REQ-006: Bug Report E2E (1 test)
**File**: `tests/e2e/bug-report.spec.ts`

```typescript
test('REQ-006 — Bug report creates GitHub issue', async ({ page }) => {
  await page.goto('/keystatic');
  await page.click('[data-testid="bug-report-button"]');

  await page.fill('[data-testid="bug-title"]', 'Test bug report');
  await page.fill('[data-testid="bug-description"]', 'This is a test bug report from E2E tests');
  await page.click('[data-testid="bug-submit"]');

  await expect(page.locator('[data-testid="bug-success"]')).toHaveText(/Issue created/);
  await expect(page.locator('[data-testid="issue-url"]')).toContainText('github.com');
});
```

#### REQ-011: Content Components E2E (4 tests - sample)
**File**: `tests/e2e/content-components.spec.ts`

```typescript
test('REQ-011 — Hero component renders on frontend', async ({ page }) => {
  // Create page with Hero component → Publish → Verify frontend render
});

test('REQ-011 — FeatureGrid responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // Verify mobile layout
});

test('REQ-011 — AccordionFAQ keyboard navigation', async ({ page }) => {
  // Tab through items, verify focus states
});

test('REQ-011 — PricingTable highlights popular tier', async ({ page }) => {
  // Verify visual distinction for highlighted tier
});
```

#### REQ-012: SEO Generation E2E (1 test)
**File**: `tests/e2e/seo-generation.spec.ts`

```typescript
test('REQ-012 — AI SEO generation pre-fills fields', async ({ page }) => {
  await page.goto('/keystatic/pages');
  await page.click('[data-testid="generate-seo-button"]');

  await page.waitForSelector('[data-testid="seo-loading"]');
  await page.waitForSelector('[data-testid="seo-preview"]', { timeout: 10000 });

  const metaTitle = await page.inputValue('[data-testid="meta-title"]');
  expect(metaTitle.length).toBeGreaterThan(0);
  expect(metaTitle.length).toBeLessThanOrEqual(60);
});
```

### Edge Cases Matrix

| REQ-ID | Edge Case | Test Coverage |
|--------|-----------|---------------|
| REQ-000 | Hydration mismatch from browser extension | Unit test: Suppress non-app errors |
| REQ-001 | Page slug with special characters | Unit test: URL encoding |
| REQ-002 | Vercel API timeout | Integration test: Timeout handling |
| REQ-002 | Rate limit reached | Unit test: 429 response handling |
| REQ-003 | Character counter at exact limit | Unit test: Boundary value (60, 160) |
| REQ-004 | File exactly 5MB | Unit test: Boundary value |
| REQ-004 | Corrupt image file | Unit test: Invalid file handling |
| REQ-006 | Screenshot capture fails | Unit test: Optional screenshot |
| REQ-006 | GitHub API returns 500 | Integration test: Error handling |
| REQ-011 | Component with all optional props empty | Unit test: Graceful degradation |
| REQ-012 | Universal LLM returns malformed JSON | Integration test: JSON parse error |
| REQ-012 | Generated meta title >60 chars | Unit test: Truncation logic |

### Accessibility Checklist (REQ-011 Components)

All 8 new components must pass:
- ✅ ARIA labels for interactive elements
- ✅ Keyboard navigation (Tab, Enter, Space, Arrows)
- ✅ Focus indicators visible
- ✅ Color contrast ratio ≥4.5:1 (WCAG AA)
- ✅ Semantic HTML (headings, lists, buttons vs divs)
- ✅ Screen reader compatibility (tested with VoiceOver)
- ✅ Reduced motion support (`prefers-reduced-motion`)

### Performance Benchmarks

| Component | First Render | Interactive | Lighthouse Score |
|-----------|-------------|------------|-----------------|
| DeploymentStatus | <100ms | <200ms | N/A (admin UI) |
| BugReportModal | <150ms | <300ms | N/A |
| SEOGenerateButton | <50ms | <100ms | N/A |
| Hero | <200ms | <300ms | ≥90 |
| FeatureGrid | <150ms | <250ms | ≥90 |
| AccordionFAQ | <100ms | <200ms | ≥90 |

---

## Implementation Plan

### Phase 1: QCODET (Test Implementation)

**Story Points**: 12.8 SP
**Parallel Execution**: test-writer instances per domain

#### Stream 1: API Route Tests (4.0 SP)
**Specialist**: test-writer (backend)
**Files**:
- `app/api/vercel-status/route.spec.ts` (1.5 SP)
- `app/api/submit-bug/route.spec.ts` (1.5 SP)
- `app/api/generate-seo/route.spec.ts` (1.0 SP)

**Tasks**:
- [ ] REQ-002: Vercel status API tests (6 tests)
- [ ] REQ-006: Bug submission API tests (6 tests)
- [ ] REQ-012: SEO generation API tests (6 tests)
- [ ] Mock external APIs (Vercel, GitHub, Claude)
- [ ] Rate limiting tests (client + server)

#### Stream 2: Component Tests (5.8 SP)
**Specialist**: test-writer (frontend)
**Files**:
- `components/keystatic/*.spec.tsx` (3.0 SP)
- `keystatic.config.spec.ts` (0.8 SP)
- `components/content/*.spec.tsx` (2.0 SP - 8 components × 6 tests each)

**Tasks**:
- [ ] REQ-000: Hydration fix tests (3 tests)
- [ ] REQ-001: Production link tests (4 tests)
- [ ] REQ-002: Deployment status UI tests (6 tests)
- [ ] REQ-003: SEO accordion tests (5 tests)
- [ ] REQ-004: Image validation tests (8 tests)
- [ ] REQ-P1-005: Sparkry branding tests (3 tests)
- [ ] REQ-006: Bug report modal tests (6 tests)
- [ ] REQ-011: Content component tests (48 tests)
- [ ] REQ-012: SEO generate button tests (4 tests)

#### Stream 3: Integration Tests (2.0 SP)
**Specialist**: test-writer (integration)
**Files**:
- `tests/integration/*.spec.ts`

**Tasks**:
- [ ] REQ-002: Vercel status integration (2 tests)
- [ ] REQ-004: Image upload integration (1 test)
- [ ] REQ-006: Bug report integration (3 tests)
- [ ] REQ-011: Content components integration (8 tests)
- [ ] REQ-012: SEO generation integration (2 tests)

#### Stream 4: E2E Tests (1.0 SP)
**Specialist**: test-writer (e2e)
**Files**:
- `tests/e2e/*.spec.ts` (Playwright)

**Tasks**:
- [ ] REQ-000: Hydration E2E (1 test)
- [ ] REQ-001: Production link E2E (1 test)
- [ ] REQ-002: Deployment status E2E (1 test)
- [ ] REQ-003: SEO accordion E2E (1 test)
- [ ] REQ-004: Image upload E2E (1 test)
- [ ] REQ-P1-005: Sparkry branding E2E (1 test)
- [ ] REQ-006: Bug report E2E (1 test)
- [ ] REQ-011: Content components E2E (4 tests)
- [ ] REQ-012: SEO generation E2E (1 test)

**Validation**:
- ✅ All tests fail before implementation (TDD requirement)
- ✅ Each REQ-ID has ≥1 failing test
- ✅ Test coverage matrix 100% complete

**Commands**:
```bash
# Run all tests to verify failures
npm test

# Expected output: ~128 failing tests
# (99 unit + 17 integration + 12 E2E)
```

---

### Phase 2: QCHECKT (Test Review)

**Story Points**: 2.0 SP
**Parallel Execution**: 2 reviewers

#### Reviewer 1: PE-Reviewer (1.0 SP)
**Focus**: Test quality audit
**Checklist**:
- [ ] Each test has clear REQ-ID reference
- [ ] Test descriptions align with assertions
- [ ] No trivial tests (e.g., `expect(2).toBe(2)`)
- [ ] Parameterized inputs (no magic numbers)
- [ ] Independent expectations (not circular logic)
- [ ] Edge cases covered per matrix
- [ ] Accessibility tests for UI components
- [ ] Performance benchmarks defined

**Output**: `docs/tasks/CMS-ENH-2025-001/test-review-pe.md`

#### Reviewer 2: test-writer (1.0 SP)
**Focus**: Coverage analysis
**Checklist**:
- [ ] 100% REQ-ID coverage (all 9 requirements)
- [ ] Test-to-requirement traceability matrix complete
- [ ] Mock dependencies correctly (Vercel, GitHub, Universal LLM APIs)
- [ ] Test data fixtures realistic
- [ ] Snapshot tests where appropriate
- [ ] Property-based tests for validation logic
- [ ] Test failure messages informative

**Output**: `docs/tasks/CMS-ENH-2025-001/test-coverage.md`

**Expected P0/P1 Count**: 5-8 issues
- P0: Missing edge cases, incorrect assertions, test logic errors
- P1: Weak assertions, poor test descriptions, missing fixtures

---

### Phase 3a: QPLAN (Fix Test Issues)

**Story Points**: 1.0 SP
**Specialist**: planner

**Process**:
1. Consolidate P0/P1 issues from Phase 2 reviewers
2. Prioritize: P0 (blocking) first, then P1 (improvements)
3. Break down fixes into subtasks
4. Assign story points per fix

**Output**: `docs/tasks/CMS-ENH-2025-001/test-fixes-plan.md`

**Expected Fixes**:
- P0: 3-5 critical test issues (missing REQ coverage, logic errors)
- P1: 2-3 improvements (better assertions, edge cases)

---

### Phase 3b: QCODE (Implement Test Fixes)

**Story Points**: 0.5 SP
**Specialist**: test-writer

**Tasks**:
- [ ] Fix P0 test issues (per plan from 3a)
- [ ] Fix P1 test issues (per plan from 3a)
- [ ] Re-run tests to verify fixes

**Validation**:
```bash
npm test
# Expected: Still ~128 failing tests (failures, not errors)
```

---

### Phase 3c: QCHECKT (Re-review Tests)

**Story Points**: 0.5 SP
**Specialist**: pe-reviewer

**Checklist**:
- [ ] All P0 issues resolved
- [ ] All P1 issues resolved
- [ ] No new issues introduced
- [ ] Tests still fail (pre-implementation)

**Exit Criteria**: Zero P0/P1 issues remaining

---

### Phase 4: QCODE (Implementation)

**Story Points**: 21.0 SP
**Parallel Execution**: 4 concurrent streams

#### Stream A: Hydration & Header (5.0 SP)
**Specialist**: sde-iii (frontend)
**Dependencies**: None (can start immediately)

**Tasks**:
- [ ] **REQ-000: Fix Hydration Errors** (2.0 SP)
  - [ ] Add `'use client'` to Keystatic page components
  - [ ] Dynamic import Keystatic with `ssr: false`
  - [ ] Defer localStorage access to `useEffect`
  - [ ] Add `suppressHydrationWarning` where needed
  - [ ] Verify zero console errors in production build

- [ ] **REQ-001: Production Link** (1.5 SP)
  - [ ] Create `components/keystatic/ProductionLink.tsx`
  - [ ] Get current page slug from router
  - [ ] Construct production URL
  - [ ] Handle edge cases (homepage, nested pages)
  - [ ] Add to Keystatic header

- [ ] **REQ-P1-005: Sparkry Branding** (1.5 SP)
  - [ ] Create `components/keystatic/SparkryBranding.tsx`
  - [ ] Load Sparkry logo (Next.js Image component)
  - [ ] Link to https://sparkry.ai
  - [ ] Position in header (top-right)
  - [ ] Responsive design (hide text on mobile)

**Validation**:
```bash
npm test -- components/keystatic/ProductionLink.spec.tsx
npm test -- components/keystatic/SparkryBranding.spec.tsx
npm test -- app/keystatic
# Expected: All tests pass
```

#### Stream B: API Routes (8.0 SP)
**Specialist**: sde-iii (backend)
**Dependencies**: None (can start immediately)

**Tasks**:
- [ ] **REQ-002: Vercel Status API** (3.0 SP)
  - [ ] Create `app/api/vercel-status/route.ts`
  - [ ] Fetch from Vercel Deployment API v6
  - [ ] Parse deployment state (QUEUED → BUILDING → READY)
  - [ ] Handle rate limits, timeouts, errors
  - [ ] Return standardized JSON response

- [ ] **REQ-002: Deployment Status Component** (2.0 SP)
  - [ ] Create `components/keystatic/DeploymentStatus.tsx`
  - [ ] Implement smart polling (React Query or SWR)
  - [ ] Display status icons (Loader2, CheckCircle2, XCircle)
  - [ ] Show relative timestamp
  - [ ] Add to Keystatic header

- [ ] **REQ-006: Bug Submission API** (2.0 SP)
  - [ ] Create `app/api/submit-bug/route.ts`
  - [ ] GitHub API integration (create issue)
  - [ ] Server-side rate limiting (5 reports/hour)
  - [ ] Input sanitization (XSS prevention)
  - [ ] Format issue body (Markdown with context)

- [ ] **REQ-012: SEO Generation API** (1.0 SP)
  - [ ] Create `app/api/generate-seo/route.ts`
  - [ ] Universal LLM Router integration (OpenAI-compatible API)
  - [ ] Prompt engineering (SEO metadata generation)
  - [ ] Response parsing and validation
  - [ ] Server-side rate limiting (10 generations/hour)

**Validation**:
```bash
npm test -- app/api/vercel-status
npm test -- app/api/submit-bug
npm test -- app/api/generate-seo
# Expected: All tests pass
```

#### Stream C: Form Components (4.0 SP)
**Specialist**: sde-iii (frontend)
**Dependencies**: Stream B API routes (for REQ-006, REQ-012)

**Tasks**:
- [ ] **REQ-003: SEO Accordion** (1.0 SP)
  - [ ] Update `keystatic.config.ts`
  - [ ] Wrap SEO fields in `fields.object()`
  - [ ] Add character counters (metaTitle 60, metaDescription 160)
  - [ ] Set default state: collapsed
  - [ ] Add Lucide icons (ChevronDown/Up)

- [ ] **REQ-004: Image Upload Validation** (1.5 SP)
  - [ ] Create `components/keystatic/ImageUploadValidator.tsx`
  - [ ] Client-side file size validation (5MB max)
  - [ ] Display error messages (current size + limit)
  - [ ] Extract and display image dimensions
  - [ ] Show recommended dimensions (contextual)
  - [ ] Integrate with Keystatic image fields

- [ ] **REQ-006: Bug Report Modal** (1.0 SP)
  - [ ] Create `components/keystatic/BugReportButton.tsx`
  - [ ] Create `components/keystatic/BugReportModal.tsx`
  - [ ] Form fields (title, description, includeContext)
  - [ ] Context capture (page slug, field values, browser info)
  - [ ] Optional screenshot (html2canvas, lazy-loaded)
  - [ ] Client-side rate limiting (localStorage)
  - [ ] Success/error message handling

- [ ] **REQ-012: SEO Generate Button** (0.5 SP)
  - [ ] Create `components/keystatic/SEOGenerateButton.tsx`
  - [ ] Position next to SEO accordion header
  - [ ] Loading state (spinner during API call)
  - [ ] Pre-fill fields with generated content
  - [ ] Client-side rate limiting (10/hour counter)
  - [ ] Error handling

**Validation**:
```bash
npm test -- components/keystatic/ImageUploadValidator
npm test -- components/keystatic/BugReportModal
npm test -- components/keystatic/SEOGenerateButton
# Expected: All tests pass
```

#### Stream D: Content Components (4.0 SP)
**Specialist**: sde-iii (frontend, multiple parallel instances)
**Dependencies**: None (can start immediately)

**Tasks** (8 components × 0.5 SP each):
- [ ] **REQ-011: Hero Section** (0.5 SP)
  - [ ] Create `components/content/Hero.tsx`
  - [ ] Props: backgroundImage, heading, subheading, CTAs, overlayOpacity
  - [ ] Responsive design (mobile-first)
  - [ ] Accessible (ARIA labels)
  - [ ] Update `keystatic.config.ts` (Markdoc component)

- [ ] **REQ-011: Feature Grid** (0.5 SP)
  - [ ] Create `components/content/FeatureGrid.tsx`
  - [ ] Props: columns (2/3/4), items (icon, heading, description, link)
  - [ ] Lucide icons integration
  - [ ] Responsive grid (Tailwind)

- [ ] **REQ-011: Stats Counter** (0.5 SP)
  - [ ] Create `components/content/StatsCounter.tsx`
  - [ ] Props: number, label, suffix
  - [ ] Animated count-up (on scroll, Intersection Observer)
  - [ ] Accessible (ARIA live region)

- [ ] **REQ-011: Testimonial Card** (0.5 SP)
  - [ ] Create `components/content/TestimonialCard.tsx`
  - [ ] Props: quote, author, role, avatar, rating (optional)
  - [ ] Star rating display

- [ ] **REQ-011: Accordion/FAQ** (0.5 SP)
  - [ ] Create `components/content/AccordionFAQ.tsx`
  - [ ] Props: items (question, answer)
  - [ ] Expand/collapse functionality
  - [ ] Keyboard navigation (Enter, Space, Arrows)

- [ ] **REQ-011: Split Content** (0.5 SP)
  - [ ] Create `components/content/SplitContent.tsx`
  - [ ] Props: image, content, imagePosition (left/right)
  - [ ] Reverse layout option
  - [ ] Responsive (stack on mobile)

- [ ] **REQ-011: Timeline** (0.5 SP)
  - [ ] Create `components/content/Timeline.tsx`
  - [ ] Props: items (date, heading, description)
  - [ ] Vertical connector line (CSS)

- [ ] **REQ-011: Pricing Table** (0.5 SP)
  - [ ] Create `components/content/PricingTable.tsx`
  - [ ] Props: tiers (name, price, features, cta, highlighted)
  - [ ] Highlight popular tier (visual distinction)

**Validation**:
```bash
npm test -- components/content/Hero
npm test -- components/content/FeatureGrid
npm test -- components/content/StatsCounter
npm test -- components/content/TestimonialCard
npm test -- components/content/AccordionFAQ
npm test -- components/content/SplitContent
npm test -- components/content/Timeline
npm test -- components/content/PricingTable
# Expected: All tests pass
```

**Parallelization**:
- Stream A, B, D: Start immediately (no dependencies)
- Stream C: Start after Stream B completes (API routes needed)

**Total Parallelism**: 3 streams concurrently, then 4 streams

---

### Phase 5: QCHECK (Implementation Review)

**Story Points**: 2.0 SP
**Parallel Execution**: 3 reviewers

#### Reviewer 1: PE-Reviewer (1.0 SP)
**Focus**: Code quality audit
**Checklist**:
- [ ] No `any` types without justification
- [ ] Branded types for domain concepts
- [ ] Small, focused functions (<50 lines)
- [ ] Domain vocabulary in naming
- [ ] Error handling comprehensive
- [ ] Async operations properly handled
- [ ] React hooks rules followed
- [ ] Component composition over complexity

**Output**: `docs/tasks/CMS-ENH-2025-001/code-review-pe.md`

#### Reviewer 2: code-quality-auditor (0.5 SP)
**Focus**: Standards compliance
**Checklist**:
- [ ] TypeScript strict mode enabled
- [ ] Tailwind classes (no custom CSS)
- [ ] Lucide icons (consistent usage)
- [ ] Prettier formatted
- [ ] ESLint clean
- [ ] No commented-out code
- [ ] Import organization (type imports separate)

**Output**: `docs/tasks/CMS-ENH-2025-001/code-quality.md`

#### Reviewer 3: security-reviewer (0.5 SP)
**Focus**: Security audit (REQ-002, REQ-006, REQ-012)
**Checklist**:
- [ ] API keys in server-side env vars only
- [ ] Input sanitization (XSS prevention)
- [ ] Rate limiting enforced (client + server)
- [ ] No sensitive data in logs
- [ ] CORS properly configured
- [ ] Authentication tokens secured
- [ ] GitHub token scopes minimized

**Output**: `docs/tasks/CMS-ENH-2025-001/security-audit.md`

**Expected P0/P1 Count**: 8-12 issues
- P0: Type errors, missing error handling, security vulnerabilities
- P1: Code organization, naming improvements, performance optimizations

---

### Phase 6: QCHECKF (Function Review)

**Story Points**: 1.0 SP
**Parallel Execution**: 2 reviewers

#### Reviewer 1: PE-Reviewer (0.5 SP)
**Focus**: Function-level audit
**Checklist** (per function):
- [ ] Cyclomatic complexity <10
- [ ] Single responsibility principle
- [ ] Pure functions where possible
- [ ] Side effects isolated
- [ ] Return types explicit
- [ ] Parameter validation

**Output**: `docs/tasks/CMS-ENH-2025-001/function-review.md`

#### Reviewer 2: code-quality-auditor (0.5 SP)
**Focus**: Complexity metrics
**Tools**: `cyclomatic-complexity.py`, `dependency-risk.py`

**Checklist**:
- [ ] No circular dependencies
- [ ] Dependency depth <5 levels
- [ ] Shared code used ≥2 places
- [ ] Feature organization (not layer organization)

**Output**: `docs/tasks/CMS-ENH-2025-001/complexity-metrics.md`

**Expected P0/P1 Count**: 4-6 issues
- P0: High complexity functions, circular dependencies
- P1: Refactoring opportunities, code duplication

---

### Phase 7a: QPLAN (Fix Implementation Issues)

**Story Points**: 1.5 SP
**Specialist**: planner

**Process**:
1. Consolidate P0/P1 issues from Phase 5 & 6 reviewers
2. Total expected: 12-18 issues (8-12 from QCHECK + 4-6 from QCHECKF)
3. Prioritize: P0 (blocking) first, then P1 (improvements)
4. Break down fixes into subtasks
5. Assign story points per fix

**Output**: `docs/tasks/CMS-ENH-2025-001/implementation-fixes-plan.md`

**Expected Breakdown**:
- P0 fixes: 5-8 issues (type errors, security issues, missing error handling)
- P1 fixes: 7-10 issues (code quality, refactoring, optimizations)

---

### Phase 7b: QCODE (Implement Fixes)

**Story Points**: 2.0 SP
**Specialist**: sde-iii

**Tasks**:
- [ ] Fix P0 issues (per plan from 7a)
- [ ] Fix P1 issues (per plan from 7a)
- [ ] Re-run quality gates

**Validation**:
```bash
npm run typecheck
npm run lint
npm test
# Expected: All pass
```

---

### Phase 7c: QCHECK + QCHECKF (Re-review)

**Story Points**: 1.0 SP
**Parallel Execution**: pe-reviewer + code-quality-auditor

**Checklist**:
- [ ] All P0 issues resolved
- [ ] All P1 issues resolved
- [ ] No new issues introduced
- [ ] Quality gates pass

**Exit Criteria**: Zero P0 issues, ≤2 P1 issues remaining

---

### Phase 8: Recursive Loop (Max 3 More Iterations)

**Story Points**: 2.0 SP (estimated total across loops)
**Loop Structure**: QPLAN → QCODE → QCHECK + QCHECKF

**Loop 1** (if needed):
- QPLAN: 0.3 SP
- QCODE: 0.5 SP
- QCHECK: 0.2 SP
- **Expected P0/P1**: 4-6 issues

**Loop 2** (if needed):
- QPLAN: 0.2 SP
- QCODE: 0.3 SP
- QCHECK: 0.2 SP
- **Expected P0/P1**: 2-3 issues

**Loop 3** (if needed):
- QPLAN: 0.1 SP
- QCODE: 0.2 SP
- QCHECK: 0.1 SP
- **Expected P0/P1**: 0-1 issues

**Exit Criteria** (any of):
- ✅ Zero P0 issues remaining
- ✅ All quality gates pass
- ✅ 4 total loops completed (hard limit)

**Commands** (run at end of each loop):
```bash
npm run typecheck && npm run lint && npm test
# Must exit 0 before proceeding to next phase
```

---

### Phase 9: QDOC (Documentation)

**Story Points**: 2.0 SP
**Specialist**: docs-writer

**Tasks**:
- [ ] Update `requirements/requirements.lock.md` (final snapshot)
- [ ] API route documentation
  - [ ] `/api/vercel-status` (request/response schemas)
  - [ ] `/api/submit-bug` (request/response schemas, rate limits)
  - [ ] `/api/generate-seo` (request/response schemas, Universal LLM usage)
- [ ] Component usage examples
  - [ ] Keystatic header components (ProductionLink, DeploymentStatus, etc.)
  - [ ] Content components (Hero, FeatureGrid, etc.)
  - [ ] Markdoc integration examples
- [ ] Environment variable guide
  - [ ] VERCEL_TOKEN, VERCEL_PROJECT_ID
  - [ ] GITHUB_TOKEN (scopes, rotation)
  - [ ] UNIVERSAL_LLM_KEY (usage, rate limits, universal-llm router)
- [ ] Update README.md
  - [ ] New features section
  - [ ] Environment setup instructions
  - [ ] Troubleshooting guide
- [ ] Create `docs/operations/CMS-ADMIN-GUIDE.md`
  - [ ] Deployment status monitoring
  - [ ] Bug reporting workflow
  - [ ] SEO generation best practices
  - [ ] Image upload guidelines

**Output Files**:
- `requirements/requirements.lock.md` (updated)
- `docs/api/VERCEL-STATUS-API.md` (new)
- `docs/api/BUG-SUBMISSION-API.md` (new)
- `docs/api/SEO-GENERATION-API.md` (new)
- `docs/components/KEYSTATIC-HEADER.md` (new)
- `docs/components/CONTENT-COMPONENTS.md` (new)
- `docs/operations/CMS-ADMIN-GUIDE.md` (new)
- `README.md` (updated)

**Validation**:
- [ ] All documentation reviewed for accuracy
- [ ] Code examples tested
- [ ] Links verified
- [ ] Screenshots added where helpful

---

### Phase 10: QGIT (Release)

**Story Points**: 1.0 SP
**Specialist**: release-manager

**Pre-commit Gates**:
```bash
# MUST pass before commit
npm run typecheck && npm run lint && npm test

# Expected output:
# ✅ TypeScript: 0 errors
# ✅ ESLint: 0 errors, 0 warnings
# ✅ Tests: 128 passed, 0 failed
```

**Edge Function Version Check** (if applicable):
```bash
grep -r "@supabase/supabase-js" supabase/functions/ | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" | sort -u
# Expected: Single version (N/A for this project - no Supabase)
```

**Git Workflow**:
```bash
# Stage changes
git add .

# Review changes
git status
git diff --staged

# Commit with conventional commit message
git commit -m "$(cat <<'EOF'
feat: Keystatic CMS enhancements (REQ-000 to REQ-012)

Implements 9 critical CMS improvements:
- REQ-000: Fix React hydration errors (dynamic imports, client boundaries)
- REQ-001: Production link in header (quick access to live site)
- REQ-002: Deployment status indicator (Vercel API polling)
- REQ-003: SEO metadata accordion (collapsible, character counters)
- REQ-004: Image upload validation (5MB limit, dimension display)
- REQ-P1-005: Sparkry AI branding (white-label logo)
- REQ-006: Bug submission to GitHub (modal with context capture)
- REQ-011: Enhanced content components (8 new Markdoc components)
- REQ-012: AI-powered SEO generation (Universal LLM Router integration)

Total: 47.8 Story Points
Tests: 128 (99 unit + 17 integration + 12 E2E)
Quality Gates: All passed (typecheck, lint, tests)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push to remote
git push origin main
```

**Post-push Verification**:
```bash
# Wait for Vercel deployment
sleep 120

# Check deployment status
curl https://prelaunch.bearlakecamp.com/api/vercel-status

# Verify production site loads
curl -I https://prelaunch.bearlakecamp.com/keystatic
# Expected: 200 OK
```

**Rollback Plan** (if deployment fails):
```bash
# Revert commit
git revert HEAD

# Push revert
git push origin main

# Notify user
echo "Deployment failed. Reverted to previous version."
```

**Success Criteria**:
- ✅ All quality gates pass
- ✅ Commit pushed successfully
- ✅ Vercel deployment completes
- ✅ Production site functional
- ✅ Zero console errors

---

## Story Point Summary

| REQ-ID | Description | Component SP | Test SP | Total SP |
|--------|-------------|--------------|---------|----------|
| REQ-000 | Hydration fixes | 2.0 | 0.5 | 2.5 |
| REQ-001 | Production link | 1.5 | 0.5 | 2.0 |
| REQ-002 | Deployment status | 5.0 | 1.5 | 6.5 |
| REQ-003 | SEO accordion | 1.0 | 0.5 | 1.5 |
| REQ-004 | Image validation | 1.5 | 1.0 | 2.5 |
| REQ-P1-005 | Sparkry branding | 1.5 | 0.3 | 1.8 |
| REQ-006 | Bug submission | 3.0 | 2.0 | 5.0 |
| REQ-011 | Content components | 4.0 | 6.0 | 10.0 |
| REQ-012 | AI SEO generation | 1.5 | 1.5 | 3.0 |
| **Subtotal** | | **21.0** | **13.8** | **34.8** |
| Research | | | | 2.0 |
| Architecture | | | | 3.0 |
| Test Reviews | | | | 2.0 |
| Code Reviews | | | | 3.0 |
| Recursive Fixes | | | | 2.0 |
| Documentation | | | | 2.0 |
| Release | | | | 1.0 |
| **TOTAL** | | | | **47.8** |

### Phase Breakdown

| Phase | Description | Story Points | Duration Estimate |
|-------|-------------|--------------|-------------------|
| 0 | Research | 2.0 SP | REMOVED per CLAUDE.md |
| 1 | QCODET (Test Writing) | 12.8 SP | REMOVED per CLAUDE.md |
| 2 | QCHECKT (Test Review) | 2.0 SP | REMOVED per CLAUDE.md |
| 3 | Test Fixes | 2.0 SP | REMOVED per CLAUDE.md |
| 4 | QCODE (Implementation) | 21.0 SP | REMOVED per CLAUDE.md |
| 5 | QCHECK (Code Review) | 2.0 SP | REMOVED per CLAUDE.md |
| 6 | QCHECKF (Function Review) | 1.0 SP | REMOVED per CLAUDE.md |
| 7 | Implementation Fixes | 3.5 SP | REMOVED per CLAUDE.md |
| 8 | Recursive Loops | 2.0 SP | REMOVED per CLAUDE.md |
| 9 | QDOC (Documentation) | 2.0 SP | REMOVED per CLAUDE.md |
| 10 | QGIT (Release) | 1.0 SP | REMOVED per CLAUDE.md |
| **TOTAL** | | **47.8 SP** | |

**Note**: Time estimates removed per CLAUDE.md mandate (only story points allowed)

---

## Environment Setup Checklist

### Required Environment Variables

**Vercel Dashboard → Settings → Environment Variables**

```bash
# Deployment Status (REQ-002)
VERCEL_TOKEN=<your_vercel_api_token>
# Get from: https://vercel.com/account/tokens
# Scopes: Read deployments
# Expiry: 90 days (set reminder to rotate)

VERCEL_PROJECT_ID=prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx
# Get from: Vercel Dashboard → Project Settings → General → Project ID

# Bug Submission (REQ-006)
GITHUB_TOKEN=<your_github_personal_access_token>
# Get from: https://github.com/settings/tokens
# Scopes: repo:write (for creating issues), read:user
# Expiry: 90 days (set reminder to rotate)

# AI SEO Generation (REQ-012)
CLAUDE_API_KEY=<your_claude_api_key>
# Get from: https://console.anthropic.com/account/keys
# Usage: SEO metadata generation
# Rate limit: 10 requests/hour (enforced server-side)

# Existing Keystatic Variables (already configured)
KEYSTATIC_GITHUB_CLIENT_ID=<existing>
KEYSTATIC_GITHUB_CLIENT_SECRET=<existing>
KEYSTATIC_SECRET=<existing>
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=<existing>
GITHUB_OWNER=sparkst
GITHUB_REPO=bearlakecamp
```

### Environment Setup Steps

1. **Vercel Token**:
   ```bash
   # Visit: https://vercel.com/account/tokens
   # Click: Create Token
   # Name: bearlakecamp-deployment-status
   # Scopes: Read-only (deployments)
   # Expiry: 90 days
   # Copy token → Add to Vercel env vars
   ```

2. **GitHub Token**:
   ```bash
   # Visit: https://github.com/settings/tokens
   # Click: Generate new token (classic)
   # Name: bearlakecamp-bug-reporter
   # Scopes: repo (full), read:user
   # Expiry: 90 days
   # Copy token → Add to Vercel env vars
   ```

3. **Claude API Key**:
   ```bash
   # Visit: https://console.anthropic.com/account/keys
   # Click: Create Key
   # Name: bearlakecamp-seo-generator
   # Copy key → Add to Vercel env vars
   ```

4. **Verify in Vercel**:
   ```bash
   # Vercel Dashboard → bearlakecamp → Settings → Environment Variables
   # Ensure all variables set for:
   # - Production
   # - Preview
   # - Development
   ```

5. **Local Development** (optional):
   ```bash
   # Create .env.local (gitignored)
   cp .env.example .env.local
   # Add all tokens (for local testing)
   ```

---

## Quality Gates

### Pre-Deployment Checks

**MUST pass before ANY deployment**:

```bash
# 1. TypeScript compilation
npm run typecheck
# Expected: ✓ No TypeScript errors

# 2. Linting
npm run lint
# Expected: ✓ No ESLint errors or warnings

# 3. Tests
npm test
# Expected: ✓ All 128 tests pass

# 4. Build
npm run build
# Expected: ✓ Build completes without errors

# 5. Lighthouse (production build)
# Expected: Score ≥90 (Performance, Accessibility, Best Practices, SEO)
```

### Continuous Quality Checks

**During implementation** (run after each Stream completion):

```bash
# Quick check (faster feedback)
npm run typecheck && npm test -- <changed-files>

# Full check (before commit)
npm run typecheck && npm run lint && npm test
```

### Quality Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| TypeScript Errors | 0 | TBD | ⏳ Pending |
| ESLint Errors | 0 | TBD | ⏳ Pending |
| ESLint Warnings | 0 | TBD | ⏳ Pending |
| Test Coverage | ≥80% | TBD | ⏳ Pending |
| Passing Tests | 128/128 | TBD | ⏳ Pending |
| Lighthouse Performance | ≥90 | TBD | ⏳ Pending |
| Lighthouse Accessibility | ≥90 | TBD | ⏳ Pending |
| Lighthouse Best Practices | ≥90 | TBD | ⏳ Pending |
| Lighthouse SEO | ≥90 | TBD | ⏳ Pending |
| Console Errors (Production) | 0 | TBD | ⏳ Pending |

---

## Rollback Plan

### Pre-Deployment Snapshot

**Before deployment**:
```bash
# Record current state
git rev-parse HEAD > .last-known-good-commit
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > .deployment-timestamp

# Verify production URL
curl -I https://prelaunch.bearlakecamp.com/keystatic
# Save response code
```

### Rollback Triggers

**Rollback if ANY of**:
- ❌ Vercel deployment fails
- ❌ Production site returns 500 errors
- ❌ Console errors on page load
- ❌ Keystatic admin unresponsive
- ❌ API routes return errors

### Rollback Procedure

**Immediate rollback** (within 5 minutes of deployment):

```bash
# Option 1: Git revert (preferred)
git revert HEAD
git push origin main
# Vercel auto-deploys reverted version

# Option 2: Vercel rollback (if git revert fails)
npx vercel rollback
# Vercel UI: Deployments → Previous → Promote to Production
```

**Verify rollback success**:
```bash
# Check production URL
curl -I https://prelaunch.bearlakecamp.com/keystatic
# Expected: 200 OK

# Check deployment status
curl https://prelaunch.bearlakecamp.com/api/health
# Expected: {"status": "ok"}
```

### Post-Rollback Analysis

**If rollback required**:
1. Capture error logs (Vercel dashboard)
2. Document failure mode
3. Create GitHub issue with:
   - Error logs
   - Rollback reason
   - Steps to reproduce
   - Proposed fix
4. Re-plan fixes (QPLAN phase)
5. Re-test before next deployment

---

## Success Criteria

### Functional Requirements

- ✅ **REQ-000**: Keystatic loads without hydration errors
- ✅ **REQ-001**: Production link opens correct URL in new tab
- ✅ **REQ-002**: Deployment status polls Vercel API and updates badge
- ✅ **REQ-003**: SEO accordion collapses/expands with character counters
- ✅ **REQ-004**: Image upload rejects files >5MB with clear error
- ✅ **REQ-P1-005**: Sparkry logo links to sparkry.ai
- ✅ **REQ-006**: Bug report creates GitHub issue with context
- ✅ **REQ-011**: All 8 content components render correctly (responsive, accessible)
- ✅ **REQ-012**: AI SEO generation pre-fills fields with Claude-generated content

### Quality Requirements

- ✅ All 128 tests passing (99 unit + 17 integration + 12 E2E)
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors/warnings
- ✅ Test coverage ≥80%
- ✅ Lighthouse score ≥90 (all categories)
- ✅ Zero console errors in production
- ✅ All documentation complete and accurate

### Security Requirements

- ✅ API keys in server-side env vars only (not client-exposed)
- ✅ Input sanitization (XSS prevention)
- ✅ Rate limiting enforced (bug reports: 5/hour, SEO: 10/hour)
- ✅ GitHub token minimal scopes (repo:write, read:user)
- ✅ No sensitive data in logs or error messages

### Deployment Requirements

- ✅ Vercel deployment successful
- ✅ Production site functional (https://prelaunch.bearlakecamp.com)
- ✅ All API routes responding (200/400/401, not 404/500)
- ✅ Environment variables configured correctly
- ✅ Rollback plan tested and documented

---

## Risk Assessment

### High-Risk Items (P0)

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Hydration errors persist | Medium | High | Comprehensive testing of SSR/client boundaries |
| Vercel API rate limits exceeded | Low | High | Smart polling (stop when READY/ERROR) |
| Claude API costs excessive | Medium | Medium | Rate limiting (10/hour) + content truncation |
| GitHub token compromised | Low | High | Server-side only + 90-day rotation |
| Deployment fails | Low | High | Rollback plan + pre-deployment gates |

### Medium-Risk Items (P1)

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Content components performance issues | Medium | Medium | Lazy loading + Next.js Image optimization |
| Bug report spam | Low | Low | Rate limiting (5/hour) + validation |
| SEO generation quality low | Medium | Low | Prompt engineering + user editing |
| Image upload validation bypassed | Low | Medium | Server-side validation (defense in depth) |

### Low-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Sparkry logo fails to load | Low | Low | Fallback text, error handling |
| Production link incorrect | Low | Low | Comprehensive URL construction tests |
| Character counters inaccurate | Low | Low | Validation tests for boundary values |

---

## Dependencies

### External APIs

| API | Purpose | Rate Limit | Fallback |
|-----|---------|-----------|----------|
| Vercel Deployment API v6 | Deployment status | 100 req/hour | Show last known state |
| GitHub Issues API | Bug submission | 5000 req/hour | Show error message |
| Claude API (Anthropic) | SEO generation | 10 req/hour (self-imposed) | User writes manually |

### Third-Party Libraries

**New Dependencies** (to be installed):
```bash
# Client-side
npm install lucide-react      # Icons (already installed if used elsewhere)
npm install html2canvas       # Screenshot capture (lazy-loaded)

# Dev Dependencies
npm install -D @playwright/test  # E2E testing
npm install -D vitest             # Already installed
```

**Version Pinning**:
```json
{
  "dependencies": {
    "lucide-react": "^0.263.0",
    "html2canvas": "^1.4.1"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

### Internal Dependencies

| Component | Depends On | Blocking? |
|-----------|-----------|-----------|
| DeploymentStatus | Vercel Status API route | Yes |
| BugReportModal | Bug Submission API route | Yes |
| SEOGenerateButton | SEO Generation API route | Yes |
| ImageUploadValidator | Keystatic image field | No (enhances existing) |
| Content Components | Keystatic config updates | Yes |

---

## Monitoring & Observability

### Deployment Monitoring

**Vercel Deployment Events**:
```bash
# Monitor deployments
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&limit=10

# Expected response: List of recent deployments with states
```

### API Usage Monitoring

**Rate Limit Tracking** (client-side):
```typescript
// LocalStorage schema
{
  "bug-report": {
    "count": 3,
    "resetAt": 1700000000000  // Unix timestamp
  },
  "seo-generate": {
    "count": 7,
    "resetAt": 1700000000000
  }
}
```

**Server-side Logging** (API routes):
```typescript
// app/api/*/route.ts
console.log('[API] Endpoint:', request.url);
console.log('[API] User:', userId);
console.log('[API] Rate limit remaining:', remaining);
console.log('[API] Response status:', response.status);
```

### Error Tracking

**Console Error Monitoring** (client-side):
```typescript
// Track hydration errors
window.addEventListener('error', (event) => {
  if (event.message.includes('Hydration')) {
    console.error('[Hydration Error]', event.message);
    // Optionally: Send to error tracking service
  }
});
```

**API Error Rates**:
```bash
# Check Vercel logs for error rates
# Dashboard → Deployments → Logs → Filter by status code 500
```

---

## Lessons Learned & Improvements

**To be populated after implementation**:
- Story point accuracy (estimated vs actual)
- P0/P1 issue distribution (which phases had most issues)
- Recursive loop count (how many iterations needed)
- Test coverage gaps (tests that should have been written)
- Refactoring opportunities identified

---

## Appendices

### Appendix A: Keystatic Configuration Changes

**File**: `keystatic.config.ts`

```typescript
// Changes for REQ-003 (SEO Accordion)
seo: fields.object({
  metaTitle: fields.text({
    label: 'Meta Title',
    description: 'SEO title (50-60 chars recommended)',
    validation: { length: { max: 60 } }
  }),
  metaDescription: fields.text({
    label: 'Meta Description',
    description: '150-160 chars recommended',
    multiline: true,
    validation: { length: { max: 160 } }
  }),
  ogTitle: fields.text({
    label: 'Open Graph Title',
    description: 'Optional, defaults to Meta Title'
  }),
  ogDescription: fields.text({
    label: 'Open Graph Description',
    multiline: true,
    description: 'Optional, defaults to Meta Description'
  }),
  ogImage: fields.image({
    label: 'Social Share Image',
    description: 'Recommended: 1200x630px',
    directory: 'public/og-images',
    publicPath: '/og-images/'
  }),
  twitterCard: fields.select({
    label: 'Twitter Card Type',
    options: [
      { label: 'Summary', value: 'summary' },
      { label: 'Summary Large Image', value: 'summary_large_image' }
    ],
    defaultValue: 'summary_large_image'
  })
}, {
  label: 'SEO & Social Media',
  description: 'Meta tags and social preview settings'
})

// Changes for REQ-011 (Content Components)
components: {
  Hero: component({
    label: 'Hero Section',
    schema: {
      backgroundImage: fields.image({
        label: 'Background Image',
        directory: 'public/uploads/heroes',
        publicPath: '/uploads/heroes/'
      }),
      heading: fields.text({ label: 'Heading' }),
      subheading: fields.text({
        label: 'Subheading',
        multiline: true
      }),
      ctaPrimary: fields.object({
        text: fields.text({ label: 'Button Text' }),
        url: fields.text({ label: 'URL' })
      }, { label: 'Primary CTA' }),
      ctaSecondary: fields.object({
        text: fields.text({ label: 'Button Text' }),
        url: fields.text({ label: 'URL' })
      }, { label: 'Secondary CTA (optional)' }),
      overlayOpacity: fields.select({
        label: 'Overlay Darkness',
        options: [
          { label: 'Light (30%)', value: '0.3' },
          { label: 'Medium (50%)', value: '0.5' },
          { label: 'Dark (70%)', value: '0.7' }
        ],
        defaultValue: '0.5'
      })
    }
  }),

  // ... 7 more components (FeatureGrid, StatsCounter, etc.)
}
```

### Appendix B: API Route Templates

**Template**: API route with rate limiting

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Get user ID (from session or IP)
    const userId = getUserId(request);

    // Check rate limit
    const rateLimit = checkRateLimit(userId, 'example-endpoint');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimit.retryAfter,
          code: 'RATE_LIMIT'
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter.toString()
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Required field missing', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Call external API
    const response = await fetch('https://external-api.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Return success
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
```

### Appendix C: Component Template (Content Components)

**Template**: Accessible, responsive content component

```typescript
// components/content/ExampleComponent.tsx
'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ExampleComponentProps {
  heading: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
}

export function ExampleComponent({
  heading,
  description,
  icon: Icon,
  className = ''
}: ExampleComponentProps) {
  return (
    <div
      className={`
        flex flex-col gap-4 p-6
        bg-white rounded-lg shadow-md
        md:flex-row md:items-center
        ${className}
      `}
      role="article"
      aria-labelledby="example-heading"
    >
      {Icon && (
        <div
          className="flex-shrink-0 w-12 h-12 text-blue-600"
          aria-hidden="true"
        >
          <Icon className="w-full h-full" />
        </div>
      )}

      <div className="flex-1">
        <h3
          id="example-heading"
          className="text-xl font-semibold text-gray-900"
        >
          {heading}
        </h3>
        <p className="mt-2 text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}
```

### Appendix D: Test Template

**Template**: Comprehensive component test

```typescript
// components/content/ExampleComponent.spec.tsx
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';
import { Star } from 'lucide-react';

describe('REQ-011 — ExampleComponent', () => {
  test('renders with required props', () => {
    render(
      <ExampleComponent
        heading="Test Heading"
        description="Test description"
      />
    );

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  test('applies responsive classes correctly', () => {
    const { container } = render(
      <ExampleComponent
        heading="Test"
        description="Test"
      />
    );

    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('flex-col');
    expect(element.className).toContain('md:flex-row');
  });

  test('handles missing optional props gracefully', () => {
    render(
      <ExampleComponent
        heading="Test"
        description="Test"
        // icon prop omitted
      />
    );

    // Component should render without icon
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('renders accessible ARIA labels', () => {
    render(
      <ExampleComponent
        heading="Test Heading"
        description="Test"
      />
    );

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-labelledby', 'example-heading');
  });

  test('supports keyboard navigation', () => {
    // Test focus states, tab order, etc.
    // Implementation depends on interactive elements
  });

  test('matches snapshot', () => {
    const { container } = render(
      <ExampleComponent
        heading="Test"
        description="Test"
        icon={Star}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
```

---

## Execution Checklist

**Pre-Execution**:
- [ ] All environment variables configured in Vercel
- [ ] GitHub token scopes verified (repo:write, read:user)
- [ ] Claude API key active and funded
- [ ] Vercel project ID confirmed: prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx
- [ ] Repository clean: `git status` shows no uncommitted changes

**During Execution** (autonomous, no user intervention):
- [ ] Phase 1: QCODET completed (128 failing tests)
- [ ] Phase 2: QCHECKT completed (test quality validated)
- [ ] Phase 3: Test fixes completed (all tests still fail correctly)
- [ ] Phase 4: QCODE completed (all tests pass)
- [ ] Phase 5-6: QCHECK + QCHECKF completed (reviews done)
- [ ] Phase 7: Implementation fixes completed (P0/P1 resolved)
- [ ] Phase 8: Recursive loops completed (max 4 iterations)
- [ ] Phase 9: QDOC completed (all documentation updated)
- [ ] Phase 10: QGIT completed (committed + pushed + deployed)

**Post-Execution**:
- [ ] Verify production deployment: https://prelaunch.bearlakecamp.com/keystatic
- [ ] Smoke test all 9 requirements manually
- [ ] Check Vercel logs for errors
- [ ] Monitor API usage (rate limits, costs)
- [ ] Update lessons learned section

---

**PLAN READY FOR AUTONOMOUS EXECUTION**

Total Story Points: 47.8 SP
Estimated Completion: REMOVED (per CLAUDE.md - only story points allowed)
Success Criteria: All 9 requirements implemented, all tests passing, zero P0 issues

**Next Action**: Execute Phase 1 (QCODET) - Begin test implementation across 4 parallel streams.
