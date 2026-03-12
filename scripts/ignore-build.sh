#!/bin/bash
# Vercel Ignored Build Step
# Exit 0 = skip build, Exit 1 = proceed with build
# Skips builds when only content/ files changed (ISR webhook handles content updates)

echo "::  Ignore Build Step — checking changed files..."

# Always build if git diff fails (first deploy, shallow clone issues, etc.)
CHANGED_FILES=$(git diff HEAD^ HEAD --name-only 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$CHANGED_FILES" ]; then
  echo "::  Cannot determine changed files — proceeding with build"
  exit 1
fi

echo "::  Changed files:"
echo "$CHANGED_FILES" | sed 's/^/     /'

# Check each changed file
NEEDS_BUILD=false
while IFS= read -r file; do
  case "$file" in
    content/*)
      # Content files — ISR webhook handles these
      ;;
    *)
      # Any non-content file (including public/) requires a build
      NEEDS_BUILD=true
      echo "::  Non-content file changed: $file — build required"
      break
      ;;
  esac
done <<< "$CHANGED_FILES"

if [ "$NEEDS_BUILD" = true ]; then
  echo "::  Proceeding with build"
  exit 1
else
  echo "::  All changes are content-only — skipping build (ISR webhook handles updates)"
  exit 0
fi
