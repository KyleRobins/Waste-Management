import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") || "/";
    const error = requestUrl.searchParams.get("error");
    const error_description = requestUrl.searchParams.get("error_description");

    // If there's an error, redirect to login with the error message
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(error_description || error)}`,
          requestUrl.origin
        )
      );
    }

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(
          new URL(
            `/auth/login?error=${encodeURIComponent(error.message)}`,
            requestUrl.origin
          )
        );
      }

      // Successful verification
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    // No code provided
    return NextResponse.redirect(
      new URL("/auth/login?error=Invalid verification link", requestUrl.origin)
    );
  } catch (error: any) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error.message || "Something went wrong")}`,
        request.url
      )
    );
  }
}