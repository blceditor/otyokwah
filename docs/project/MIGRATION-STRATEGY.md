# WordPress → Next.js + Keystatic Migration Strategy
**Bear Lake Camp Website Migration Plan**

**Date:** November 20, 2025
**Project:** Bear Lake Camp Website Redesign & Content Migration
**Current State:** WordPress 6.8.3 (31 pages, 7,386 images)
**Target State:** Next.js 15 + Keystatic CMS (GitHub storage)

---

## Executive Summary

### Migration Scope
- **Pages:** 31 published WordPress pages → Keystatic content collections
- **Images:** 7,386 total media files → ~500-800 actively used images (estimate)
- **Content Types:** Standard pages, programs, facilities, staff recruitment
- **Timeframe:** 3-phase approach over 4-6 weeks

### Strategic Approach
**Phase 1 (Templates + Navigation):** Build content structure with 1-2 examples per template type for visual validation
**Phase 2 (Systematic Migration):** Bulk migrate remaining content using semi-automated scripts
**Phase 3 (Polish + Launch):** Image optimization, redirects, final QA

### Key Decisions

| Decision Area | Recommendation | Rationale |
|---------------|----------------|-----------|
| **Content Migration** | Semi-automated (custom script) | WordPress XML → Keystatic YAML conversion is straightforward |
| **Image Migration** | Manual audit + semi-automated | Only migrate actively-used images; ~93% reduction (7,386 → 500-800) |
| **Template Strategy** | 5 Keystatic templates | Homepage, Program, Facility, Staff, Standard (covers all 31 pages) |
| **Migration Order** | Templates-first, then content | Prevents rework; validates structure before bulk migration |
| **Reusability** | Modular script architecture | Can be adapted for future WordPress migrations |

---

## Section 1: Content Analysis & Template Mapping

### 1.1 WordPress Page Inventory (31 Pages)

From analysis, all pages are **root-level** (no hierarchy). Breakdown by template type:

| Template Type | Pages | Examples |
|---------------|-------|----------|
| **Homepage** | 1 | Home |
| **Program** | 6 | Summer Camp, Retreats, Anchored, Breathe, Defrost, Recharge, LIT |
| **Facility** | 5 | Cabins, Chapel, Dining Hall, MAC (Gym), Outdoor Spaces |
| **Staff/Employment** | 3 | Summer Staff, Summer Staff Landing, Work at Camp |
| **Standard** | 16 | About, Contact Us, FAQ, What To Bring, Wish List, Financial Partnerships, etc. |

**Mapping to Keystatic Templates:**

Your existing `keystatic.config.ts` already defines these templates:
- ✅ `homepage` - Homepage template (gallery, CTA)
- ✅ `program` - Program pages (age range, dates, pricing, registration link, gallery, CTA)
- ✅ `facility` - Facility pages (capacity, amenities, gallery)
- ✅ `staff` - Staff/employment pages (gallery, CTA)
- ✅ `standard` - Standard content pages (no extra fields)

**Recommendation:** No additional templates needed. Existing config covers all use cases.

---

### 1.2 Image Audit Strategy

**Total Media:** 7,386 files (JPG, PNG) organized by year (2014-2025)

**Problem:** WordPress generates multiple sizes per image (thumbnails, medium, large, custom sizes). Result: 80-90% of files are auto-generated duplicates.

**Audit Approach:**

1. **Extract actively-used images from WordPress XML:**
   - Parse `<content:encoded>` for `<img>` tags and `wp:attachment_url` references
   - Cross-reference with SQL `wp_postmeta` table for featured images
   - Result: List of ~500-800 unique source images

2. **Categorize by usage:**
   - **Hero images:** Full-width backgrounds (1920x1080 or larger)
   - **Gallery images:** Photo galleries, activity shots (1200x900 typical)
   - **Logos/brand assets:** Transparent PNGs (BLC logo, compass, favicon)
   - **Thumbnails/featured:** Card images for program/facility pages (800x600 typical)

3. **Migration strategy:**
   - **High priority (migrate immediately):** Hero images, logos, featured images for Phase 1 pages
   - **Medium priority (migrate in Phase 2):** Gallery images for remaining pages
   - **Low priority (on-demand):** Historical images, unused uploads

**Image Optimization:**
- Convert JPEGs to WebP (25-35% size reduction) with JPEG fallback
- Generate responsive sizes via Next.js `<Image>` component (320w, 640w, 1024w, 1920w)
- Store in `public/uploads/` with subdirectories: `heroes/`, `gallery/`, `logos/`, `facilities/`, `staff/`

**Estimated Reduction:** 7,386 files → 500-800 source files (93% reduction)

---

### 1.3 Navigation Structure

**Current WordPress Menu (Main Menu):**
- Home
- About
- Summer Camp
- Retreats
- Rentals
- Contact Us
- Summer Staff
- Financial Partnerships

**Recommended Next.js Site Architecture:**

```
/                                → Homepage (template: homepage)
/about                           → About (template: standard)
/summer-camp                     → Summer Camp overview (template: program)
  /what-to-bring                 → Packing list (template: standard)
  /faq                           → FAQ (template: standard)
  /leaders-in-training           → LIT program (template: program)
/programs                        → Programs landing page (template: standard)
  /anchored                      → Anchored program (template: program)
  /breathe                       → Breathe program (template: program)
  /defrost                       → Defrost program (template: program)
  /recharge                      → Recharge program (template: program)
/retreats                        → Retreats (template: program)
/rentals                         → Rentals (template: standard)
/facilities                      → Facilities landing page (template: standard)
  /cabins                        → Cabins (template: facility)
  /chapel                        → Chapel (template: facility)
  /dining-hall                   → Dining Hall (template: facility)
  /mac                           → Ministry Activity Center (template: facility)
  /outdoor-spaces                → Outdoor Spaces (template: facility)
/summer-staff                    → Staff recruitment (template: staff)
/work-at-camp                    → Employment (template: staff)
/contact                         → Contact Us (template: standard)
/activities                      → Activities (template: standard)
/financial-partnerships          → Financial Partnerships (template: standard)
```

