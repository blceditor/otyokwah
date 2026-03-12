import { NextResponse } from "next/server";
import { reader } from "@/lib/keystatic-reader";

interface HealthCheck {
  name: string;
  status: "pass" | "fail";
  ms: number;
  detail?: string;
}

async function timedCheck(
  name: string,
  fn: () => Promise<string | undefined>,
): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const detail = await fn();
    return { name, status: "pass", ms: Date.now() - start, detail };
  } catch (e) {
    return {
      name,
      status: "fail",
      ms: Date.now() - start,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function GET() {
  const checks: HealthCheck[] = await Promise.all([
    // 1. Can we read a page from the CMS?
    timedCheck("cms_reader", async () => {
      const r = reader();
      const page = await r.collections.pages.read("about");
      if (!page) throw new Error("Page 'about' not found");
      return page.title;
    }),

    // 2. Can we read navigation?
    timedCheck("navigation", async () => {
      const r = reader();
      const nav = await r.singletons.siteNavigation.read();
      if (!nav) throw new Error("Navigation singleton not found");
      return `${nav.menuItems.length} menu items`;
    }),

    // 3. Can we list pages?
    timedCheck("page_list", async () => {
      const r = reader();
      const slugs = await r.collections.pages.list();
      if (slugs.length === 0) throw new Error("No pages found");
      return `${slugs.length} pages`;
    }),

    // 4. Is GitHub API reachable? (only in production)
    timedCheck("github_api", async () => {
      const res = await fetch("https://api.github.com/rate_limit", {
        headers: process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {},
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = await res.json();
      return `${data.rate.remaining}/${data.rate.limit} remaining`;
    }),
  ]);

  const allPass = checks.every((c) => c.status === "pass");

  return NextResponse.json(
    {
      status: allPass ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allPass ? 200 : 503 },
  );
}
