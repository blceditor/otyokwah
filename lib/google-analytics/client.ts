/**
 * GA4 Data API client using REST + OAuth access tokens.
 * Queries the GA4 reporting API for page views, top pages, etc.
 */

import { getAccessToken } from "./auth";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? "";
const GA4_DATA_API = "https://analyticsdata.googleapis.com/v1beta/properties";

export interface GA4ReportRow {
  dimensions: string[];
  metrics: number[];
}

interface GA4ApiResponse {
  rows?: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  totals?: Array<{
    metricValues: Array<{ value: string }>;
  }>;
}

async function runReport(
  body: Record<string, unknown>,
): Promise<GA4ApiResponse> {
  const token = await getAccessToken();
  const res = await fetch(`${GA4_DATA_API}/${GA4_PROPERTY_ID}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA4 API error: ${res.status} ${err}`);
  }

  return res.json();
}

function parseRows(response: GA4ApiResponse): GA4ReportRow[] {
  return (response.rows ?? []).map((row) => ({
    dimensions: (row.dimensionValues ?? []).map((d) => d.value),
    metrics: (row.metricValues ?? []).map((m) => parseFloat(m.value)),
  }));
}

function dateRange(days: number): { startDate: string; endDate: string } {
  return { startDate: `${days}daysAgo`, endDate: "today" };
}

export interface AnalyticsSummary {
  totalPageViews: number;
  totalUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number; users: number }>;
  referrers: Array<{ source: string; sessions: number; users: number }>;
  browsers: Array<{ browser: string; users: number }>;
  devices: Array<{ device: string; users: number }>;
  countries: Array<{ country: string; users: number }>;
  dailyViews: Array<{ date: string; views: number; users: number }>;
  ctaClicks: Array<{ label: string; href: string; count: number }>;
  landingPages: Array<{ page: string; sessions: number; users: number }>;
  pageFlow: Array<{ page: string; sessions: number; bounceRate: number }>;
}

export async function getAnalyticsSummary(
  days: number = 7,
): Promise<AnalyticsSummary> {
  const range = dateRange(days);

  const [
    overviewRes,
    pagesRes,
    referrersRes,
    browsersRes,
    devicesRes,
    countriesRes,
    dailyRes,
    ctaRes,
    landingRes,
    pageFlowRes,
  ] = await Promise.all([
    // Overview metrics
    runReport({
      dateRanges: [range],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "averageSessionDuration" },
      ],
    }),

    // Top pages
    runReport({
      dateRanges: [range],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 20,
    }),

    // Referrers
    runReport({
      dateRanges: [range],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),

    // Browsers
    runReport({
      dateRanges: [range],
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    }),

    // Devices
    runReport({
      dateRanges: [range],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    }),

    // Countries
    runReport({
      dateRanges: [range],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    }),

    // Daily page views
    runReport({
      dateRanges: [range],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    }),

    // CTA clicks (custom event)
    runReport({
      dateRanges: [range],
      dimensions: [
        { name: "customEvent:cta_label" },
        { name: "customEvent:cta_href" },
      ],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { value: "cta_click" },
        },
      },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 20,
    }).catch(() => ({ rows: [] }) as GA4ApiResponse),

    // Landing pages (entry points)
    runReport({
      dateRanges: [range],
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }).catch(() => ({ rows: [] }) as GA4ApiResponse),

    // Page engagement: bounce rate per page
    runReport({
      dateRanges: [range],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }, { name: "bounceRate" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }).catch(() => ({ rows: [] }) as GA4ApiResponse),
  ]);

  const overview = parseRows(overviewRes);
  const overviewMetrics = overview[0]?.metrics ?? [0, 0, 0, 0];

  return {
    totalPageViews: overviewMetrics[0],
    totalUsers: overviewMetrics[1],
    totalSessions: overviewMetrics[2],
    avgSessionDuration: overviewMetrics[3],

    topPages: parseRows(pagesRes).map((r) => ({
      page: r.dimensions[0],
      views: r.metrics[0],
      users: r.metrics[1],
    })),

    referrers: parseRows(referrersRes).map((r) => ({
      source: r.dimensions[0] === "(direct)" ? "Direct" : r.dimensions[0],
      sessions: r.metrics[0],
      users: r.metrics[1],
    })),

    browsers: parseRows(browsersRes).map((r) => ({
      browser: r.dimensions[0],
      users: r.metrics[0],
    })),

    devices: parseRows(devicesRes).map((r) => ({
      device: r.dimensions[0],
      users: r.metrics[0],
    })),

    countries: parseRows(countriesRes).map((r) => ({
      country: r.dimensions[0],
      users: r.metrics[0],
    })),

    dailyViews: parseRows(dailyRes).map((r) => ({
      date: r.dimensions[0],
      views: r.metrics[0],
      users: r.metrics[1],
    })),

    ctaClicks: parseRows(ctaRes).map((r) => ({
      label: r.dimensions[0],
      href: r.dimensions[1],
      count: r.metrics[0],
    })),

    landingPages: parseRows(landingRes).map((r) => ({
      page: r.dimensions[0],
      sessions: r.metrics[0],
      users: r.metrics[1],
    })),

    pageFlow: parseRows(pageFlowRes).map((r) => ({
      page: r.dimensions[0],
      sessions: r.metrics[0],
      bounceRate: r.metrics[1],
    })),
  };
}

export function isPropertyConfigured(): boolean {
  return !!GA4_PROPERTY_ID;
}
