import { describe, test, expect, beforeEach, vi, afterEach, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { TEST_GITHUB } from '@/tests/fixtures/config';

let testCounter = 0;
const getMockAccessToken = () => `ghu_${String(testCounter).padStart(12, '0')}_mock_access_token`;

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn((name: string) =>
        name === 'keystatic-gh-access-token'
          ? { value: getMockAccessToken() }
          : undefined
      ),
    })
  ),
}));

vi.mock('@/lib/keystatic/auth', () => ({
  isKeystatiAuthenticated: vi.fn(() => Promise.resolve(true)),
}));

describe('REQ-006 — Bug Submission API', () => {
  let POST: (request: NextRequest) => Promise<Response>;
  const MOCK_GITHUB_TOKEN = 'ghp_test_token_123456789';
  const MOCK_REPO_OWNER = TEST_GITHUB.owner;
  const MOCK_REPO_NAME = TEST_GITHUB.repo;

  beforeAll(async () => {
    const module = await import('./route');
    POST = module.POST;
  });

  const createMockRequest = (body: Record<string, unknown>): NextRequest => {
    const url = new URL('http://localhost:3000/api/submit-bug');
    return new NextRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  const mockIssueData = {
    title: 'Image upload fails on Staff page',
    description: 'Cannot upload images larger than 2MB. The upload button shows loading spinner but nothing happens.',
    includeContext: true,
    context: {
      slug: 'about/staff',
      fieldValues: {
        title: 'Staff Page',
        content: 'Meet our amazing team'
      },
      browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      timestamp: '2025-11-21T10:30:00Z',
      deploymentUrl: 'https://www.bearlakecamp.com'
    }
  };

  beforeEach(() => {
    testCounter++;
    vi.stubEnv('GITHUB_TOKEN', MOCK_GITHUB_TOKEN);
    vi.stubEnv('GITHUB_REPO_OWNER', MOCK_REPO_OWNER);
    vi.stubEnv('GITHUB_REPO_NAME', MOCK_REPO_NAME);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  test('creates GitHub issue with correct format', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 123456789,
        number: 42,
        html_url: `https://github.com/${TEST_GITHUB.full}/issues/42`,
        title: mockIssueData.title
      })
    });

    global.fetch = mockFetch;

    const request = createMockRequest(mockIssueData);

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.github.com/repos/${MOCK_REPO_OWNER}/${MOCK_REPO_NAME}/issues`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${MOCK_GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json'
        })
      })
    );

    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);
    expect(requestBody.title).toBe(mockIssueData.title);
    expect(requestBody.body).toContain('## Bug Report');
    expect(requestBody.body).toContain(mockIssueData.description);
  });

  test('includes captured context in issue body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 123456789,
        number: 42,
        html_url: `https://github.com/${TEST_GITHUB.full}/issues/42`
      })
    });

    global.fetch = mockFetch;

    const request = createMockRequest(mockIssueData);

    const response = await POST(request);

    expect(response.status).toBe(201);

    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);
    const issueBody = requestBody.body;

    expect(issueBody).toContain('### Context');
    expect(issueBody).toContain(`**Page**: /about/staff`);
    expect(issueBody).toContain('### Environment');
    expect(issueBody).toContain('**Browser**:');
    expect(issueBody).toContain('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    expect(issueBody).toContain('**Deployment**:');
    expect(issueBody).toContain('https://www.bearlakecamp.com');

    expect(issueBody).toContain('Staff Page');
  });

  test('applies labels: bug, cms-reported', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 123456789,
        number: 42,
        html_url: `https://github.com/${TEST_GITHUB.full}/issues/42`
      })
    });

    global.fetch = mockFetch;

    const request = createMockRequest(mockIssueData);

    const response = await POST(request);

    expect(response.status).toBe(201);

    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);
    expect(requestBody.labels).toEqual(['bug', 'cms-reported']);
  });

  test('returns 500 on GitHub API failure', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        message: 'Internal Server Error',
        documentation_url: 'https://docs.github.com/rest/issues/issues'
      })
    });

    global.fetch = mockFetch;

    const request = createMockRequest(mockIssueData);

    const response = await POST(request);

    expect(response.status).toBe(500);

    const responseBody = await response.json();
    expect(responseBody.error).toBeDefined();
    expect(responseBody.error).toMatch(/failed to create issue|github api/i);
  });

  test('handles GitHub API authentication error (401)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        message: 'Bad credentials'
      })
    });

    global.fetch = mockFetch;

    const request = createMockRequest(mockIssueData);

    const response = await POST(request);

    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody.error).toBeDefined();
  });

  test('validates required fields (title, description)', async () => {
    const missingTitleRequest = createMockRequest({
      description: 'Test description',
      includeContext: false
    });

    const missingTitleResponse = await POST(missingTitleRequest);
    expect(missingTitleResponse.status).toBe(400);

    const missingTitleBody = await missingTitleResponse.json();
    expect(missingTitleBody.error).toMatch(/title|required/i);

    const missingDescRequest = createMockRequest({
      title: 'Test bug',
      includeContext: false
    });

    const missingDescResponse = await POST(missingDescRequest);
    expect(missingDescResponse.status).toBe(400);

    const missingDescBody = await missingDescResponse.json();
    expect(missingDescBody.error).toMatch(/description|required/i);
  });

  test('generates markdown formatted issue body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 123456789,
        number: 42,
        html_url: `https://github.com/${TEST_GITHUB.full}/issues/42`
      })
    });

    global.fetch = mockFetch;

    const request = createMockRequest(mockIssueData);

    await POST(request);

    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);
    const issueBody = requestBody.body;

    const expectedSections = [
      '## Bug Report',
      '**Reported by**:',
      '**Date**:',
      '**Page**:',
      '### Description',
      '### Context',
      '### Environment',
      '**Browser**:',
      '**Deployment**:'
    ];

    for (const section of expectedSections) {
      expect(issueBody).toContain(section);
    }

    expect(issueBody).toMatch(/```json|```/);
  });

  test('SEC-01 — returns 401 when isKeystatiAuthenticated returns false', async () => {
    const { isKeystatiAuthenticated } = await import('@/lib/keystatic/auth');
    (isKeystatiAuthenticated as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);

    const request = createMockRequest({
      title: 'Test bug',
      description: 'A test bug report',
      includeContext: false,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Authentication required');
  });

  test('SEC-01 — calls isKeystatiAuthenticated with cookie store', async () => {
    const { isKeystatiAuthenticated } = await import('@/lib/keystatic/auth');
    (isKeystatiAuthenticated as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 1,
        number: 1,
        html_url: `https://github.com/${TEST_GITHUB.full}/issues/1`,
      }),
    });

    const request = createMockRequest({
      title: 'Test bug',
      description: 'A test description',
      includeContext: false,
    });

    await POST(request);
    expect(isKeystatiAuthenticated).toHaveBeenCalled();
  });

  test('omits context when includeContext is false', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 123456789,
        number: 42,
        html_url: `https://github.com/${TEST_GITHUB.full}/issues/42`
      })
    });

    global.fetch = mockFetch;

    const requestData = {
      title: 'Simple bug report',
      description: 'Just the description, no context',
      includeContext: false
    };

    const request = createMockRequest(requestData);

    const response = await POST(request);

    expect(response.status).toBe(201);

    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);
    const issueBody = requestBody.body;

    expect(issueBody).toContain('## Bug Report');
    expect(issueBody).toContain(requestData.description);
    expect(issueBody).not.toContain('### Context');
    expect(issueBody).not.toContain('Field Values');
  });

});
