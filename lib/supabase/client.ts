"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }

  return createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey,
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  });
};