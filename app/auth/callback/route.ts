import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

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

    if (!code) {
      throw new Error("No code provided");
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

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Profile check error:", profileCheckError);
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
        console.error("Profile upsert error:", upsertError);
        throw upsertError;
      }
    }

    // Verify profile exists after creation/update
    const { data: finalProfile, error: finalCheckError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (finalCheckError || !finalProfile) {
      console.error("Final profile check error:", finalCheckError);
      throw new Error("Failed to verify profile creation");
    }

    // Successful auth - redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
  } catch (error) {
    console.error("Auth callback error:", error);
    // Redirect to login with error message
    const errorMessage = encodeURIComponent(
      (error as Error).message || "Authentication failed"
    );
    return NextResponse.redirect(
      new URL(`/auth/login?error=${errorMessage}`, request.url)
    );
  }
}

const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Detailed error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};
