"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthError, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "employee" | "customer" | "supplier";

const checkIfFirstUser = async (supabase: ReturnType<typeof createClient>) => {
  try {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count === 0;
  } catch (error) {
    console.error("Error checking if first user:", error);
    return false;
  }
};

export const signUp = async (
  email: string,
  password: string,
  role: UserRole = "customer",
  metadata: any = {}
) => {
  try {
    const supabase = createClient();

    // Check if this is the first user
    const isFirstUser = await checkIfFirstUser(supabase);
    const finalRole = isFirstUser ? "admin" : role;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          role: finalRole,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm?type=signup`,
      },
    });

    if (error) throw error;
    return {
      data,
      error: null,
      role: finalRole,
      message: isFirstUser
        ? "Account created with admin privileges. Please check your email to verify your account."
        : "Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Error in signUp:", error);
    return {
      data: null,
      error:
        error instanceof AuthError
          ? error
          : new Error("Failed to create account"),
      role: null,
      message: null,
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const supabase = createClient();

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user role from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      // If profile doesn't exist, create it with default role
      if (profileError.code === "PGRST116") {
        const role = data.user?.user_metadata?.role || "customer";
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          role: role,
        });

        if (insertError) throw insertError;
        
        return { data, error: null, role };
      }
      throw profileError;
    }

    return { data, error: null, role: profile?.role || "customer" };
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
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return {
      error:
        error instanceof AuthError
          ? error
          : new Error("Failed to send reset instructions"),
    };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    // Sign out after password update to force re-login with new password
    await supabase.auth.signOut();
    return { data, error: null };
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return {
      data: null,
      error:
        error instanceof AuthError
          ? error
          : new Error("Failed to update password"),
    };
  }
};

export const signOut = async () => {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error in signOut:", error);
    return {
      error:
        error instanceof AuthError ? error : new Error("Failed to sign out"),
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const supabase = createClient();
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
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (error) throw error;
    return (profile?.role as UserRole) || "customer";
  } catch (error) {
    console.error("Error in getCurrentUserRole:", error);
    throw error;
  }
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const supabase = createClient();
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