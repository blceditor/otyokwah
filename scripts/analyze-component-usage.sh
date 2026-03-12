#!/bin/bash
# Markdoc Component Usage Analysis Script
# REQ-LP-V5-007

echo "=== Markdoc Component Usage Analysis ==="
echo "Date: $(date)"
echo "Analyzing content files..."
echo ""

# Count tag usage
echo "=== Tag Usage (sorted by frequency) ==="
find content -name "*.mdoc" -exec grep -oE '\{%\s*\w+' {} \; 2>/dev/null | \
  sed 's/{%\s*//' | \
  sort | uniq -c | sort -rn

# Count nested patterns
echo ""
echo "=== Nested Tag Patterns (top 20) ==="
grep -r '\{%\s*\w+.*\{%' content --include="*.mdoc" 2>/dev/null | \
  grep -oE '\{%\s*\w+' | head -20

# Count attributes used
echo ""
echo "=== Common Attributes (top 20) ==="
grep -roE '\{%\s*\w+[^%]+%\}' content --include="*.mdoc" 2>/dev/null | \
  grep -oE '\s\w+=' | sed 's/\s//' | sort | uniq -c | sort -rn | head -20

# Generate MVP list
echo ""
echo "=== MVP Component List (Top 10 by usage) ==="
find content -name "*.mdoc" -exec grep -oE '\{%\s*\w+' {} \; 2>/dev/null | \
  sed 's/{%\s*//' | \
  sort | uniq -c | sort -rn | head -10 | awk '{print NR". "$2" ("$1" uses)"}'

# Summary stats
echo ""
echo "=== Summary Statistics ==="
TOTAL_FILES=$(find content -name "*.mdoc" | wc -l)
TOTAL_TAGS=$(find content -name "*.mdoc" -exec grep -oE '\{%\s*\w+' {} \; 2>/dev/null | wc -l)
UNIQUE_TAGS=$(find content -name "*.mdoc" -exec grep -oE '\{%\s*\w+' {} \; 2>/dev/null | sed 's/{%\s*//' | sort | uniq | wc -l)
echo "Total .mdoc files: $TOTAL_FILES"
echo "Total Markdoc tag instances: $TOTAL_TAGS"
echo "Unique Markdoc tags used: $UNIQUE_TAGS"