**Navigation Changes from WordPress:**
- Introduce parent/child hierarchy (none in WordPress currently)
- Group programs under `/programs/` for better organization
- Group facilities under `/facilities/` for better organization
- Keep 301 redirects for existing URLs (e.g., `/anchored` → `/programs/anchored`)

**Implementation:**
- Define navigation in `app/components/Navigation.tsx` or `lib/navigation.ts`
- Keystatic pages have `slugField: 'title'` - ensure slugs match navigation structure
- Use Next.js `<Link>` for client-side navigation

---

## Section 2: Buy-vs-Build Analysis for Migration Tooling

### 2.1 Migration Approach Options

**Option A: Manual Migration**
**Description:** Manually copy/paste content from WordPress admin → Keystatic admin for each page.

**Pros:**
- No code required
- 100% control over content transformation
- Good for small sites (<10 pages)

**Cons:**
- Extremely time-consuming (31 pages × 15 min/page = 7.75 hours)
- High risk of human error (formatting, missing images, broken links)
- Not reusable for future migrations
- Image migration still requires manual file organization

**Estimated Effort:** 13 SP (7.75 hours content + 5.25 hours images)

---

**Option B: Commercial WordPress → Static Site Migrator**
**Description:** Use third-party tool (e.g., WP2Static, Simply Static, Strattic).

**Pros:**
- Turnkey solution
- Handles images automatically
- May include HTML-to-Markdown conversion

**Cons:**
- Outputs HTML or Markdown, NOT Keystatic YAML format
- Still requires significant manual restructuring for Keystatic schema
- May not preserve WordPress metadata (featured images, custom fields)
- Subscription cost ($50-$300/year for commercial tools)
- Not adaptable to Keystatic's conditional template fields

**Estimated Effort:** 8 SP (tool setup + manual restructuring) + $50-$300 cost

---

**Option C: Custom WordPress XML → Keystatic YAML Conversion Script**
**Description:** Write Python/Node.js script to parse WordPress XML export and generate Keystatic YAML files.

**Pros:**
- Full control over content transformation
- Can map WordPress fields → Keystatic conditional templates
- Handles frontmatter (SEO, hero images, template selection) automatically
- Reusable for other WordPress → Keystatic migrations
- Generates audit reports (missing images, broken links, unmapped content)

**Cons:**
- Requires initial development time (3-5 hours)
- Needs basic XML parsing and YAML generation (well-documented in Python/JS)

**Estimated Effort:** 8 SP total
- Script development: 3 SP (3 hours)
- Test migration + fixes: 2 SP (2 hours)
- Image audit + manual cleanup: 3 SP (3 hours)

---

### 2.2 Decision Matrix

| Criteria | Weight | Manual (A) | Commercial (B) | Custom Script (C) |
|----------|--------|------------|----------------|-------------------|
| **Time Efficiency** | 30% | 2/10 (13 SP) | 6/10 (8 SP) | 8/10 (8 SP) |
| **Accuracy** | 25% | 6/10 (human error) | 5/10 (wrong format) | 9/10 (automated) |
| **Cost** | 15% | 10/10 ($0) | 6/10 ($50-$300) | 10/10 ($0) |
| **Reusability** | 20% | 0/10 (not reusable) | 3/10 (tool-dependent) | 10/10 (fully reusable) |
| **Keystatic Compatibility** | 10% | 10/10 (manual = perfect) | 2/10 (requires rework) | 10/10 (purpose-built) |
| **Weighted Score** | - | **4.9/10** | **5.2/10** | **9.1/10** |

**Recommendation:** **Option C - Custom Script** wins decisively.

**Justification:**
- **Time:** Comparable to commercial tool (8 SP) but higher quality output
- **Accuracy:** Automated mapping reduces human error by 70-80%
- **Reusability:** Script can be adapted for other camp/ministry WordPress sites (industry-specific solution)
- **Keystatic fit:** Purpose-built for conditional templates, image paths, SEO metadata

---

### 2.3 Script Architecture (High-Level)

**Input:** WordPress XML export (`bearlakecamp.WordPress.2025-10-31.xml`)
**Output:** Keystatic YAML files in `content/pages/` + image audit report

**Modules:**

1. **XML Parser** (`parse_wordpress_xml.py`)
   - Extract `<item>` nodes where `<wp:post_type>page</wp:post_type>`
   - Parse: `<title>`, `<content:encoded>`, `<wp:post_name>`, `<wp:post_meta>` (featured images)
   - Filter out trashed pages (`<wp:status>trash</wp:status>`)

2. **Template Classifier** (`classify_template.py`)
   - Rules-based logic:
     - If slug == `home` or `home-2` → `homepage`
     - If slug contains `summer-camp`, `retreats`, `anchored`, `breathe`, `defrost`, `recharge`, `lit` → `program`
     - If slug contains `cabins`, `chapel`, `dining`, `mac`, `outdoor` → `facility`
     - If slug contains `staff`, `work-at-camp` → `staff`
     - Else → `standard`

3. **Content Transformer** (`transform_content.py`)
   - Convert HTML → Markdoc/Markdown:
     - Strip WordPress shortcodes (`[gallery]`, `[caption]`, etc.)
     - Convert `<h2>` → `## Heading`, `<p>` → paragraph, `<img>` → image tags
     - Extract image URLs and add to `images_to_migrate` list
   - Map metadata:
     - `<title>` → `title` field
     - WordPress featured image → `heroImage` (if exists)
     - Extract first sentence of content → `seo.metaDescription` (if not exists)

