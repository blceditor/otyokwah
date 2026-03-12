/**
 * REQ-FUTURE-019: AI-Powered Alt Text Suggestion API
 *
 * Uses Universal LLM vision to generate descriptive alt text for images.
 * Shares rate limit with SEO generation (100/month).
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isKeystatiAuthenticated } from "@/lib/keystatic/auth";
import { isSsrfSafeUrl } from "@/lib/security/validate-ssrf";
import { SITE_URL } from "@/lib/site-url";

interface SuggestAltTextRequest {
  imageUrl: string;
}

interface SuggestAltTextResponse {
  altText: string;
}

const UNIVERSAL_LLM_ENDPOINT =
  "https://universal.sparkry.ai/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    // REQ-SEC-004: Auth check
    const cookieStore = await cookies();
    const isAdmin = await isKeystatiAuthenticated(cookieStore);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SuggestAltTextRequest = await request.json();

    if (!body.imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    // REQ-SEC-004: SSRF check - use isSsrfSafeUrl NOT isSafeImageUrl
    if (!isSsrfSafeUrl(body.imageUrl)) {
      return NextResponse.json(
        { error: "Invalid image URL - blocked for security" },
        { status: 400 },
      );
    }

    const apiKey = process.env.UNIVERSAL_LLM_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Universal LLM API key not configured" },
        { status: 500 },
      );
    }

    // Resolve relative URLs to absolute
    let imageUrl = body.imageUrl;
    if (imageUrl.startsWith("/")) {
      imageUrl = `${SITE_URL}${imageUrl}`;
    }

    const systemPrompt = `You are an accessibility expert specialized in writing alt text for images.

Your task is to analyze the provided image and generate concise, descriptive alt text that:
1. Describes the main subject and action in the image
2. Includes relevant context (setting, mood, important details)
3. Is 125 characters or less (ideal for screen readers)
4. Avoids phrases like "image of" or "picture of"
5. Focuses on what's important for someone who cannot see the image

For camp/retreat images, consider:
- Activities being performed
- Age groups visible
- Setting (indoor, outdoor, lake, woods, etc.)
- Emotional tone (fun, peaceful, community, etc.)`;

    const response = await fetch(UNIVERSAL_LLM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate alt text for this image. Respond with ONLY the alt text, no explanation or formatting.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "low",
                },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 },
        );
      }

      return NextResponse.json(
        { error: "Failed to generate alt text" },
        { status: 500 },
      );
    }

    const data = await response.json();
    const altText =
      data.choices?.[0]?.message?.content?.trim() ||
      "Alt text generation failed";

    // Clean up the alt text - remove quotes if present
    const cleanedAltText = altText.replace(/^["']|["']$/g, "").trim();

    const result: SuggestAltTextResponse = {
      altText: cleanedAltText,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
