# Smoke Test System - Usage Guide

**Version**: 1.0
**Purpose**: Fast production deployment validation
**Script**: `/scripts/smoke-test.sh`

---

## Quick Start

### Basic Usage (Default Domain)

```bash
./scripts/smoke-test.sh
```

Tests `prelaunch.bearlakecamp.com` with default settings (15 parallel workers).

### Test Production Domain

```bash
./scripts/smoke-test.sh www.bearlakecamp.com
```

### Force Retest (Bypass Cache)

```bash
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
```

### Expected Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Smoke Test: prelaunch.bearlakecamp.com
Build: dpl_9FmK3xHq2LpZvN8rW5tQ1yJ6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ / (200, 8402 bytes, "Bear Lake Camp | Christian Summer Camp")
✓ /summer-camp (200, 12763 bytes, "Summer Camp | Bear Lake Camp")
✓ /about (200, 9431 bytes, "About | Bear Lake Camp")
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT: 24/24 tests passed (100%)
Duration: 2 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Log saved: logs/smoke/smoke-20251205-143218-dpl_9FmK3xHq2LpZvN8rW5tQ1yJ6.json
```

---

## CLI Reference

### Syntax

```bash
./scripts/smoke-test.sh [OPTIONS] [DOMAIN]
```

### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `DOMAIN` | `prelaunch.bearlakecamp.com` | Target domain to test |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--help` | Show usage information | - |
| `--force` | Skip cache, always run tests | Off |
| `--sequential` | Run tests one at a time (disable parallelization) | Off |
| `--verbose` | Show detailed debug output | Off |
| `--workers N` | Set parallel worker count (1-50) | 15 |

### Environment Variables

Configure via `.env.local` or shell exports:

| Variable | Description | Default |
|----------|-------------|---------|
| `SMOKE_TEST_WORKERS` | Default worker count | 15 |
| `SMOKE_TEST_TIMEOUT` | Curl timeout (seconds) | 10 |
| `SMOKE_TEST_LOG_DIR` | Log directory path | `logs/smoke` |

**Priority**: CLI flags > Environment variables > Defaults

### Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| `0` | All tests passed | Safe to deploy |
| `1` | One or more tests failed | Review failures, fix issues |
| `2` | Cache hit (build already tested) | Use `--force` to override |

---

## Usage Examples

### 1. Local Development Workflow

**Pre-commit validation**:
```bash
# Test your changes before pushing
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
```

**Post-deploy verification**:
```bash
# Wait 30 seconds for Vercel deployment
sleep 30
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

### 2. Test Production Site

```bash
./scripts/smoke-test.sh www.bearlakecamp.com
```

### 3. Force Retest (Ignore Cache)

```bash
# Useful when debugging fixes
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
```

Cache is bypassed even if build ID matches previous run.

### 4. Sequential Mode (Debugging)

```bash
./scripts/smoke-test.sh --sequential --verbose prelaunch.bearlakecamp.com
```

**Use when**:
- Debugging intermittent failures
- Troubleshooting worker concurrency issues
- Running on resource-constrained systems

### 5. Custom Worker Count

```bash
# Low-resource environment (e.g., CI container)
./scripts/smoke-test.sh --workers 5 prelaunch.bearlakecamp.com

# High-performance (50-page site)
./scripts/smoke-test.sh --workers 30 www.bearlakecamp.com
```

### 6. Verbose Output

```bash
./scripts/smoke-test.sh --verbose --sequential prelaunch.bearlakecamp.com
```

**Shows**:
- Page discovery details
- Build ID detection process
- Cache check logic
- Individual test execution

### 7. Test Multiple Domains

```bash
# Test both prelaunch and production
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
./scripts/smoke-test.sh www.bearlakecamp.com
```

Each domain has separate cache files.

---

## Understanding Output

### Console Output Format

#### Test Results

Each page shows:
```
✓ /page-slug (HTTP_CODE, SIZE bytes, "Page Title")
✗ /page-slug (HTTP_CODE, Error message)
```

**Symbols**:
- `✓` = Test passed (200 OK, ≥500 bytes, has title)
- `✗` = Test failed

#### Summary Section

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT: 23/24 tests passed (95.83%)
Duration: 2 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Metrics**:
- Pass count / Total count
- Pass percentage (100% expected for production)
- Duration in seconds (target: 1-3s for ~24 pages)

#### Failures Detail

```
Failures:
  • /contact — Non-200 HTTP status: 500
    Debug: Server error. Check application logs and server-side rendering for this route.
    URL: https://prelaunch.bearlakecamp.com/contact
    Response: /tmp/smoke-error-contact-1733418738.html