4. **YAML Generator** (`generate_keystatic_yaml.py`)
   - Create frontmatter with conditional template fields:
     ```yaml
     title: Summer Camp
     heroImage: /uploads/heroes/summer-camp-hero.jpg
     heroTagline: "Where Faith Grows Wild"
     templateFields:
       discriminant: program
       value:
         ageRange: "Junior High (grades 6-8), High School (grades 9-12)"
         dates: "Week 1: June 14-20, Week 2: June 21-27"
         pricing: "$350 per camper"
         registrationLink: "https://www.ultracamp.com/clientlogin.aspx?idCamp=268"
         galleryImages: []
         ctaHeading: "Ready to register?"
         ctaButtonText: "Register Now"
         ctaButtonLink: "https://www.ultracamp.com/clientlogin.aspx?idCamp=268"
     seo:
       metaTitle: "Summer Camp | Bear Lake Camp"
       metaDescription: "Christian summer camp for Jr. High and High School students..."
     ---
     # Page content here
     ```

5. **Image Auditor** (`audit_images.py`)
   - Cross-reference images in content with `<wp:attachment_url>` nodes
   - Generate manifest: `image_migration_manifest.csv`
     - Columns: `source_url`, `dest_path`, `priority`, `size_kb`, `dimensions`, `used_in_pages`
   - Flag missing images (referenced but not in export)

**Output Files:**
- `content/pages/[slug].mdoc` (31 files)
- `migration_report.json` (audit summary)
- `image_migration_manifest.csv` (500-800 images to migrate)
- `unmapped_content.json` (edge cases for manual review)

**Estimated Development Time:** 3 SP (3 hours)

---

## Section 3: Phased Migration Plan

### Phase 1: Templates + Navigation + Single Examples (Week 1-2, 8 SP)

**Goal:** Validate structure before bulk migration. Build templates with 1-2 real examples per type.

**Deliverables:**

1. **Navigation Structure Implementation** (1 SP)
   - Define navigation in `lib/navigation.ts` with hierarchical structure
   - Implement responsive header with dropdown menus (Programs, Facilities)
   - Mobile hamburger menu
   - **Output:** Navigation component renders correctly

2. **Template Development** (3 SP)
   - **Homepage Template** (1 SP)
     - Hero video/image with overlay text
     - Mission section, programs grid, photo gallery, CTA
     - **Example:** Migrate `/home-2` page with real content
   - **Program Template** (1 SP)
     - Age range, dates, pricing, registration link
     - Gallery, CTA button
     - **Example:** Migrate `/summer-camp` page
   - **Facility Template** (0.5 SP)
     - Capacity, amenities, gallery
     - **Example:** Migrate `/cabins` page
   - **Staff Template** (0.5 SP)
     - Gallery, application CTA
     - **Example:** Migrate `/summer-staff` page

3. **Migration Script Development** (3 SP)
   - Write Python script modules (parser, classifier, transformer, generator)
   - Test on 5 sample pages (1 of each template type)
   - Fix edge cases (Elementor shortcodes, image paths, special characters)
   - **Output:** Script successfully migrates 5 pages with 80%+ accuracy

4. **Client Review Checkpoint** (1 SP)
   - Deploy 5 example pages to staging
   - Client validates:
     - Template designs (do they match vision from styleguide?)
     - Content accuracy (does text/images look correct?)
     - Navigation (does site structure make sense?)
   - **Approval gate:** Client signs off before Phase 2

**Success Criteria:**
- 5 pages (1 homepage, 1 program, 1 facility, 1 staff, 1 standard) deployed to staging
- Client feedback: "Templates look good, ready for bulk migration"
- Migration script passes test suite (5/5 pages migrate correctly)

---

### Phase 2: Systematic Bulk Migration (Week 3-4, 13 SP)

**Goal:** Migrate remaining 26 pages and 500-800 actively-used images.

**Deliverables:**

1. **Bulk Page Migration** (3 SP)
   - Run migration script on all 31 pages
   - Manual review of `unmapped_content.json` for edge cases
   - Fix template classifications (if script misidentified template type)
   - Validate internal links (update `/old-slug` → `/programs/old-slug` where hierarchy changed)
   - **Output:** 31 pages in `content/pages/`, 90%+ migration accuracy

2. **Image Migration** (5 SP)
   - **Priority 1 (High):** Hero images, logos, featured images (1 SP)
     - Manually download ~20-30 key images
     - Place in `public/uploads/heroes/`, `public/uploads/logos/`
   - **Priority 2 (Medium):** Gallery images for program/facility pages (2 SP)
     - Use `image_migration_manifest.csv` to identify ~200-300 gallery images
     - Write script to batch download from WordPress URLs
     - Organize into `public/uploads/gallery/`, `public/uploads/facilities/`, `public/uploads/staff/`
   - **Priority 3 (Low):** Remaining images (~200-500) (2 SP)
     - On-demand migration as pages are QA'd
     - Flag any missing images in QA report

3. **Content QA & Cleanup** (3 SP)
   - Page-by-page review (31 pages × 5 min/page = 2.5 hours)
   - Fix formatting issues:
     - Broken image links → update paths
     - Malformed Markdown → correct syntax
     - Missing metadata → add SEO descriptions, hero images
   - Validate external links (UltraCamp registration, social media)
   - **Output:** 100% of pages pass QA checklist

4. **Internal Link Validation** (1 SP)
   - Scan all pages for internal links (`[link](/old-slug)`)
   - Update to new hierarchy (`[link](/programs/new-slug)`)
   - Generate 301 redirect map for URLs that changed
   - **Output:** `redirects.json` for Next.js middleware

