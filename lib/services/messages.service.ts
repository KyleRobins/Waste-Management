"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

type Message = Database["public"]["Tables"]["messages"]["Insert"];

export const createMessage = async (message: Message) => {
  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMessages = async () => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateMessage = async (id: string, updates: Partial<Message>) => {
  const { data, error } = await supabase
    .from("messages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUnreadCount = async (userId: string) => {
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact" })
    .eq("recipient_id", userId)
    .eq("status", "unread");

  if (error) throw error;
  return count;
};