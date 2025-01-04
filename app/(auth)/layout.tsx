"use client";

import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="h-screen relative flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-8">{children}</div>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}