"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationUser = Database["public"]["Tables"]["organization_users"]["Row"];

export const createOrganization = async (organization: Partial<Organization>) => {
  const { data, error } = await supabase
    .from("organizations")
    .insert({
      ...organization,
      slug: generateSlug(organization.name || ""),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getOrganization = async (id: string) => {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const updateOrganization = async (id: string, updates: Partial<Organization>) => {
  const { data, error } = await supabase
    .from("organizations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserOrganizations = async () => {
  const { data, error } = await supabase
    .from("organization_users")
    .select(`
      organization:organizations(*)
    `)
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

  if (error) throw error;
  return data.map(item => item.organization);
};

export const getCurrentUserRole = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("organization_users")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (error) throw error;
  return data.role;
};

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};