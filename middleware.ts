import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
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

    // Get user role from session metadata
    const userRole = session.user.user_metadata.role;

    // Define role-based route mappings
    const roleRoutes = {
      admin: ['/dashboard', '/admin', '/customers', '/suppliers', '/employees', '/products', '/waste-records', '/reports', '/messages', '/payments'],
      employee: ['/dashboard', '/customers', '/suppliers', '/products', '/waste-records'],
      supplier: ['/supplier-portal'],
      customer: ['/customer-portal'],
    };

    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];

    // Check if user has access to the requested path
    const hasAccess = allowedRoutes.some(route => path.startsWith(route));

    if (!hasAccess) {
      // Redirect to the default route for their role
      const defaultRoute = allowedRoutes[0] || '/auth/login';
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};