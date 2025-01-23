"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

type WasteRecord = Database["public"]["Tables"]["waste_records"]["Insert"];

export const createWasteRecord = async (record: WasteRecord) => {
  const { data, error } = await supabase
    .from("waste_records")
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getWasteRecords = async () => {
  const { data, error } = await supabase
    .from("waste_records")
    .select(`
      *,
      supplier:suppliers(name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateWasteRecord = async (id: string, updates: Partial<WasteRecord>) => {
  const { data, error } = await supabase
    .from("waste_records")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWasteRecord = async (id: string) => {
  const { error } = await supabase
    .from("waste_records")
    .delete()
    .eq("id", id);

  if (error) throw error;
};