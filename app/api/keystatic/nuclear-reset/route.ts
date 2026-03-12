import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';

/**
 * Nuclear Reset — serves a standalone HTML page that:
 * 1. Server-side: clears all HttpOnly cookies via Set-Cookie headers
 * 2. Client-side: clears IndexedDB (no open Keystatic connections on this page),
 *    localStorage, sessionStorage, Cache API, service workers
 * 3. Redirects to /keystatic for a completely fresh start
 *
 * This MUST be a separate page from Keystatic because deleteDatabase()
 * fires "onblocked" when there are open connections — Keystatic keeps
 * IndexedDB open, so clearing from within Keystatic silently fails.
 */

function expireCookie(name: string, path: string, httpOnly: boolean, secure: boolean): string {
  let header = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax`;
  if (secure) header += '; Secure';
  if (httpOnly) header += '; HttpOnly';
  return header;
}

const RESET_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Resetting Keystatic...</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0; background: #111; color: #fff; }
    .container { text-align: center; }
    .spinner { width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #4A7A9E;
               border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status { color: #999; font-size: 14px; margin-top: 8px; }
    .error { color: #f87171; font-size: 14px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Resetting Keystatic</h2>
    <p class="status" id="status">Clearing browser storage...</p>
  </div>
  <script>
    (async function() {
      const status = document.getElementById('status');
      try {
        // 0. Tell other Keystatic tabs to navigate away (releases their IDB connections)
        status.textContent = 'Closing other Keystatic tabs...';
        try {
          const bc = new BroadcastChannel('keystatic-reset');
          bc.postMessage('close-connections');
          bc.close();
        } catch(e) { /* BroadcastChannel may not be available */ }
        // Wait for other tabs to navigate away and close their connections
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Delete ALL IndexedDB databases
        status.textContent = 'Clearing IndexedDB databases...';
        if (window.indexedDB) {
          if (window.indexedDB.databases) {
            // Modern browsers: enumerate and delete all
            const databases = await window.indexedDB.databases();
            const deletePromises = databases.filter(db => db.name).map(db =>
              new Promise(resolve => {
                const req = window.indexedDB.deleteDatabase(db.name);
                const timer = setTimeout(() => resolve('timeout: ' + db.name), 5000);
                req.onsuccess = () => { clearTimeout(timer); resolve('deleted: ' + db.name); };
                req.onerror = () => { clearTimeout(timer); resolve('error: ' + db.name); };
                req.onblocked = () => {
                  clearTimeout(timer);
                  resolve('blocked: ' + db.name);
                };
              })
            );
            await Promise.all(deletePromises);
          } else {
            // Safari/older browsers: delete known database names
            const knownDBs = [
              'keystatic', 'keystatic-blobs', 'keystatic-trees',
              'replicache-wasm-module', 'keyval-store'
            ];
            // Also try common Replicache DB name patterns
            for (let i = 0; i < 20; i++) {
              knownDBs.push('replicache-' + i);
            }
            const deletePromises = knownDBs.map(name =>
              new Promise(resolve => {
                const req = window.indexedDB.deleteDatabase(name);
                const timer = setTimeout(() => resolve('timeout: ' + name), 5000);
                req.onsuccess = () => { clearTimeout(timer); resolve('deleted: ' + name); };
                req.onerror = () => { clearTimeout(timer); resolve('error: ' + name); };
                req.onblocked = () => { clearTimeout(timer); resolve('blocked: ' + name); };
              })
            );
            await Promise.all(deletePromises);
          }
        }

        // 2. Clear localStorage and sessionStorage
        status.textContent = 'Clearing local storage...';
        try { localStorage.clear(); } catch(e) { /* storage may be restricted */ }
        try { sessionStorage.clear(); } catch(e) { /* storage may be restricted */ }

        // 3. Clear Cache API
        status.textContent = 'Clearing caches...';
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          } catch(e) { /* Cache API may not be available */ }
        }

        // 4. Unregister service workers
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(r => r.unregister()));
          } catch(e) { /* SW may not be available */ }
        }

        // 5. Clear client-visible cookies at all paths
        status.textContent = 'Clearing cookies...';
        document.cookie.split(';').forEach(cookie => {
          const name = cookie.split('=')[0].trim();
          if (name) {
            ['/','/_next','/keystatic','/api','/api/keystatic','/api/keystatic/github'].forEach(path => {
              document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path;
            });
          }
        });

        // Done — redirect to Keystatic
        status.textContent = 'Done! Redirecting to Keystatic...';
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = '/keystatic';

      } catch (err) {
        status.className = 'error';
        status.textContent = 'Error during reset: ' + err.message + '. Redirecting anyway...';
        await new Promise(resolve => setTimeout(resolve, 2000));
        window.location.href = '/keystatic';
      }
    })();
  </script>
</body>
</html>`;

export async function GET() {
  const cookieStore = await cookies();
  const isAuthenticated = await isKeystatiAuthenticated(cookieStore);
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Build response with HTML body
  const response = new NextResponse(RESET_HTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });

  // Server-side: expire all known keystatic/auth cookies including HttpOnly
  const knownCookies = [
    'keystatic-gh-access-token',
    'keystatic-gh-refresh-token',
    'keystatic-gh-token',
    '__Host-keystatic-gh-access-token',
    '__Host-keystatic-gh-refresh-token',
    '__Secure-keystatic-gh-access-token',
    '__Secure-keystatic-gh-refresh-token',
    'keystatic-state',
    'keystatic-csrf',
  ];

  const paths = [
    '/',
    '/api',
    '/api/keystatic',
    '/api/keystatic/github',
    '/api/keystatic/github/callback',
    '/api/keystatic/github/refresh-token',
    '/keystatic',
  ];

  for (const cookieName of knownCookies) {
    const isRefreshToken = cookieName.toLowerCase().includes('refresh');
    for (const path of paths) {
      response.headers.append(
        'Set-Cookie',
        expireCookie(cookieName, path, isRefreshToken, isProduction)
      );
    }
  }

  // Also clear dynamically-discovered cookies
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      const name = c.name.toLowerCase();
      if (name.includes('keystatic') || name.includes('github')) {
        for (const path of paths) {
          response.headers.append(
            'Set-Cookie',
            expireCookie(c.name, path, true, isProduction)
          );
        }
      }
    }
  } catch {
    // Ignore cookie read errors
  }

  return response;
}
