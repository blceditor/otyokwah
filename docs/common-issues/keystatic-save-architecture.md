# Keystatic Save Architecture: Multi-Layer Defense Design

> **Status**: Design complete — 2026-02-20
> **Problem**: Keystatic's GraphQL save mutation fails with "A path was requested for deletion which does not exist" when cached tree data is stale relative to actual GitHub HEAD.
> **Design Goal**: Multi-layer defense at fetch intercept, cache freshness check, and error recovery layers.

---

## Root Cause Summary

Keystatic's save pipeline (line ~1920-2087 in `keystatic-core-ui.js`) works as follows:

```
1. Load unscopedTree from IDB cache (useCurrentUnscopedTree)
2. Build initialFiles = list of files that were present when entry was LOADED
3. Build additions = new/changed file blobs
4. Compute filesToDelete = initialFiles - additions (files to remove)
5. Send GraphQL mutation: createCommitOnBranch(additions, deletions)
```

**Stale cache failure mode**: If GitHub HEAD has changed since the IDB cache was populated (e.g., another editor saved, or a git push deleted/renamed files), `filesToDelete` will contain paths that no longer exist in GitHub. The mutation fails:

```
[GraphQL] A path was requested for deletion which does not exist as of commit oid <sha>
```

**Image path concatenation failure mode** (documented separately in `keystatic-save-issues.md`): `fields.image()` stores filename only; Keystatic prepends `directory/{slug}/` on save. If the stored value was a full path (e.g., `/images/summer-program/photo.jpg`), it gets concatenated to `public/images/{slug}/mages/summer-program/photo.jpg` — a nonsense path that triggers the same deletion error.

Both failure modes produce identical GraphQL errors but require different fixes.

---

## Architecture: Three Defense Layers

### Layer 1 — Fetch Interceptor (Client-Side Mutation Guard)

**Approach**: Wrap `window.fetch` in `IDB_TIMEOUT_SCRIPT` (already injected via `app/keystatic/layout.tsx`) to intercept GitHub GraphQL mutations before they're sent. Validate the `deletions` array against a freshly fetched tree SHA to strip nonexistent paths.

**Implementation sketch** (add to `IDB_TIMEOUT_SCRIPT`):

```javascript
(function() {
  var origFetch = window.fetch;

  // Cache the latest known good GitHub tree SHA
  // Set by our cache-freshness layer (Layer 2) when it syncs
  window.__ksTreeSha = null;

  window.fetch = function(url, opts) {
    // Only intercept GitHub GraphQL
    if (typeof url === 'string' && url.includes('api.github.com/graphql') && opts && opts.body) {
      try {
        var body = JSON.parse(opts.body);
        var deletions = body &&
          body.variables &&
          body.variables.input &&
          body.variables.input.fileChanges &&
          body.variables.input.fileChanges.deletions;

        if (Array.isArray(deletions) && deletions.length > 0) {
          // If we have a known-good tree from Layer 2, validate against it
          if (window.__ksValidPaths) {
            var filtered = deletions.filter(function(d) {
              return window.__ksValidPaths.has(d.path);
            });
            if (filtered.length !== deletions.length) {
              var removed = deletions.length - filtered.length;
              console.warn('[KS-Guard] Stripped ' + removed + ' stale deletion path(s) from GraphQL mutation');
              body.variables.input.fileChanges.deletions = filtered;
              opts = Object.assign({}, opts, { body: JSON.stringify(body) });
            }
          }

          // Log all deletions for debugging
          console.log('[KS-Guard] GraphQL deletions:', deletions.map(function(d) { return d.path; }));
        }
      } catch (e) {
        console.warn('[KS-Guard] Could not inspect GraphQL body:', e);
      }
    }
    return origFetch.call(this, url, opts);
  };
})();
```

