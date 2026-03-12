import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';
import { DEFAULT_GITHUB_OWNER, DEFAULT_GITHUB_REPO } from '@/lib/config';

interface BugReportContext {
  slug?: string;
  fullUrl?: string;
  fieldValues?: Record<string, unknown>;
  browser?: string;
  timestamp?: string;
  deploymentUrl?: string;
  screenshot?: string;
}

interface BugReportRequest {
  title: string;
  description: string;
  includeContext: boolean;
  context?: BugReportContext;
}

interface GitHubIssueResponse {
  id: number;
  number: number;
  html_url: string;
  title: string;
}

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 3600;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing) {
    return { allowed: true };
  }

  if (now > existing.resetTime) {
    rateLimitStore.delete(identifier);
    return { allowed: true };
  }

  if (existing.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

function incrementRateLimit(identifier: string): void {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW * 1000,
    });
  } else {
    existing.count += 1;
  }
}

function formatIssueBody(report: BugReportRequest): string {
  const sections: string[] = [];

  sections.push('## Bug Report');
  sections.push('');
  sections.push('**Reported by**: CMS User');
  sections.push(`**Date**: ${new Date().toISOString()}`);

  if (report.includeContext && report.context?.fullUrl) {
    sections.push(`**Page**: ${report.context.fullUrl}`);
  } else if (report.includeContext && report.context?.slug) {
    sections.push(`**Page**: /${report.context.slug}`);
  }

  sections.push('');
  sections.push('### Description');
  sections.push('');
  sections.push(report.description);

  if (report.includeContext && report.context?.screenshot) {
    sections.push('');
    sections.push('### Screenshot');
    sections.push('');
    sections.push('<details>');
    sections.push('<summary>Click to view screenshot</summary>');
    sections.push('');
    sections.push(`![Screenshot](${report.context.screenshot})`);
    sections.push('');
    sections.push('</details>');
  }

  if (report.includeContext && report.context) {
    sections.push('');
    sections.push('### Context');
    sections.push('');

    if (report.context.fieldValues) {
      sections.push('**Field Values**:');
      sections.push('```json');
      sections.push(JSON.stringify(report.context.fieldValues, null, 2));
      sections.push('```');
      sections.push('');
    }

    sections.push('### Environment');
    sections.push('');

    if (report.context.browser) {
      sections.push(`**Browser**: ${report.context.browser}`);
    }

    if (report.context.deploymentUrl) {
      sections.push(`**Deployment**: ${report.context.deploymentUrl}`);
    }

    if (report.context.timestamp) {
      sections.push(`**Timestamp**: ${report.context.timestamp}`);
    }
  }

  return sections.join('\n');
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const isAuthed = await isKeystatiAuthenticated(cookieStore);
  if (!isAuthed) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || DEFAULT_GITHUB_OWNER;
  const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || DEFAULT_GITHUB_REPO;

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: 'GitHub API configuration missing' },
      { status: 500 }
    );
  }

  let body: BugReportRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Missing or invalid request body' },
      { status: 400 }
    );
  }

  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    );
  }

  if (body.title.length > 200) {
    return NextResponse.json(
      { error: 'Title must be 200 characters or less' },
      { status: 400 }
    );
  }

  if (!body.description || typeof body.description !== 'string' || body.description.trim() === '') {
    return NextResponse.json(
      { error: 'Description is required' },
      { status: 400 }
    );
  }

  if (body.description.length > 5000) {
    return NextResponse.json(
      { error: 'Description must be 5000 characters or less' },
      { status: 400 }
    );
  }

  const accessToken = cookieStore.get('keystatic-gh-access-token');
  const rateLimitKey = accessToken?.value?.substring(0, 16) || 'anonymous';

  const rateLimitCheck = checkRateLimit(rateLimitKey);

  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Too many bug reports submitted.',
        retryAfter: rateLimitCheck.retryAfter,
      },
      { status: 429 }
    );
  }

  try {
    const githubUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`;

    const issueBody = formatIssueBody(body);

    const response = await fetch(githubUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: body.title,
        body: issueBody,
        labels: ['bug', 'cms-reported'],
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'GitHub authentication failed' },
          { status: 500 }
        );
      }

      const errorData = await response.json();
      return NextResponse.json(
        { error: `Failed to create issue - GitHub API error: ${errorData.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const issueData: GitHubIssueResponse = await response.json();

    incrementRateLimit(rateLimitKey);

    return NextResponse.json(
      {
        success: true,
        issueUrl: issueData.html_url,
        issueNumber: issueData.number,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create issue',
      },
      { status: 500 }
    );
  }
}
