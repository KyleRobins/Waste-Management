import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type Provider } from "@supabase/supabase-js";

export type AuthError = {
  message: string;
  status?: number;
};

// Create a single supabase client for interacting with your database
const createClient = () => {
  return createClientComponentClient();
};

export const verifyOAuthSession = async () => {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Session verification error:", error);
    throw new Error("Failed to verify session");
  }

  return { session, error };
};

export const handleOAuthSignIn = async (
  provider: Provider,
  mode: "login" | "register",
  options?: {
    role?: string;
    isFirstUser?: boolean;
  }
) => {
  const supabase = createClient();

  try {
    const redirectURL = new URL("/auth/callback", window.location.origin);
    const queryParams = new URLSearchParams();

    queryParams.append("mode", mode);

    if (mode === "register" && options) {
      if (options.role) queryParams.append("role", options.role);
      if (options.isFirstUser !== undefined) {
        queryParams.append("isFirstUser", options.isFirstUser.toString());
      }
    }

    redirectURL.search = queryParams.toString();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectURL.toString(),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("OAuth sign in error:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to sign in",
        status: 500,
      },
    };
  }
};

export const verifyPasswordResetToken = async (token: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Password reset verification error:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Invalid or expired reset token",
        status: 400,
      },
    };
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to reset password",
        status: 500,
      },
    };
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Password reset email error:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "Failed to send reset email",
        status: 500,
      },
    };
  }
};

export const verifyEmail = async (token: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      data: null,
      error: {
        message:
          (error as Error).message || "Invalid or expired verification token",
        status: 400,
      },
    };
  }
};

export const signOut = async () => {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      error: {
        message: (error as Error).message || "Failed to sign out",
        status: 500,
      },
    };
  }
};
