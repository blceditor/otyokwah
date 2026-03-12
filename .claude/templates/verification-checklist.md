# Verification Checklist

> **REQ-VERIFY-002**: QVERIFY verification gate template
> Fill in all fields before marking feature as complete.

## Feature Information

- **Feature**: {{FEATURE_NAME}}
- **Commit SHA**: {{COMMIT_SHA}}
- **Date**: {{DATE}}
- **Developer**: {{DEVELOPER}}

---

## 1. Deployment Status

- [ ] Vercel deployment completed successfully
- [ ] Build logs show no errors
- [ ] Deployment URL accessible: {{PRODUCTION_URL}}

**Vercel Build ID**: {{VERCEL_BUILD_ID}}

**Deployment Status**: __DEPLOYMENT_STATUS__

---

## 2. Smoke Test Results

- [ ] `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com` executed
- [ ] All page routes return HTTP 200
- [ ] Homepage visual elements validated
- [ ] Keystatic admin routes accessible

**Smoke Test Exit Code**: __SMOKE_EXIT_CODE__

**Test Results Summary**:
```
Pass: __PASS_COUNT__ / __TOTAL_COUNT__
Failures: __FAIL_COUNT__
```

**Log File**: {{LOG_FILE_PATH}}

---

## 3. Screenshot Proof

> **Instructions**: Capture screenshots of the feature in production using browser DevTools or screenshot tool. Save to `verification-screenshots/` directory.

### How to Capture Screenshots

1. Open production URL in browser
2. Navigate to the affected feature/page
3. Use browser DevTools (F12) → More Tools → Screenshot
4. Or use macOS: `Cmd+Shift+4` to capture region
5. Save with naming convention: `{{COMMIT_SHA}}-{{FEATURE}}-screenshot.png`

### Required Screenshots

- [ ] **Before State** (if applicable)
  - Path: {{SCREENSHOT_PATH_BEFORE}}
  - Description: __BEFORE_DESCRIPTION__

- [ ] **After State** (feature implemented)
  - Path: {{SCREENSHOT_PATH_AFTER}}
  - Description: __AFTER_DESCRIPTION__

- [ ] **Keystatic Admin** (if CMS-related)
  - Path: {{SCREENSHOT_PATH_ADMIN}}
  - Description: __ADMIN_DESCRIPTION__

**Screenshot Directory**: `verification-screenshots/`

---

## 4. Manual Verification Checklist

> Visually confirm each item works as expected in production.

### Functionality

- [ ] Feature behaves as specified in requirements
- [ ] No JavaScript console errors
- [ ] No network request failures (check DevTools Network tab)
- [ ] Loading states work correctly
- [ ] Error states handle gracefully

### Visual Confirmation

- [ ] Layout renders correctly on desktop (1920x1080)
- [ ] Layout renders correctly on mobile (375x667)
- [ ] Colors/fonts match design system
- [ ] Images load without broken links
- [ ] Animations/transitions work smoothly

### Keystatic Admin (if applicable)

- [ ] Admin UI accessible at `/keystatic`
- [ ] PageEditingToolbar visible when editing pages
- [ ] DeploymentStatus component shows correct status
- [ ] CMS fields render and save correctly
- [ ] Preview functionality works

### Cross-Browser (if critical feature)

- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iOS)

---

## 5. Sign-Off

**Human Verification Completed**: [ ] Yes / [ ] No

**Notes/Issues Found**:
```
__VERIFICATION_NOTES__
```

**Verified By**: {{VERIFIER_NAME}}
**Verification Date**: {{VERIFICATION_DATE}}

---

## Checklist Summary

| Category | Status |
|----------|--------|
| Deployment | __STATUS_DEPLOY__ |
| Smoke Tests | __STATUS_SMOKE__ |
| Screenshots | __STATUS_SCREENSHOTS__ |
| Manual Check | __STATUS_MANUAL__ |
| **Overall** | __STATUS_OVERALL__ |

---

*Template Version: 1.0.0*
*Last Updated: 2025-12-11*
