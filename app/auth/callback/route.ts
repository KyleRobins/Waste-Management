import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");

  // For password reset flow with PKCE token
  if (type === 'recovery' && token) {
    // Create the reset password URL with all necessary parameters
    const resetPasswordUrl = new URL('/auth/reset-password', requestUrl.origin);
    
    // Pass all necessary parameters
    resetPasswordUrl.searchParams.set('token', token);
    resetPasswordUrl.searchParams.set('type', type);

    // Create Supabase client to handle the verification
    const supabase = createRouteHandlerClient({ cookies });

    try {
      // Verify the token first
      const { error } = await supabase.auth.verifyOtp({
        token,
        type: 'recovery'
      });

      if (error) {
        console.error('Token verification error:', error);
        return NextResponse.redirect(
          new URL('/auth/forgot-password?error=Invalid or expired reset link', requestUrl.origin)
        );
      }

      return NextResponse.redirect(resetPasswordUrl);
    } catch (error) {
      console.error('Recovery verification error:', error);
      return NextResponse.redirect(
        new URL('/auth/forgot-password?error=Invalid or expired reset link', requestUrl.origin)
      );
    }
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