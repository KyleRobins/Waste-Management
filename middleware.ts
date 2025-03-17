import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Check auth state
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // Handle authentication for protected routes
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute =
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/" &&
    !request.nextUrl.pathname.startsWith("/_next") &&
    !request.nextUrl.pathname.startsWith("/api");

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && session) {
    // Get user role from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const role =
      profile?.role || session.user.user_metadata?.role || "customer";

    // Role-based redirect
    const redirectMap: Record<string, string> = {
      admin: "/dashboard",
      supplier: "/supplier-portal",
      employee: "/employee-portal",
      customer: "/customer-portal",
    };

    return NextResponse.redirect(
      new URL(redirectMap[role] || "/dashboard", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/(api(?!/auth).*)",
  ],
};
