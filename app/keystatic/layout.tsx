import KeystaticToolsHeader from "@/components/keystatic/KeystaticToolsHeader";
import PageEditingToolbar from "@/components/keystatic/PageEditingToolbar";
import { SEOFieldsetEnhancer } from "@/components/keystatic/SEOFieldsetEnhancer";
import { HeroFieldsetEnhancer } from "@/components/keystatic/HeroFieldsetEnhancer";
import { ThemeProvider } from "@/components/keystatic/ThemeProvider";
import { MediaFieldEnhancer } from "@/components/keystatic/MediaFieldEnhancer";
import { RepoAccessErrorBanner } from "@/components/keystatic/RepoAccessErrorBanner";
import { ContentCleanupEnhancer } from "@/components/keystatic/ContentCleanupEnhancer";
import Script from "next/script";

// REQ-CMS-018: Dark mode CSS overrides for Keystatic internals
import "./keystatic-dark.css";

// IndexedDB timeout fix: Keystatic uses idb-keyval which calls indexedDB.open()
// without any timeout. If Chrome's IDB backend is locked (e.g., from stuck
// operations across multiple tabs), open() hangs forever and Keystatic shows
// an infinite "Loading Entries" spinner. This script adds a 3-second timeout
// that rejects hung open() calls so Keystatic can show an error instead of
// hanging forever.
const IDB_TIMEOUT_SCRIPT = `
(function() {
  var origOpen = indexedDB.open.bind(indexedDB);
  var TIMEOUT_MS = 3000;

  // Shared fake request/store/db factory — used by both timeout fallback
  // and stale-schema fallback so Keystatic falls through to REST API.
  function fakeReq(result) {
    var r = { result: result, error: null, readyState: 'done' };
    var fns = {};
    Object.defineProperty(r, 'onsuccess', {
      get: function() { return fns.s; },
      set: function(fn) { fns.s = fn; if (fn) Promise.resolve().then(function() { fn({target: r}); }); },
      configurable: true
    });
    Object.defineProperty(r, 'oncomplete', {
      set: function() {}, configurable: true
    });
    Object.defineProperty(r, 'onerror', {
      set: function(fn) { fns.e = fn; }, get: function() { return fns.e; }, configurable: true
    });
    Object.defineProperty(r, 'onabort', { set: function() {}, configurable: true });
    r.addEventListener = function() {};
    r.removeEventListener = function() {};
    r.dispatchEvent = function() { return true; };
    return r;
  }

  function makeFakeStore() {
    var store = {
      getAll: function() { return fakeReq([]); },
      getAllKeys: function() { return fakeReq([]); },
      get: function() { return fakeReq(undefined); },
      put: function() { return fakeReq(undefined); },
      delete: function() { return fakeReq(undefined); },
      clear: function() { return fakeReq(undefined); },
      count: function() { return fakeReq(0); },
      get transaction() { return fakeReq(undefined); }
    };
    return store;
  }

  var fakeStore = makeFakeStore();

  // Wraps a real IDBDatabase.transaction() to catch "object store not found"
  // errors from stale schemas. Instead of silently returning fake stores
  // (which breaks the save pipeline), we nuke the corrupted DBs and reload
  // so Keystatic can recreate them with proper schema.
  var alreadyResetting = false;
  function wrapDbTransaction(db) {
    var origTx = db.transaction.bind(db);
    db.transaction = function(storeNames, mode) {
      try {
        return origTx(storeNames, mode);
      } catch(e) {
        if (alreadyResetting) {
          return { objectStore: function() { return makeFakeStore(); } };
        }
        alreadyResetting = true;
        console.warn('[IDB-Fix] Stale schema detected — nuking corrupted DBs and reloading');
        db.close();
        var dbNames = ['keystatic', 'keystatic-blobs', 'keystatic-trees'];
        var done = 0;
        dbNames.forEach(function(name) {
          var req = origDelete(name);
          req.onsuccess = req.onerror = req.onblocked = function() {
            done++;
            if (done >= dbNames.length) {
              console.warn('[IDB-Fix] DBs cleared, reloading...');
              location.reload();
            }
          };
        });
        // Safety: reload after 3s even if delete callbacks don't fire
        setTimeout(function() { location.reload(); }, 3000);
        return { objectStore: function() { return makeFakeStore(); } };
      }
    };
  }

  indexedDB.open = function(name, version) {
    var req = version !== undefined ? origOpen(name, version) : origOpen(name);
    var settled = false;

    // When the real DB opens, wrap its transaction() to handle stale schemas
    req.addEventListener('success', function() {
      settled = true;
      try {
        var db = req.result;
        if (db && typeof db.transaction === 'function') {
          wrapDbTransaction(db);
        }
      } catch(e) {
        console.warn('[IDB-Fix] Could not wrap transaction on opened DB:', e);
      }
    });
    req.addEventListener('error', function() { settled = true; });
    req.addEventListener('blocked', function() { settled = true; });
    req.addEventListener('upgradeneeded', function() { settled = true; });

    setTimeout(function() {
      if (!settled) {
        settled = true;
        console.warn('[IDB-Fix] indexedDB.open timed out after ' + TIMEOUT_MS + 'ms for: ' + name + '. Using in-memory fallback.');

        var fakeDb = {
          transaction: function() { return { objectStore: function() { return fakeStore; } }; },
          close: function() {},
          createObjectStore: function() { return fakeStore; },
          objectStoreNames: { contains: function() { return true; }, length: 1 }
        };

        try {
          Object.defineProperty(req, 'result', { value: fakeDb, configurable: true });
        } catch(e) {
          console.warn('[IDB-Fix] Cannot set fake result, falling back to error:', e);
        }

        // Fire onsuccess with fake DB, or onerror as fallback
        if (typeof req.onsuccess === 'function') {
          try { req.onsuccess({target: req}); return; } catch(e) {}
        }
        if (typeof req.onerror === 'function') {
          try {
            Object.defineProperty(req, 'error', {
              value: new DOMException('IndexedDB timed out', 'TimeoutError'),
              configurable: true
            });
          } catch(e) {}
          req.onerror(new Event('error'));
        }
      }
    }, TIMEOUT_MS);

    return req;
  };

  var origDelete = indexedDB.deleteDatabase.bind(indexedDB);
  indexedDB.deleteDatabase = function(name) {
    var req = origDelete(name);
    var settled = false;

    req.addEventListener('success', function() { settled = true; });
    req.addEventListener('error', function() { settled = true; });
    req.addEventListener('blocked', function() { settled = true; });

    setTimeout(function() {
      if (!settled) {
        settled = true;
        console.warn('[IDB-Fix] deleteDatabase timed out for: ' + name);
        if (typeof req.onsuccess === 'function') {
          req.onsuccess(new Event('success'));
        }
      }
    }, TIMEOUT_MS);

    return req;
  };

  // Listen for nuclear reset from other tabs — navigate away to release IDB connections
  try {
    var bc = new BroadcastChannel('keystatic-reset');
    bc.onmessage = function(e) {
      if (e.data === 'close-connections') {
        console.warn('[IDB-Fix] Nuclear reset requested — navigating away to release IDB connections');
        window.location.href = '/keystatic/logged-out';
      }
    };
  } catch(e) {}

  // Layer 3: GitHub GraphQL Save Guard — intercepts deletion errors and auto-retries
  // without deletions. Prevents "[GraphQL] A path was requested for deletion which
  // does not exist" from blocking content saves. Two failure modes handled:
  //   Mode A: fields.image() path mismatch (produces garbage deletion paths)
  //   Mode B: Stale IDB tree cache (references paths removed by another editor/push)
  var origFetch = window.fetch;
  window.fetch = function(url, opts) {
    if (typeof url !== 'string' || !url.includes('api.github.com/graphql') || !opts || !opts.body) {
      return origFetch.apply(this, arguments);
    }

    var self = this;
    var args = arguments;

    return origFetch.apply(self, args).then(function(response) {
      return response.clone().text().then(function(text) {
        try {
          var data = JSON.parse(text);
        } catch(e) {
          return response;
        }

        var hasDeletionError = (data.errors || []).some(function(e) {
          return e.message && e.message.indexOf('path was requested for deletion which does not exist') !== -1;
        });

        if (!hasDeletionError) return response;

        console.warn('[KS-Guard] Deletion error detected — retrying save without deletions');

        try {
          var body = JSON.parse(opts.body);
          if (body && body.variables && body.variables.input && body.variables.input.fileChanges) {
            var stripped = (body.variables.input.fileChanges.deletions || []).length;
            body.variables.input.fileChanges.deletions = [];
            console.warn('[KS-Guard] Stripped ' + stripped + ' deletion path(s), retrying...');
            var retryOpts = {};
            for (var k in opts) { retryOpts[k] = opts[k]; }
            retryOpts.body = JSON.stringify(body);
            return origFetch.call(self, url, retryOpts);
          }
        } catch(e) {
          console.error('[KS-Guard] Failed to strip deletions:', e);
        }

        return response;
      }).catch(function() { return response; });
    });
  };
})();
`;

