"use client";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createClient = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used in the browser');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
  });
};