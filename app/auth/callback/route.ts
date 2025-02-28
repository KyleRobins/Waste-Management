import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Add this line to explicitly mark the route as dynamic
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const role = requestUrl.searchParams.get("role");
    const isFirstUser = requestUrl.searchParams.get("isFirstUser") === "true";
    const mode = requestUrl.searchParams.get("mode");
    const next = requestUrl.searchParams.get("next") || "/dashboard";

    if (!code) {
      throw new Error("No authorization code provided");
    }

    // Exchange the code for a session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }

    if (!session?.user) {
      throw new Error("No user in session");
    }

    try {
      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileCheckError && profileCheckError.code !== "PGRST116") {
        throw profileCheckError;
      }

      // Create or update profile if it doesn't exist or if in register mode
      if (!existingProfile || mode === "register") {
        const { error: upsertError } = await supabase.from("profiles").upsert(
          {
            id: session.user.id,
            email: session.user.email,
            role: isFirstUser ? "admin" : role || "customer",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

        if (upsertError) {
          throw upsertError;
        }

        // Verify profile was created
        const { data: finalProfile, error: finalCheckError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (finalCheckError || !finalProfile) {
          throw new Error("Failed to verify profile creation");
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error("Profile error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Auth callback error:", error);
    const errorMessage = encodeURIComponent(
      (error as Error).message || "Authentication failed"
    );
    return NextResponse.redirect(
      new URL(`/auth/login?error=${errorMessage}`, request.url)
    );
  }
}