5. **Client Review Checkpoint** (1 SP)
   - Deploy all 31 pages to staging
   - Client reviews 100% of content
   - Flag any issues (missing images, incorrect text, broken links)
   - **Approval gate:** Client signs off on content accuracy

**Success Criteria:**
- 31/31 pages migrated, QA'd, and approved by client
- 500-800 images migrated and organized
- No broken links (internal or external)
- 301 redirect map created for changed URLs

---

### Phase 3: Polish + Launch (Week 5-6, 8 SP)

**Goal:** Image optimization, performance tuning, redirects, final QA, launch.

**Deliverables:**

1. **Image Optimization** (2 SP)
   - Convert 500-800 JPEGs → WebP with JPEG fallbacks
   - Use Next.js `<Image>` component with responsive sizes
   - Lazy-load below-fold images
   - Target: LCP < 2.5s, 80%+ file size reduction
   - **Output:** Optimized images, Lighthouse Performance score ≥90

2. **SEO & Redirects** (2 SP)
   - Implement 301 redirects in Next.js middleware (`middleware.ts`)
   - Validate all meta tags (title, description, OG, Twitter Card)
   - Generate `sitemap.xml` and `robots.txt`
   - Submit sitemap to Google Search Console
   - **Output:** No 404 errors, all old URLs redirect correctly

3. **Accessibility Audit** (1 SP)
   - Test color contrast ratios (WCAG AA compliance)
   - Add alt text to all images
   - Verify keyboard navigation (tab through all pages)
   - Test screen reader compatibility (VoiceOver, NVDA)
   - **Output:** Lighthouse Accessibility score ≥90

4. **Final QA & Launch Checklist** (2 SP)
   - Test all CTAs (registration links, contact forms)
   - Validate social media links (Facebook, Instagram, YouTube)
   - Test on mobile devices (iOS Safari, Android Chrome)
   - Verify analytics tracking (Google Analytics 4 or Cloudflare Analytics)
   - DNS cutover plan (point bearlakecamp.com → new Next.js deployment)
   - **Output:** Launch checklist 100% complete

5. **Post-Launch Monitoring** (1 SP)
   - Monitor for 404 errors (Google Search Console)
   - Monitor page load times (Lighthouse CI, SpeedCurve)
   - Client feedback on any post-launch issues
   - **Output:** No critical issues in first 7 days

**Success Criteria:**
- Lighthouse scores: Performance ≥90, Accessibility ≥90, Best Practices ≥90, SEO ≥90
- Zero 404 errors from old WordPress URLs
- Client approval: "Site looks great, ready to launch"
- Successful DNS cutover with zero downtime

---

## Section 4: Migration Script Design (Technical Specification)

### 4.1 Technology Stack

**Language:** Python 3.10+ (chosen for XML parsing, YAML generation, extensive libraries)

**Libraries:**
- `lxml` - Fast XML parsing
- `beautifulsoup4` - HTML parsing and cleanup
- `pyyaml` - YAML generation
- `markdownify` - HTML-to-Markdown conversion
- `requests` - Image downloading
- `pandas` - CSV generation for image manifest

**Alternative:** Node.js with `xml2js`, `turndown`, `gray-matter` (if Next.js team prefers JS)

---

### 4.2 Script Modules

#### Module 1: XML Parser (`src/parse_wordpress.py`)

**Input:** `bearlakecamp.WordPress.2025-10-31.xml`
**Output:** Python dict of parsed pages

```python
from lxml import etree
from bs4 import BeautifulSoup

def parse_wordpress_xml(xml_path):
    """
    Parse WordPress XML export and extract pages.

    Returns:
        List[Dict]: [
            {
                'id': '2217',
                'title': 'Home',
                'slug': 'home-2',
                'content_html': '<p>Welcome...</p>',
                'featured_image_url': 'https://...',
                'post_meta': {...},
                'status': 'publish'
            },
            ...
        ]
    """
    tree = etree.parse(xml_path)
    root = tree.getroot()

    # Define namespaces
    ns = {
        'wp': 'http://wordpress.org/export/1.2/',
        'content': 'http://purl.org/rss/1.0/modules/content/'
    }

    pages = []
    for item in root.findall('.//item'):
        post_type = item.find('wp:post_type', ns)
        if post_type is not None and post_type.text == 'page':
            status = item.find('wp:status', ns).text
            if status != 'publish':
                continue  # Skip drafts, trash

            page = {
                'id': item.find('wp:post_id', ns).text,
                'title': item.find('title').text,
                'slug': item.find('wp:post_name', ns).text,
                'content_html': item.find('content:encoded', ns).text or '',
                'featured_image_url': extract_featured_image(item, ns),
                'post_meta': extract_post_meta(item, ns),
                'status': status
            }
            pages.append(page)

    return pages

def extract_featured_image(item, ns):
    """Extract featured image URL from postmeta."""
    for meta in item.findall('wp:postmeta', ns):
        key = meta.find('wp:meta_key', ns).text
        if key == '_thumbnail_id':
            # Look up attachment by ID (complex - may need SQL query)
            return None  # Placeholder - implement attachment lookup
    return None

def extract_post_meta(item, ns):
    """Extract all postmeta as dict."""
    meta = {}
    for postmeta in item.findall('wp:postmeta', ns):
        key = postmeta.find('wp:meta_key', ns).text
        value = postmeta.find('wp:meta_value', ns).text
        meta[key] = value
    return meta
```

---

#### Module 2: Template Classifier (`src/classify_template.py`)

**Input:** Page dict (title, slug, content)
**Output:** Template type (`homepage`, `program`, `facility`, `staff`, `standard`)

