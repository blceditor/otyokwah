#!/bin/bash
# Pre-push validation gate
# Blocks pushes to main, validates before staging pushes
# Bypass: SKIP_PREPUSH_VALIDATE=1 git push origin staging

remote="$1"

# Read push refs from stdin
while read local_ref local_sha remote_ref remote_sha; do
  # Block direct pushes to main
  if echo "$remote_ref" | grep -q "refs/heads/main"; then
    echo ""
    echo "BLOCKED: Direct push to main is not allowed."
    echo ""
    echo "  Workflow: staging -> PR -> main"
    echo ""
    echo "  To push to staging:  git push origin staging"
    echo "  To create a PR:      gh pr create --base main --head staging"
    echo ""
    echo "  If you really need to bypass: git push --no-verify origin main"
    echo ""
    exit 1
  fi

  # Validate before staging pushes
  if echo "$remote_ref" | grep -q "refs/heads/staging"; then
    if [ "$SKIP_PREPUSH_VALIDATE" = "1" ]; then
      echo "Pre-push validation SKIPPED (SKIP_PREPUSH_VALIDATE=1)"
      exit 0
    fi

    echo ""
    echo "Running pre-push validations..."
    echo ""

    echo "1/3 TypeScript check..."
    if ! pnpm typecheck; then
      echo ""
      echo "BLOCKED: TypeScript check failed. Fix type errors before pushing."
      echo "  Bypass: SKIP_PREPUSH_VALIDATE=1 git push origin staging"
      echo ""
      exit 1
    fi

    echo ""
    echo "2/3 ESLint..."
    if ! pnpm lint; then
      echo ""
      echo "BLOCKED: Lint check failed. Fix lint errors before pushing."
      echo "  Bypass: SKIP_PREPUSH_VALIDATE=1 git push origin staging"
      echo ""
      exit 1
    fi

    echo ""
    echo "3/3 Tests..."
    if ! pnpm test; then
      echo ""
      echo "BLOCKED: Tests failed. Fix failing tests before pushing."
      echo "  Bypass: SKIP_PREPUSH_VALIDATE=1 git push origin staging"
      echo ""
      exit 1
    fi

    echo ""
    echo "All validations passed. Pushing..."
    echo ""
  fi
done

exit 0
