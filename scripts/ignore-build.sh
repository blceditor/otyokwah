#!/bin/bash
# Vercel Ignored Build Step
# Exit 0 = skip build, Exit 1 = proceed with build
# Skips only when every file changed since the last successful deployment is
# under content/ (ISR webhook handles content updates). Builds whenever the
# changed files cannot be determined.

build() {
  echo "::  $1 — proceeding with build"
  exit 1
}

is_sha() {
  [[ "$1" =~ ^[0-9a-f]{40}$ ]]
}

has_commit() {
  git cat-file -e "$1^{commit}" 2>/dev/null
}

PREVIOUS_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"
CURRENT_SHA="${VERCEL_GIT_COMMIT_SHA:-}"

echo "::  Ignore Build Step — checking changed files..."

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || build "Not a git work tree"
is_sha "$PREVIOUS_SHA" || build "VERCEL_GIT_PREVIOUS_SHA is unset or not a commit sha (first deploy)"
is_sha "$CURRENT_SHA" || build "VERCEL_GIT_COMMIT_SHA is unset or not a commit sha"

if ! has_commit "$PREVIOUS_SHA"; then
  echo "::  Previous deployment $PREVIOUS_SHA is not in the clone — fetching it"
  GIT_TERMINAL_PROMPT=0 git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=20 \
    fetch --quiet --depth=1 origin "$PREVIOUS_SHA" 2>/dev/null
  has_commit "$PREVIOUS_SHA" || build "Previous deployment $PREVIOUS_SHA could not be fetched"
fi

CHANGED_FILES=$(git diff --name-only --no-renames "$PREVIOUS_SHA" "$CURRENT_SHA" 2>/dev/null) ||
  build "Cannot diff $PREVIOUS_SHA..$CURRENT_SHA"
[ -n "$CHANGED_FILES" ] || build "No changed files in $PREVIOUS_SHA..$CURRENT_SHA"

set -f
IFS=$'\n'
for file in $CHANGED_FILES; do
  [[ "$file" == content/* ]] || build "Non-content file changed: $file"
done

echo "::  All changes in $PREVIOUS_SHA..$CURRENT_SHA are content-only — skipping build (ISR webhook handles updates)"
exit 0