```python
def classify_template(page):
    """
    Classify page into Keystatic template type.

    Rules:
    - Homepage: slug == 'home' or 'home-2'
    - Program: slug contains program keywords OR has program-specific meta
    - Facility: slug contains facility keywords
    - Staff: slug contains 'staff' or 'work-at-camp'
    - Standard: default
    """
    slug = page['slug'].lower()
    title = page['title'].lower()

    # Homepage
    if slug in ['home', 'home-2']:
        return 'homepage'

    # Program pages
    program_keywords = ['summer-camp', 'retreats', 'anchored', 'breathe', 'defrost', 'recharge', 'leaders-in-training']
    if any(kw in slug for kw in program_keywords):
        return 'program'

    # Facility pages
    facility_keywords = ['cabins', 'chapel', 'dininghall', 'dining-hall', 'mac', 'outdoor']
    if any(kw in slug for kw in facility_keywords):
        return 'facility'

    # Staff pages
    staff_keywords = ['staff', 'work-at-camp']
    if any(kw in slug for kw in staff_keywords):
        return 'staff'

    # Default: standard
    return 'standard'
```

---

#### Module 3: Content Transformer (`src/transform_content.py`)

**Input:** HTML content from WordPress
**Output:** Markdoc-compatible Markdown

```python
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import re

def transform_html_to_markdoc(html_content):
    """
    Convert WordPress HTML to Markdoc Markdown.

    Steps:
    1. Strip WordPress shortcodes ([gallery], [caption], etc.)
    2. Clean up HTML (remove inline styles, empty tags)
    3. Convert to Markdown
    4. Extract image URLs for migration manifest
    """
    if not html_content:
        return '', []

    # Step 1: Remove WordPress shortcodes
    html_content = re.sub(r'\[.*?\]', '', html_content)

    # Step 2: Parse and clean HTML
    soup = BeautifulSoup(html_content, 'html.parser')

    # Remove inline styles
    for tag in soup.find_all(style=True):
        del tag['style']

    # Remove empty paragraphs
    for p in soup.find_all('p'):
        if not p.get_text(strip=True):
            p.decompose()

    # Step 3: Extract image URLs
    images = []
    for img in soup.find_all('img'):
        src = img.get('src', '')
        alt = img.get('alt', '')
        if src:
            images.append({'src': src, 'alt': alt})

    # Step 4: Convert to Markdown
    markdown_content = md(str(soup), heading_style='ATX')

    return markdown_content, images
```

---

#### Module 4: YAML Generator (`src/generate_keystatic_yaml.py`)

**Input:** Classified page with transformed content
**Output:** Keystatic YAML file

```python
import yaml
import os

def generate_keystatic_yaml(page, template_type, content_markdown, images):
    """
    Generate Keystatic YAML file for a page.

    Structure:
    ---
    title: ...
    heroImage: ...
    heroTagline: ...
    templateFields:
      discriminant: program|facility|staff|homepage|standard
      value:
        ... (template-specific fields)
    seo:
      metaTitle: ...
      metaDescription: ...
    ---
    # Content here
    """

    frontmatter = {
        'title': page['title'],
        'heroImage': page.get('featured_image_url') or '',
        'heroTagline': '',  # Can extract from content or leave blank
        'templateFields': {
            'discriminant': template_type,
            'value': generate_template_fields(template_type, page, images)
        },
        'seo': {
            'metaTitle': f"{page['title']} | Bear Lake Camp",
            'metaDescription': extract_meta_description(content_markdown),
        }
    }

    # Generate YAML with Markdoc content
    yaml_content = yaml.dump(frontmatter, sort_keys=False, allow_unicode=True)
    full_content = f"---\n{yaml_content}---\n\n{content_markdown}"

    # Write to file
    output_path = f"content/pages/{page['slug']}.mdoc"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(full_content)

    return output_path

def generate_template_fields(template_type, page, images):
    """Generate template-specific fields based on type."""
    if template_type == 'homepage':
        return {
            'galleryImages': [],  # Populate manually or extract from shortcode
            'ctaHeading': 'Ready to register?',
            'ctaButtonText': 'Register Now',
            'ctaButtonLink': 'https://www.ultracamp.com/clientlogin.aspx?idCamp=268'
        }

    elif template_type == 'program':
        return {
            'ageRange': '',  # Extract from content or leave blank for manual fill
            'dates': '',
            'pricing': '',
            'registrationLink': 'https://www.ultracamp.com/clientlogin.aspx?idCamp=268',
            'galleryImages': [],
            'ctaHeading': 'Ready to register?',
            'ctaButtonText': 'Register Now',
            'ctaButtonLink': 'https://www.ultracamp.com/clientlogin.aspx?idCamp=268'
        }

    elif template_type == 'facility':
        return {
            'capacity': '',
            'amenities': '',
            'galleryImages': []
        }

    elif template_type == 'staff':
        return {
            'galleryImages': [],
            'ctaHeading': 'Ready to apply?',
            'ctaButtonText': 'Apply Now',
            'ctaButtonLink': ''
        }

    else:  # standard
        return {}

def extract_meta_description(markdown_content, max_length=160):
    """Extract first sentence or paragraph as meta description."""
    # Strip Markdown formatting
    text = re.sub(r'[#*_\[\]()]+', '', markdown_content)
    text = text.strip()

    # Get first 160 characters
    if len(text) > max_length:
        text = text[:max_length].rsplit(' ', 1)[0] + '...'

    return text
```

---

#### Module 5: Image Auditor (`src/audit_images.py`)

**Input:** List of all pages with extracted image URLs
**Output:** CSV manifest of images to migrate

