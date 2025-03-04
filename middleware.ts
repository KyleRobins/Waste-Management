import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Refresh session if needed
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error in middleware:", error);
      throw error;
    }

    // Skip auth check for public routes
    if (
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.startsWith("/api/") ||
      req.nextUrl.pathname.startsWith("/auth/callback") ||
      req.nextUrl.pathname.startsWith("/auth/confirm-email") ||
      req.nextUrl.pathname === "/favicon.ico"
    ) {
      return res;
    }

    // Handle authentication state
    const isAuthRoute = req.nextUrl.pathname.startsWith("/auth/");
    const isProtectedRoute =
      !isAuthRoute && !req.nextUrl.pathname.startsWith("/public/");

    if (!session && isProtectedRoute) {
      // Save the original URL to redirect back after login
      const redirectUrl = new URL("/auth/login", req.url);
      redirectUrl.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (session && isAuthRoute) {
      // Don't allow authenticated users to access auth pages
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // For authenticated users accessing protected routes
    if (session && isProtectedRoute) {
      // You can add role-based access control here if needed
      // const { data: profile } = await supabase
      //   .from('profiles')
      //   .select('role')
      //   .eq('id', session.user.id)
      //   .single();
      // if (profile?.role !== 'admin' && req.nextUrl.pathname.startsWith('/admin')) {
      //   return NextResponse.redirect(new URL('/dashboard', req.url));
      // }
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    // Clear any existing session on error
    await supabase.auth.signOut();

    const redirectUrl = new URL("/auth/login", req.url);
    redirectUrl.searchParams.set("error", "Session expired");
    return NextResponse.redirect(redirectUrl);
  }
}

// Specify which routes should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
