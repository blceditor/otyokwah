q# QPLAN: Keystatic Website Productization

## Executive Summary

This plan addresses extracting the Keystatic CMS architecture from bearlakecamp into a reusable GitHub project called "keystatic-website." Given the **Jan 1 deadline** for both bearlakecamp and otyakwah, I recommend a **phased approach** that prioritizes getting otyakwah launched quickly while building the productized foundation incrementally.

## Architecture Analysis

### Components Identified for Extraction

#### 1. GENERIC CMS Infrastructure (Extract to keystatic-website)

| Component Category | Files | Complexity |
|---|---|---|
| **Keystatic Core Config Template** | `keystatic.config.ts` (template version) | High - needs parameterization |
| **Keystatic Reader Abstraction** | `lib/keystatic-reader.ts` | Medium |
| **CMS Admin Layout** | `app/keystatic/layout.tsx`, `keystatic.tsx`, `keystatic-dark.css` | Medium |
| **CMS Enhancement Components** | `components/keystatic/*` (17 files) | High |
| **API Routes** | `app/api/keystatic/*`, `app/api/generate-seo/*`, `app/api/git-dates/*` | Medium |
| **Lib Utilities** | `lib/keystatic/*`, `lib/hooks/usePageContent.ts`, `lib/types/seo.ts` | Low |
| **Theme/Dark Mode** | `ThemeProvider.tsx`, dark mode CSS | Low |

#### 2. SITE-SPECIFIC Elements (Stay in Site Repos)

| Category | Examples | Notes |
|---|---|---|
| **Content** | `content/*` directory | All mdoc files, YAML configs |
| **Images/Media** | `public/images/*` | Site-specific photos |
| **Branding Colors** | `tailwind.config.ts` colors | Primary, secondary, accent |
| **Navigation Structure** | `content/navigation/navigation.yaml` | Menu items |
| **Redirects** | `next.config.mjs` redirects | URL structure |
| **Custom Fonts** | Font files, CSS variables | Site-specific typography |
| **SEO Prompt Template** | `app/api/generate-seo/route.ts` systemPrompt | Organization name, keywords |

#### 3. CONFIGURABLE Elements (Template with Site Override)

| Element | Default in Template | Override Location |
|---|---|---|
| Organization Name | `"YOUR_ORGANIZATION"` | `site.config.ts` |
| Production Domain | `"your-domain.com"` | `site.config.ts` |
| GitHub Repo | Environment variables | `.env` |
| Color Palette | Neutral defaults | `tailwind.config.ts` extend |
| Collections Schema | Pages, Staff, Testimonials, FAQs | `keystatic.config.ts` override |

---

## Decision: Split Now vs Defer

### RECOMMENDATION: Hybrid Approach - "Fork & Extract"

Given the Jan 1 deadline and the complexity involved, I recommend:

**Phase 1 (NOW - before Dec 25):** Quick clone approach for otyakwah
- Fork bearlakecamp to otyakwah repo
- Rename/rebrand in place
- Both sites launch on time

**Phase 2 (Post-launch - Jan 2-15):** Proper extraction
- Create keystatic-website package
- Migrate both sites to use it as dependency/template
- Document for future customers

### Rationale

1. **Risk Mitigation**: Splitting now adds 8-13 SP of work before the deadline
2. **Time Constraint**: Only ~14 days until Jan 1; testing/QA alone takes 3-5 days
3. **Fork is Fast**: A fork takes 30 minutes vs 2-3 days for proper extraction
4. **Post-Launch is Safer**: Extraction can be done carefully without deadline pressure

---

## Phase 1: Quick Launch for otyakwah (3 SP)

**Timeline:** December 17-22 (before Christmas)

### Step 1.1: Fork and Rebrand (1 SP)
```
- Fork sparkst/bearlakecamp to sparkst/otyakwah
- Update package.json name
- Update site.config.ts (new file to create)
- Update tailwind.config.ts colors
- Remove bearlakecamp-specific content
- Update next.config.mjs redirects
```

