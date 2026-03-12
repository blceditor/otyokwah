import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ThemeProvider } from "@/components/keystatic/ThemeProvider";

export const metadata = {
  title: "Admin Dashboard - Camp Otyokwah",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
        <AdminNav />
        <main className="flex-1">{children}</main>
      </div>
    </ThemeProvider>
  );
}
