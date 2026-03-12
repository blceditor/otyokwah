import { isConfigured } from "@/lib/google-analytics/auth";
import { isPropertyConfigured, getAnalyticsSummary } from "@/lib/google-analytics/client";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { AnalyticsSetup } from "@/components/admin/AnalyticsSetup";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  if (!isConfigured() || !isPropertyConfigured()) {
    return <AnalyticsSetup isTokenMissing={!isConfigured()} />;
  }

  try {
    const data = await getAnalyticsSummary(7);
    return <AnalyticsDashboard initialData={data} />;
  } catch {
    return <AnalyticsSetup isTokenMissing={false} hasError />;
  }
}
