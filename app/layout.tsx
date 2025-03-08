import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import Auth0Provider from "@/providers/Auth0Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Waste Management System",
  description: "A modern waste management solution",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/android-chrome.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
    },
  },
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${inter.className} font-sans`} suppressHydrationWarning>
        <Auth0Provider>
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
        </Auth0Provider>
      </body>
    </html>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
