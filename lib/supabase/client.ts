"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { type Database } from "@/types/supabase";

// Export both the instance and the creation function
export const createClient = () => {
  return createClientComponentClient<Database>();
};

export const supabase = createClientComponentClient<Database>();
