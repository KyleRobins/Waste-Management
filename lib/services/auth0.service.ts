import { createClient } from "@supabase/supabase-js";
import { getSession } from "@auth0/nextjs-auth0";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function syncAuth0ToSupabase(req: Request, res: Response) {
  try {
    // Get Auth0 session
    const auth0Session = await getSession(req, res);

    if (!auth0Session?.user) {
      throw new Error("No Auth0 user found");
    }

    const auth0User = auth0Session.user;

    // Check if user exists in Supabase
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", auth0User.email)
      .single();

    if (userError && userError.code !== "PGRST116") {
      throw userError;
    }

    if (!existingUser) {
      // Create new user in Supabase
      const { data: profile, error: createError } = await supabase
        .from("profiles")
        .insert({
          email: auth0User.email,
          full_name: auth0User.name,
          role: "customer", // Default role
          auth0_id: auth0User.sub,
          picture: auth0User.picture,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return profile;
    }

    // Update existing user
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: auth0User.name,
        picture: auth0User.picture,
        updated_at: new Date().toISOString(),
      })
      .eq("email", auth0User.email)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return updatedProfile;
  } catch (error) {
    console.error("Error syncing Auth0 user to Supabase:", error);
    throw error;
  }
}

export async function getSupabaseUserByAuth0Id(auth0Id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth0_id", auth0Id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserRole(userId: string, role: string) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