```

**Fields**:
- Page path
- Error summary
- Debug hint (actionable guidance)
- Full URL
- Response dump path (for detailed inspection)

### JSON Log Structure

**Location**: `logs/smoke/smoke-{timestamp}-{buildID}.json`

**Schema**:
```json
{
  "metadata": {
    "timestamp": "2025-12-05T14:32:18Z",
    "domain": "prelaunch.bearlakecamp.com",
    "buildID": "dpl_9FmK3xHq2LpZvN8rW5tQ1yJ6",
    "testCount": 24,
    "passCount": 23,
    "failCount": 1,
    "passPercentage": 95.83,
    "durationSeconds": 2.3,
    "workers": 15
  },
  "results": [
    {
      "page": "/summer-camp",
      "status": 200,
      "result": "pass",
      "url": "https://prelaunch.bearlakecamp.com/summer-camp",
      "contentLength": 12763,
      "title": "Summer Camp | Bear Lake Camp",
      "hasTitle": true
    }
  ],
  "failures": [
    {
      "page": "/contact",
      "status": 500,
      "result": "fail",
      "url": "https://prelaunch.bearlakecamp.com/contact",
      "contentLength": 342,
      "title": "",
      "hasTitle": false,
      "error": "Non-200 HTTP status: 500",
      "debugHint": "Server error. Check application logs and server-side rendering for this route.",
      "fullResponseDump": "/tmp/smoke-error-contact-1733418738.html",
      "headers": "HTTP/2 500 content-type: text/html ...",
      "bodySnippet": "<!DOCTYPE html><html><body>Application error..."
    }
  ],
  "brokenNavigation": []
}
```

**Use Cases**:
- **CI/CD parsing**: Extract pass/fail status
- **AI debugging**: Provide full context to Claude
- **Historical analysis**: Track failure trends
- **Integration**: Feed into monitoring dashboards

### Error Dump Files

**Location**: `/tmp/smoke-error-{page}-{timestamp}.html`

**Contains**:
1. Full HTTP response headers
2. Complete HTML body
3. Saved on any test failure

**Example Usage**:
```bash
# Inspect 500 error response
cat /tmp/smoke-error-contact-1733418738.html
```

### Debug Hints

**Automatically generated based on HTTP status**:

| HTTP Code | Debug Hint |
|-----------|------------|
| `404` | Page not found. Check route configuration and content file existence. |
| `500` | Server error. Check application logs and server-side rendering for this route. |
| `301/302` | Redirect detected. Update navigation to use final destination URL. |
| `000` | Connection failed. Check domain accessibility and network connectivity. |
| `200 (short content)` | Page may be rendering empty or missing content. Check component rendering and data fetching. |
| `200 (no title)` | HTML head is missing title tag. Check layout component and SEO metadata configuration. |

---

## Integration

### Local Development Workflow

**Pre-push checklist**:
```bash
# 1. Run type check
npm run typecheck

# 2. Run tests
npm test

# 3. Smoke test prelaunch
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com

# 4. Push changes
git push
```

### CI/CD Integration (GitHub Actions)

**Example Workflow** (`.github/workflows/smoke-test.yml`):

```yaml
name: Smoke Test Production

