"use client";

import { PaymentStats } from "@/components/payments/stats";
import { PaymentHistory } from "@/components/payments/history";
import { PaymentChart } from "@/components/payments/chart";
import { useState, useEffect } from "react";
import { getPayments, getPaymentStats } from "@/lib/services/payments.service";
import { useToast } from "@/hooks/use-toast";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    collected: 0,
    pending: 0,
    disbursed: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const [paymentsData, statsData] = await Promise.all([
        getPayments(),
        getPaymentStats(),
      ]);

      setPayments(paymentsData);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Monitor payment collections and disbursements
        </p>
      </div>
      <PaymentStats stats={stats} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaymentChart payments={payments} />
        <PaymentHistory payments={payments} onUpdate={loadPayments} />
      </div>
    </div>
  );
}