"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

type Customer = Database["public"]["Tables"]["customers"]["Insert"];

export const createCustomer = async (customer: Customer) => {
  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCustomers = async () => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateCustomer = async (id: string, updates: Partial<Customer>) => {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;
};