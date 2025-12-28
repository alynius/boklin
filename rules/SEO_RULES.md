# SEO RULES & REQUIREMENTS

> **Purpose**: This file defines SEO rules that MUST be followed when building this site. Reference this file before creating pages, components, or making architectural decisions.

---

## TABLE OF CONTENTS

1. [Core Principles](#core-principles)
2. [Technical Requirements](#technical-requirements)
3. [URL Rules](#url-rules)
4. [Page Requirements](#page-requirements)
5. [Content Structure](#content-structure)
6. [Metadata Rules](#metadata-rules)
7. [Image Requirements](#image-requirements)
8. [Internal Linking](#internal-linking)
9. [Index Control](#index-control)
10. [Structured Data](#structured-data)
11. [Performance Requirements](#performance-requirements)
12. [International SEO](#international-seo)
13. [Programmatic SEO Rules](#programmatic-seo-rules)
14. [Quality Gates](#quality-gates)
15. [Checklists](#checklists)

---

## CORE PRINCIPLES

```
ALWAYS:
- Treat SEO as infrastructure, not marketing
- Prefer long-term correctness over short-term tricks
- Ensure Google and Bing compatibility equally
- Consider any SEO bug as a production bug
- Assume site will scale to thousands of pages

NEVER:
- Stuff keywords unnaturally
- Create thin/duplicate content pages
- Use tricks that could trigger penalties
- Ignore mobile-first requirements
- Launch without validation
```

---

## TECHNICAL REQUIREMENTS

### Rendering (CRITICAL)

```
REQUIRED in initial HTML (not JS-injected):
- <title>
- <meta name="description">
- <meta name="robots">
- <link rel="canonical">
- <h1>
- Main content (first 500+ words)
- Navigation links
- JSON-LD structured data

RENDERING PRIORITY:
1. SSG (Static Site Generation) — Best
2. SSR (Server-Side Rendering) — Good
3. CSR (Client-Side Rendering) — Avoid for indexable pages
```

### robots.txt

```
MUST:
- Be minimal and explicit
- Reference all sitemaps
- Allow CSS, JS, and images
- Have separate Googlebot/Bingbot rules only if needed

MUST NOT:
- Block essential rendering resources
- Use Disallow: / unless intentional
- Block verification files
```

### Sitemap Requirements

```
MUST:
- Be accurate and auto-updating
- Exclude noindex pages
- Exclude non-canonical URLs
- Exclude 4xx/5xx pages
- Have valid lastmod (only when content actually changes)
- Be segmented by page type if >1000 URLs
- Have sitemap index for multiple sitemaps
- Be compressed (.xml.gz) for large sitemaps

MUST NOT:
- Include pages that return non-200 status
- Have fake/auto-incrementing lastmod dates
- Include duplicate URLs
```

### Canonical Tags

```
RULES:
- Every page MUST have a canonical tag
- Self-referencing by default
- Always use absolute URLs (not relative)
- Never point canonical to noindex page
- Never point canonical to 4xx/5xx page
- Handle URL parameters correctly
```

### HTTP Status Codes

```
USE:
- 200: Page exists and should render
- 301: Permanent redirect (passes link equity)
- 302: Temporary redirect (use sparingly)
- 404: Page not found (may return)
- 410: Permanently gone (faster de-indexing)
- 503: Temporary maintenance

AVOID:
- Soft 404s (200 status for "not found" content)
- Redirect chains (A→B→C)
- Redirect loops
- Mixed redirect/canonical conflicts
```

### HTTPS & Security

```
REQUIRED:
- HTTPS everywhere
- No mixed content (HTTP resources on HTTPS)
- Valid SSL certificate
- HSTS header
- Security headers present
```

---

## URL RULES

```
FORMAT:
- Lowercase only
- Hyphens for word separation (not underscores)
- No special characters or encoded entities
- No trailing spaces
- Under 75 characters recommended

STRUCTURE:
- One concept per URL level
- Meaningful hierarchy: /category/subcategory/page
- Consistent trailing slash policy (pick one, enforce everywhere)

PARAMETERS:
- Define which parameters should be indexed
- Canonicalize parameter variations
- Block non-essential parameters

SLUGS:
- Descriptive and keyword-relevant
- No generic slugs (page1, post123)
- Handle unicode/international characters
- Prevent duplicate slugs
```

### Redirect Rules

```
MUST:
- All redirects resolve in single hop (no chains)
- 301 for permanent moves
- Maintain redirect map for reference
- Audit regularly for chains/loops

WHEN CHANGING URLs:
1. Implement 301 redirect from old → new
2. Update all internal links to new URL
3. Update sitemap
4. Update canonical tags
```

---

## PAGE REQUIREMENTS

### Every Indexable Page MUST Have:

```
□ Unique <title> (50-60 chars)
□ Unique <meta name="description"> (140-160 chars)
□ Exactly one <h1>
□ <link rel="canonical"> (absolute URL)
□ Proper meta robots tag
□ Structured data (JSON-LD)
□ Internal links to/from other pages
□ Mobile-friendly layout
□ Fast load time (<3s)
□ No mixed content
```

### Page Type Classification

```
Every page must be classified by intent:
- Informational: User wants to learn
- Navigational: User wants specific page/brand
- Transactional: User wants to buy/convert
- Commercial Investigation: User comparing options

Each page type needs:
- Defined URL pattern
- Required content sections
- Appropriate schema type
- Internal linking role (hub/spoke/leaf)
```

---

## CONTENT STRUCTURE

### Heading Hierarchy

```
RULES:
- Exactly ONE <h1> per page
- H1 must match primary keyword + page intent
- H1 must be visible (not hidden/off-screen)
- Logical hierarchy: H1 → H2 → H3 → H4 (no skipping)
- All headings must be semantic HTML (not styled divs)
- No empty headings
- No keyword-stuffed headings

FORBIDDEN:
- Multiple <h1> tags
- Skipped levels (H1 → H3)
- H1 that doesn't match page intent
- Hidden headings
```

### Content Quality

```
MINIMUM REQUIREMENTS:
- Unique, valuable content (not thin)
- At least 300 words for standard pages
- Content matches declared intent
- No duplicate/boilerplate blocks
- Proper grammar and readability

FOR EACH PAGE:
- Primary keyword (unique across site)
- Secondary keywords (2-5 related terms)
- Unique intent statement
```

---

## METADATA RULES

### Title Tags

```
FORMAT: Primary Keyword - Secondary Info | Brand
LENGTH: 50-60 characters (hard max: 60)

RULES:
- Include primary keyword naturally
- Unique across entire site
- Match page intent
- No truncation in SERPs
- Brand suffix if space permits

FORBIDDEN:
- Duplicate titles
- Keyword stuffing
- ALL CAPS
- Excessive punctuation
```

### Meta Descriptions

```
LENGTH: 140-160 characters (hard max: 160)

RULES:
- Match page intent
- Include call-to-action where appropriate
- Human-readable, compelling copy
- Unique across entire site

FORBIDDEN:
- Duplicate descriptions
- Keyword stuffing
- Generic descriptions
- Truncated sentences
```

### OpenGraph & Twitter Cards

```
REQUIRED TAGS:
- og:title
- og:description
- og:image (1200x630px minimum)
- og:url (canonical URL)
- og:type
- twitter:card
- twitter:title
- twitter:description
- twitter:image

RULES:
- Fallback images for pages without specific images
- Proper image dimensions
- Match visible page content
```

### Content Freshness

```
IMPLEMENT:
- Accurate <lastmod> in sitemaps
- article:modified_time in OpenGraph
- dateModified in Article schema
- Visible "Last updated" on content pages

NEVER:
- Fake lastmod dates
- Auto-increment dates without real changes
```

---

## IMAGE REQUIREMENTS

### Alt Text

```
EVERY <img> MUST HAVE:
- Descriptive, contextual alt text
- Accurate description of image content

EXCEPTIONS:
- Decorative images: alt=""

FORBIDDEN:
- Missing alt attributes
- Keyword stuffing in alt
- Generic alt ("image", "photo")
- Filename as alt
```

### File Optimization

```
FILENAMES:
- Descriptive, lowercase, hyphen-separated
- No generic names (IMG_1234.jpg)
- Reflect image content

FORMAT:
- WebP or AVIF with fallbacks
- Proper compression
- Responsive images with srcset

DIMENSIONS:
- Explicit width and height attributes
- Prevent CLS (Cumulative Layout Shift)
```

### Loading

```
RULES:
- loading="lazy" for below-fold images
- loading="eager" for above-fold/LCP images
- NEVER lazy-load the LCP image

LCP IMAGE:
- Preload with <link rel="preload">
- No lazy loading
- Optimized file size
```

---

## INTERNAL LINKING

### Link Requirements

```
EVERY INDEXABLE PAGE SHOULD LINK TO:
- 1 parent page (if hierarchy exists)
- 2-5 sibling pages (related by topic)
- 2-6 child pages (if applicable)
- 1 authority/hub page

ANCHOR TEXT:
- Descriptive and keyword-relevant
- Varied (not always exact-match)
- Natural reading flow

FORBIDDEN:
- "Click here" or "Read more" anchors
- Footer/sidebar link spam
- Hidden links
- Orphan pages (no internal links pointing to them)
```

### Link Placement Priority

```
1. Contextual links within content (highest value)
2. Related posts/pages sections
3. Breadcrumb navigation
4. Category/tag pages
5. Footer navigation (lowest value)
```

### Orphan Page Prevention

```
BEFORE PUBLISHING ANY PAGE:
- Verify at least 2 internal links point to it
- Add it to relevant hub/category pages
- Include in breadcrumb navigation
- Add to related posts where relevant
```

---

## INDEX CONTROL

### Index Eligibility Rules

```
A PAGE SHOULD ONLY BE INDEXED IF ALL CONDITIONS MET:
□ Unique search intent (confirmed in keyword map)
□ Minimum content depth (not thin)
□ At least 2 internal links pointing to it
□ Unique title and meta description
□ Proper H1 matching intent
□ Passes quality threshold
□ Not a low-value variant
```

### Meta Robots Implementation

```
USE:
- index,follow → Eligible pages
- noindex,follow → Non-eligible pages (still crawl links)
- noindex,nofollow → Private pages only

NEVER:
- Index thin/duplicate content
- Index parameter variations
- Index paginated archives (use canonical)
- Put noindex pages in sitemap
```

### Canonical Strategy

```
INDEX-ELIGIBLE PAGES:
- Self-referencing canonical

VARIANT PAGES:
- Canonical to primary version

PARAMETER URLS:
- Canonical to clean URL

PAGINATION:
- Each page self-canonical OR
- All pages canonical to page 1 (if appropriate)
```

---

## STRUCTURED DATA

### Required Schema by Page Type

```
HOMEPAGE:
- WebSite (with SearchAction if applicable)
- Organization

ALL PAGES:
- WebPage
- BreadcrumbList

ARTICLES/BLOG:
- Article or BlogPosting
- Author (Person)

PRODUCTS:
- Product
- Offer
- AggregateRating (if reviews exist)

FAQ PAGES:
- FAQPage (only if visible FAQs exist)

LOCAL BUSINESS:
- LocalBusiness
- Address, hours, contact
```

### Schema Rules

```
MUST:
- Match visible page content exactly
- Use valid JSON-LD format
- Pass Google Rich Results Test
- Pass Bing Markup Validator
- Populate dynamic fields per page

FORBIDDEN:
- Invisible content in schema
- Fake reviews or ratings
- Schema that doesn't match page
- Spammy markup
```

---

## PERFORMANCE REQUIREMENTS

### Core Web Vitals Targets

```
LCP (Largest Contentful Paint):
- Good: ≤2.5s
- Poor: >4.0s

CLS (Cumulative Layout Shift):
- Good: ≤0.1
- Poor: >0.25

INP (Interaction to Next Paint):
- Good: ≤200ms
- Poor: >500ms
```

### Performance Rules

```
LCP OPTIMIZATION:
- Preload LCP image
- Optimize server response (<200ms TTFB)
- Eliminate render-blocking resources
- Inline critical CSS

CLS PREVENTION:
- Set image dimensions (width/height)
- Reserve space for ads/embeds
- Use font-display: swap
- Avoid inserting content above existing content

INP OPTIMIZATION:
- Minimize JavaScript
- Use code splitting
- Defer non-critical scripts
- Optimize event handlers
```

### Resource Loading

```
IMAGES:
- Modern formats (WebP/AVIF)
- Lazy load below-fold
- Responsive srcset

FONTS:
- Preload critical fonts
- font-display: swap
- Subset if possible
- Limit variations

SCRIPTS:
- Defer non-critical JS
- Async where appropriate
- Code split large bundles

CSS:
- Inline critical CSS
- Defer non-critical stylesheets
```

---

## INTERNATIONAL SEO

> Skip this section if site is single-language only.

### Hreflang Implementation

```
REQUIRED:
- Correct hreflang on all pages
- Bidirectional references (A↔B)
- x-default for language selector
- Self-referencing hreflang included
- Valid codes (en-US, not en_US)

FORMAT:
<link rel="alternate" hreflang="en-US" href="https://example.com/en/page" />
<link rel="alternate" hreflang="de-DE" href="https://example.com/de/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### URL Structure

```
OPTIONS (pick one):
- Subdirectory: example.com/en/, example.com/de/
- Subdomain: en.example.com, de.example.com
- ccTLD: example.com, example.de

RULES:
- Consistent pattern across site
- No language detection redirects for bots
- Each language version is self-canonical
```

---

## PROGRAMMATIC SEO RULES

> Apply these rules when generating pages at scale from data.

### Page Generation Rules

```
BEFORE GENERATING PAGES:
□ Define page types with distinct intents
□ Create keyword map (prevent cannibalization)
□ Set up index eligibility system
□ Create content skeletons
□ Implement quality thresholds

EACH GENERATED PAGE MUST:
□ Have genuinely unique, valuable content
□ Serve distinct search intent
□ Pass index eligibility check
□ Have unique title/description
□ Include proper internal links
□ Have accurate schema
```

### Batch Rollout Rules

```
FIRST BATCH:
- Maximum 25-50 pages
- Choose highest-demand topics
- Strongest unique intent
- Best data quality

EXPANSION CRITERIA:
- 80%+ of batch indexed
- No crawl errors
- Impressions growing
- No quality warnings

KILL CRITERIA (noindex if):
- Zero impressions after 60 days
- No organic traffic
- High bounce rate
```

### Anti-Thin Content Rules

```
EVERY GENERATED PAGE NEEDS:
- Unique "value core" section (varies meaningfully)
- Not just template with swapped keywords
- Real data or insights specific to that page
- Minimum content depth per page type

FORBIDDEN:
- Doorway pages
- Pages differing only by city/keyword swap
- Auto-generated content without unique value
```

---

## QUALITY GATES

### Pre-Publish Checklist

```
EVERY PAGE BEFORE PUBLISH:
□ Title: 50-60 chars, unique, has keyword
□ Description: 140-160 chars, unique
□ H1: Exactly one, matches intent
□ Canonical: Present, absolute URL
□ Images: All have alt text, optimized
□ Internal links: At least 2 pointing to page
□ Schema: Valid, matches content
□ Mobile: Renders correctly
□ Performance: <3s load time
□ Content: Not thin, unique value
```

### CI/CD SEO Lint Rules

```
BUILD SHOULD FAIL IF:
- Any page missing title
- Any page missing meta description
- Any page missing H1
- Any page with multiple H1s
- Duplicate titles detected
- Duplicate descriptions detected
- Title > 60 characters
- Description > 160 characters
- Images without alt text
- Redirect chains in internal links
- Mixed content (HTTP on HTTPS)
- Orphan pages in sitemap
- Noindex pages in sitemap
- Invalid canonical URLs
- Invalid lastmod dates
```

### Ahrefs Audit Compliance

```
ZERO TOLERANCE (must pass):
□ No missing titles
□ No missing descriptions
□ No missing H1s
□ No multiple H1s
□ No duplicate titles
□ No duplicate descriptions
□ No broken internal links (4xx/5xx)
□ No redirect chains
□ No redirect loops
□ No orphan pages
□ No noindex in sitemap
□ No mixed content
□ No missing alt text

WARNINGS (minimize):
□ Title > 60 chars
□ Description > 160 chars
□ Low word count (<200)
□ Slow pages (>3s)
□ Large images (>100KB uncompressed)
□ Too many links (>100 per page)
```

---

## CHECKLISTS

### New Page Checklist

```
BEFORE CREATING:
□ Identify primary keyword (check not used elsewhere)
□ Define search intent
□ Choose appropriate page type
□ Plan content sections

WHILE BUILDING:
□ Set unique title (50-60 chars)
□ Set unique description (140-160 chars)
□ Add single H1 matching intent
□ Add canonical tag
□ Add proper meta robots
□ Optimize images (alt, dimensions, format)
□ Add internal links
□ Add schema markup
□ Test mobile rendering
□ Test page speed

BEFORE PUBLISH:
□ Run SEO lint
□ Verify in sitemap
□ Check no duplicates
□ Test structured data
```

### Launch Checklist

```
PRE-LAUNCH:
□ All pages pass SEO lint
□ Sitemap valid and complete
□ robots.txt correct
□ Canonical tags verified
□ No broken links
□ No redirect chains
□ Schema validates
□ Performance acceptable
□ Mobile-friendly
□ HTTPS enforced

LAUNCH DAY:
□ Submit sitemap to GSC
□ Submit sitemap to Bing
□ Set up IndexNow
□ Request crawl
□ Monitor for errors

POST-LAUNCH:
□ Check index coverage daily (week 1)
□ Monitor Core Web Vitals
□ Watch for crawl errors
□ Track initial rankings
```

### Monthly Maintenance

```
WEEKLY:
□ Check GSC for errors
□ Monitor Core Web Vitals
□ Review crawl stats

MONTHLY:
□ Full site crawl (Ahrefs/Screaming Frog)
□ Broken link audit
□ Redirect chain audit
□ Content freshness review
□ Keyword ranking check

QUARTERLY:
□ Full index coverage audit
□ Cannibalization check
□ Page type performance review
□ Technical debt review
□ Competitor analysis
```

---

## FILE OUTPUTS REFERENCE

When following these rules, generate these files:

```
/seo/
├── repo-discovery.md          # Framework analysis
├── js-rendering-audit.md      # SSR/CSR assessment
├── seo-audit.md               # Full site audit
├── image-seo-audit.md         # Image optimization status
├── crawl-budget-audit.md      # Crawl efficiency
├── url-rules.md               # URL conventions
├── page-types.md              # Page type definitions
├── keyword-map.json           # Keyword → URL mapping
├── keyword-to-url.csv         # Lookup table
├── cannibalization-report.md  # Overlap issues
├── content-skeletons.md       # Content templates
├── content-skeletons.json     # Machine-readable
├── internal-linking.md        # Linking strategy
├── orphan-pages.csv           # Unlinked pages
├── index-policy.md            # Index eligibility rules
├── schema-templates.md        # JSON-LD examples
├── eeat-audit.md              # Trust signals
├── search-console-checklist.md # GSC/Bing setup
├── seo-rules.md               # This file
├── pre-launch-checklist.md    # Final validation
├── pseo-rollout-plan.md       # Batch launch plan
└── pseo-ops-checklist.md      # Ongoing maintenance
```

---

## QUICK REFERENCE

### Character Limits

| Element | Target | Hard Max |
|---------|--------|----------|
| Title | 50-60 | 60 |
| Description | 140-160 | 160 |
| URL | <75 | — |
| Alt text | <125 | — |

### Core Web Vitals

| Metric | Good | Poor |
|--------|------|------|
| LCP | ≤2.5s | >4.0s |
| CLS | ≤0.1 | >0.25 |
| INP | ≤200ms | >500ms |

### Status Codes

| Code | Use Case |
|------|----------|
| 200 | Normal page |
| 301 | Permanent redirect |
| 302 | Temporary redirect |
| 404 | Not found (may return) |
| 410 | Gone permanently |
| 503 | Maintenance |

---

*Last updated: December 2024*
*Version: 2.0*