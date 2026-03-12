/**
 * REQ-CMS-003: Vercel Deployment Status API
 *
 * Direct integration with Vercel's Deployments API for accurate status.
 * Falls back gracefully when VERCEL_TOKEN is not configured.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';

// Cache the last known status to prevent excessive API calls
let lastStatus: { state: string; url?: string; createdAt?: string; cachedAt: number } | null = null;
const CACHE_DURATION_MS = 10000; // 10 seconds cache

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = await isKeystatiAuthenticated(cookieStore);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  // Return cached result if still fresh
  if (lastStatus && Date.now() - lastStatus.cachedAt < CACHE_DURATION_MS) {
    return NextResponse.json({
      state: lastStatus.state,
      url: lastStatus.url,
      createdAt: lastStatus.createdAt,
      cached: true
    });
  }

  // Return graceful fallback if not configured
  if (!token || !projectId) {
    return NextResponse.json({
      state: 'unknown',
      message: 'Vercel integration not configured',
      isLocalDev: true
    });
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1&state=`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 10 } // Next.js fetch caching
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        state: 'error',
        message: `Vercel API returned ${response.status}`
      });
    }

    const data = await response.json();
    const deployment = data.deployments?.[0];

    if (!deployment) {
      return NextResponse.json({
        state: 'unknown',
        message: 'No deployments found'
      });
    }

    // Map Vercel states to our display states
    const stateMap: Record<string, string> = {
      'READY': 'READY',
      'BUILDING': 'BUILDING',
      'QUEUED': 'QUEUED',
      'INITIALIZING': 'BUILDING',
      'ERROR': 'ERROR',
      'CANCELED': 'ERROR'
    };

    const state = stateMap[deployment.state] || deployment.state;

    // Update cache
    lastStatus = {
      state,
      url: deployment.url,
      createdAt: deployment.createdAt,
      cachedAt: Date.now()
    };

    return NextResponse.json({
      state,
      url: deployment.url,
      createdAt: deployment.createdAt,
      readyState: deployment.readyState,
      alias: deployment.alias?.[0]
    });
  } catch (error) {
    return NextResponse.json({
      state: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
