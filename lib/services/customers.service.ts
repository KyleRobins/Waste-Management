"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

type Customer = Database["public"]["Tables"]["customers"]["Insert"];

export const checkCustomerExists = async (customer: Partial<Customer>) => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .or(`name.eq.${customer.name},email.eq.${customer.email},phone.eq.${customer.phone}`);

  if (error) throw error;
  
  if (data && data.length > 0) {
    const duplicateFields = [];
    data.forEach(existingCustomer => {
      if (existingCustomer.name === customer.name) duplicateFields.push('Company name');
      if (existingCustomer.email === customer.email) duplicateFields.push('Email');
      if (existingCustomer.phone === customer.phone) duplicateFields.push('Phone number');
    });
    if (duplicateFields.length > 0) {
      throw new Error(`Duplicate entry found: ${duplicateFields.join(', ')} already exists`);
    }
  }
  return false;
};

export const createCustomer = async (customer: Customer) => {
  // Check for duplicates first
  await checkCustomerExists(customer);

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
  // Check for duplicates excluding current customer
  const { data: currentCustomer } = await supabase
    .from("customers")
    .select()
    .eq('id', id)
    .single();

  if (currentCustomer) {
    const { data: duplicates } = await supabase
      .from("customers")
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