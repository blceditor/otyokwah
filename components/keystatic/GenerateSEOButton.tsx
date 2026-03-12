"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface PageContent {
  title: string;
  body: string;
}

interface SEOData {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

interface GenerateSEOButtonProps {
  pageContent: PageContent;
  onSEOGenerated: (seoData: SEOData) => void;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 3600000;

function getRateLimitData(): RateLimitData {
  if (typeof window === "undefined") {
    return { count: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW };
  }

  const stored = localStorage.getItem("seo_generations");
  if (!stored) {
    return { count: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW };
  }

  try {
    const data: RateLimitData = JSON.parse(stored);

    if (Date.now() > data.resetTime) {
      return { count: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW };
    }

    return data;
  } catch {
    return { count: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW };
  }
}

function setRateLimitData(data: RateLimitData): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("seo_generations", JSON.stringify(data));
}

export function GenerateSEOButton({
  pageContent,
  onSEOGenerated,
}: GenerateSEOButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [rateLimitData, setRateLimitDataState] =
    useState<RateLimitData>(getRateLimitData());

  const remainingCredits = Math.max(0, RATE_LIMIT - rateLimitData.count);
  const isRateLimited = remainingCredits === 0;

  const handleGenerate = async () => {
    setError("");

    const currentRateLimit = getRateLimitData();
    if (currentRateLimit.count >= RATE_LIMIT) {
      setError("Rate limit reached. Please try again later.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pageContent.title,
          body: pageContent.body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "SEO generation failed");
      }

      const seoData: SEOData = await response.json();

      const newRateLimitData: RateLimitData = {
        count: currentRateLimit.count + 1,
        resetTime: currentRateLimit.resetTime,
      };
      setRateLimitData(newRateLimitData);
      setRateLimitDataState(newRateLimitData);

      onSEOGenerated(seoData);
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message.includes("timeout") ||
          err.message.includes("Timeout")
        ) {
          setError("Request timeout. Please try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to generate SEO. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || isRateLimited}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate SEO
            </>
          )}
        </button>

        <span className="text-sm text-gray-600">
          {isRateLimited ? (
            <span className="text-red-600 font-medium">
              Rate limit reached (0/10)
            </span>
          ) : (
            <span>
              {remainingCredits}/{RATE_LIMIT} remaining
            </span>
          )}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

export default GenerateSEOButton;
