import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(email: string, password: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) throw authError;

    return { success: true };
  } catch (error) {
    console.error("Error during sign up:", error);
    return { error: "Error during sign up" };
  }
}

export async function signIn(email: string, password: string) {
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

    // Fetch the user's profile data including role
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

export async function signOut() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  await supabase.auth.signOut();
  redirect('/login');
}
