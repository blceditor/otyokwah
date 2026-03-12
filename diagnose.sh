#!/bin/bash
# Diagnostic script for Bear Lake Camp deployment issues
# Run this to quickly gather all relevant information

set -e

echo "=========================================="
echo "Bear Lake Camp Deployment Diagnostics"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "ERROR: Not in project directory. Please cd to bearlakecamp-nextjs first."
    exit 1
fi

echo "1. Vercel Account Info"
echo "----------------------"
npx vercel whoami
echo ""

echo "2. Vercel Projects List"
echo "----------------------"
npx vercel projects ls
echo ""

echo "3. Domain Assignments"
echo "----------------------"
npx vercel domains ls
echo ""

echo "4. Environment Variables (Current Project)"
echo "----------------------"
npx vercel env ls
echo ""

echo "5. Recent Deployments"
echo "----------------------"
npx vercel ls | head -20
echo ""

echo "6. Latest Deployment Details"
echo "----------------------"
echo "Fetching info for prelaunch.bearlakecamp.com..."
npx vercel inspect prelaunch.bearlakecamp.com 2>&1 || echo "Could not inspect prelaunch.bearlakecamp.com"
echo ""

echo "7. Local Environment Variables"
echo "----------------------"
if [ -f ".env.local" ]; then
    echo "Checking .env.local for required variables..."
    grep -E "KEYSTATIC_|GITHUB_" .env.local | sed 's/=.*/=***REDACTED***/'
else
    echo "WARNING: .env.local not found"
fi
echo ""

echo "8. Production Environment Variables"
echo "----------------------"
echo "Pulling production environment variables..."
npx vercel env pull .env.production.tmp --environment production 2>&1

if [ -f ".env.production.tmp" ]; then
    echo "Checking production env vars for required variables..."
    grep -E "KEYSTATIC_|GITHUB_" .env.production.tmp | sed 's/=.*/=***REDACTED***/'
    rm .env.production.tmp
else
    echo "WARNING: Could not pull production environment variables"
fi
echo ""

echo "9. Keystatic Configuration"
echo "----------------------"
if [ -f "keystatic.config.ts" ]; then
    echo "Storage configuration logic:"
    grep -A 20 "function getStorageConfig" keystatic.config.ts
else
    echo "WARNING: keystatic.config.ts not found"
fi
echo ""

echo "10. Git Status"
echo "----------------------"
git status --short
echo ""
git log -1 --oneline
echo ""

echo "=========================================="
echo "Diagnostics Complete"
echo "=========================================="
echo ""
echo "NEXT STEPS:"
echo "1. Review the output above"
echo "2. Check if multiple Vercel projects exist (section 2)"
echo "3. Verify domain is assigned to 'bearlakecamp' project (section 3)"
echo "4. Confirm all KEYSTATIC_* variables exist in Production (section 8)"
echo ""
echo "MOST LIKELY FIX:"
echo "Visit: https://github.com/settings/apps/bearlakecamp-cms"
echo "Verify callback URL includes: https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback"
echo ""
echo "See EXECUTIVE-SUMMARY.md for detailed analysis and next steps."
