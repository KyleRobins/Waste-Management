"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function checkIfAdminExists() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { count, error } = await supabase
      .from("profiles")  // Note: using profiles table instead of users
      .select("*", { count: 'exact', head: true })
      .eq("role", "admin");

    if (error) throw error;

    return { hasAdmin: count ? count > 0 : false };
  } catch (error) {
    console.error("Error checking admin existence:", error);
    return { error: "Error checking admin status" };
  }
}

export async function signUpAction(email: string, password: string, role?: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // First, check if this is the first user
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: 'exact', head: true });

    const isFirstUser = count === 0;

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        data: {
          role: isFirstUser ? "admin" : role || "customer", // Default to customer instead of USER
        },
      },
    });

    if (authError) throw authError;

    // Create the user profile with the appropriate role
    if (authData.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          role: isFirstUser ? "admin" : role || "customer",
          email: email,
        });

      if (profileError) throw profileError;
    }

    return { success: true, redirect: "/auth/verify-email" };
  } catch (error) {
    console.error("Error during sign up:", error);
    return { error: "Error during sign up" };
  }
}

export async function signInAction(email: string, password: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (profileError) throw profileError;

    return { success: true, user: profile };
  } catch (error) {
    console.error("Error during sign in:", error);
    return { error: "Invalid login credentials" };
  }
}

export async function signOutAction() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.signOut();
  redirect("/login");
}
