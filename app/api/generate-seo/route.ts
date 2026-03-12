import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';

interface SEOGenerationRequest {
  title: string;
  slug: string;
  heroTagline?: string;
  templateType?: string;
  templateFields?: {
    ageRange?: string;
    dates?: string;
    pricing?: string;
    capacity?: string;
    amenities?: string;
  };
  body: string;
}

interface SEOGenerationResponse {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

interface UniversalLLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength);
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const isAdmin = await isKeystatiAuthenticated(cookieStore);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const UNIVERSAL_LLM_KEY = process.env.UNIVERSAL_LLM_KEY;

  if (!UNIVERSAL_LLM_KEY) {
    return NextResponse.json(
      { error: 'SEO generation is not configured. Please contact the administrator to set up the UNIVERSAL_LLM_KEY.' },
      { status: 401 }
    );
  }

  // Trim any accidental whitespace
  const cleanKey = UNIVERSAL_LLM_KEY.trim();

  let body: SEOGenerationRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Missing or invalid request body' },
      { status: 400 }
    );
  }

  // Title can come from form OR be derived from slug
  const hasTitle = body.title && typeof body.title === 'string' && body.title.trim();
  const hasSlug = body.slug && typeof body.slug === 'string' && body.slug.trim();

  if (!hasTitle && !hasSlug) {
    // Include debug info about what was received
    const received = {
      title: body.title ? `"${body.title}"` : '(empty)',
      slug: body.slug ? `"${body.slug}"` : '(empty)',
    };
    return NextResponse.json(
      {
        error: `Could not identify the page. Please ensure you're editing an existing page. Received: title=${received.title}, slug=${received.slug}`,
      },
      { status: 400 }
    );
  }

  // Use title if available, otherwise derive from slug
  const pageTitle = hasTitle
    ? body.title.trim()
    : body.slug
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  if (!body.body || typeof body.body !== 'string' || !body.body.trim()) {
    return NextResponse.json(
      { error: 'Page content is empty. Please add some content to the page body before generating SEO metadata.' },
      { status: 400 }
    );
  }

  try {
    const truncatedContent = truncateContent(body.body, 2000);

    // Build context-aware prompt
    const contextParts: string[] = [];

    if (body.slug) {
      contextParts.push(`Page URL: /${body.slug}`);
    }

    if (body.heroTagline) {
      contextParts.push(`Tagline: ${body.heroTagline}`);
    }

    if (body.templateType && body.templateType !== 'standard') {
      contextParts.push(`Page Type: ${body.templateType} page`);
    }

    // Add template-specific details
    if (body.templateFields) {
      const details: string[] = [];
      if (body.templateFields.ageRange) details.push(`Age: ${body.templateFields.ageRange}`);
      if (body.templateFields.dates) details.push(`Dates: ${body.templateFields.dates}`);
      if (body.templateFields.pricing) details.push(`Price: ${body.templateFields.pricing}`);
      if (body.templateFields.capacity) details.push(`Capacity: ${body.templateFields.capacity}`);
      if (details.length > 0) {
        contextParts.push(`Details: ${details.join(', ')}`);
      }
    }

    const contextSection = contextParts.length > 0
      ? `\n${contextParts.join('\n')}\n`
      : '';

    const systemPrompt = `You are an SEO expert for Camp Otyokwah, a Christian summer camp in Ohio. Generate optimized meta tags as JSON only. Focus on:
- Include "Camp Otyokwah" in meta title
- Highlight spiritual growth, outdoor adventure, Christian community
- For program pages, mention age group and key benefits
- Keep descriptions compelling and action-oriented
Do not include any explanations or additional text outside the JSON structure.`;

    const userPrompt = `Generate SEO metadata for this Camp Otyokwah page:

Title: ${pageTitle}${contextSection}
Content Summary:
${truncatedContent}

Return JSON only with these exact fields:
{"metaTitle":"50-60 chars with Camp Otyokwah","metaDescription":"150-155 chars compelling description","ogTitle":"engaging social title","ogDescription":"descriptive for social sharing"}`;

    const response = await fetch('https://universal.sparkry.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanKey}`,
        'User-Agent': 'CampOtyokwah/1.0 (Next.js; SEO Generator)',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      body: JSON.stringify({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      // Try to get error details from response body
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = errorBody.slice(0, 200);
      } catch {
        // Ignore if we can't read the body
      }

      if (response.status === 429) {
        const headers: Record<string, string> = {};
        try {
          const retryAfter = response.headers?.get('Retry-After');
          if (retryAfter) {
            headers['Retry-After'] = retryAfter;
          }
        } catch {
          // Headers might not be available in all environments
        }
        return NextResponse.json(
          { error: 'Rate limit exceeded. Too many requests.' },
          {
            status: 429,
            headers,
          }
        );
      }

      if (response.status === 403) {
        console.error('[SEO API] 403 from upstream:', errorDetails);
        return NextResponse.json(
          { error: 'API authentication failed. Please verify API key configuration.' },
          { status: 500 }
        );
      }

      if (response.status === 401) {
        return NextResponse.json(
          { error: `API key invalid or missing (401). Please check UNIVERSAL_LLM_KEY configuration.` },
          { status: 500 }
        );
      }

      throw new Error(`Universal LLM API error: ${response.status}. ${errorDetails}`);
    }

    const data: UniversalLLMResponse = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Universal LLM API');
    }

    let seoData: SEOGenerationResponse;
    try {
      const content = data.choices[0].message.content;
      seoData = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse SEO data from LLM response. Invalid JSON format.' },
        { status: 500 }
      );
    }

    if (!seoData.metaTitle || !seoData.metaDescription || !seoData.ogTitle || !seoData.ogDescription) {
      return NextResponse.json(
        { error: 'Incomplete SEO data: missing required fields' },
        { status: 500 }
      );
    }

    const cleanedData: SEOGenerationResponse = {
      metaTitle: stripHtmlTags(seoData.metaTitle).substring(0, 60),
      metaDescription: stripHtmlTags(seoData.metaDescription),
      ogTitle: stripHtmlTags(seoData.ogTitle),
      ogDescription: stripHtmlTags(seoData.ogDescription),
    };

    if (cleanedData.metaDescription.length < 150) {
      return NextResponse.json(
        { error: `Generated description too short (${cleanedData.metaDescription.length}/150 chars). Try adding more content to the page for better SEO generation.` },
        { status: 400 }
      );
    }

    return NextResponse.json(cleanedData);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Failed to generate SEO metadata',
      },
      { status: 500 }
    );
  }
}