// Tooltip repositioner: Voussoir places tooltips above icons by default.
// Our sticky header clips them. This observer watches for tooltip elements
// and moves them below their trigger instead.
const TOOLTIP_FIX_SCRIPT = `
(function() {
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        // Find tooltips — either the node itself or children
        var tooltips = [];
        if (node.getAttribute && node.getAttribute('role') === 'tooltip') {
          tooltips.push(node);
        }
        if (node.querySelectorAll) {
          var found = node.querySelectorAll('[role="tooltip"]');
          for (var k = 0; k < found.length; k++) tooltips.push(found[k]);
        }
        for (var t = 0; t < tooltips.length; t++) {
          flipTooltipBelow(tooltips[t]);
        }
      }
    }
  });

  // Rewrite tooltip text to be friendlier for non-technical editors
  var TOOLTIP_REWRITES = {
    'Reset changes': 'Undo all unsaved changes',
    'Delete entry\u2026': 'Permanently delete this page',
    'Copy entry': 'Copy all page data to clipboard',
    'Paste entry': 'Paste copied page data here',
    'Duplicate entry\u2026': 'Create a new page from this one'
  };

  function rewriteTooltipText(tooltip) {
    var textNode = tooltip.querySelector('div > div');
    if (!textNode) return;
    var text = textNode.textContent || '';
    for (var original in TOOLTIP_REWRITES) {
      if (text.trim() === original) {
        textNode.textContent = TOOLTIP_REWRITES[original];
        break;
      }
    }
  }

  function flipTooltipBelow(tooltip) {
    // Voussoir positions tooltips ABOVE triggers using "bottom: Npx" inline style,
    // set asynchronously after DOM insertion. We delay to ensure Voussoir has
    // finished positioning, then flip to below the trigger.
    setTimeout(function() {
      rewriteTooltipText(tooltip);

      var style = tooltip.style;
      var hasBottom = style.bottom && style.bottom !== 'auto';
      if (!hasBottom) return;

      var tooltipRect = tooltip.getBoundingClientRect();

      // Only flip if tooltip is near top of viewport (clipped by header)
      if (tooltipRect.top > 120) return;

      // Calculate where the trigger button ends.
      // Tooltip is above trigger: trigger starts at tooltipRect.bottom + gap
      var triggerBottomY = tooltipRect.bottom + 4 + 32 + 4; // gap + button height + gap

      // Flip: remove bottom, set top
      style.bottom = 'auto';
      style.top = triggerBottomY + 'px';

      // Flip arrow caret
      var arrows = tooltip.querySelectorAll('div[style]');
      for (var i = 0; i < arrows.length; i++) {
        var a = arrows[i];
        if (a.style.transform && a.style.transform.indexOf('rotate') !== -1) {
          a.style.transform = 'rotate(180deg)';
          a.style.top = '-7px';
          a.style.bottom = 'auto';
        }
      }
    }, 50);
  }

  // Observe the entire document for tooltip additions
  observer.observe(document.body, { childList: true, subtree: true });
})();
`;