### Step 1.2: Environment Configuration (0.5 SP)
```
- Create new GitHub App for otyakwah
- Configure Vercel project
- Set up environment variables
- Configure domains
```

### Step 1.3: Content Migration (1 SP)
```
- Add otyakwah-specific pages
- Update navigation
- Add otyakwah images/branding
```

### Step 1.4: Verification (0.5 SP)
```
- Run smoke tests
- Verify CMS functionality
- Test on production domain
```

---

## Phase 2: Proper Productization (13 SP)

**Timeline:** January 2-15

### Step 2.1: Create keystatic-website Repository (2 SP)

**New Repository Structure:**
```
keystatic-website/
├── src/
│   ├── keystatic/
│   │   ├── config-template.ts      # Parameterized Keystatic config
│   │   ├── reader.ts               # Reader abstraction
│   │   └── types.ts                # Shared types
│   ├── components/
│   │   └── keystatic/              # All CMS enhancement components
│   │       ├── KeystaticToolsHeader.tsx
│   │       ├── PageEditingToolbar.tsx
│   │       ├── SEOGenerationPanel.tsx
│   │       ├── ThemeProvider.tsx
│   │       └── ... (14 more)
│   ├── api/
│   │   ├── generate-seo/           # SEO generation route template
│   │   ├── git-dates/              # Git dates API
│   │   └── keystatic/              # Keystatic API routes
│   ├── lib/
│   │   ├── keystatic/              # Utility functions
│   │   ├── hooks/
│   │   └── types/
│   └── styles/
│       └── keystatic-dark.css
├── templates/
│   ├── app/
│   │   ├── keystatic/              # Admin layout template
│   │   └── [slug]/                 # Dynamic page template
│   ├── content/                    # Sample content structure
│   └── public/                     # Placeholder images
├── scripts/
│   ├── setup.sh                    # Installation script
│   ├── migrate.sh                  # Migration from existing site
│   └── validate.sh                 # Configuration validator
├── docs/
│   ├── QUICK-START.md
│   ├── INSTALLATION.md
│   ├── CUSTOMIZATION.md
│   ├── DEPLOYMENT.md
│   └── GITHUB-APP-SETUP.md
├── package.json
├── tsconfig.json
└── README.md
```

### Step 2.2: Create Site Configuration System (2 SP)

**site.config.ts Template:**
```typescript
export interface SiteConfig {
  name: string;
  shortName: string;
  domain: string;
  description: string;
  organization: {
    name: string;
    type: 'camp' | 'church' | 'nonprofit' | 'other';
    keywords: string[];
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo: string;
  };
  features: {
    seoGeneration: boolean;
    darkMode: boolean;
    mediaLibrary: boolean;
    recentPagesSort: boolean;
  };
  github: {
    owner: string;
    repo: string;
  };
}
```

### Step 2.3: Parameterize Components (3 SP)

Components requiring site-context injection:
- `PageEditingToolbar.tsx` - Production URL construction
- `generate-seo/route.ts` - Organization name in prompts
- `SparkryBranding.tsx` - Optional white-label toggle
- `DeploymentStatus.tsx` - Vercel project reference

### Step 2.4: Create Installation Scripts (2 SP)

**setup.sh:**
```bash
#!/bin/bash
# Interactive setup wizard
# - Prompts for organization details
# - Creates site.config.ts
# - Updates environment template
# - Generates GitHub App setup instructions
# - Validates configuration
```

### Step 2.5: Documentation Suite (2 SP)

Documents to create:
1. **QUICK-START.md** - 5-minute getting started
2. **INSTALLATION.md** - Full installation guide
3. **CUSTOMIZATION.md** - Branding, colors, collections
4. **DEPLOYMENT.md** - Vercel/GitHub setup
5. **GITHUB-APP-SETUP.md** - Already exists, adapt

