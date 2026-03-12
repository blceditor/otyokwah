# WordPress to Keystatic Migration Script

Automated migration tool for converting WordPress XML exports to Keystatic-compatible Markdown + YAML frontmatter format.

## Quick Start

```bash
# Install dependencies
pip3 install pyyaml

# Test on 5 sample pages (recommended first step)
python3 scripts/wp-to-keystatic-migrator.py \
  bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml \
  content/migrated-pages \
  "2217,2263,3432,2807,2894"

# Migrate ALL pages (after verifying samples)
python3 scripts/wp-to-keystatic-migrator.py \
  bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml \
  content/migrated-pages
```

## What It Does

### ✅ Converts WordPress Pages to Keystatic Format

- **HTML → Markdown**: Converts WordPress HTML content to clean Markdown
- **Template Classification**: Automatically classifies pages into 5 template types:
  - `homepage` - Site homepage
  - `program` - Camp programs (Summer Camp, Retreats, etc.)
  - `facility` - Facilities (Cabins, Chapel, Dining Hall, etc.)
  - `staff` - Staff recruitment pages
  - `standard` - All other pages
- **YAML Frontmatter**: Generates Keystatic-compatible frontmatter with SEO, template-specific fields
- **Image Extraction**: Finds all images referenced in content and creates manifest CSV

### 📊 Migration Results (5 Sample Pages)

```
✓ Home (homepage) → home-2.md
✓ Summer Camp (program) → summer-camp.md
✓ Cabins (facility) → cabins.md
✓ Summer Staff (staff) → summer-staff.md
✓ About (standard) → about.md

Images found: 49 across 5 pages
```

## Output Structure

### Migrated Page Format

```yaml
---
title: Summer Camp
slug: summer-camp
template: program
ageRange: TBD  # Template-specific field (program)
dates: []
pricing: TBD
seo:
  title: Summer Camp
  description: Summer Camp - Bear Lake Camp
---

# Page content in Markdown

Paragraph text with **bold**, _italic_, and [links](https://example.com).

![Image alt text](https://example.com/image.jpg)
```

### Image Manifest CSV

Location: `content/migrated-pages/image-manifest.csv`

```csv
page_id,page_title,image_url
2217,Home,https://bearlakecamp.com/wp-content/uploads/2019/10/logo.png
2263,Summer Camp,https://bearlakecamp.com/wp-content/uploads/2024/11/camp.jpg
```

## Template-Specific Fields

The script automatically adds fields based on template type:

| Template | Additional Fields |
|----------|------------------|
| `homepage` | `hero.tagline`, `hero.backgroundImage` |
| `program` | `ageRange`, `dates[]`, `pricing` |
| `facility` | `capacity`, `amenities[]` |
| `staff` | `positions[]` |
| `standard` | _(none)_ |

Fields marked **TBD** need manual completion after migration.

## Next Steps After Migration

### 1. Review Migrated Content

```bash
# List all migrated files
ls -lh content/migrated-pages/

# Review template classification
grep "^template:" content/migrated-pages/*.md | sort
```

### 2. Manual Cleanup Tasks

- **Fill in TBD fields**: `ageRange`, `pricing`, `capacity`, etc.
- **Update hero images**: Replace placeholder paths with actual image paths
- **Fix broken links**: Update internal WordPress links to new site structure
- **Clean up formatting**: Review converted Markdown for edge cases

### 3. Migrate Images

Use the `image-manifest.csv` to:
- Download actively-used images (49 from sample, ~500-800 total)
- Convert to WebP format
- Organize in `/public/images/` directory

```bash
# Example: Download images from manifest
while IFS=, read -r page_id page_title image_url; do
  wget "$image_url" -P public/images/temp/
done < content/migrated-pages/image-manifest.csv
```

### 4. Move to Keystatic Content Directory

Once reviewed and cleaned:

```bash
# Move migrated pages to Keystatic content folder
mv content/migrated-pages/*.md content/pages/
```

## Advanced Usage

### Filter by Specific Page IDs

```bash
# Migrate only specific pages (comma-separated IDs)
python3 scripts/wp-to-keystatic-migrator.py \
  wordpress-export.xml \
  output-dir \
  "2217,2263,3432"
```

### Modify Template Classification Rules

Edit `classify_page_template()` function in script:

```python
def classify_page_template(title, slug, content):
    # Add custom keywords
    program_keywords = ['anchored', 'breathe', 'custom-program']
    facility_keywords = ['cabins', 'chapel', 'new-building']
    # ...
```

## Troubleshooting

### Issue: ModuleNotFoundError: No module named 'yaml'

```bash
pip3 install pyyaml
```

### Issue: Template misclassified

1. Check classification keywords in `classify_page_template()`
2. Manually edit `template:` field in output `.md` file

### Issue: HTML not converting cleanly

- The script handles common WordPress HTML patterns
- For complex Elementor widgets, manual cleanup may be needed
- Check converted Markdown and adjust as needed

## Script Architecture

```
wp-to-keystatic-migrator.py
├── HTMLToMarkdown          # HTML parser → Markdown converter
├── classify_page_template  # Template type detection
├── extract_images_from_content  # Image URL extraction
└── migrate_page           # Main migration logic
```

## Extending for Other Sites

This script can be adapted for other WordPress → Keystatic migrations:

1. **Modify Template Types**: Update `classify_page_template()` rules
2. **Add Custom Fields**: Extend frontmatter generation in `migrate_page()`
3. **Handle Custom Post Types**: Extend beyond `page` type if needed

Example for adding a custom "ministry" template:

```python
def classify_page_template(title, slug, content):
    # ... existing code ...
    ministry_keywords = ['missions', 'outreach', 'ministry']
    if any(keyword in slug_lower for keyword in ministry_keywords):
        return 'ministry'
```

## Performance

- **Sample run (5 pages)**: ~1 second
- **Full site (31 pages)**: ~3-5 seconds
- **Memory usage**: < 50MB

## License

Part of Bear Lake Camp website migration project.