/**
 * Keystatic Admin Layout
 * REQ-MEDIA-002: Updated to support children prop for custom routes like /keystatic/media
 *
 * Only essential enhancers active (SEOFieldsetEnhancer + MediaFieldEnhancer).
 * Non-essential observers disabled to prevent MutationObserver cascade loops.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* IndexedDB timeout fix — must run before Keystatic's JS bundle */}
      <Script id="idb-timeout-fix" strategy="beforeInteractive">
        {IDB_TIMEOUT_SCRIPT}
      </Script>
      <Script id="tooltip-fix" strategy="afterInteractive">
        {TOOLTIP_FIX_SCRIPT}
      </Script>
      <div className="flex flex-col h-screen bg-white dark:bg-dark-bg transition-colors duration-200">
        {/* REQ-CMS-003: SEO Accordion Enhancement */}
        <SEOFieldsetEnhancer />
        {/* REQ-CMS-009: Hero Section Accordion Enhancement */}
        <HeroFieldsetEnhancer />
        {/* REQ-MEDIA-003: Media Picker for Image/Video Fields */}
        <MediaFieldEnhancer />
        {/* Empty leading paragraph cleanup helper */}
        <ContentCleanupEnhancer />

        <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex-shrink-0 transition-colors duration-200">
          <KeystaticToolsHeader />
        </div>

        {/* REQ-CMS-AUTH: Show banner when signed in with wrong GitHub account */}
        <RepoAccessErrorBanner />

        <div className="flex-1 overflow-auto pb-20">{children}</div>

        <PageEditingToolbar />
      </div>
    </ThemeProvider>
  );
}