**SP estimate**: 1 SP
**Risk**: Low. Only strips paths that don't exist in the current tree. No-op if `__ksValidPaths` is unset. Worst case: stale path goes through and fails as before.
**Classification**: **Mitigation** — prevents known stale paths from reaching GitHub, but requires Layer 2 to populate `__ksValidPaths`.
**Limitation**: Can't filter if `__ksValidPaths` is unpopulated. Intercept must execute before Keystatic's own fetch calls.

---

### Layer 2 — Cache Freshness Check (Tree SHA Comparison)

**Approach**: Before any save attempt, compare the IDB-cached tree SHA against the actual GitHub HEAD SHA. If they diverge, fetch the fresh tree and invalidate/update the local cache. Populate `window.__ksValidPaths` with the actual file set.

**Where to hook**: The `IDB_TIMEOUT_SCRIPT` already runs before Keystatic's JS. We can extend it to poll GitHub's refs API (unauthenticated rate: 60/hr, authenticated: 5000/hr — our OAuth token is in the cookie) every 60 seconds and on page focus.

**Implementation sketch**:

```javascript
(function() {
  var POLL_INTERVAL_MS = 60000;
  var repoOwner = null;
  var repoName = null;

  // Extract repo info from the current URL path: /keystatic/...
  // Keystatic also stores this in localStorage under 'keystatic-repo'
  function getRepoInfo() {
    try {
      var stored = localStorage.getItem('keystatic-repo');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return null;
  }

  function getGitHubToken() {
    // Read from cookie
    var match = document.cookie.match(/keystatic-gh-access-token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  async function fetchCurrentHeadSha(owner, repo, branch) {
    var token = getGitHubToken();
    if (!token) return null;
    try {
      var res = await origFetch('https://api.github.com/repos/' + owner + '/' + repo + '/git/refs/heads/' + branch, {
        headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) return null;
      var data = await res.json();
      return data.object && data.object.sha;
    } catch(e) { return null; }
  }

  async function fetchAllTreePaths(owner, repo, sha) {
    var token = getGitHubToken();
    if (!token) return null;
    try {
      var res = await origFetch('https://api.github.com/repos/' + owner + '/' + repo + '/git/trees/' + sha + '?recursive=1', {
        headers: { 'Authorization': 'token ' + token }
      });
      if (!res.ok) return null;
      var data = await res.json();
      var paths = new Set();
      (data.tree || []).forEach(function(item) { paths.add(item.path); });
      window.__ksValidPaths = paths;
      window.__ksTreeSha = sha;
      console.log('[KS-Freshness] Tree updated: ' + paths.size + ' paths at SHA ' + sha.slice(0,7));
      return paths;
    } catch(e) { return null; }
  }

  async function syncTreeFreshness() {
    var info = getRepoInfo();
    if (!info) return;
    var sha = await fetchCurrentHeadSha(info.owner, info.name, info.branch || 'main');
    if (sha && sha !== window.__ksTreeSha) {
      console.warn('[KS-Freshness] Tree SHA changed ' + (window.__ksTreeSha || 'unknown') + ' → ' + sha.slice(0,7) + '. Fetching fresh tree.');
      await fetchAllTreePaths(info.owner, info.name, sha);
    }
  }

  // Initial sync + polling
  setTimeout(syncTreeFreshness, 2000); // After page load
  setInterval(syncTreeFreshness, POLL_INTERVAL_MS);
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') syncTreeFreshness();
  });
  window.addEventListener('focus', syncTreeFreshness);
})();
```

**SP estimate**: 3 SP
**Risk**: Medium. Requires extracting repo info from localStorage (Keystatic stores it there, but format could change). GitHub REST API `?recursive=1` is limited to 100,000 nodes — fine for this repo. Additional REST calls add latency. Token availability not guaranteed (HttpOnly cookies not readable from JS — need to check actual cookie accessibility for `keystatic-gh-access-token`).

> **Token note**: Per MEMORY.md, `keystatic-gh-access-token` is set with `path: '/'` but may be HttpOnly. If HttpOnly, we cannot read it from JS and Layer 2 cannot call the GitHub API directly. **This is a critical blocker for this approach.** Alternative: proxy through our own API endpoint `/api/keystatic/tree-sha` that reads the cookie server-side.

