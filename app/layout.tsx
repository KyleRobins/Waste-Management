import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Waste Management System",
  description: "Efficient waste collection and recycling management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if the current route is an auth route
  const isAuthPage = children.props?.childProp?.segment === "auth";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isAuthPage ? (
            // Render auth pages without sidebar
            <main className="h-screen bg-background">{children}</main>
          ) : (
            // Render protected pages with sidebar
            <div className="h-screen relative flex">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-background">
                <div className="container mx-auto p-8">{children}</div>
              </main>
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

export function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
