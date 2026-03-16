import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ThemeProvider } from "@/components/keystatic/ThemeProvider";

export const metadata = {
  title: "Admin Dashboard - Camp Otyokwah",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="bg-gray-50 dark:bg-dark-bg transition-colors min-h-screen pt-16">
        <AdminNav />
        <main>{children}</main>
      </div>
    </ThemeProvider>
  );
}
