"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

type Payment = Database["public"]["Tables"]["payments"]["Insert"];

export const createPayment = async (payment: Payment) => {
  const { data, error } = await supabase
    .from("payments")
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPayments = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      customer:customers(name),
      supplier:suppliers(name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updatePayment = async (id: string, updates: Partial<Payment>) => {
  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPaymentStats = async () => {
  const { data: payments, error } = await supabase
    .from("payments")
    .select("amount, status, type");

  if (error) throw error;

  const stats = {
    collected: 0,
    pending: 0,
    disbursed: 0,
  };

  payments?.forEach((payment) => {
    if (payment.status === "completed") {
      if (payment.type === "collected") {
        stats.collected += payment.amount;
      } else {
        stats.disbursed += payment.amount;
      }
    } else if (payment.status === "pending") {
      stats.pending += payment.amount;
    }
  });

  return stats;
};