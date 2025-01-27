"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

type Supplier = Database["public"]["Tables"]["suppliers"]["Insert"];

export const checkSupplierExists = async (supplier: Partial<Supplier>) => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .or(`name.eq.${supplier.name},email.eq.${supplier.email},phone.eq.${supplier.phone}`);

  if (error) throw error;
  
  if (data && data.length > 0) {
    const duplicateFields = [];
    data.forEach(existingSupplier => {
      if (existingSupplier.name === supplier.name) duplicateFields.push('Company name');
      if (existingSupplier.email === supplier.email) duplicateFields.push('Email');
      if (existingSupplier.phone === supplier.phone) duplicateFields.push('Phone number');
    });
    if (duplicateFields.length > 0) {
      throw new Error(`Duplicate entry found: ${duplicateFields.join(', ')} already exists`);
    }
  }
  return false;
};

export const createSupplier = async (supplier: Supplier) => {
  // Check for duplicates first
  await checkSupplierExists(supplier);

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
  // Check for duplicates excluding current supplier
  const { data: currentSupplier } = await supabase
    .from("suppliers")
    .select()
    .eq('id', id)
    .single();

  if (currentSupplier) {
    const { data: duplicates } = await supabase
      .from("suppliers")
      .select("*")
      .neq('id', id)
      .or(`name.eq.${updates.name},email.eq.${updates.email},phone.eq.${updates.phone}`);

    if (duplicates && duplicates.length > 0) {
      const duplicateFields = [];
      duplicates.forEach(duplicate => {
        if (duplicate.name === updates.name) duplicateFields.push('Company name');
        if (duplicate.email === updates.email) duplicateFields.push('Email');
        if (duplicate.phone === updates.phone) duplicateFields.push('Phone number');
      });
      if (duplicateFields.length > 0) {
        throw new Error(`Duplicate entry found: ${duplicateFields.join(', ')} already exists`);
      }
    }
  }

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