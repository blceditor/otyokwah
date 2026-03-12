import { fetchUltraCampSessions } from "@/lib/ultracamp/sessions";
import { AdminSessionsDashboard } from "@/components/admin/AdminSessionsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const sessions = await fetchUltraCampSessions();

  return <AdminSessionsDashboard initialSessions={sessions} />;
}
