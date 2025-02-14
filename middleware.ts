import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession();

    const path = req.nextUrl.pathname;

    // Allow public routes and assets
    if (
      path.startsWith('/_next') ||
      path.startsWith('/api') ||
      path.startsWith('/static') ||
      path === '/auth/login' ||
      path === '/auth/register' ||
      path === '/auth/forgot-password' ||
      path === '/auth/reset-password' ||
      path.startsWith('/auth/callback')
    ) {
      return res;
    }

    // Redirect unauthenticated users to login
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Handle role-based access
    const userRole = session.user.user_metadata.role;
    const roleRoutes = {
      admin: ['/dashboard', '/admin'],
      employee: ['/dashboard'],
      supplier: ['/supplier-portal'],
      customer: ['/customer-portal'],
    };

    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];
    const hasAccess = allowedRoutes.some(route => path.startsWith(route));

    if (!hasAccess) {
      // Redirect to default route for role
      return NextResponse.redirect(new URL(allowedRoutes[0] || '/auth/login', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
