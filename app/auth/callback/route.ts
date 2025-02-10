import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") || "/";

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(
          new URL("/auth/login?error=Unable to verify email", requestUrl.origin)
        );
      }

      // Successful verification
      return NextResponse.redirect(
        new URL(
          "/auth/login?message=Email verified successfully",
          requestUrl.origin
        )
      );
    }

    // No code provided
    return NextResponse.redirect(
      new URL("/auth/login?error=Invalid verification link", requestUrl.origin)
    );
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=Something went wrong", request.url)
    );
  }
}
