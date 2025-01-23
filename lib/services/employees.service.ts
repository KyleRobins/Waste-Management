"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { generatePassword } from "@/lib/utils";

const supabase = createClient();

type Employee = Database["public"]["Tables"]["employees"]["Insert"];

export const createEmployee = async (employee: Omit<Employee, "user_id" | "status">) => {
  try {
    // Generate a temporary password
    const tempPassword = generatePassword();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: employee.email,
      password: tempPassword,
      options: {
        data: {
          role: "employee",
        },
      },
    });

    if (authError) throw authError;

    if (!authData.user) throw new Error("Failed to create user");

    // Create employee record
    const { data, error } = await supabase
      .from("employees")
      .insert({
        ...employee,
        user_id: authData.user.id,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    // Send email with temporary password
    // Note: In a real application, you would use a proper email service
    console.log(`Temporary password for ${employee.email}: ${tempPassword}`);

    return data;
  } catch (error) {
    throw error;
  }
};

export const getEmployees = async () => {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateEmployee = async (id: string, updates: Partial<Employee>) => {
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEmployee = async (id: string) => {
  // Get the user_id first
  const { data: employee, error: fetchError } = await supabase
    .from("employees")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Delete the employee record
  const { error: deleteError } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);

  if (deleteError) throw deleteError;

  // Delete the auth user
  if (employee?.user_id) {
    const { error: authError } = await supabase.auth.admin.deleteUser(
      employee.user_id
    );
    if (authError) throw authError;
  }
};