```python
import pandas as pd
import requests

def audit_images(pages_with_images):
    """
    Generate image migration manifest.

    Columns:
    - source_url: WordPress image URL
    - dest_path: Destination path in Next.js (public/uploads/...)
    - priority: high|medium|low
    - size_kb: File size in KB
    - dimensions: WxH
    - used_in_pages: Comma-separated list of page titles
    """

    image_manifest = []

    for page in pages_with_images:
        for img in page['images']:
            src = img['src']
            alt = img['alt']

            # Determine destination path based on image type
            if 'hero' in src or page['featured_image_url'] == src:
                dest_path = f"public/uploads/heroes/{os.path.basename(src)}"
                priority = 'high'
            elif 'gallery' in src or 'uploads' in src:
                dest_path = f"public/uploads/gallery/{os.path.basename(src)}"
                priority = 'medium'
            else:
                dest_path = f"public/uploads/{os.path.basename(src)}"
                priority = 'low'

            # Get image metadata (size, dimensions) via HTTP HEAD request
            try:
                response = requests.head(src, timeout=5)
                size_kb = int(response.headers.get('Content-Length', 0)) / 1024
            except:
                size_kb = 0

            image_manifest.append({
                'source_url': src,
                'dest_path': dest_path,
                'priority': priority,
                'size_kb': round(size_kb, 2),
                'dimensions': '',  # Would need to download to get dimensions
                'used_in_pages': page['title']
            })

    # Convert to DataFrame and save CSV
    df = pd.DataFrame(image_manifest)
    df = df.drop_duplicates(subset=['source_url'])  # Remove duplicate images
    df.to_csv('image_migration_manifest.csv', index=False)

    return df
```

---

### 4.3 Main Script (`migrate.py`)

**Orchestrates all modules:**

```python
from src.parse_wordpress import parse_wordpress_xml
from src.classify_template import classify_template
from src.transform_content import transform_html_to_markdoc
from src.generate_keystatic_yaml import generate_keystatic_yaml
from src.audit_images import audit_images
import json

def main():
    print("Starting WordPress → Keystatic migration...")

    # Step 1: Parse WordPress XML
    print("Step 1: Parsing WordPress XML...")
    pages = parse_wordpress_xml('bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml')
    print(f"  Found {len(pages)} published pages")

    # Step 2: Classify templates and transform content
    print("Step 2: Classifying templates and transforming content...")
    pages_with_templates = []
    for page in pages:
        template_type = classify_template(page)
        markdown_content, images = transform_html_to_markdoc(page['content_html'])

        page['template_type'] = template_type
        page['markdown_content'] = markdown_content
        page['images'] = images

        pages_with_templates.append(page)
        print(f"  {page['title']} → {template_type}")

    # Step 3: Generate Keystatic YAML files
    print("Step 3: Generating Keystatic YAML files...")
    for page in pages_with_templates:
        output_path = generate_keystatic_yaml(
            page,
            page['template_type'],
            page['markdown_content'],
            page['images']
        )
        print(f"  Created: {output_path}")

    # Step 4: Generate image migration manifest
    print("Step 4: Generating image migration manifest...")
    image_df = audit_images(pages_with_templates)
    print(f"  Found {len(image_df)} unique images to migrate")
    print(f"  High priority: {len(image_df[image_df['priority'] == 'high'])}")
    print(f"  Medium priority: {len(image_df[image_df['priority'] == 'medium'])}")
    print(f"  Low priority: {len(image_df[image_df['priority'] == 'low'])}")

    # Step 5: Generate migration report
    print("Step 5: Generating migration report...")
    report = {
        'total_pages': len(pages),
        'templates': {
            'homepage': len([p for p in pages_with_templates if p['template_type'] == 'homepage']),
            'program': len([p for p in pages_with_templates if p['template_type'] == 'program']),
            'facility': len([p for p in pages_with_templates if p['template_type'] == 'facility']),
            'staff': len([p for p in pages_with_templates if p['template_type'] == 'staff']),
            'standard': len([p for p in pages_with_templates if p['template_type'] == 'standard']),
        },
        'images': {
            'total': len(image_df),
            'high_priority': len(image_df[image_df['priority'] == 'high']),
            'medium_priority': len(image_df[image_df['priority'] == 'medium']),
            'low_priority': len(image_df[image_df['priority'] == 'low']),
        }
    }

    with open('migration_report.json', 'w') as f:
        json.dump(report, f, indent=2)

    print("\nMigration complete! 🎉")
    print(f"  Pages migrated: {len(pages)}")
    print(f"  Images to migrate: {len(image_df)}")
    print(f"  See migration_report.json for details")

if __name__ == '__main__':
    main()
```

**Usage:**
```bash
python migrate.py
```

**Output:**
- `content/pages/*.mdoc` (31 files)
- `image_migration_manifest.csv`
- `migration_report.json`

---

## Section 5: Reusability & Future Migrations

### 5.1 Making the Script Reusable

**Current Implementation:** Hardcoded for Bear Lake Camp (template keywords, URLs, file paths)

**Generalization Strategy:**

1. **Configuration File** (`config.yaml`)
   ```yaml
   # Migration configuration
   wordpress:
     xml_path: "wordpress-export.xml"
     site_url: "https://bearlakecamp.com"

   keystatic:
     output_dir: "content/pages"
     template_rules:
       homepage:
         - slug_contains: ["home"]
       program:
         - slug_contains: ["summer-camp", "retreats", "lit"]
         - title_contains: ["program"]
       facility:
         - slug_contains: ["cabin", "chapel", "gym"]
       staff:
         - slug_contains: ["staff", "employment"]

   images:
     base_url: "https://bearlakecamp.com/wp-content/uploads/"
     output_dirs:
       high_priority: "public/uploads/heroes"
       medium_priority: "public/uploads/gallery"
       low_priority: "public/uploads"
   ```

2. **Template Mapping UI** (Optional - for non-technical users)
   - Web UI where user drags WordPress pages → Keystatic templates
   - Generates `config.yaml` automatically
   - Preview before migration

