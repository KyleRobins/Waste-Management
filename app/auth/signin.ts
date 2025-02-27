export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error details:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Detailed error:", error);
    return { data: null, error };
  }
}
