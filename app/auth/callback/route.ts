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
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const role = requestUrl.searchParams.get("role");
    const isFirstUser = requestUrl.searchParams.get("isFirstUser") === "true";
    const mode = requestUrl.searchParams.get("mode");

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) throw sessionError;

      if (session?.user) {
        if (mode === "register") {
          // Only update profile for new registrations
          const { error: updateError } = await supabase
            .from("profiles")
            .upsert({
              id: session.user.id,
              role: isFirstUser ? "admin" : role || "customer",
              email: session.user.email,
              updated_at: new Date().toISOString(),
            });

          if (updateError) throw updateError;
        } else {
          // For login, verify the user exists in profiles
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError || !profile) {
            throw new Error("User profile not found");
          }
        }
      }

      // Successful auth - redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    }

    throw new Error("No code provided");
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=Authentication%20failed", request.url)
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