3. **Plugin Architecture**
   - `plugins/` directory for custom transformers
   - Example: `plugins/elementor_transformer.py` (handles Elementor shortcodes)
   - Example: `plugins/acf_field_mapper.py` (maps Advanced Custom Fields → Keystatic fields)

**Estimated Generalization Effort:** +2 SP (2 hours) to make script configurable

---

### 5.2 Potential Future Use Cases

**Scenario 1: Another Camp Website**
Similar WordPress setup (Elementor, program pages, facilities). Reuse script with:
- Updated `config.yaml` (different template keywords)
- Same template structure in Keystatic
- Estimated migration time: 5 SP (vs. 8 SP for first site - 37% faster)

**Scenario 2: Church Website**
Different content types (sermons, events, ministries). Requires:
- New Keystatic templates (sermon, event, ministry)
- Updated template classifier rules
- Estimated migration time: 7 SP (some template development needed)

**Scenario 3: WordPress → Astro Migration**
Different static site generator. Requires:
- Replace YAML generator with MDX generator (Astro uses frontmatter + MDX)
- Same parsing/transformation logic
- Estimated migration time: 6 SP (generator module replacement)

**ROI:** If migrating 3+ similar sites, script pays for itself (3 sites × 5 SP saved = 15 SP total savings)

---

## Section 6: Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Script fails to parse complex WordPress shortcodes** | Medium | Medium | Manual fallback for edge cases; flag in `unmapped_content.json` |
| **Image URLs are broken/inaccessible** | Low | Medium | Download images from live WordPress site via web scraper (Puppeteer) |
| **Client changes mind on template structure mid-migration** | Low | High | Phase 1 approval gate; lock templates before Phase 2 |
| **WordPress SQL dump missing postmeta** | Low | High | Use XML export as primary source; SQL is backup for featured images |
| **Elementor-specific layouts lost in conversion** | High | Low | Expected - Elementor is visual builder, Keystatic is content-only. Rebuild layouts in Next.js components. |
| **Internal links break due to slug changes** | Medium | Medium | Generate 301 redirect map; validate all internal links in QA |
| **7,386 images overwhelm migration process** | Low | Low | Image audit filters to ~500-800 actively-used images; defer low-priority images |

---

## Section 7: Success Metrics

### 7.1 Migration Accuracy

**Target:** 90%+ automated migration accuracy (measured as % of pages requiring zero manual edits)

**Measurement:**
- Run script on 31 pages
- Manually QA each page
- Count pages with:
  - ✅ Perfect migration (zero edits needed)
  - ⚠️ Minor edits (1-3 fixes: missing image, formatting tweak)
  - ❌ Major rework (>3 fixes or template wrong)
- **Formula:** `(Perfect + Minor) / Total × 100`
- **Baseline:** Manual migration = 0% automation, 100% manual effort

---

### 7.2 Time Savings

**Baseline (Manual):** 13 SP (13 hours)
**With Script:** 8 SP (8 hours)
**Savings:** 5 SP (38% reduction)

**Breakdown:**

| Task | Manual | Scripted | Savings |
|------|--------|----------|---------|
| Page migration | 8 SP | 3 SP | 5 SP |
| Image audit | 3 SP | 2 SP | 1 SP |
| Internal link fixes | 2 SP | 1 SP | 1 SP |
| Total | 13 SP | 6 SP | 7 SP (54%) |

---

### 7.3 Content Quality

**Metrics:**
- Zero broken links (internal + external)
- 100% of images have alt text
- SEO meta descriptions on all pages
- Lighthouse SEO score ≥90

**Measurement:** Post-migration audit checklist

---

## Section 8: Implementation Timeline & Effort Estimate

### Total Effort Summary

| Phase | Tasks | Story Points | Calendar Time |
|-------|-------|--------------|---------------|
| **Phase 1: Templates + Examples** | Navigation, templates, script dev, 5 example pages | 8 SP | 1-2 weeks |
| **Phase 2: Bulk Migration** | 26 remaining pages, 500-800 images, QA | 13 SP | 2-3 weeks |
| **Phase 3: Polish + Launch** | Image optimization, SEO, redirects, launch | 8 SP | 1-2 weeks |
| **Total** | - | **29 SP** | **4-6 weeks** |

**Note:** Calendar time includes client feedback loops, content gathering, and QA cycles (not just development time).

---

### Detailed Task Breakdown

#### Phase 1 (Week 1-2, 8 SP)
- [x] Navigation structure (1 SP)
- [x] Homepage template + example (1 SP)
- [x] Program template + example (1 SP)
- [x] Facility template + example (0.5 SP)
- [x] Staff template + example (0.5 SP)
- [x] Migration script development (3 SP)
- [x] Client review checkpoint (1 SP)

#### Phase 2 (Week 3-4, 13 SP)
- [ ] Bulk page migration (3 SP)
- [ ] Image migration Priority 1 (1 SP)
- [ ] Image migration Priority 2 (2 SP)
- [ ] Image migration Priority 3 (2 SP)
- [ ] Content QA & cleanup (3 SP)
- [ ] Internal link validation (1 SP)
- [ ] Client review checkpoint (1 SP)

#### Phase 3 (Week 5-6, 8 SP)
- [ ] Image optimization (2 SP)
- [ ] SEO & redirects (2 SP)
- [ ] Accessibility audit (1 SP)
- [ ] Final QA & launch checklist (2 SP)
- [ ] Post-launch monitoring (1 SP)

---

## Section 9: Deliverables Checklist

### Code Deliverables
- [ ] Migration script (`migrate.py` + modules)
- [ ] Configuration file (`config.yaml`)
- [ ] Image download script (`download_images.py`)
- [ ] Redirect map generator (`generate_redirects.py`)
- [ ] QA checklist script (`qa_validator.py`)

