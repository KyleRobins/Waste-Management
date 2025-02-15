import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");

  // For password reset flow
  if (type === 'recovery' && token) {
    // Pass all necessary parameters to the reset password page
    const resetPasswordUrl = new URL('/auth/reset-password', requestUrl.origin);
    resetPasswordUrl.searchParams.set('token', token);
    resetPasswordUrl.searchParams.set('type', type);

    return NextResponse.redirect(resetPasswordUrl);
  }

  // For login/signup flow
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;

      return NextResponse.redirect(new URL('/', requestUrl.origin));
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL('/auth/login?error=Authentication failed', requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(
    new URL('/auth/login?error=Invalid callback', requestUrl.origin)
  );
}