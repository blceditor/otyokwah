#!/bin/bash
# REQ-000: Fix component test imports - remove inline imports, add at top

# List of files to fix (from grep earlier)
FILES=(
  "components/keystatic/ProductionLink.spec.tsx"
  "components/content/Timeline.spec.tsx"
  "components/content/StatsCounter.spec.tsx"
  "components/keystatic/GenerateSEOButton.spec.tsx"
  "components/keystatic/BugReportModal.spec.tsx"
  "components/content/Accordion.spec.tsx"
  "components/content/Hero.spec.tsx"
  "components/content/PricingTable.spec.tsx"
  "components/content/SplitContent.spec.tsx"
  "components/content/Testimonial.spec.tsx"
  "components/content/FeatureGrid.spec.tsx"
  "components/keystatic/SparkryBranding.spec.tsx"
  "components/keystatic/DeploymentStatus.spec.tsx"
  "components/content/TableOfContents.spec.tsx"
  "components/content/ImageGallery.spec.tsx"
  "components/content/Callout.spec.tsx"
  "components/content/Button.spec.tsx"
  "components/OptimizedImage.spec.tsx"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi

  # Extract component name from file path
  # e.g., components/keystatic/SparkryBranding.spec.tsx -> SparkryBranding
  component=$(basename "$file" .spec.tsx)
  dir=$(dirname "$file")

  # Check if file has inline imports
  if grep -q "^\s\+import $component from" "$file"; then
    echo "✅ Fixing: $file"

    # Remove all inline import statements for this component
    sed -i.bak "/^\s\+import $component from/d" "$file"

    # Add import at top (after last existing import line)
    # Find last import line number
    last_import_line=$(grep -n "^import.*from" "$file" | tail -1 | cut -d: -f1)

    if [ -n "$last_import_line" ]; then
      # Insert after last import
      sed -i.bak "${last_import_line}a\\
import $component from './$component';" "$file"
    fi

    # Remove backup file
    rm -f "${file}.bak"
  else
    echo "⏭️  No inline imports: $file"
  fi
done

echo ""
echo "✨ Done fixing inline imports"
