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

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });

      // Exchange the code for a session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) throw sessionError;

      if (session?.user && role) {
        // Only update profile if this is a registration (role is present)
        const { error: updateError } = await supabase.from("profiles").upsert({
          id: session.user.id,
          role: isFirstUser ? "admin" : role || "customer",
          email: session.user.email,
          updated_at: new Date().toISOString(),
        });

        if (updateError) throw updateError;
      }
    }

    // Redirect to the dashboard or appropriate page
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
  } catch (error) {
    console.error("Auth callback error:", error);
    // Redirect to login page with error
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
