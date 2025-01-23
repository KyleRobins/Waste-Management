"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

type Supplier = Database["public"]["Tables"]["suppliers"]["Insert"];

export const createSupplier = async (supplier: Supplier) => {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(supplier)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSuppliers = async () => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
  const { data, error } = await supabase
    .from("suppliers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSupplier = async (id: string) => {
  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", id);

  if (error) throw error;
};