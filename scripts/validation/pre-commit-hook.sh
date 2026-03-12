#!/bin/bash
# Pre-commit hook for running validation on staged files
# Install: ln -sf ../../scripts/validation/pre-commit-hook.sh .git/hooks/pre-commit

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running pre-commit validation...${NC}"

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}No staged files to validate${NC}"
    exit 0
fi

# Check if TypeScript files changed
TS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx)$' || true)

if [ -n "$TS_FILES" ]; then
    echo -e "${YELLOW}Running TypeScript check...${NC}"
    npm run typecheck || {
        echo -e "${RED}TypeScript check failed${NC}"
        exit 1
    }
fi

# Check if JS/TS files changed
JS_TS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(js|jsx|ts|tsx)$' || true)

if [ -n "$JS_TS_FILES" ]; then
    echo -e "${YELLOW}Running ESLint...${NC}"
    npm run lint || {
        echo -e "${RED}ESLint check failed${NC}"
        exit 1
    }
fi

# Run incremental validation with Python validators
echo -e "${YELLOW}Running validators on changed files...${NC}"

# Create temp file for results
RESULTS_FILE=$(mktemp)

python3 scripts/validation/validator_runner.py . --incremental --json > "$RESULTS_FILE" 2>&1 || true

# Check results
FAILED=$(python3 -c "import json; print(json.load(open('$RESULTS_FILE')).get('failed', 0))" 2>/dev/null || echo "0")

if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Validation failed with $FAILED issues${NC}"
    echo ""
    python3 scripts/validation/report_aggregator.py "$RESULTS_FILE" --format markdown 2>/dev/null || cat "$RESULTS_FILE"
    rm -f "$RESULTS_FILE"
    exit 1
fi

rm -f "$RESULTS_FILE"

echo -e "${GREEN}Pre-commit validation passed!${NC}"
exit 0
