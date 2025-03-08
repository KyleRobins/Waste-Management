import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import { cache } from "react";

export const createServerClient = cache(() => {
  return createServerComponentClient<Database>({
    cookies,
  });
});