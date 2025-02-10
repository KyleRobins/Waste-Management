"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthError, Session } from "@supabase/supabase-js";

const supabase = createClient();

export type UserRole = "admin" | "employee" | "customer" | "supplier";

export const signUp = async (
  email: string,
  password: string,
  role: UserRole = "customer",
  metadata: any = {}
) => {
  try {
    validateSupabaseConfig();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) throw error;
    return {
      data,
      error: null,
      message: "Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Error in signUp:", error);
    return {
      data: null,
      error:
        error instanceof AuthError
          ? error
          : new Error("Failed to create account"),
      message: null,
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    validateSupabaseConfig();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if email is verified
    if (!data.user?.email_confirmed_at) {
      return {
        data: null,
        error: new Error("Please verify your email before logging in"),
        role: null,
      };
    }

    const role = data.user?.user_metadata?.role || "customer";
    return { data, error: null, role };
  } catch (error) {
    console.error("Error in signIn:", error);
    return {
      data: null,
      error:
        error instanceof AuthError
          ? error
          : new Error("An unexpected error occurred"),
      role: null,
    };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error in resetPassword:", error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in updatePassword:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error in signOut:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    throw error;
  }
};

export const getCurrentUserRole = async (): Promise<UserRole> => {
  try {
    const user = await getCurrentUser();
    return (user?.user_metadata?.role as UserRole) || "customer";
  } catch (error) {
    console.error("Error in getCurrentUserRole:", error);
    throw error;
  }
};

export const checkPermission = async (
  allowedRoles: UserRole[]
): Promise<boolean> => {
  const userRole = await getCurrentUserRole();
  return allowedRoles.includes(userRole);
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Error in getSession:", error);
    return null;
  }
};

const validateSupabaseConfig = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "Missing Supabase configuration. Please check your environment variables."
    );
  }
};