on:
  deployment_status:  # After Vercel deployment
  workflow_dispatch:  # Manual trigger

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success'

    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y jq curl
          # Install yq (Go version)
          wget https://github.com/mikefarah/yq/releases/download/v4.35.1/yq_linux_amd64 -O /usr/local/bin/yq
          chmod +x /usr/local/bin/yq

      - name: Run smoke tests
        run: ./scripts/smoke-test.sh prelaunch.bearlakecamp.com

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: smoke-test-logs
          path: logs/smoke/*.json
          retention-days: 30

      - name: Comment on PR (on failure)
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const logDir = 'logs/smoke';
            const files = fs.readdirSync(logDir).sort().reverse();
            const latestLog = JSON.parse(fs.readFileSync(`${logDir}/${files[0]}`));

            const failures = latestLog.failures.map(f =>
              `- ❌ **${f.page}**: ${f.error}\n  ${f.debugHint}\n  [View full response](${f.fullResponseDump})`
            ).join('\n\n');

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🚨 Smoke Test Failed\n\n${failures}`
            });
```

**Trigger Strategies**:
- `deployment_status`: Auto-test after every Vercel deploy
- `workflow_dispatch`: Manual trigger for production DNS cutover
- `schedule` (cron): Daily health check for www.bearlakecamp.com

### Post-Deployment Hook (Local)

**Add to `.git/hooks/post-push`** (optional):
```bash
#!/bin/bash
# Auto-smoke-test after git push

echo "Running post-push smoke test..."
./scripts/smoke-test.sh prelaunch.bearlakecamp.com || {
  echo "⚠️  Smoke test failed! Check output above."
  exit 1
}
```

### Slack/Email Notifications

**Parse JSON output in CI**:
```bash
# Extract pass percentage
PASS_PCT=$(jq -r '.metadata.passPercentage' logs/smoke/smoke-*.json | tail -1)

if (( $(echo "$PASS_PCT < 100" | bc -l) )); then
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🚨 Smoke test failed: ${PASS_PCT}% passed\"}"
fi
```

---

## Troubleshooting

### Common Issues

#### 1. Build ID Detection Fails

**Symptom**:
```
ERROR: Could not detect build ID. No x-vercel-id header found and vercel CLI not available.
```

**Causes**:
- Domain not deployed to Vercel
- Deployment not finished propagating
- DNS not pointing to Vercel

**Solutions**:
```bash
# Check if site is reachable
curl -I https://prelaunch.bearlakecamp.com

# Look for x-vercel-id header
curl -I https://prelaunch.bearlakecamp.com | grep -i x-vercel-id

# Wait for deployment to finish (30-60 seconds)
sleep 60
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

#### 2. Cache Not Working (Always Runs Tests)

**Symptom**: Exit code always 0 or 1, never 2

**Causes**:
- `.cache/smoke/` directory missing
- `jq` not installed
- Cache file permissions

**Solutions**:
```bash
# Check cache directory exists
ls -la .cache/smoke/

# Install jq if missing
brew install jq  # macOS
sudo apt-get install jq  # Ubuntu

# Check cache file
cat .cache/smoke/last-tested-prelaunch.bearlakecamp.com.json

# Clear cache and retry
rm -rf .cache/smoke/*
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

#### 3. Timeout Errors

**Symptom**: Tests hang or fail with connection timeouts

**Causes**:
- Network latency
- Slow serverless cold starts
- High worker count overwhelming server

**Solutions**:
```bash
# Increase timeout (default: 10s)
SMOKE_TEST_TIMEOUT=30 ./scripts/smoke-test.sh prelaunch.bearlakecamp.com

# Reduce worker count
./scripts/smoke-test.sh --workers 5 prelaunch.bearlakecamp.com

# Sequential mode (no parallelization)
./scripts/smoke-test.sh --sequential prelaunch.bearlakecamp.com
```

#### 4. Permission Errors (Cache/Logs)

**Symptom**:
```
mkdir: cannot create directory '.cache/smoke': Permission denied
```

**Causes**:
- Running in restricted directory
- Incorrect file ownership

**Solutions**:
```bash
# Check directory permissions
ls -la .cache/

# Create directories manually
mkdir -p .cache/smoke logs/smoke
chmod 755 .cache/smoke logs/smoke

# Change ownership (if needed)
sudo chown -R $USER:$USER .cache logs
```

#### 5. Invalid JSON in Logs

**Symptom**: `jq` fails to parse log files

**Causes**:
- Parallel execution race condition (P1-5 in implementation)
- Malformed test output

**Solutions**:
```bash
# Run in sequential mode
./scripts/smoke-test.sh --sequential --verbose prelaunch.bearlakecamp.com

# Validate JSON manually
jq . logs/smoke/smoke-*.json

# Check for invalid test results
grep -v '^{' logs/smoke/smoke-*.json
```

#### 6. Broken Navigation Detection False Positives

**Symptom**: Pages flagged as broken but they exist

**Causes**:
- External links in navigation (e.g., `https://...`)
- Slug mismatch between navigation and content file

**Solutions**:
```bash
# Check navigation.yaml structure
yq eval '.menuItems[] | .href' content/navigation/navigation.yaml

# Verify content files exist
ls -1 content/pages/*.mdoc

# Run in verbose mode to see discovery details
./scripts/smoke-test.sh --verbose prelaunch.bearlakecamp.com
```

### Debugging Workflow

**Step 1: Run with verbose + sequential**
```bash
./scripts/smoke-test.sh --verbose --sequential prelaunch.bearlakecamp.com
```

**Step 2: Inspect error dump**
```bash
# Find latest error dump
ls -lt /tmp/smoke-error-* | head -1

# View full response
cat /tmp/smoke-error-contact-*.html
```

**Step 3: Check JSON log**
```bash
# Find latest log
ls -lt logs/smoke/smoke-*.json | head -1

# Pretty-print failures
jq '.failures' logs/smoke/smoke-*.json
```

**Step 4: Manual curl test**
```bash
# Replicate test manually
curl -I https://prelaunch.bearlakecamp.com/contact
curl -s https://prelaunch.bearlakecamp.com/contact > /tmp/manual-test.html
```

---

## Performance

### Parallel vs Sequential Mode

**Benchmark** (24 pages):

| Mode | Workers | Duration | Throughput |
|------|---------|----------|------------|
| Sequential | 1 | 17s | 1.4 pages/s |
| Parallel | 5 | 4s | 6 pages/s |
| Parallel | 15 | 2s | 12 pages/s |
| Parallel | 30 | 1.5s | 16 pages/s |

**Recommendation**: 15 workers (balances speed and resource usage)

### Worker Count Tuning

**Guidelines**:

| Environment | Recommended Workers | Rationale |
|-------------|---------------------|-----------|
| Local dev (macOS) | 15 | Default, fast feedback |
| CI container (2 CPU) | 5-10 | Avoid overwhelming container |
| High-performance CI (8 CPU) | 20-30 | Maximize parallelization |
| Debugging | 1 (sequential) | Isolate issues |

**Tuning command**:
```bash
# Benchmark your environment
for workers in 1 5 10 15 20 30; do
  time ./scripts/smoke-test.sh --workers $workers --force prelaunch.bearlakecamp.com
done
```

### Expected Timings

**Target**: 1-3 seconds for 24 pages (15 workers)

**Breakdown**:
- Page discovery: 0.1s
- Build ID detection: 0.2s
- Parallel tests: 1-2s (depends on network latency)
- JSON generation: 0.1s

**If slower than expected**:
1. Check network latency: `ping prelaunch.bearlakecamp.com`
2. Test single page manually: `time curl -s https://prelaunch.bearlakecamp.com/ > /dev/null`
3. Reduce worker count if overwhelming server

### Scaling Considerations

| Site Size | Pages | Workers | Expected Duration |
|-----------|-------|---------|-------------------|
| Small | <30 | 15 | 1-3s |
| Medium | 30-100 | 20 | 3-7s |
| Large | 100-500 | 30 | 10-20s |

**Cache effectiveness** reduces repeated tests to <1 second (instant exit on build match).

---

## Best Practices

### Development Workflow

1. **Test locally before pushing**:
   ```bash
   ./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
   ```

2. **Use verbose mode for debugging**:
   ```bash
   ./scripts/smoke-test.sh --verbose --sequential prelaunch.bearlakecamp.com
   ```

3. **Review JSON logs for trends**:
   ```bash
   jq '.metadata.passPercentage' logs/smoke/*.json | sort | uniq -c
   ```

### Production Deployment

1. **Wait for Vercel deployment** (30-60s after git push)
2. **Run smoke test** (respects cache, fast on repeated runs)
3. **Verify 100% pass rate** before DNS cutover
4. **Archive logs** for historical tracking

### CI/CD Integration

1. **Trigger on deployment_status** (auto-test after Vercel deploy)
2. **Upload artifacts** (preserve logs for debugging)
3. **Comment on PRs** (surface failures to developers)
4. **Block merges** on smoke test failure

### Monitoring

**Daily production health check**:
```yaml
# .github/workflows/daily-smoke-test.yml
on:
  schedule:
    - cron: '0 12 * * *'  # Noon UTC daily

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/smoke-test.sh www.bearlakecamp.com
```

---

## FAQ

### Q: Why exit code 2 for cache hits?

**A**: Distinguishes "didn't run tests" from "ran and passed". Useful for CI logic:
```bash
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
EXIT_CODE=$?

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "Tests passed"
elif [[ $EXIT_CODE -eq 2 ]]; then
  echo "Cache hit (already tested)"
else
  echo "Tests failed"
  exit 1
fi
```

### Q: How does build ID detection work?

**A**: Extracts `x-vercel-id` header from HTTP response:
```bash
curl -sI https://prelaunch.bearlakecamp.com | grep -i x-vercel-id
```

Falls back to `vercel` CLI if `VERCEL_TOKEN` available.

### Q: What if navigation.yaml and content files are out of sync?

**A**: Smoke test detects this as "broken navigation":
```json
"brokenNavigation": [
  {
    "page": "/old-page",
    "inNavigation": true,
    "inContent": false,
    "issue": "Content file not found for navigation link"
  }
]
```

**Action**: Remove stale links from navigation.yaml or create missing .mdoc files.

### Q: Can I test dynamic routes (e.g., /staff/[slug])?

**A**: Current version only tests static routes. Dynamic routes require:
1. Parsing content to enumerate slugs
2. Adding discovered slugs to test list

**Enhancement**: Add to Phase 2 (see design doc).

### Q: How long are logs retained?

**A**: Logs in `logs/smoke/` are gitignored. Retention depends on your cleanup:
- **Local**: Manual cleanup (`rm -rf logs/smoke/`)
- **CI**: GitHub Actions artifacts (30 days default)

### Q: What validation does the smoke test perform?

**A**: Three checks per page:
1. **HTTP 200** status
2. **Content length** ≥500 bytes
3. **Title tag** exists

Future enhancement: Content matching against .mdoc files.

### Q: Why curl instead of Playwright/Cypress?

**A**: Speed and simplicity:
- **curl**: 1-3 seconds for 24 pages
- **Playwright**: 20-40 seconds + browser setup

Use Playwright for JavaScript interaction testing; smoke tests validate SSR/SSG rendering.

---

## Additional Resources

- **Design Document**: `/docs/technical/SMOKE-TEST-SYSTEM-DESIGN.md`
- **Requirements Lock**: `/requirements/smoke-test-system.lock.md`
- **Implementation**: `/scripts/smoke-test.sh`

**Support**: Open GitHub issue with:
- Command run
- Error output
- JSON log (`logs/smoke/smoke-*.json`)
- Environment (OS, curl/jq/yq versions)

---

**Version History**:
- 1.0 (2025-12-05): Initial release
