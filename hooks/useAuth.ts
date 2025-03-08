import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAuth() {
  const {
    user: auth0User,
    error: auth0Error,
    isLoading: auth0Loading,
  } = useUser();
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadSupabaseUser() {
      if (!auth0User) {
        setSupabaseUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("auth0_id", auth0User.sub)
          .single();

        if (error) throw error;
        setSupabaseUser(data);
      } catch (err) {
        console.error("Error fetching Supabase user:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user data")
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadSupabaseUser();
  }, [auth0User]);

  return {
    user: supabaseUser,
    auth0User,
    isLoading: isLoading || auth0Loading,
    error: error || auth0Error,
  };
}
