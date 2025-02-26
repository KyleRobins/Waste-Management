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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");

  // For password reset flow with PKCE token
  if (type === "recovery" && token) {
    // Create the reset password URL with all necessary parameters
    const resetPasswordUrl = new URL("/auth/reset-password", requestUrl.origin);

    // Pass all necessary parameters
    resetPasswordUrl.searchParams.set("token", token);
    resetPasswordUrl.searchParams.set("type", type);

    // Create Supabase client to handle the verification
    const supabase = createRouteHandlerClient({ cookies });

    try {
      // Verify the token first
      const { error } = await supabase.auth.verifyOtp({
        token,
        type: "recovery",
      });

      if (error) {
        console.error("Token verification error:", error);
        return NextResponse.redirect(
          new URL(
            "/auth/forgot-password?error=Invalid or expired reset link",
            requestUrl.origin
          )
        );
      }

      return NextResponse.redirect(resetPasswordUrl);
    } catch (error) {
      console.error("Recovery verification error:", error);
      return NextResponse.redirect(
        new URL(
          "/auth/forgot-password?error=Invalid or expired reset link",
          requestUrl.origin
        )
      );
    }
  }

  // For login/signup flow
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      const {
        data: { user },
        error: exchangeError,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) throw exchangeError;

      if (!user) throw new Error("No user found");

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 means no rows returned
        throw profileError;
      }

      // If profile doesn't exist, create it
      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          role: user.user_metadata.role || "customer",
        });

        if (insertError) throw insertError;
      }

      // Get the user's role for redirection
      const role = user.user_metadata.role || "customer";

      // Role-based redirection
      let redirectTo = "/";
      switch (role) {
        case "admin":
          redirectTo = "/dashboard";
          break;
        case "supplier":
          redirectTo = "/supplier-portal";
          break;
        case "customer":
          redirectTo = "/customer-portal";
          break;
        case "employee":
          redirectTo = "/dashboard";
          break;
      }

      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL("/auth/login?error=Authentication failed", requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(
    new URL("/auth/login?error=Invalid callback", requestUrl.origin)
  );
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