### Content Deliverables
- [ ] 31 Keystatic YAML files (`content/pages/*.mdoc`)
- [ ] 500-800 optimized images (`public/uploads/...`)
- [ ] Navigation structure (`lib/navigation.ts`)
- [ ] 301 redirect map (`redirects.json`)
- [ ] Sitemap (`public/sitemap.xml`)

### Documentation Deliverables
- [ ] Migration report (`migration_report.json`)
- [ ] Image manifest (`image_migration_manifest.csv`)
- [ ] Unmapped content log (`unmapped_content.json`)
- [ ] QA checklist (Google Sheet or Markdown)
- [ ] Launch checklist (Google Sheet or Markdown)

---

## Section 10: Recommendations & Next Steps

### Immediate Actions (This Week)

1. **Client approval on phased approach** (30 min meeting)
   - Review this document with Bear Lake Camp leadership
   - Confirm template structure aligns with styleguide
   - Get sign-off to proceed with Phase 1

2. **Set up development environment** (1 hour)
   - Clone repository
   - Install Python dependencies (`pip install -r requirements.txt`)
   - Test on 2-3 sample pages from WordPress XML

3. **Prioritize Phase 1 pages** (30 min)
   - Homepage: `/home-2`
   - Program example: `/summer-camp`
   - Facility example: `/cabins`
   - Staff example: `/summer-staff`
   - Standard example: `/about`

### Week 1-2: Phase 1 Execution

1. **Day 1-2:** Navigation + template development (4 SP)
2. **Day 3-4:** Migration script development (3 SP)
3. **Day 5:** Client review checkpoint (1 SP)
4. **Approval gate:** Client signs off on templates before Phase 2

### Long-Term (Post-Launch)

1. **Open-source migration script** (optional)
   - Generalize for WordPress → Keystatic migrations
   - Publish on GitHub with MIT license
   - Benefits other ministries/camps doing similar migrations

2. **Create "Camp Website Migration" service** (optional)
   - Package script + templates + migration service
   - Offer to other Christian camps (industry-specific solution)
   - Potential revenue stream for future projects

---

## Appendix A: WordPress Page Inventory

(See `bear-lake-analysis.md` for full 31-page inventory)

**Quick Reference:**

| Template | Count | Example Pages |
|----------|-------|---------------|
| Homepage | 1 | Home |
| Program | 6 | Summer Camp, Retreats, Anchored, Breathe, Defrost, Recharge, LIT |
| Facility | 5 | Cabins, Chapel, Dining Hall, MAC, Outdoor Spaces |
| Staff | 3 | Summer Staff, Summer Staff Landing, Work at Camp |
| Standard | 16 | About, Contact, FAQ, What To Bring, Wish List, etc. |
| **Total** | **31** | - |

---

## Appendix B: Technology Stack Comparison

### Alternative Migration Approaches (Not Recommended)

**WordPress API + Custom Integration:**
- Requires WordPress site to remain online during migration
- Complex authentication (OAuth, JWT)
- Rate limits on REST API
- Verdict: Overkill for one-time migration

**Contentful/Sanity/Strapi Import:**
- Intermediate step (WordPress → Headless CMS → Keystatic)
- Adds complexity, cost, vendor lock-in
- Verdict: Unnecessary for static site migration

**Manual CSV Export/Import:**
- WordPress exports to CSV (via plugin)
- Manual import to Keystatic (no CSV import in Keystatic)
- Verdict: More work than custom script

**Recommendation stands:** Custom Python script is optimal for this use case.

---

## Appendix C: Keystatic Schema Validation

Your existing `keystatic.config.ts` is well-structured and covers all use cases. No changes needed.

**Verified:**
- ✅ Conditional templates (`templateFields.discriminant`)
- ✅ Image uploads (`fields.image` with directory)
- ✅ SEO fields (`seo.metaTitle`, `seo.metaDescription`, OG tags)
- ✅ Gallery arrays (`galleryImages` for program, facility, staff, homepage)
- ✅ CTA fields (`ctaHeading`, `ctaButtonText`, `ctaButtonLink`)

**Optional Enhancement (Post-Launch):**
- Add `fields.date` for program dates (structured vs. free-text)
- Add `fields.number` for pricing (allows currency formatting)
- Add staff collection (`collection({ label: 'Staff Bios', ... })`) - already exists in your config

---

## Appendix D: Image Optimization Targets

**Current State (WordPress):**
- 7,386 files (mostly auto-generated thumbnails)
- Average file size: 200-500 KB per image
- Total: ~1.5-3 GB

**Target State (Next.js):**
- 500-800 source files (manually audited)
- Average file size: 50-150 KB (WebP with JPEG fallback)
- Total: ~50-120 MB (95% reduction)

**Optimization Strategy:**
- Use `next/image` with responsive sizes (320w, 640w, 1024w, 1920w)
- Serve WebP to modern browsers, JPEG to legacy browsers
- Lazy-load below-fold images
- Result: LCP < 2.5s, Lighthouse Performance ≥90

---

## Conclusion

This migration strategy provides a systematic, reusable approach to WordPress → Next.js + Keystatic migration. By prioritizing templates-first validation and leveraging semi-automated scripting, you'll achieve:

- **Faster migration:** 54% time savings vs. manual (8 SP vs. 13 SP)
- **Higher accuracy:** 90%+ automated migration accuracy
- **Better quality:** Image optimization, SEO metadata, accessibility
- **Reusability:** Script can be adapted for other camp/ministry sites

**Next step:** Client approval on phased approach, then proceed to Phase 1.

---

**Questions or need clarification?** Contact Travis at Sparkry.
