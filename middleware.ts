import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const roleRoutes = {
  admin: [
    "/dashboard",
    "/employees",
    "/suppliers",
    "/customers",
    "/products",
    "/waste-records",
  ],
  employee: ["/dashboard", "/waste-records"],
  supplier: ["/supplier-portal", "/products"],
  customer: ["/customer-portal"],
};

export async function middleware(req: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res: NextResponse.next() });

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();

    const path = req.nextUrl.pathname;

    // Allow public assets
    if (
      path.startsWith("/_next") ||
      path.startsWith("/api") ||
      path.startsWith("/static")
    ) {
      return NextResponse.next();
    }

    // Handle root path
    if (path === "/") {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      // Redirect to appropriate dashboard based on role
      const userRole = session.user.user_metadata
        .role as keyof typeof roleRoutes;
      const defaultRoute = roleRoutes[userRole]?.[0] || "/dashboard";
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    // Handle authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      // Allow access to public routes
      if (publicRoutes.includes(path)) {
        return NextResponse.next();
      }
      // Redirect to login for protected routes
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Prevent authenticated users from accessing auth pages
    if (publicRoutes.includes(path)) {
      const userRole = session.user.user_metadata
        .role as keyof typeof roleRoutes;
      const defaultRoute = roleRoutes[userRole]?.[0] || "/dashboard";
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    // Check role-based access
    const userRole = session.user.user_metadata.role as keyof typeof roleRoutes;
    const hasAccess =
      userRole === "admin" ||
      roleRoutes[userRole]?.some((route) => path.startsWith(route));

    if (!hasAccess) {
      const defaultRoute = roleRoutes[userRole]?.[0] || "/dashboard";
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

// Specify which routes should be protected
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/admin/:path*",
    // Add other protected routes here
  ],
};
