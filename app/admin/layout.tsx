import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ThemeProvider } from "@/components/keystatic/ThemeProvider";

export const metadata = {
  title: "Admin Dashboard - Camp Otyokwah",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("keystatic-gh-access-token");
  if (!token?.value) {
    redirect("/keystatic");
  }

  return (
    <ThemeProvider>
      <div className="bg-gray-50 dark:bg-dark-bg transition-colors min-h-screen pt-16">
        <AdminNav />
        <main>{children}</main>
      </div>
    </ThemeProvider>
  );
}