**Classification**: **Permanent fix** if token is accessible; **requires API proxy** if HttpOnly.
**Alternative if HttpOnly**: Add a `/api/keystatic/current-sha` route that forwards to GitHub using server-side cookie access, returns `{sha, paths[]}`.

---

### Layer 3 — Error Recovery (Auto-Retry with Cache Invalidation)

**Approach**: Keystatic already handles `STALE_DATA` errors by refetching from GitHub and retrying (lines 2008-2031). The deletion-nonexistent error (`"A path was requested for deletion which does not exist"`) is NOT currently handled — it falls through to `throw result.error`.

We cannot monkey-patch the Keystatic React internals without significant risk. Instead, we intercept the **fetch response** for the GitHub GraphQL endpoint and transform `deletion does not exist` errors into a response that Keystatic can handle, or catch + retry with sanitized deletions.

**Implementation sketch** (extend the fetch interceptor from Layer 1):

```javascript
window.fetch = function(url, opts) {
  var promise = origFetch.call(this, url, opts);

  if (typeof url === 'string' && url.includes('api.github.com/graphql')) {
    return promise.then(function(response) {
      // Clone to allow re-reading
      return response.clone().json().then(function(data) {
        var errors = data && data.errors;
        if (!errors) return response; // No errors, pass through

        var deletionError = errors.find(function(e) {
          return e.message && e.message.includes('path was requested for deletion which does not exist');
        });

        if (deletionError) {
          console.warn('[KS-Recovery] Deletion error detected. Clearing stale IDB cache and retrying...');

          // Invalidate our path cache to force re-sync
          window.__ksValidPaths = null;
          window.__ksTreeSha = null;

          // Clear Keystatic's IDB caches to force fresh tree load
          var dbsToDelete = ['keystatic', 'keystatic-blobs', 'keystatic-trees'];
          dbsToDelete.forEach(function(dbName) {
            try { indexedDB.deleteDatabase(dbName); } catch(e) {}
          });

          // Re-try the mutation with deletions stripped
          // Parse the original request body to remove deletions
          try {
            var body = JSON.parse(opts.body);
            if (body.variables && body.variables.input && body.variables.input.fileChanges) {
              body.variables.input.fileChanges.deletions = [];
              console.warn('[KS-Recovery] Retrying mutation with deletions removed.');
              return origFetch.call(this, url, Object.assign({}, opts, { body: JSON.stringify(body) }));
            }
          } catch(e) {}
        }

        return response;
      }).catch(function() { return response; });
    });
  }
  return promise;
};
```

**SP estimate**: 2 SP
**Risk**: Medium-High. Stripping all deletions on retry means files that SHOULD be deleted won't be. This is safe for our use case (we'd rather leave orphaned files than fail the save), but the CMS operator will accumulate orphaned files over time. The IDB clear also invalidates all cached blobs, causing slower next load.
**Classification**: **Mitigation** — prevents save failure on error, but leaves orphaned files. Acceptable tradeoff for editor UX.

---

### Schema Fix — Convert `fields.image()` to `fields.text()`

**Scope** (from current audit of `pages.ts`):

These `fields.image()` usages are inside **Markdoc component schemas** (embedded in body content), not collection-level fields. Per the docs in `keystatic-save-issues.md`, these are generally **safe** because they're for new uploads only, not existing content paths.

| Location | Field | Status | Action |
|----------|-------|--------|--------|
| `pages.hero.heroImage` | `fields.image()` | **ALREADY converted to text** (per docs) | None |
| `pages.seo.ogImage` | `fields.image()` | Safe (new uploads only, singleton-like) | Monitor |
| `pages.program.galleryImages[].image` | `fields.image()` | **Markdoc component** — safe | Monitor |
| `pages.facility.galleryImages[].image` | `fields.image()` | **Markdoc component** — safe | Monitor |
| `pages.staff.galleryImages[].image` | `fields.image()` | **Markdoc component** — safe | Monitor |
| `pages.body.valueCards.cards[].image` | `fields.image()` | **Markdoc component** — safe | Monitor |
| `pages.body.positionCards.positions[].image` | `fields.image()` | **Markdoc component** — safe | Monitor |
| `pages.body.imageSection.image` | `fields.image()` | **Markdoc component** — safe | Monitor |
| `pages.body.gridSquare.image` | `fields.image()` | **Markdoc component** — safe | Monitor |