### Step 2.6: Migration Scripts (1 SP)

For existing sites (bearlakecamp, otyakwah) to adopt the package:
```bash
./scripts/migrate.sh \
  --from-fork \
  --package-version latest \
  --keep-content \
  --keep-config
```

### Step 2.7: Testing & Validation (1 SP)

- Create test sites with different configurations
- Validate all features work with parameterization
- CI/CD pipeline for the template repo

---

## Story Point Summary

### Phase 1: Quick Launch (Before Jan 1)
| Task | SP |
|---|---|
| Fork and rebrand | 1 |
| Environment setup | 0.5 |
| Content migration | 1 |
| Verification | 0.5 |
| **Phase 1 Total** | **3 SP** |

### Phase 2: Productization (January)
| Task | SP |
|---|---|
| Create repo structure | 2 |
| Site config system | 2 |
| Parameterize components | 3 |
| Installation scripts | 2 |
| Documentation | 2 |
| Migration scripts | 1 |
| Testing | 1 |
| **Phase 2 Total** | **13 SP** |

### **Grand Total: 16 SP**

---

## Risks and Mitigations

### Risk 1: Fork Divergence
**Risk:** After forking, bearlakecamp and otyakwah will diverge, making future consolidation harder.
**Mitigation:** Keep a detailed changelog of changes made to each. Plan Phase 2 migration within 2 weeks of launch.

### Risk 2: Deadline Pressure
**Risk:** Rushing Phase 1 may introduce bugs.
**Mitigation:** Use the existing smoke-test.sh and Playwright tests. Only change what's necessary for branding.

### Risk 3: Environment Variable Complexity
**Risk:** Multiple sites with different GitHub Apps can be confusing.
**Mitigation:** Document each site's configuration in a central tracking doc. Use clear naming conventions.

### Risk 4: SEO Generation Hardcoding
**Risk:** The generate-seo route has "Bear Lake Camp" hardcoded in prompts.
**Mitigation:** Phase 1 - quick string replacement. Phase 2 - proper parameterization via site.config.ts.

---

## Implementation Sequence

```
Week 1 (Dec 17-22) - Phase 1:
  Mon-Tue: Fork otyakwah, rebrand basics
  Wed-Thu: Environment setup, Vercel deployment
  Fri: Content migration begins

Week 2 (Dec 23-31) - Content & Launch:
  Mon-Fri: Content population for both sites
  Deadline: Jan 1 - Both sites live

Week 3-4 (Jan 2-15) - Phase 2:
  Week 3: Create keystatic-website repo, config system
  Week 4: Parameterize, document, migrate
```

---

## Critical Files for Phase 1 (Fork & Rebrand)

| File | Changes Required |
|---|---|
| `keystatic.config.ts` | Update repo references |
| `tailwind.config.ts` | Color palette changes |
| `app/api/generate-seo/route.ts` | Organization name in SEO prompts |
| `components/keystatic/PageEditingToolbar.tsx` | Production URL |
| `next.config.mjs` | Remote patterns, redirects |

## Critical Files for Phase 2 (Extraction)

| File | Purpose |
|---|---|
| `app/keystatic/layout.tsx` | Full CMS layout to extract |
| `components/keystatic/KeystaticToolsHeader.tsx` | Feature-rich header |
| `lib/keystatic-reader.ts` | Reader abstraction pattern |
| `docs/operations/DEPLOYMENT.md` | Existing deployment docs to adapt |
| `docs/GITHUB-APP-SETUP.md` | GitHub App documentation |

---

## Approval Checklist

- [ ] Phase 1 approach approved (Fork & Rebrand)
- [ ] Phase 2 timeline acceptable (Post Jan 1)
- [ ] Story point estimates reviewed
- [ ] Risk mitigations agreed upon
- [ ] Ready to begin Phase 1 implementation
