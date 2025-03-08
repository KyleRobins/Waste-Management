import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);

  if (!session && !isPublicPath) {
    // Redirect to login if accessing protected route without session
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isPublicPath) {
    // Redirect to dashboard if accessing auth routes with session
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/public).*)",
  ],
};