**Critical finding**: The current `pages.ts` still shows `fields.image()` at `pages.hero.heroImage` (line 33) and `pages.seo.ogImage` (line 104). Per `keystatic-save-issues.md` these were supposed to have been converted in commit `96b44b1`. Either the conversion was not complete, or the docs are ahead of the code.

**Recommended schema changes**:
- `pages.hero.heroImage` → convert to `fields.text()` if not already done (verify current content)
- `pages.seo.ogImage` → leave as `fields.image()` (only new uploads, no existing content)
- All Markdoc body component image fields → leave as `fields.image()` (safe)
- Check `staff.photo`, `homepage.heroImages`, and `mission.backgroundImage` in their respective collection files

**SP estimate**: 1 SP
**Risk**: Low. Text fields never generate deletion paths. Downside: lose image picker UI; editors must type paths manually (or rely on MediaFieldEnhancer).

---

## Recommended Implementation Priority

| Layer | Approach | SP | Risk | Type |
|-------|----------|----|------|------|
| Schema fix | Convert remaining `fields.image()` in collections to `fields.text()` | 1 | Low | Permanent fix |
| Layer 3 | Fetch interceptor: error recovery + retry without deletions | 2 | Medium | Mitigation |
| Layer 1 | Fetch interceptor: pre-validate deletions against known paths | 1 | Low | Mitigation |
| Layer 2 (proxy) | `/api/keystatic/current-sha` endpoint + client-side freshness sync | 3 | Medium | Permanent fix |
| Layer 2 (direct) | Direct GitHub API calls if token is JS-accessible | 3 | Medium | Permanent fix |

**Minimum viable fix** (2 SP): Schema fix + Layer 3 error recovery. Catches the error, strips bad deletions, retries. User saves succeed; orphaned files accumulate but are benign.

**Full defense** (7 SP): All layers. Proactive validation before mutation + reactive recovery after failure. Near-zero chance of user-visible errors.

---

## Open Questions for Team Lead

1. **Is `keystatic-gh-access-token` HttpOnly?** If yes, Layer 2 direct API calls are impossible from JS. We need the proxy endpoint. Check with: `document.cookie.includes('keystatic-gh-access-token')` in browser console.

2. **What does Keystatic store in localStorage for repo info?** Run `Object.keys(localStorage).filter(k => k.includes('keystatic'))` to identify the key(s). Layer 2 needs this to know `owner/repo/branch`.

3. **Should we prefer orphaned files (Layer 3 approach) or a hard retry loop?** Layer 3 strips deletions on retry, which means images previously replaced in the CMS may linger as orphans in the repo. Acceptable?

4. **Which `fields.image()` fields in the current `pages.ts` are NOT yet converted?** Task #3 audit will clarify this.

---

## Key Architectural Insight

The fundamental issue is that **Keystatic's delete list is computed from `initialFiles` captured at page-load time**, not from a live GitHub tree query. Any divergence between the IDB cache (which `initialFiles` is built from) and actual GitHub state causes this error.

The IDB timeout fix in `layout.tsx` already handles the "IDB hangs" scenario. This new layer handles the "IDB is alive but stale" scenario — a different failure mode that the current code doesn't address.

The cleanest long-term fix is Layer 2 (cache freshness check) which ensures the IDB is always current before a save. But it requires API access (the proxy endpoint) and has complexity. Layer 3 (error recovery) is simpler and handles the failure gracefully at the cost of potential orphaned files.

**Recommended delivery order**: Schema fix → Layer 3 → Layer 2 proxy.
